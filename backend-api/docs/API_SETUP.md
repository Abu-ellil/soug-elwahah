# ElSoug API Setup Guide

## Overview
ElSoug is a RESTful API for a local marketplace system designed for Egyptian villages. This guide will help you set up and run the API locally.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ElSoug/backend-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/elsoug
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elsoug

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Database Setup
Make sure MongoDB is running on your system or you have access to a MongoDB Atlas cluster.

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

## API Documentation

### Swagger Documentation
Once the server is running, you can access the interactive API documentation at:
```
http://localhost:5000/api/v1/docs
```

### Health Check
To verify the API is running correctly:
```
http://localhost:5000/health
```

## Available Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Main Routes
- **Products**: `/api/v1/products`
- **Services**: `/api/v1/services`
- **Users**: `/api/v1/users`
- **Authentication**: `/api/v1/auth`
- **Stores**: `/api/v1/stores`
- **Orders**: `/api/v1/orders`
- **Reviews**: `/api/v1/reviews`
- **Villages**: `/api/v1/villages`
- **Categories**: `/api/v1/categories`
- **Messages**: `/api/v1/messages`
- **Notifications**: `/api/v1/notifications`
- **Upload**: `/api/v1/upload`

## Testing the API

### Using cURL
```bash
# Test products endpoint
curl -X GET http://localhost:5000/api/v1/products

# Test services endpoint
curl -X GET http://localhost:5000/api/v1/services

# Health check
curl -X GET http://localhost:5000/health
```

### Using Postman
1. Import the API collection (if available)
2. Set the base URL to `http://localhost:5000/api/v1`
3. Test the endpoints

## Project Structure
```
backend-api/
├── config/
│   ├── database.js      # MongoDB connection
│   └── swagger.js       # Swagger configuration
├── controllers/         # Route controllers
├── middleware/          # Custom middleware
├── models/             # MongoDB models
├── routes/             # API routes
├── utils/              # Utility functions
├── docs/               # Documentation
├── server.js           # Main server file
├── package.json        # Dependencies
└── .env               # Environment variables
```

## Security Features
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Data Sanitization**: MongoDB injection prevention
- **XSS Protection**: Cross-site scripting prevention
- **HPP**: HTTP parameter pollution prevention

## Deployment

### Vercel Deployment
```bash
npm run deploy
```

### Environment Variables for Production
Make sure to set all required environment variables in your production environment.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB is running
   - Check connection string in `.env`
   - Ensure network connectivity

2. **Port Already in Use**
   - Change the PORT in `.env`
   - Kill the process using the port

3. **Missing Dependencies**
   - Run `npm install` to install all dependencies
   - Check for any peer dependency warnings

### Logs
The application uses Morgan for HTTP request logging in development mode.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support
For issues and questions, please create an issue in the repository or contact the development team.