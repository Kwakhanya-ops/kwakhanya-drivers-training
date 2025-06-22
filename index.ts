import express, { type Request, Response, NextFunction } from "express";
import fileUpload from "express-fileupload";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

console.log('Starting server initialization...');

// Set trust proxy settings for deployment environments
app.set('trust proxy', 1);

// Setup file upload middleware
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  useTempFiles: false,
  abortOnLimit: true,
}));

// Add CORS handling for deployment environments
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  
  if (origin.includes('replit.app') || origin.includes('replit.dev') || origin.includes('repl.co')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV !== 'production') {
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

// Register API routes
const server = registerRoutes(app);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({ message });
});

// Setup Vite for development
if (process.env.NODE_ENV !== "production") {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  log(`serving on port ${PORT}`);
});
