import { type ViteDevServer } from "vite";
import express, { type Express } from "express";
import { createServer, type Server } from "http";

export const log = (message: string) => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log(`${formattedTime} [express] ${message}`);
};

export async function setupVite(app: Express, server: Server): Promise<ViteDevServer> {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    clearScreen: false,
    optimizeDeps: { include: ["wouter", "wouter/use-browser-location"] },
  });

  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
  return vite;
}

export function serveStatic(app: Express) {
  const path = await import("path");
  const sirv = await import("sirv");

  const distPath = path.resolve("dist", "public");
  const staticHandler = sirv.default(distPath, {
    maxAge: 31536000,
    immutable: true
  });

  app.use(staticHandler);

  app.get("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    res.sendFile(indexPath);
  });
}
