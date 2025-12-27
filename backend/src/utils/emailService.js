import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // Use SMTP if configured, otherwise use Gmail OAuth or fallback to console
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Gmail OAuth (if configured)
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  }

  // Development: Use console transport (logs emails to console)
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      jsonTransport: true, // Logs email as JSON
    });
  }

  // Fallback: Use Ethereal Email for testing (creates a test account)
  return null;
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || `FreeJira <noreply@freejira.online>`,
    to: email,
    subject: 'Password Reset Request - FreeJira',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #4338CA;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>FreeJira</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>You requested to reset your password for your FreeJira account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
              <p><strong>This link will expire in 10 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <div class="footer">
                <p>This is an automated message from FreeJira. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - FreeJira
      
      You requested to reset your password for your FreeJira account.
      
      Click this link to reset your password:
      ${resetUrl}
      
      This link will expire in 10 minutes.
      
      If you didn't request this password reset, please ignore this email.
      
      This is an automated message from FreeJira. Please do not reply to this email.
    `,
  };

  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      // Fallback: Log to console in development
      console.log('='.repeat(60));
      console.log('📧 PASSWORD RESET EMAIL (Development Mode)');
      console.log('='.repeat(60));
      console.log('To:', email);
      console.log('Subject:', mailOptions.subject);
      console.log('Reset URL:', resetUrl);
      console.log('='.repeat(60));
      return { success: true, message: 'Email logged to console (development mode)' };
    }

    const info = await transporter.sendMail(mailOptions);
    
    // In development with jsonTransport, log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email sent (development mode):', JSON.stringify(info, null, 2));
      console.log('Reset URL:', resetUrl);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw error - we don't want to reveal if email exists
    return { success: false, error: error.message };
  }
};

