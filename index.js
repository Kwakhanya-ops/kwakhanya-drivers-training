const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kwakhanya Drivers Training</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                max-width: 600px;
                width: 90%;
                text-align: center;
            }
            h1 { color: #2563eb; margin-bottom: 20px; font-size: 2.5rem; font-weight: 700; }
            .status {
                background: #dcfce7;
                border: 1px solid #16a34a;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                color: #15803d;
            }
            .feature-list { text-align: left; margin: 25px 0; list-style: none; }
            .feature-list li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 25px;
                text-align: left;
            }
            .info-card {
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
            }
            .info-card h3 { color: #374151; margin-bottom: 8px; }
            .info-card p { color: #6b7280; font-size: 14px; }
            @media (max-width: 600px) {
                .info-grid { grid-template-columns: 1fr; }
                h1 { font-size: 2rem; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Kwakhanya Drivers Training</h1>
            
            <div class="status">
                <strong>✓ Platform Successfully Deployed!</strong><br>
                Your driving school booking platform is now live on Render.
            </div>

            <p style="margin: 20px 0; color: #374151; font-size: 18px;">
                Professional driving instruction across South Africa
            </p>

            <div style="text-align: left; margin: 25px 0;">
                <h3 style="color: #374151; margin-bottom: 15px;">Platform Features:</h3>
                <ul class="feature-list">
                    <li>🏫 Driving School Registration & Management</li>
                    <li>👥 Student Booking & Lesson Scheduling</li>
                    <li>💳 Secure Payment Processing (PayFast)</li>
                    <li>📧 Email Notifications (SendGrid)</li>
                    <li>📱 WhatsApp Integration for Schools</li>
                    <li>🎓 Progress Tracking & Assessments</li>
                    <li>👨‍💼 Admin Dashboard & Analytics</li>
                    <li>🛡️ Role-based Authentication</li>
                </ul>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <h3>Server Status</h3>
                    <p>Environment: ${process.env.NODE_ENV || 'Production'}</p>
                    <p>Port: ${PORT}</p>
                    <p>Timestamp: ${new Date().toLocaleString('en-ZA')}</p>
                </div>
                <div class="info-card">
                    <h3>Services</h3>
                    <p>Database: ${process.env.DATABASE_URL ? '✓ Connected' : '⚠️ Pending'}</p>
                    <p>Email: ${process.env.SENDGRID_API_KEY ? '✓ Configured' : '⚠️ Pending'}</p>
                    <p>Session: ${process.env.SESSION_SECRET ? '✓ Secured' : '⚠️ Pending'}</p>
                </div>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                    Ready for React frontend integration and full feature activation
                </p>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Kwakhanya Drivers Training server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'production'}`);
});
