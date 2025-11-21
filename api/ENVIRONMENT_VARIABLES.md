# Environment Variables Configuration

This document lists all the environment variables required for the Tawseela Grocery Delivery API.

## Database Configuration

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/tawseela-grocery
```

## JWT Configuration

```env
# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRE=30d
```

## Twilio Configuration (SMS Verification)

```env
# Twilio Credentials for SMS OTP
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Email Configuration

```env
# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

## Stripe Configuration (Payments)

```env
# Stripe API Keys
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Server Configuration

```env
# Server Settings
PORT=5000
NODE_ENV=development
API_VERSION=v1

# Rate Limiting (Optional - Disabled by default)
RATE_LIMIT_WINDOW_MS=600000  # 10 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=250

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5

# Delivery Configuration
DELIVERY_RADIUS_DEFAULT=5000  # 5km in meters
DELIVERY_FEE_DEFAULT=50       # 50 EGP
FREE_DELIVERY_MINIMUM=200     # 200 EGP
```

## Cloudinary Configuration (Optional - for file uploads)

```env
# Cloudinary for image storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Socket.IO Configuration

```env
# Socket.IO Settings
SOCKET_IO_PORT=3001
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

## Example .env File

Create a `.env` file in the root of your project with the following structure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/tawseela-grocery

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRE=30d

# Twilio (for SMS verification)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server
PORT=5000
NODE_ENV=development
API_VERSION=v1

# OTP Settings
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5

# Delivery Settings
DELIVERY_RADIUS_DEFAULT=5000
DELIVERY_FEE_DEFAULT=50
FREE_DELIVERY_MINIMUM=200

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Socket.IO
SOCKET_IO_PORT=3001
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

## Production Notes

For production deployment, make sure to:

1. Use strong, unique secret keys
2. Set `NODE_ENV=production`
3. Use environment-specific database URLs
4. Configure proper email and SMS providers
5. Set up SSL certificates for HTTPS
6. Configure proper CORS origins for your domain
7. Use production-ready SMTP settings
8. Set up monitoring and logging

## Vercel Deployment

When deploying to Vercel, set these environment variables in your Vercel project settings:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key
- `JWT_REFRESH_SECRET`: Strong refresh token secret
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: For SMS
- `STRIPE_SECRET_KEY`: For payments
- `EMAIL_USER`, `EMAIL_PASS`: For email notifications
- `NODE_ENV`: Set to `production`
