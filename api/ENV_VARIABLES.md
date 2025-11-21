# API Environment Variables

This document lists all environment variables used in the Tawseelah API.

## Current .env File

```env
MONGODB_URI=mongodb+srv://mrabuellil_db_user:mrabuellil_db_user@aifarm.j5pnubg.mongodb.net/elsoog?retryWrites=true&w=majority
PORT=5000
```

## Complete List of Environment Variables

### Database Configuration
- **MONGODB_URI** (Required)
  - MongoDB connection string
  - Current: `mongodb+srv://mrabuellil_db_user:mrabuellil_db_user@aifarm.j5pnubg.mongodb.net/elsoog?retryWrites=true&w=majority`
  - Used in: [`api/config/db.js`](api/config/db.js:12)

### Server Configuration
- **PORT** (Optional)
  - Server port number
  - Default: `5000`
  - Current: `5000`
  - Used in: [`api/server.js`](api/server.js:88)

- **NODE_ENV** (Optional)
  - Environment mode (development/production)
  - Default: `development`
  - Used in: 
    - [`api/utils/logger.js`](api/utils/logger.js:42)
    - [`api/modules/customers/controller.js`](api/modules/customers/controller.js:35)
    - [`api/modules/storeowners/controller.js`](api/modules/storeowners/controller.js:37)
    - [`api/modules/drivers/controller.js`](api/modules/drivers/controller.js:36)
    - [`api/modules/auth/controller.js`](api/modules/auth/controller.js:53)

### Client/Frontend Configuration
- **CLIENT_URL** (Optional)
  - Frontend application URL for CORS and email links
  - Default: `http://localhost:3000`
  - Used in:
    - [`api/server.js`](api/server.js:39) - CORS configuration
    - [`api/utils/sendEmail.js`](api/utils/sendEmail.js:63) - Verification emails
    - [`api/modules/auth/controller.js`](api/modules/auth/controller.js:204) - Password reset

### JWT (Authentication) Configuration
- **JWT_SECRET** (Required - Missing)
  - Secret key for signing JWT tokens
  - Used in:
    - [`api/models/User.js`](api/models/User.js:113)
    - [`api/middleware/auth.js`](api/middleware/auth.js:34)

- **JWT_EXPIRE** (Required - Missing)
  - JWT token expiration time (e.g., '30d', '24h')
  - Used in: [`api/models/User.js`](api/models/User.js:114)

- **JWT_COOKIE_EXPIRE** (Required - Missing)
  - Cookie expiration time in days
  - Used in:
    - [`api/modules/customers/controller.js`](api/modules/customers/controller.js:32)
    - [`api/modules/storeowners/controller.js`](api/modules/storeowners/controller.js:34)
    - [`api/modules/drivers/controller.js`](api/modules/drivers/controller.js:33)
    - [`api/modules/customers/advancedAuthController.js`](api/modules/customers/advancedAuthController.js:60)

### Email Configuration (SMTP)
- **SMTP_HOST** (Optional)
  - SMTP server hostname
  - Default: `smtp.gmail.com`
  - Used in: [`api/utils/sendEmail.js`](api/utils/sendEmail.js:11)

- **SMTP_PORT** (Optional)
  - SMTP server port
  - Default: `587`
  - Used in: [`api/utils/sendEmail.js`](api/utils/sendEmail.js:12)

- **SMTP_EMAIL** (Optional)
  - SMTP authentication email
  - Default: `your-email@gmail.com`
  - Used in: [`api/utils/sendEmail.js`](api/utils/sendEmail.js:15)

- **SMTP_PASSWORD** (Optional)
  - SMTP authentication password/app password
  - Default: `your-app-password`
  - Used in: [`api/utils/sendEmail.js`](api/utils/sendEmail.js:16)

- **FROM_EMAIL** (Optional)
  - Email sender address
  - Default: `noreply@tawseela.com`
  - Used in: [`api/utils/sendEmail.js`](api/utils/sendEmail.js:32)

### Business Configuration
- **COMMISSION_RATE** (Optional)
  - Platform commission rate (decimal)
  - Default: `0.15` (15%)
  - Used in: [`api/modules/admin/controller.js`](api/modules/admin/controller.js:173)

- **DELIVERY_FEE** (Optional)
  - Default delivery fee amount
  - Default: `15`
  - Used in: [`api/modules/admin/controller.js`](api/modules/admin/controller.js:174)

- **CURRENCY** (Optional)
  - Currency code
  - Default: `EGP`
  - Used in: [`api/modules/admin/controller.js`](api/modules/admin/controller.js:175)

## Authentication Methods Supported

The API supports multiple authentication methods:
- **Email/Password** - Traditional authentication
- **Phone/Password** - Phone-based authentication
- **Social Login** - Google, Facebook, Apple (OAuth)
- **JWT Tokens** - For session management

## Recommended .env Template

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
MONGODB_URI=mongodb+srv://mrabuellil_db_user:mrabuellil_db_user@aifarm.j5pnubg.mongodb.net/elsoog?retryWrites=true&w=majority

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# CLIENT/FRONTEND CONFIGURATION
# ============================================
CLIENT_URL=http://localhost:3000

# ============================================
# JWT AUTHENTICATION (REQUIRED)
# ============================================
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@tawseela.com

# ============================================
# BUSINESS SETTINGS
# ============================================
COMMISSION_RATE=0.15
DELIVERY_FEE=15
CURRENCY=EGP
```

## Missing Critical Variables

⚠️ **The following REQUIRED variables are missing from the current .env file:**

1. **JWT_SECRET** - Critical for authentication security
2. **JWT_EXPIRE** - Required for token expiration
3. **JWT_COOKIE_EXPIRE** - Required for cookie management

**Action Required:** Add these variables to your `.env` file before running the application in production.

## Security Notes

1. Never commit the `.env` file to version control
2. Use strong, random values for `JWT_SECRET` in production
3. Change default SMTP credentials before deployment
4. Use environment-specific values for `CLIENT_URL`
5. Set `NODE_ENV=production` in production environments
