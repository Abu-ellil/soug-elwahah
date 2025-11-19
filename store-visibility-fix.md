# Store Visibility Issue - Complete Fix Guide

## Problem Summary
Your application shows that the user profile loads successfully with role "store", approved verification status, and existing stores array, yet API requests to `/api/store/statistics` consistently fail with the error "لا توجد متاجر معتمدة" (No approved stores exist).

## Root Causes Identified

### 1. **Data Inconsistency Between Models**
- **StoreOwner model** has a syntax error in the verificationStatus enum definition
- **StoreOwner.stores array** is not properly synchronized with actual Store documents
- **Store documents** may not have the correct `verificationStatus: "approved"`

### 2. **Controller Logic Issues**
- Statistics controller queries stores directly by `ownerId` without checking `verificationStatus`
- Middleware `isStoreOwnerWithApprovedStore` properly checks for approved stores, but the data might be inconsistent

### 3. **Authentication Flow**
- User profile endpoint successfully returns stores data, but subsequent API calls fail because the backend checks are more strict

## Solution Steps

### Step 1: Fix Model Syntax Error
```bash
# Already fixed: StoreOwner.js line 9
# Changed from: verificationStatus: { type: String, default: 'approved' ['pending', 'approved', 'rejected'] }
# To: verificationStatus: { type: String, default: 'approved', enum: ['pending', 'approved', 'rejected'] }
```

### Step 2: Run Data Synchronization
```bash
cd api
node sync-store-relationships.js
```

This script will:
- Synchronize StoreOwner.stores array with actual Store documents
- Remove orphaned stores
- Fix data inconsistencies

### Step 3: Debug Current Data State
```bash
cd api
node debug-store-visibility.js
```

This will show you:
- How many StoreOwners have approved stores
- Which stores are not approved
- Current data state

### Step 4: Update Store Approval Status (if needed)
If stores need to be manually approved:

```javascript
// Run this in MongoDB or create a script
db.stores.updateMany(
  { verificationStatus: "pending" },
  { $set: { verificationStatus: "approved", isActive: true, isOpen: true } }
);
```

### Step 5: Test the Fix
1. Restart the API server
2. Test profile endpoint: `GET /api/store/auth/profile`
3. Test statistics endpoint: `GET /api/store/statistics`

## Enhanced Debugging Features Added

### Backend Logging
- **Auth Middleware**: Now logs detailed store verification status
- **Statistics Controller**: Added comprehensive logging for store queries
- **Store Controller**: Added logging for approved store lookups
- **Auth Controller**: Enhanced profile response logging

### Frontend Logging
- **Auth Store**: Enhanced profile loading with store details
- **API Service**: Added statistics request logging

## Common Scenarios and Solutions

### Scenario 1: Store Status is "pending"
**Solution**: 
```javascript
// Update store status to approved
db.stores.updateOne(
  { _id: "STORE_ID_HERE" },
  { $set: { verificationStatus: "approved", isActive: true } }
);
```

### Scenario 2: StoreOwner.stores array is empty
**Solution**: 
```javascript
// Run the sync script to rebuild relationships
node sync-store-relationships.js
```

### Scenario 3: Multiple stores but none approved
**Solution**: 
```javascript
// Approve all stores for this owner
db.stores.updateMany(
  { ownerId: "OWNER_ID_HERE" },
  { $set: { verificationStatus: "approved", isActive: true } }
);
```

## Expected Data Flow

1. **User Login** → AuthController.getProfile() → Returns user with stores array
2. **Frontend** → Loads user data → Shows stores in UI
3. **API Request** → Goes through middleware → isStoreOwnerWithApprovedStore
4. **Middleware** → Checks StoreOwner.stores for approved stores
5. **Controller** → Processes request with approved store data

## Prevention Measures

### 1. Data Validation
- Ensure StoreOwner.stores array is always in sync with Store documents
- Validate store approval status updates

### 2. Database Constraints
- Use proper mongoose schemas with enum validation
- Add database indexes for better query performance

### 3. Logging
- Keep enhanced debugging logs in production (at appropriate levels)
- Monitor store approval status changes

## Files Modified

1. **api/src/models/StoreOwner.js** - Fixed enum syntax
2. **api/src/middlewares/auth.middleware.js** - Added detailed logging
3. **api/src/controllers/store/statistics.controller.js** - Added logging and approved store query
4. **api/src/controllers/store/store.controller.js** - Added logging
5. **api/src/controllers/store/auth.controller.js** - Enhanced profile logging
6. **merchant-app/stores/authStore.ts** - Added store detail logging
7. **merchant-app/services/api.ts** - Added request logging

## Test Commands

```bash
# Check API logs for detailed debugging
tail -f api/logs/app.log

# Run debug script
cd api && node debug-store-visibility.js

# Sync relationships
cd api && node sync-store-relationships.js

# Test profile endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://192.168.1.4:5000/api/store/auth/profile

# Test statistics endpoint  
curl -H "Authorization: Bearer YOUR_TOKEN" http://192.168.1.4:5000/api/store/statistics
```

## Next Steps

1. Run the sync script to fix data inconsistencies
2. Check the debug output to identify remaining issues
3. Manually approve stores if needed
4. Test the complete flow
5. Monitor logs to ensure everything works correctly