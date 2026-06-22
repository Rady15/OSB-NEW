import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Mock employee data
const mockEmployees = [
    {
        id: 1,
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        password: 'password123',
        role: 'employee',
        permissions: ['view_transactions', 'update_status']
    },
    {
        id: 2,
        name: 'سارة أحمد',
        email: 'sara@example.com',
        password: 'password123',
        role: 'employee',
        permissions: ['view_transactions', 'update_status']
    },
    {
        id: 3,
        name: 'محمد علي',
        email: 'mohamed@example.com',
        password: 'password123',
        role: 'employee',
        permissions: ['view_transactions', 'update_status']
    },
    {
        id: 4,
        name: 'فاطمة خالد',
        email: 'fatima@example.com',
        password: 'password123',
        role: 'employee',
        permissions: ['view_transactions', 'update_status']
    },
    {
        id: 5,
        name: 'علي حسن',
        email: 'ali@example.com',
        password: 'password123',
        role: 'employee',
        permissions: ['view_transactions', 'update_status']
    },
    {
        id: 6,
        name: 'نورة سعد',
        email: 'noura@example.com',
        password: 'password123',
        role: 'employee',
        permissions: ['view_transactions', 'update_status']
    },
    {
        id: 7,
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        permissions: ['view_all', 'manage_users', 'update_all']
    }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in from localStorage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        // Decode the JWT payload (middle segment) to check expiry
        const isTokenExpired = (() => {
            if (!token) return true;
            const parts = token.split('.');
            if (parts.length !== 3) return true;
            try {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                if (payload.exp && Date.now() >= payload.exp * 1000) return true;
            } catch {
                return true;
            }
            return false;
        })();

        if (storedUser && token && !isTokenExpired) {
            setUser(JSON.parse(storedUser));
        } else {
            // Token expired or missing — clear stale state
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Attempt API Login
            const data = await authAPI.login(email, password);

            // Decode JWT to extract claims (role, id)
            const token = data?.token || data?.accessToken;
            let role = 'employee';
            let userId = '';
            let userName = '';

            if (token) {
                try {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                        const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                        role = roleClaim ? roleClaim.toLowerCase() : 'employee';
                        userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
                        userName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '';
                    }
                } catch { /* ignore decode errors */ }
            }

            const isAdmin = role === 'admin';

            const userObj = {
                id: userId || data.email || email,
                name: data.displayName || userName || data.email?.split('@')[0] || email.split('@')[0],
                email: data.email || email,
                role: isAdmin ? 'admin' : 'employee',
                permissions: isAdmin
                    ? ['view_all', 'manage_users', 'update_all']
                    : ['view_transactions', 'update_status']
            };

            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
            return { success: true, user: userObj };
        } catch (error) {
            console.warn('API Login failed, trying mock accounts fallback...', error);
            // Fallback for mock/demo accounts
            const employee = mockEmployees.find(emp => 
                emp.email === email && emp.password === password
            );
            
            if (employee) {
                const userObj = {
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    role: employee.role,
                    permissions: employee.permissions
                };
                
                setUser(userObj);
                localStorage.setItem('user', JSON.stringify(userObj));
                localStorage.setItem('token', 'mock-jwt-token'); // Set mock token
                return { success: true, user: userObj };
            }
            
            throw new Error(error.response?.data?.message || error.message || 'Invalid email or password');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};