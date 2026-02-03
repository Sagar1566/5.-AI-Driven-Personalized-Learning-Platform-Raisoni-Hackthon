import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
        setInitialized(true);
    }, []);

    const login = (accessToken: string) => {
        localStorage.setItem('token', accessToken);
        setToken(accessToken);
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        router.push('/login');
    };

    return {
        token,
        login,
        logout,
        isAuthenticated: !!token,
        initialized
    };
}
