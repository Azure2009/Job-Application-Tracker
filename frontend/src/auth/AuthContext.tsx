import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from '../lib/api';

type User = { 

    id: string; 
    full_name: string; 
    email: string 

};

type AuthState = {

    user: User | null;
    loading: boolean;
    refresh: () => Promise<void>;
    logout: () => Promise<void>;

};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    async function refresh() {

        try {

            const res = await apiFetch('/me');
            setUser(res.ok ? await res.json() : null);

        } catch {

            setUser(null);

        } finally {

            setLoading(false);

        }
    }

    async function logout() {

        await apiFetch('/logout', { method: 'POST' });
        
        setUser(null);

    }

    useEffect(() => {

        refresh();

    }, []);

    useEffect(() => {

        const onExpired = () => setUser(null);
        window.addEventListener('auth:expired', onExpired);
        return () => window.removeEventListener('auth:expired', onExpired);
        
    }, []);

    return (

        <AuthContext.Provider value={{ user, loading, refresh, logout }}>
            {children}
        </AuthContext.Provider>

    );
}

export function useAuth() {

    const ctx = useContext(AuthContext);

    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');

    return ctx;
}