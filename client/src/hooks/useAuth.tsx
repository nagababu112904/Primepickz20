import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { auth, logOut, isFirebaseConfigured } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isConfigured: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false, // Default to false so pages don't get stuck
    isAuthenticated: false,
    isConfigured: false,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        // If Firebase is not configured, immediately stop loading
        if (!isFirebaseConfigured) {
            console.warn('Firebase is not configured. Auth features will not work.');
            setIsLoading(false);
            setHasInitialized(true);
            return;
        }

        // Failsafe timeout: If auth state doesn't resolve in 2 seconds, stop loading
        const timeout = setTimeout(() => {
            if (!hasInitialized) {
                console.warn('Auth state timeout - proceeding without auth');
                setIsLoading(false);
                setHasInitialized(true);
            }
        }, 2000);

        try {
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
                clearTimeout(timeout);
                setUser(firebaseUser);
                setIsLoading(false);
                setHasInitialized(true);
            }, (error) => {
                console.error('Auth state error:', error);
                clearTimeout(timeout);
                setIsLoading(false);
                setHasInitialized(true);
            });

            return () => {
                clearTimeout(timeout);
                unsubscribe();
            };
        } catch (error) {
            console.error('Failed to setup auth listener:', error);
            clearTimeout(timeout);
            setIsLoading(false);
            setHasInitialized(true);
        }
    }, []);

    const logout = async () => {
        await logOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            isConfigured: isFirebaseConfigured,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}

export type { User };
