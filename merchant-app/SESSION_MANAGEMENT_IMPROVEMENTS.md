# Session Management Improvements

This document outlines the comprehensive improvements made to handle session expiration issues in the merchant app.

## Issues Fixed

### 1. **Abrupt Session Expiration**
- **Problem**: Users were being logged out abruptly with only an Arabic error message
- **Solution**: Implemented proactive session monitoring and graceful handling

### 2. **Poor Error Handling**
- **Problem**: 401 errors just cleared tokens without providing user-friendly feedback
- **Solution**: Added token refresh attempts and better error messaging

### 3. **No Session Validation**
- **Problem**: No way to check if a session was still valid before making API calls
- **Solution**: Implemented proactive session validation and monitoring

## New Features Implemented

### 1. Enhanced API Service (`services/api.ts`)

#### New Properties:
- `refreshTokenPromise`: Prevents multiple simultaneous refresh attempts
- `isSessionValid`: Tracks current session status
- `sessionCheckInterval`: Automatic session validation every 5 minutes

#### New Methods:
- `initializeSessionMonitoring()`: Sets up automatic session monitoring
- `validateSession()`: Proactively checks session validity
- `ensureValidSession()`: Validates session before making requests
- `refreshToken()`: Attempts to refresh expired tokens
- `validateAndRefreshIfNeeded()`: Combined validation and refresh
- `destroy()`: Cleanup resources

#### Improved Error Handling:
- **401 Errors**: Try token refresh first before clearing session
- **Session Validation**: Check session validity before each request
- **Better Retry Logic**: More intelligent retry behavior for network issues

### 2. Session Manager (`services/sessionManager.ts`)

#### Features:
- **Session Monitoring**: Continuous monitoring of session validity
- **Toast Notifications**: User-friendly Arabic notifications
- **Automatic Cleanup**: Clears expired sessions and user data
- **Navigation Handling**: Smooth navigation to login on session expiry
- **Configuration Options**: Customizable behavior via config object

#### Key Methods:
- `initialize()`: Start session monitoring
- `checkAndHandleSession()`: Check and handle current session status
- `validateSessionProactively()`: Manual session validation
- `getSessionStatus()`: Get current session status
- `handleSessionExpired()`: Handle session expiry gracefully

### 3. Session Monitor Component (`components/SessionMonitor.tsx`)

#### Purpose:
- **Global Session Handling**: Monitors session across the entire app
- **Event Management**: Handles session-related events
- **Integration**: Integrates with Redux for state management

#### Features:
- **Automatic Initialization**: Starts session monitoring on app load
- **Event Listeners**: Handles session expiration events
- **Redux Integration**: Dispatches logout actions on session expiry
- **Custom Callbacks**: Supports custom handlers for session events

### 4. Enhanced Authentication Stores

#### Redux Slice (`src/redux/slices/authSlice.ts`):
- **Session Validation**: Validates session on user load
- **Better Error Handling**: Handles session expiration gracefully
- **Automatic Cleanup**: Clears auth state on session issues

#### Zustand Store (`stores/authStore.ts`):
- **Proactive Checks**: Validates session before operations
- **Better State Management**: Improved state clearing on errors
- **Enhanced Logging**: Better error logging and debugging

### 5. Updated App Layout (`app/_layout.tsx`)

- **Session Monitor Integration**: Added global session monitoring
- **Navigation Handling**: Smooth navigation on session expiry
- **User Experience**: Better handling of authentication state changes

## How It Works

### 1. **Session Initialization**
```typescript
// On app startup
await sessionManager.initialize();
// This checks existing session and starts monitoring
```

### 2. **Proactive Session Validation**
```typescript
// Before each API request
await this.ensureValidSession();
// Checks if session is still valid, attempts refresh if needed
```

### 3. **Automatic Session Monitoring**
```typescript
// Every 5 minutes
this.sessionCheckInterval = setInterval(async () => {
  await this.validateSession();
}, 5 * 60 * 1000);
```

### 4. **Graceful Session Expiry**
```typescript
// On session expiry
Toast.show({
  type: 'error',
  text1: 'انتهت الجلسة',
  text2: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
});

// After delay, navigate to login
setTimeout(() => {
  this.navigateToLogin();
}, 3000);
```

## User Experience Improvements

### 1. **Proactive Notifications**
- Shows "متصل" toast when session is valid
- Shows "انتهت الجلسة" when session expires
- Clear Arabic error messages

### 2. **Automatic Cleanup**
- Clears stored user data on session expiry
- Clears auth state in Redux/Zustand
- Removes tokens from AsyncStorage

### 3. **Smooth Navigation**
- Graceful redirect to login screen
- No abrupt logouts
- User-friendly transition

### 4. **Session Refresh Attempts**
- Tries to refresh tokens before giving up
- Only clears session after refresh fails
- Reduces unnecessary logouts

## Configuration Options

### Session Manager Configuration:
```typescript
const sessionManager = new SessionManager({
  onSessionExpire: () => {
    // Custom session expiry handler
  },
  onSessionRefresh: () => {
    // Custom session refresh handler
  },
  showToastMessages: true, // Show/hide toast notifications
  autoLogoutDelay: 3000, // Delay before logout (ms)
});
```

## Error Handling

### 1. **Network Errors**
- Exponential backoff retry logic
- Distinguishes between network and auth errors
- Proper error propagation

### 2. **Session Errors**
- Token refresh attempts
- Graceful degradation
- User-friendly error messages

### 3. **State Management**
- Consistent state clearing
- Proper cleanup on logout
- Redux/Zustand synchronization

## Benefits

### 1. **Improved Reliability**
- Fewer unexpected logouts
- Better error recovery
- Proactive session management

### 2. **Better User Experience**
- Clear feedback to users
- Smooth transitions
- Graceful error handling

### 3. **Maintainability**
- Centralized session management
- Consistent error handling
- Better logging and debugging

### 4. **Security**
- Proper token cleanup
- Session validation
- Secure logout handling

## Usage Examples

### Manual Session Validation:
```typescript
import { useSessionManager } from '@/components/SessionMonitor';

function MyComponent() {
  const { validateProactively, getSessionStatus } = useSessionManager();

  const handleCheckSession = async () => {
    const status = await getSessionStatus();
    console.log('Session status:', status);
  };
}
```

### API Service Usage:
```typescript
import apiService from '@/services/api';

// Session validation happens automatically
const products = await apiService.getProducts();

// Manual session check
const isValid = await apiService.isSessionValidAsync();
```

## Future Enhancements

### 1. **Token Refresh Endpoint**
Currently, the refresh token implementation throws an error. In a real implementation, you would:
- Add a `/auth/refresh` endpoint to your API
- Implement proper token refresh logic
- Handle refresh token storage and rotation

### 2. **Background Sync**
- Sync data when session is restored
- Queue failed requests for retry
- Background session validation

### 3. **Enhanced Monitoring**
- Session analytics
- Performance monitoring
- User behavior tracking

## Testing

### Manual Testing:
1. **Session Expiry**: Let session expire and observe graceful handling
2. **Network Errors**: Test with poor network connection
3. **App Backgrounding**: Test session validation on app resume
4. **Logout Flow**: Test both manual and automatic logout

### Automated Testing:
- Session validation tests
- Error handling tests
- Integration tests
- Redux/Zustand state tests

## Deployment Notes

### 1. **Backward Compatibility**
- All changes are backward compatible
- Existing API calls work without modification
- Gradual rollout possible

### 2. **Performance Impact**
- Minimal performance overhead
- Session checks are lightweight
- Monitoring runs in background

### 3. **Debugging**
- Enhanced logging for session events
- Console warnings for session issues
- Better error tracking

## Troubleshooting

### Common Issues:

1. **Session not refreshing**
   - Check if refresh endpoint exists
   - Verify token format
   - Check API response handling

2. **Toast messages not showing**
   - Verify Toast library is configured
   - Check showToastMessages setting
   - Ensure proper import

3. **Navigation issues**
   - Check router configuration
   - Verify navigation paths
   - Test on different screen sizes

### Debug Commands:
```typescript
// Check session status
const status = await sessionManager.getSessionStatus();

// Force session validation
await sessionManager.validateProactively();

// Check API service state
console.log(apiService.isSessionValid);
```

---

This implementation provides a robust, user-friendly session management system that handles the original session expiration issues while providing a better overall user experience.