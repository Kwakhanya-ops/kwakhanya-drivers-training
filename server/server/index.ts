import express, { type Request, Response, NextFunction } from "express";
import fileUpload from "express-fileupload";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

app.set('trust proxy', 1);

app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  useTempFiles: false,
  abortOnLimit: true,
}));

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  
  if (origin.includes('onrender.com') || process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = await registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  throw err;
});

if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  setupVite(app, server);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`);
});
