# Firebase Google Sign-In Setup Guide

## 🔥 Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `apicts-fx`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your domain to authorized domains:
   - `localhost` (for development)
   - Your production domain

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app
4. Register app with nickname: `apicts-fx-web`
5. Copy the Firebase configuration object

### 4. Update Environment Variables
Replace the placeholder values in `.env.local` with your actual Firebase config:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=apicts-fx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=apicts-fx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=apicts-fx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d
```

## 🚀 Features Implemented

### ✅ Backend Integration
- **Firebase Authentication Service** (`/src/lib/firebase/auth.js`)
- **Firebase Configuration** (`/src/lib/firebase/config.js`)
- **API Endpoint** (`/api/auth/firebase`) for syncing Firebase users with database
- **Updated User Model** with Firebase UID and profile picture fields

### ✅ Frontend Integration
- **Google Sign-In buttons** on both login and register pages
- **Loading states** during authentication
- **Error handling** for authentication failures
- **Automatic user creation** in database when signing in with Google

### ✅ Authentication Flow
1. User clicks "Continue with Google"
2. Firebase handles Google OAuth
3. User data sent to `/api/auth/firebase`
4. User created/updated in database
5. JWT token generated for API access
6. User redirected to dashboard

## 🧪 Testing

### Test Google Sign-In:
1. Visit `http://localhost:3004/register` or `http://localhost:3004/login`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. User should be created in database and redirected to dashboard

### Check Database:
- New users will have `firebaseUid` field populated
- Profile pictures from Google will be stored in `profilePicture` field
- Username will be generated from Google display name or email

## 🔧 Troubleshooting

### Common Issues:
1. **"Firebase config not found"** - Check environment variables
2. **"Google Sign-In popup blocked"** - Allow popups for localhost
3. **"Invalid domain"** - Add localhost to Firebase authorized domains
4. **"API key restrictions"** - Configure Firebase API key restrictions

### Debug Steps:
1. Check browser console for errors
2. Verify Firebase config in Network tab
3. Check database for user creation
4. Verify JWT token generation

## 📱 Production Deployment

### Before deploying:
1. Add production domain to Firebase authorized domains
2. Update environment variables with production Firebase config
3. Configure Firebase API key restrictions
4. Test authentication flow in production environment

## 🎯 Next Steps

- [ ] Test Google Sign-In functionality
- [ ] Add error handling for edge cases
- [ ] Implement user profile management
- [ ] Add social login options (Facebook, Twitter)
- [ ] Implement account linking (Google + Email/Password)
