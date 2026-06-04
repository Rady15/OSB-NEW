import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const { t } = useApp();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has required permissions
    if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(permission => 
            user.permissions.includes(permission)
        );
        
        if (!hasPermission) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-dark-800 dark:text-white mb-2">
                            {t('accessDenied')}
                        </h2>
                        <p className="text-dark-600 dark:text-dark-400 mb-4">
                            {t('insufficientPermissions')}
                        </p>
                        <button 
                            onClick={() => window.history.back()}
                            className="btn-primary"
                        >
                            {t('goBack')}
                        </button>
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;