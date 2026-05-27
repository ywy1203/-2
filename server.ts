import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { exec } from "child_process";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Build the app and return index.html
  app.get("/api/export-html", (req, res) => {
    // Only allow this if we have a dist folder with index.html, or we can trigger build
    // Because build is heavy, let's trigger it and wait.
    exec("npm run build", (error, stdout, stderr) => {
      if (error) {
        console.error(`Build error: ${error.message}`);
        return res.status(500).send("Build failed");
      }
      const distPath = path.join(process.cwd(), 'dist', 'index.html');
      if (fs.existsSync(distPath)) {
        res.download(distPath, "ledger-project.html");
      } else {
        res.status(404).send("File not found");
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
