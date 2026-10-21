const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, init: RequestInit = {}) {

    const res = await fetch(`${API_URL}${path}`, { ...init, credentials: 'include' });

    if (res.status === 401 && path !== '/login' && path !== '/me') {
        window.dispatchEvent(new Event('auth:expired'));
    }

    return res;
    
}