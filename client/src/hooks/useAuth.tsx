import { useState, useEffect, useRef, createContext, useContext, type ReactNode } from 'react';
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
    const hasResolved = useRef(false);

    useEffect(() => {
        // If Firebase is not configured, skip auth state listener
        if (!isFirebaseConfigured) {
            console.warn('Firebase is not configured. Auth features will not work.');
            setIsLoading(false);
            hasResolved.current = true;
            return;
        }

        // Timeout fallback: if auth state takes too long (3 seconds), stop loading
        const timeout = setTimeout(() => {
            if (!hasResolved.current) {
                console.warn('Auth state timeout - stopping loading spinner');
                hasResolved.current = true;
                setIsLoading(false);
            }
        }, 3000);

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
            if (!hasResolved.current) {
                clearTimeout(timeout);
                hasResolved.current = true;
                setUser(firebaseUser);
                setIsLoading(false);
            } else {
                // Update user even after initial resolution (for logout/login)
                setUser(firebaseUser);
            }
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
