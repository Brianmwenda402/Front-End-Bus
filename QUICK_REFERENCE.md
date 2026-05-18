# Authentication Tracking - Quick Reference

## 🔑 Core Methods

### `login(userData, role, userId)`
Tracks user login with role and timestamp.
```javascript
const { login } = useUser();
login(
  { fullName: 'John Doe', email: 'john@example.com', phone: '123' },
  'User', // or 'Admin'
  123     // backend ID or Date.now()
);
```

### `register(userData, role, userId)`
Tracks account creation with role.
```javascript
const { register } = useUser();
register(
  { fullName: 'Jane Doe', email: 'jane@example.com', phone: '456' },
  'Admin', // or 'User'
  456
);
```

### `logout()`
Clears all authentication state.
```javascript
const { logout } = useUser();
logout();
```

---

## 📊 Auth State Object

```javascript
const { authState } = useUser();

authState = {
  isAuthenticated: true,        // Boolean - is user logged in?
  userRole: 'Admin',           // 'Admin' or 'User'
  userId: 123,                 // Unique identifier
  loginTime: '2026-05-17T...',  // ISO timestamp
  email: 'user@example.com'    // User's email
}
```

---

## 🎨 UI Components

### UserInfoBadge (Compact)
```javascript
<UserInfoBadge compact={true} onPress={() => {}} />
```
**Shows:** Avatar icon + Name + Role

### UserInfoBadge (Full)
```javascript
<UserInfoBadge compact={false} onPress={() => {}} />
```
**Shows:** Avatar + Name + Email + Role + Login Time

### UserStatusIndicator
```javascript
<UserStatusIndicator />
```
**Shows:** Status dot + Role + Name (minimal)

---

## 🎯 Common Patterns

### Check if Authenticated
```javascript
if (authState.isAuthenticated) {
  // User is logged in
}
```

### Check User Role
```javascript
if (authState.userRole === 'Admin') {
  // Show admin UI
} else {
  // Show user UI
}
```

### Display User Name
```javascript
<Text>{user.fullName}</Text>
```

### Format Login Time
```javascript
const mins = Math.floor((now - new Date(authState.loginTime)) / 60000);
// "5 minutes ago"
```

---

## 📍 Where to Use

| Component | Purpose |
|-----------|---------|
| LOGIN.js | Track login with role |
| CreateAccount.js | Track registration with role |
| UserProfile.js | Display auth status & user info |
| UserInfoBadge.js | Reusable auth display component |
| Navigation Bar | Show current user status |
| Protected Screens | Check authentication before rendering |

---

## ⚠️ Important Notes

- **Role values:** Must be exactly `'Admin'` or `'User'`
- **Color coding:** 
  - Admin: Pink (#f472b6)
  - User: Blue (#60a5fa)
- **Login time:** Stored as ISO string, displayed as relative time
- **userId:** Can be `Date.now()` or backend ID
- **Logout clears all:** After logout, authState resets

---

## 🔄 State Flow

```
User Logs In
    ↓
login() called
    ↓
authState updated
    ↓
Components re-render
    ↓
User sees profile with role
```

---

## 💾 Integration Checklist

- [x] UserContext updated with auth tracking
- [x] LOGIN.js uses login() method
- [x] CreateAccount.js uses register() method
- [x] UserProfile.js displays auth status
- [x] UserInfoBadge component created
- [x] Role-based UI colors implemented
- [ ] Connect to Spring Boot API
- [ ] Persist auth state (AsyncStorage)
- [ ] Refresh token handling
- [ ] Add logout to navigation

---

## 🚀 Next: Backend Integration

Replace `Date.now()` with backend ID:

```javascript
// LOGIN.js
const response = await fetch('/api/users/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const backendUser = await response.json();

// Use backend ID instead of Date.now()
login(backendUser, role, backendUser.id);
```

---

## 📞 Support

For complete details, see:
- `AUTH_TRACKING_GUIDE.md` - Full documentation
- `AUTH_TRACKING_EXAMPLES.js` - Code examples
- `UserContext.js` - Implementation details
