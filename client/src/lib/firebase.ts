import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    type User
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug: Log config status (only keys, not values for security)
const configKeys = Object.keys(firebaseConfig);
const missingKeys = configKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
    console.error('❌ Firebase config missing keys:', missingKeys);
    console.error('💡 Make sure these environment variables are set in Vercel:');
    missingKeys.forEach(key => {
        const envVar = key === 'apiKey' ? 'VITE_FIREBASE_API_KEY'
            : key === 'authDomain' ? 'VITE_FIREBASE_AUTH_DOMAIN'
                : key === 'projectId' ? 'VITE_FIREBASE_PROJECT_ID'
                    : key === 'storageBucket' ? 'VITE_FIREBASE_STORAGE_BUCKET'
                        : key === 'messagingSenderId' ? 'VITE_FIREBASE_MESSAGING_SENDER_ID'
                            : key === 'appId' ? 'VITE_FIREBASE_APP_ID'
                                : key;
        console.error(`   - ${envVar}`);
    });
}

// Check if Firebase is already initialized to avoid duplicate app errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Flag to check if config is valid
export const isFirebaseConfigured = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
);

// Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

// Auth Functions with config check
export const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        return { user: null, error: 'Firebase is not configured. Please check environment variables.' };
    }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { user: result.user, error: null };
    } catch (error: any) {
        console.error('Google sign-in error:', error);
        return { user: null, error: error.message };
    }
};

export const signInWithFacebook = async () => {
    if (!isFirebaseConfigured) {
        return { user: null, error: 'Firebase is not configured. Please check environment variables.' };
    }
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        return { user: result.user, error: null };
    } catch (error: any) {
        console.error('Facebook sign-in error:', error);
        return { user: null, error: error.message };
    }
};

export const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
        return { user: null, error: 'Firebase is not configured. Please check environment variables.' };
    }
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error: any) {
        let message = error.message;
        if (error.code === 'auth/user-not-found') message = 'No account found with this email.';
        if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
        if (error.code === 'auth/invalid-email') message = 'Invalid email address.';
        if (error.code === 'auth/invalid-credential') message = 'Invalid email or password.';
        return { user: null, error: message };
    }
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseConfigured) {
        return { user: null, error: 'Firebase is not configured. Please check environment variables.' };
    }
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
            await updateProfile(result.user, { displayName });
        }
        return { user: result.user, error: null };
    } catch (error: any) {
        let message = error.message;
        if (error.code === 'auth/email-already-in-use') message = 'An account with this email already exists.';
        if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
        return { user: null, error: message };
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

export { onAuthStateChanged };
export type { User };
