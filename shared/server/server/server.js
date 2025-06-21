const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Kwakhanya Drivers Training</title></head>
      <body style="font-family: Arial; margin: 40px; background: #f5f5f5;">
        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
          <h1 style="color: #2563eb;">Kwakhanya Drivers Training Platform</h1>
          <div style="padding: 10px; background: #dcfce7; border-left: 4px solid #16a34a; margin: 20px 0;">
            <strong>✓ Server is running successfully!</strong><br>
            Deployment complete - Your driving school platform foundation is live.
          </div>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
          <p><strong>Database:</strong> ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}</p>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
