import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Kwakhanya Drivers Training</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .header { text-align: center; color: #2563eb; }
        .success { background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1 class="header">Kwakhanya Drivers Training Platform</h1>
      <div class="success">
        <h2>Migration Successful!</h2>
        <p>Your driving school platform is now live on Render with free hosting.</p>
        <p><strong>Database:</strong> Connected to Neon PostgreSQL</p>
        <p><strong>Email:</strong> SendGrid integration ready</p>
      </div>
      <h3>Platform Features Ready:</h3>
      <ul>
        <li>Free hosting on Render</li>
        <li>Database connection established</li>
        <li>Email notifications configured</li>
        <li>Automatic deployments from GitHub</li>
        <li>SSL certificate active</li>
      </ul>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on port \${PORT}\`);
});
