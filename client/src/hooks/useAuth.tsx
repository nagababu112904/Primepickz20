import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { auth, logOut } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
            setUser(firebaseUser);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await logOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}

export type { User };
