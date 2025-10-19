import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from './config';

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      },
      token: await user.getIdToken()
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Email/Password Sign-Up
export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      token: await user.getIdToken()
    };
  } catch (error) {
    console.error('Email Sign-Up Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Email/Password Sign-In
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      token: await user.getIdToken()
    };
  } catch (error) {
    console.error('Email Sign-In Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Sign Out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign Out Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Auth State Listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get Current User
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get Current User Token
export const getCurrentUserToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
