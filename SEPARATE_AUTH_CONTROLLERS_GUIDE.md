# Separate Authentication Controllers Implementation Guide

## Overview

This guide documents the implementation of separate authentication controllers for different user types in the Soug Elwahah application. The new structure provides better separation of concerns, improved maintainability, and role-based security.

## 🎯 Implementation Summary

### New Architecture
- **Base Auth Controller**: Common authentication logic shared across all user types
- **User-Type Specific Controllers**: Dedicated controllers for customers, store owners, and drivers
- **Separate Routes**: Isolated authentication routes for each user type
- **Role-Based Middleware**: Proper access control for different user roles

### User Types Supported
- **Customers** (`User` model)
- **Store Owners** (`StoreOwner` model)
- **Drivers** (`Driver` model)
- **Admins** (existing implementation maintained)

---

## 📁 File Structure

```
api/src/
├── controllers/
│   ├── baseAuth.controller.js          # Common auth logic
│   ├── customer/
│   │   └── auth.controller.js          # Customer auth controller
│   ├── driver/
│   │   └── auth.controller.js          # Driver auth controller
│   ├── store/
│   │   └── auth.controller.js          # Store owner auth controller
│   └── auth.controller.js              # Legacy controller (deprecated)
├── routes/
│   ├── customer/
│   │   ├── auth.routes.js              # Customer auth routes
│   │   └── index.js                    # Customer route aggregator
│   ├── driver/
│   │   ├── auth.routes.js              # Driver auth routes
│   │   └── index.js                    # Driver route aggregator
│   ├── store/
│   │   ├── auth.routes.js              # Store auth routes
│   │   └── index.js                    # Store route aggregator
│   └── auth.routes.js                  # Legacy routes (deprecated)
```

---

## 🔄 API Endpoint Changes

| User Type | Old Endpoints | New Endpoints |
|-----------|---------------|---------------|
| **Customers** | `/auth/customer/*` | `/customer/auth/*` |
| **Store Owners** | `/auth/store/*` | `/store/auth/*` |
| **Drivers** | `/auth/driver/*` | `/driver/auth/*` |

### Complete Endpoint Mapping

#### Customer Authentication
```
POST /api/customer/auth/register
POST /api/customer/auth/login
GET  /api/customer/auth/profile
POST /api/customer/auth/request-password-reset
POST /api/customer/auth/reset-password
POST /api/customer/auth/logout
```

#### Store Owner Authentication
```
POST /api/store/auth/register
POST /api/store/auth/login
GET  /api/store/auth/profile
POST /api/store/auth/request-password-reset
POST /api/store/auth/reset-password
POST /api/store/auth/logout
```

#### Driver Authentication
```
POST /api/driver/auth/register
POST /api/driver/auth/login
GET  /api/driver/auth/profile
POST /api/driver/auth/request-password-reset
POST /api/driver/auth/reset-password
POST /api/driver/auth/logout
```

---

## 📱 Frontend App Updates

### 1. Customer App Updates

**File:** `customer-app/src/services/api.js`

#### Current Code:
```javascript
export const authAPI = {
  login: (credentials) =>
    apiRequest('/auth/customer/login', {
      method: 'POST',
      body: credentials,
    }),

  registerCustomer: (userData) =>
    apiRequest('/auth/customer/register', {
      method: 'POST',
      body: userData,
    }),

  getMe: (token) =>
    apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
```

#### Updated Code:
```javascript
export const authAPI = {
  login: (credentials) =>
    apiRequest('/customer/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  registerCustomer: (userData) =>
    apiRequest('/customer/auth/register', {
      method: 'POST',
      body: userData,
    }),

  getProfile: (token) =>
    apiRequest('/customer/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  requestPasswordReset: (phone) =>
    apiRequest('/customer/auth/request-password-reset', {
      method: 'POST',
      body: { phone },
    }),

  resetPassword: (data) =>
    apiRequest('/customer/auth/reset-password', {
      method: 'POST',
      body: data,
    }),

  logout: (token) =>
    apiRequest('/customer/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
};
```

### 2. Merchant App (Store Owners) Updates

**File:** `merchant-app/services/api.ts`

#### Current Code:
```typescript
login(credentials: { phone: string; password: string; role: string }) {
  return this.request("/auth/store/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

register(merchantData: {
  name: string;
  phone: string;
  password: string;
}) {
  return this.request("/auth/store/register", {
    method: "POST",
    body: JSON.stringify(merchantData),
  });
}

// Get current user profile
getProfile() {
  return this.request("/auth/me");
}
```

#### Updated Code:
```typescript
login(credentials: { phone: string; password: string }) {
  return this.request("/store/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

register(merchantData: {
  name: string;
  phone: string;
  password: string;
}) {
  return this.request("/store/auth/register", {
    method: "POST",
    body: JSON.stringify(merchantData),
  });
}

// Get current user profile
getProfile() {
  return this.request("/store/auth/profile");
}

// Password reset methods
requestPasswordReset(phone: string) {
  return this.request("/store/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

resetPassword(data: { phone: string; resetCode: string; newPassword: string }) {
  return this.request("/store/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

logout() {
  return this.request("/store/auth/logout", {
    method: "POST",
  });
}
```

#### Auth Store Updates:
**File:** `merchant-app/stores/authStore.ts`

Update the login method to remove the `role` parameter:

```typescript
login: async (phone: string, password: string) => {
  // ... existing code ...
  const response = await apiService.login({ phone, password }); // Remove role parameter
  // ... rest of the code stays the same ...
}
```

### 3. Delivery App (Drivers) Updates

**File:** `delivery/src/store/authStore.js`

#### Current Code:
```javascript
// Login
const response = await api.post('/auth/driver/login', {
  phone,
  password,
  role: 'driver'
});

// Register
const response = await api.post('/auth/driver/register', driverData);
```

#### Updated Code:
```javascript
// Login
const response = await api.post('/driver/auth/login', {
  phone,
  password
});

// Register
const response = await api.post('/driver/auth/register', driverData);
```

#### Add New Methods:
```javascript
// Get driver profile
getDriverProfile: async () => {
  try {
    const response = await api.get('/driver/auth/profile');

    if (response.data.success) {
      const driver = response.data.data;

      // Update driver data in AsyncStorage
      await AsyncStorage.setItem('driverData', JSON.stringify(driver));

      set({
        driver: driver,
      });

      return { success: true, data: driver };
    } else {
      return { success: false, error: response.data.message || 'Failed to get profile' };
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to get profile'
    };
  }
},

// Password reset methods
requestPasswordReset: async (phone) => {
  try {
    const response = await api.post('/driver/auth/request-password-reset', { phone });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
},

resetPassword: async (data) => {
  try {
    const response = await api.post('/driver/auth/reset-password', data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
},

logout: async () => {
  try {
    await api.post('/driver/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  }

  // ... existing logout logic ...
}
```

---

## ✅ Testing Checklist

### Customer App
- [ ] Registration works: `POST /customer/auth/register`
- [ ] Login works: `POST /customer/auth/login`
- [ ] Profile loading works: `GET /customer/auth/profile`
- [ ] Password reset works (if implemented)

### Merchant App
- [ ] Registration works: `POST /store/auth/register`
- [ ] Login works: `POST /store/auth/login`
- [ ] Profile loading works: `GET /store/auth/profile`
- [ ] Store operations still work with new auth

### Delivery App
- [ ] Registration works: `POST /driver/auth/register`
- [ ] Login works: `POST /driver/auth/login`
- [ ] Profile loading works: `GET /driver/auth/profile`
- [ ] WebSocket connections still work

---

## 🔧 Key Features

### Base Auth Controller Features
- ✅ Phone uniqueness validation across all user types
- ✅ Password hashing and validation
- ✅ JWT token generation
- ✅ Login attempt logging
- ✅ Password reset framework
- ✅ Logout functionality

### User-Type Specific Features
- **Customers**: Standard user registration and login
- **Store Owners**: Store creation capability, verification status handling
- **Drivers**: Vehicle information collection, approval workflow

### Security Features
- ✅ Role-based middleware protection
- ✅ Proper input validation
- ✅ Secure password hashing (bcrypt, 12 rounds)
- ✅ JWT token-based authentication
- ✅ Login attempt logging and monitoring

---

## 🚀 Deployment Notes

1. **Backward Compatibility**: Old `/auth/*` endpoints remain available but are deprecated
2. **Gradual Rollout**: Update one app at a time to minimize downtime
3. **Token Storage**: All apps use the same JWT token format, no storage changes needed
4. **Error Handling**: Update error messages to match new endpoint responses

---

## 📋 Quick Reference

### Response Formats

#### Successful Login Response
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "phone": "01234567890",
      "avatar": "avatar_url",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here",
    "role": "customer"
  },
  "message": "تم تسجيل الدخول بنجاح"
}
```

#### Successful Registration Response
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "phone": "01234567890",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "message": "تم إنشاء الحساب بنجاح"
}
```

---

## 🔍 Troubleshooting

### Common Issues

1. **"رقم الهاتف أو كلمة المرور غير صحيحة" (Phone or password incorrect)**
   - Check if using correct new endpoints
   - Verify user exists in correct collection
   - Ensure password is correct

2. **"الحساب غير نشط" (Account not active)**
   - For drivers: Wait for admin approval
   - For store owners: May be pending verification
   - For customers: Contact support

3. **"نوع المستخدم غير صحيح" (Invalid user type)**
   - Ensure using correct endpoint for user type
   - Check JWT token contains correct role

### Debug Steps

1. Check server logs for authentication attempts
2. Verify endpoint URLs in frontend code
3. Test API endpoints directly with tools like Postman
4. Check token storage and validity
5. Verify middleware is correctly applied

---

## 📞 Support

For issues with the new authentication system:
1. Check this documentation first
2. Review server logs for error details
3. Test endpoints individually
4. Ensure all frontend updates are applied
5. Contact development team if issues persist

---

*Last Updated: November 18, 2025*
*Version: 1.0.0*