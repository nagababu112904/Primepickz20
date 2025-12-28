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
    isLoading: true,
    isAuthenticated: false,
    isConfigured: false,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // If Firebase is not configured, skip auth state listener
        if (!isFirebaseConfigured) {
            console.warn('Firebase is not configured. Auth features will not work.');
            setIsLoading(false);
            return;
        }

        // Timeout fallback: if auth state takes too long (5 seconds), stop loading
        const timeout = setTimeout(() => {
            if (isLoading) {
                console.warn('Auth state timeout - stopping loading spinner');
                setIsLoading(false);
            }
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
            clearTimeout(timeout);
            setUser(firebaseUser);
            setIsLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
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
