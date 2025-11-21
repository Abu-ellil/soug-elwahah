# 🚀 ElSoug API - Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a MongoDB Atlas cluster
3. **GitHub Repository**: Your code should be pushed to GitHub
4. **Environment Variables**: Prepare all required environment variables

## 📋 Step-by-Step Deployment

### Step 1: Prepare Environment Variables

1. Copy the template from `backend-api/.env.production`
2. Replace placeholder values with your actual credentials:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a strong secret (use a password generator)
   - `FRONTEND_URL`: Your frontend domain (if you have one)
   - Optional services: Cloudinary, Twilio, SendGrid

### Step 2: Deploy via Vercel Dashboard

#### Option A: Import from GitHub (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `backend-api` folder as the root directory
5. Vercel will auto-detect the configuration from `vercel.json`

#### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to backend-api directory
cd backend-api

# Deploy
vercel --prod
```

### Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add each variable from `.env.production`:

**Required Variables:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-strong-secret
API_VERSION=v1
```

**Optional Variables:**
```
FRONTEND_URL=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
TWILIO_ACCOUNT_SID=your-sid
```

### Step 4: MongoDB Atlas Configuration

1. **Whitelist Vercel IPs**: In MongoDB Atlas, go to Network Access
2. **Add IP Address**: `0.0.0.0/0` (allows all IPs - Vercel uses dynamic IPs)
3. **Database User**: Ensure you have a database user with read/write permissions

### Step 5: Test Your Deployment

Once deployed, test your API:

```bash
# Replace with your actual Vercel URL
curl https://your-project.vercel.app/health

# Test API endpoints
curl https://your-project.vercel.app/api/v1/categories
```

## 🔧 Configuration Files

### vercel.json
```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "includeFiles": "**"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### api/index.js
This file serves as the serverless entry point and includes:
- Express app configuration
- Database connection with serverless optimization
- All routes and middleware
- Error handling

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Configure DNS records as instructed by Vercel

## 📊 Monitoring & Debugging

### Vercel Dashboard Features:
- **Functions**: Monitor serverless function performance
- **Analytics**: Track API usage and performance
- **Logs**: View real-time logs for debugging

### Common Issues:

1. **Database Connection Timeout**
   - Ensure MongoDB Atlas allows connections from `0.0.0.0/0`
   - Check your connection string format

2. **Environment Variables Not Loading**
   - Verify all variables are set in Vercel dashboard
   - Redeploy after adding new variables

3. **CORS Issues**
   - Update `FRONTEND_URL` and `CORS_ORIGIN` variables
   - Ensure your frontend domain is whitelisted

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to your main branch:

1. **Push to GitHub**: `git push origin main`
2. **Automatic Build**: Vercel detects changes and builds
3. **Live Deployment**: New version goes live automatically

## 📱 API Endpoints

After deployment, your API will be available at:

**Base URL**: `https://your-project.vercel.app/api/v1`

**Available Endpoints**:
- `GET /health` - Health check
- `GET /api/v1/categories` - Categories
- `GET /api/v1/products` - Products
- `GET /api/v1/services` - Services
- `POST /api/v1/auth/send-otp` - Authentication
- And more...

## 🛡️ Security Considerations

Your API includes:
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS Protection**: Configured origins only
- **Data Sanitization**: MongoDB injection prevention
- **XSS Protection**: Cross-site scripting prevention
- **Security Headers**: Via Helmet middleware

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connectivity
4. Review the API documentation

## 🎉 Success!

Once deployed successfully, your ElSoug API will be:
- ✅ Globally distributed via Vercel's CDN
- ✅ Auto-scaling based on demand
- ✅ Monitored with real-time analytics
- ✅ Continuously deployed from GitHub

Your API is now ready to serve your ElSoug marketplace application!