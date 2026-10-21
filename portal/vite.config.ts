import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function portfolioBackendPlugin(): Plugin {
  return {
    name: 'portfolio-backend-plugin',
    configureServer(server) {
      // 1. Serve ../assets to preview uploaded images in portal
      server.middlewares.use('/assets', (req, res, next) => {
        try {
          const rawUrl = (req.url || '').split('?')[0];
          const safeUrl = decodeURIComponent(rawUrl).replace(/\.\./g, '').replace(/^\//, '');
          const allowedAssetsDir = path.resolve(__dirname, '..', 'assets');
          const assetPath = path.resolve(allowedAssetsDir, safeUrl);

          // Path traversal defense
          if (!assetPath.startsWith(allowedAssetsDir)) {
            res.statusCode = 403;
            return res.end('Forbidden');
          }

          if (fs.existsSync(assetPath) && fs.statSync(assetPath).isFile()) {
            const ext = path.extname(assetPath).toLowerCase();
            const mimeMap: Record<string, string> = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.webp': 'image/webp',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif',
            };
            res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
            return fs.createReadStream(assetPath).pipe(res);
          }
        } catch {
          // Continue to next middleware
        }
        next();
      });

      // 2. Upload project image
      server.middlewares.use('/api/upload-project-image', (req, res) => {
        if (req.method === 'POST') {
          const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB limit
          let totalBytes = 0;
          let isTooLarge = false;
          const chunks: Buffer[] = [];

          req.on('data', (chunk) => {
            if (isTooLarge) return;
            totalBytes += chunk.length;
            if (totalBytes > MAX_UPLOAD_BYTES) {
              isTooLarge = true;
              res.statusCode = 413;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Payload too large (max 10MB)' }));
              req.destroy();
              return;
            }
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          });

          req.on('end', () => {
            if (isTooLarge) return;
            try {
              const rawBody = Buffer.concat(chunks).toString('utf-8');
              const { filename, dataUrl } = JSON.parse(rawBody);
              if (!dataUrl) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ ok: false, error: 'No image data provided' }));
              }

              // Extract base64
              const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              let buffer: Buffer;
              let ext = '.png';
              if (matches && matches.length === 3) {
                const mime = matches[1];
                if (mime.includes('jpeg')) ext = '.jpg';
                else if (mime.includes('webp')) ext = '.webp';
                else if (mime.includes('svg')) ext = '.svg';
                else if (mime.includes('gif')) ext = '.gif';
                buffer = Buffer.from(matches[2], 'base64');
              } else {
                buffer = Buffer.from(dataUrl, 'base64');
              }

              const originalExt = path.extname(filename || '').toLowerCase();
              const allowedExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);
              if (allowedExts.has(originalExt)) {
                ext = originalExt;
              }

              const rawBase = path.basename(filename || 'project', originalExt)
                .replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_')
                .slice(0, 30);
              const safeName = `proj-${Date.now()}-${rawBase}${ext}`;
              const targetDir = path.resolve(__dirname, '..', 'assets', 'projects');

              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }

              const targetFilePath = path.join(targetDir, safeName);
              fs.writeFileSync(targetFilePath, buffer);

              const relativeUrl = `assets/projects/${safeName}`;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, relativeUrl, filename: safeName }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });

      // 3. Save projects.json
      server.middlewares.use('/api/save-portfolio-json', (req, res) => {
        if (req.method === 'POST') {
          const MAX_JSON_BYTES = 2 * 1024 * 1024; // 2MB
          let body = '';
          let isTooLarge = false;

          req.on('data', (chunk) => {
            if (isTooLarge) return;
            body += chunk;
            if (body.length > MAX_JSON_BYTES) {
              isTooLarge = true;
              res.statusCode = 413;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Payload too large (max 2MB)' }));
              req.destroy();
            }
          });

          req.on('end', () => {
            if (isTooLarge) return;
            try {
              // Validate valid JSON
              JSON.parse(body);
              const targetPath = path.resolve(__dirname, '..', 'projects.json');
              fs.writeFileSync(targetPath, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, path: targetPath }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });

      // 4. Serve projects.json directly to portal dev server
      server.middlewares.use('/projects.json', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const targetPath = path.resolve(__dirname, '..', 'projects.json');
            if (fs.existsSync(targetPath)) {
              res.setHeader('Content-Type', 'application/json');
              return fs.createReadStream(targetPath).pipe(res);
            }
          } catch {
            // fallthrough
          }
        }
        next();
      });

      // 5. Save categories.json
      server.middlewares.use('/api/save-portfolio-categories', (req, res) => {
        if (req.method === 'POST') {
          const MAX_JSON_BYTES = 1 * 1024 * 1024; // 1MB
          let body = '';
          let isTooLarge = false;

          req.on('data', (chunk) => {
            if (isTooLarge) return;
            body += chunk;
            if (body.length > MAX_JSON_BYTES) {
              isTooLarge = true;
              res.statusCode = 413;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'Payload too large (max 1MB)' }));
              req.destroy();
            }
          });

          req.on('end', () => {
            if (isTooLarge) return;
            try {
              // Validate valid JSON
              JSON.parse(body);
              const targetPath = path.resolve(__dirname, '..', 'categories.json');
              fs.writeFileSync(targetPath, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true, path: targetPath }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });

      // 6. Serve categories.json directly
      server.middlewares.use('/categories.json', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const targetPath = path.resolve(__dirname, '..', 'categories.json');
            if (fs.existsSync(targetPath)) {
              res.setHeader('Content-Type', 'application/json');
              return fs.createReadStream(targetPath).pipe(res);
            }
          } catch {
            // fallthrough
          }
        }
        next();
      });
    },
    closeBundle() {
      // Sync master brand assets to dist/assets/brand on build so dist always has the latest logo
      try {
        const srcBrandDir = path.resolve(__dirname, '..', 'assets', 'brand');
        const distBrandDir = path.resolve(__dirname, 'dist', 'assets', 'brand');
        if (fs.existsSync(srcBrandDir)) {
          fs.mkdirSync(distBrandDir, { recursive: true });
          const files = fs.readdirSync(srcBrandDir);
          for (const file of files) {
            fs.copyFileSync(path.join(srcBrandDir, file), path.join(distBrandDir, file));
          }
        }
      } catch {
        // Ignore build asset sync errors
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), portfolioBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
