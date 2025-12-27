# Email Configuration for Password Recovery

## Quick Setup Options

### Option 1: Gmail SMTP (Easiest for Testing)

Add to your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=FreeJira <your-email@gmail.com>
```

**Note**: For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (not your regular password)

### Option 2: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com (free tier available)
2. Create an API key
3. Add to `.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=FreeJira <noreply@freejira.online>
```

### Option 3: Mailgun

1. Sign up at https://mailgun.com (free tier available)
2. Get SMTP credentials
3. Add to `.env`:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
EMAIL_FROM=FreeJira <noreply@freejira.online>
```

### Option 4: Custom SMTP Server

```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
EMAIL_FROM=FreeJira <noreply@yourdomain.com>
```

## Development Mode

If no SMTP is configured, emails will be logged to the console with the reset URL.

## Environment Variables

Add these to `backend/.env`:

```env
# Email Configuration
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=FreeJira <noreply@freejira.online>

# Frontend URL (for reset links)
FRONTEND_URL=https://freejira.online
```

## Testing

1. Configure SMTP in `.env`
2. Restart backend server
3. Try password recovery
4. Check your email inbox (and spam folder)

## Troubleshooting

### Email not received
- Check spam/junk folder
- Verify SMTP credentials
- Check server logs for errors
- Verify `FRONTEND_URL` is correct

### Gmail "Less secure app" error
- Use App Password instead of regular password
- Enable 2FA first

### Connection timeout
- Check firewall allows SMTP port (587 or 465)
- Verify SMTP host and port are correct

