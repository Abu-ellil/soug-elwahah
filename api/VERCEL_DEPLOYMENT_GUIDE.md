# Vercel Deployment Guide

## Overview
This guide helps you deploy the Tawseela API to Vercel as serverless functions.

## Key Changes Made for Vercel Compatibility

### 1. Serverless Structure
- **vercel-serverless.js**: Serverless-compatible Express app
- **serverless/index.js**: Main Vercel function handler
- **vercel.json**: Vercel configuration file

### 2. Removed Incompatible Dependencies
- **Socket.io**: Removed (use WebSocket alternatives)
- **File logging**: Replaced with console logging
- **Server listening**: Removed `server.listen()`

### 3. Database Connection Optimization
- Connection pooling for serverless cold starts
- Connection reuse across function invocations

## Required Environment Variables

In your Vercel dashboard, set these environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
JWT_COOKIE_EXPIRE=30
```

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
From the `api` directory:
```bash
vercel --prod
```

### 4. Set Environment Variables
In Vercel dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add all the variables listed above

## Testing the Deployment

### 1. Health Check
Visit: `https://your-app.vercel.app/api/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-21T13:12:28.915Z",
  "database": "Connected"
}
```

### 2. API Root
Visit: `https://your-app.vercel.app/api`

Expected response:
```json
{
  "message": "Tawseela Backend API is running!"
}
```

## Known Limitations

### 1. No Socket.io Support
- Real-time features need WebSocket alternatives
- Consider using Vercel's Edge Functions for WebSockets (beta)

### 2. File System Access
- No write access to file system
- All logging goes to console
- Consider using cloud logging services (LogRocket, DataDog)

### 3. Database Connections
- Cold starts may cause initial delays
- Connection pooling is implemented to minimize this

## Rollback Strategy

If issues occur:
1. Check Vercel function logs
2. Test locally with `vercel dev`
3. Verify environment variables
4. Check MongoDB connection

## Troubleshooting

### Common Issues

1. **500 INTERNAL_SERVER_ERROR**
   - Check MongoDB URI
   - Verify all environment variables
   - Check function logs

2. **Connection Timeout**
   - Increase function timeout in vercel.json
   - Optimize database queries

3. **Cold Start Issues**
   - Consider upgrading to Vercel Pro for better cold start performance
   - Optimize function size and dependencies

## Performance Tips

1. **Database Indexes**
   - Ensure proper MongoDB indexes
   - Optimize queries for serverless

2. **Function Size**
   - Keep dependencies minimal
   - Use dynamic imports where possible

3. **Caching**
   - Consider implementing Redis for caching
   - Use Vercel Edge Cache for static responses

## Alternative: API Gateway

If serverless doesn't work for your use case:
1. Consider Railway, Render, or DigitalOcean App Platform
2. These support persistent connections
3. Better for Socket.io applications

## Support

For deployment issues:
1. Check Vercel documentation
2. Review function logs in Vercel dashboard
3. Test locally with `vercel dev` first