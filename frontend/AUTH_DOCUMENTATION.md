# Authentication System Documentation

## Overview

The authentication system provides a comprehensive context for managing user authentication, authorization, and session handling throughout the application.

## Components

### AuthContext

Located in `src/context/AuthContext.jsx` - Provides authentication state and methods.

### useAuth Hook

Located in `src/hooks/useAuth.js` - Custom hook to access authentication context.

### AuthRedirectRoute

Located in `src/components/AuthRedirectRoute.jsx` - Redirects authenticated users away from public pages.

### ProtectedRoute

Located in `src/components/ProtectedRoute.jsx` - Protects routes from unauthenticated access.

## Features

### 1. Authentication State Management

- `user`: Current user object with authentication status
- `loading`: Boolean indicating if auth state is being determined
- `isAuthenticated`: Boolean indicating if user is currently authenticated

### 2. Token Management

- Automatic token validation and expiration checking
- Secure token storage in localStorage
- Automatic cleanup of expired tokens

### 3. User Management

- `login(token)`: Authenticate user with JWT token
- `logout()`: Clear authentication state and token
- `updateUserProfile(updates)`: Update user profile without affecting auth status

### 4. Role-Based Access Control

- `getUserRole()`: Get current user's role
- `getUserPermissions()`: Get array of user permissions
- `hasPermission(permission)`: Check if user has specific permission

### 5. Route Protection

- **AuthRedirectRoute**: Redirects authenticated users from landing page to dashboard
- **ProtectedRoute**: Protects dashboard routes from unauthenticated access

## Usage Examples

### Basic Authentication Check

```jsx
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Role-Based Rendering

```jsx
import { useAuth } from "../hooks/useAuth";

function AdminPanel() {
  const { hasPermission, getUserRole } = useAuth();

  if (getUserRole() !== "admin") {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      {hasPermission("user_management") && <UserManagementSection />}
    </div>
  );
}
```

### Login/Logout

```jsx
import { useAuth } from "../hooks/useAuth";

function AuthButtons() {
  const { login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await api.login(credentials);
      login(response.data.token);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Profile Updates

```jsx
import { useAuth } from "../hooks/useAuth";

function ProfileSettings() {
  const { user, updateUserProfile } = useAuth();

  const handleUpdatePreferences = () => {
    updateUserProfile({
      preferences: {
        theme: "dark",
        notifications: true,
      },
    });
  };

  return (
    <div>
      <h2>Profile Settings</h2>
      <button onClick={handleUpdatePreferences}>Update Preferences</button>
    </div>
  );
}
```

## Route Configuration

### Public Routes (Redirect if Authenticated)

- `/` - Landing page (redirects to /dashboard if authenticated)
- `/login` - Login page

### Protected Routes (Require Authentication)

- `/dashboard` - Main dashboard
- `/projects` - Projects management
- `/members` - Team members
- `/roles` - Role management
- `/settings` - User settings

### Special Routes

- `/onboarding` - Protected + Company guard
- `/company-registration` - Protected only

## Security Features

1. **Token Expiration**: Automatic detection and handling of expired tokens
2. **Secure Storage**: JWT tokens stored in localStorage with validation
3. **Route Protection**: Automatic redirects based on authentication status
4. **Permission Checking**: Role-based access control throughout the app

## Error Handling

The auth context includes comprehensive error handling:

- Invalid tokens are automatically cleared
- Expired tokens trigger automatic logout
- Network errors during profile updates are handled gracefully
- Invalid authentication attempts are properly reported

## Best Practices

1. Always use the `useAuth` hook instead of directly accessing context
2. Check `loading` state before rendering authentication-dependent content
3. Use `ProtectedRoute` for all authenticated-only pages
4. Use `AuthRedirectRoute` for public pages that shouldn't be shown to authenticated users
5. Implement proper error boundaries around authentication-dependent components
