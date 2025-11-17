# Super Admin Account Setup Guide

## Overview
This guide explains how to create and use super admin accounts for full control over the application. The system now supports two types of admin accounts:
1. **Legacy Phone-Based Admin**: Uses phone numbers in environment variables
2. **Super Admin**: Full-featured admin accounts with dedicated database model and enhanced permissions

## Current Admin Configuration

The current legacy admin phone number is configured in `api/.env`:
```
ADMIN_PHONES=01234567890
```

## Super Admin Account Creation

### Method 1: Using the Script (Recommended)

1. **Run the super admin creation script**:
   ```bash
   cd api
   npm run create-super-admin
   ```

2. **Default credentials created**:
   - Email: `admin@soug-elwahah.com`
   - Phone: `0100000000`
   - Password: `admin123`
   - Role: `super_admin`

3. **Login to the super admin panel** using the credentials above

### Method 2: Using the API

1. **Register a new super admin account** via API:
   - Endpoint: `POST /api/super-admin/register`
   - Body: `{"name": "Super Admin", "email": "admin@yourdomain.com", "phone": "010000000", "password": "your_secure_password"}`

2. **Login to the super admin panel**:
   - Endpoint: `POST /api/super-admin/login`
   - Body: `{"email": "admin@yourdomain.com", "password": "your_secure_password"}`

## Super Admin Capabilities

Super admins have full control over the application including:
- **User Management**: View, activate/deactivate all users (customers, store owners, drivers)
- **Store Management**: View, activate/deactivate all stores
- **Order Management**: View all orders across the platform
- **System Statistics**: Access to comprehensive system metrics and reports
- **Full API Access**: Access to all administrative endpoints

## API Endpoints for Super Admin

### Authentication
- `POST /api/super-admin/register` - Register new super admin
- `POST /api/super-admin/login` - Login as super admin

### User Management
- `GET /api/super-admin/users` - Get all users (with pagination and search)
- `PATCH /api/super-admin/users/:role/:userId` - Update user status

### Store Management
- `GET /api/super-admin/stores` - Get all stores (with pagination and search)
- `PATCH /api/super-admin/stores/:storeId` - Update store status

### Order Management
- `GET /api/super-admin/orders` - Get all orders (with pagination and search)

### System Management
- `GET /api/super-admin/stats` - Get system statistics

## How Admin Authentication Works

### Super Admin Authentication
1. Super admin users are stored in a dedicated `SuperAdmin` collection
2. Authentication requires valid email/password combination
3. Super admins have full system access and elevated permissions

### Legacy Admin Authentication
1. The system checks the `ADMIN_PHONES` environment variable
2. When a user makes an authenticated request to admin endpoints, the system:
   - Verifies the JWT token
   - Checks if the user's phone number matches any in the `ADMIN_PHONES` list
   - Grants admin access if there's a match

## Environment Variable Configuration

The `ADMIN_PHONES` variable can contain multiple phone numbers separated by commas:
```
ADMIN_PHONES=01234567890,01012345678,01187654321
```

## Testing the Admin Panel

### For Legacy Admin Panel (Coordinate Approval)
1. Register or login with an account that has an admin phone number
2. Navigate to the admin panel in the merchant app
3. The admin panel will be able to:
   - View stores with pending coordinate updates
   - Approve store coordinate updates
   - Reject store coordinate updates

### For Super Admin Panel (Full Control)
1. Login with super admin credentials
2. Access super admin endpoints directly via API or through admin interface
3. Full system control including:
   - User management
   - Store management
   - Order management
   - System statistics

## Important Notes

- Super admin accounts are stored in a dedicated database model with proper authentication
- Legacy admin access is still available for coordinate approval functionality
- Super admins have `isSuperAdmin` flag and `role: 'super_admin'` in their account
- For security in production, change default passwords and use strong credentials
- Super admin accounts have enhanced permissions including `manage_users`, `manage_stores`, `manage_orders`, etc.
- Changes to the `ADMIN_PHONES` variable require restarting the server