import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Normalize double-slash URLs: redirect //foo → /foo
// This prevents React Router links from ever generating //path in the address bar
app.use((req, res, next) => {
  if (req.path.startsWith('//') || /\/{2,}/.test(req.path)) {
    const normalized = req.path.replace(/\/{2,}/g, '/');
    return res.redirect(301, normalized + (req.search || ''));
  }
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing - return index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes - let them pass through
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found - ensure backend is configured correctly' });
  }
  
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
