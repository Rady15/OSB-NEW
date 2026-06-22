import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Building2,
    FileText,
    Briefcase,
    Users,
    Users2,
    UserCog,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';

const Sidebar = () => {
    const { t, isRTL, sidebarOpen, toggleSidebar, isDark } = useApp();
    const { user } = useAuth();
    const location = useLocation();

    const isAdmin = user?.role === 'admin';

    const baseMenuItems = [
        { path: '/', icon: LayoutDashboard, label: 'dashboard' },
        { path: '/my-tasks', icon: FileText, label: 'myTasks', adminOnly: false, employeeOnly: true },
        { path: '/companies', icon: Building2, label: 'companies' },
        { path: '/transactions', icon: FileText, label: 'transactions' },
        { path: '/services', icon: Briefcase, label: 'services' },
        { path: '/employees', icon: UserCog, label: 'employees', adminOnly: true },
        { path: '/users', icon: Users2, label: 'users', adminOnly: true },
        { path: '/reports', icon: BarChart3, label: 'reports' },
        { path: '/settings', icon: Settings, label: 'settings' },
    ];

    const adminMenuItems = [
        { path: '/employee-permissions', icon: UserCog, label: 'employeePermissions' },
        { path: '/dev-hub', icon: Users, label: 'Dev Hub' }
    ];

    const visibleBase = baseMenuItems.filter((item) => {
        if (item.adminOnly && !isAdmin) return false;
        if (item.employeeOnly && isAdmin) return false;
        return true;
    });
    const visibleAdmin = isAdmin ? adminMenuItems : [];

    const menuItems = [...visibleBase, ...visibleAdmin];

    const ChevronIcon = isRTL ? ChevronRight : ChevronLeft;
    const ChevronIconOpen = isRTL ? ChevronLeft : ChevronRight;

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen z-50
          bg-white dark:bg-dark-900 border-${isRTL ? 'l' : 'r'} border-dark-100 dark:border-dark-800
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-72' : 'w-16'}
          lg:fixed lg:h-screen
          ${sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center justify-between px-4 border-b border-dark-100 dark:border-dark-800">
                    <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center w-full' : ''}`}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                            <img src="/ach.png" alt="Logo" className="w-10 h-10 object-contain" />
                        </div>
                        {sidebarOpen && (
                            <div className="animate-fade-in">
                                <h1 className="text-lg font-bold text-dark-800 dark:text-white">{t('appName')}</h1>
                                <p className="text-xs text-dark-400">{t('admin')}</p>
                            </div>
                        )}
                    </div>

                    {/* Close button for mobile */}
                    {sidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-5rem)]">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${sidebarOpen ? '' : 'justify-center'}
                  ${isActive
                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                                        : 'text-dark-600 dark:text-dark-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
                                    }
                `}
                                title={!sidebarOpen ? t(item.label) : ''}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                                {sidebarOpen && (
                                    <span className="font-medium animate-fade-in text-sm">{t(item.label)}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Toggle Button - Desktop only */}
                <button
                    onClick={toggleSidebar}
                    className={`
            hidden lg:flex absolute top-24 ${isRTL ? '-left-3' : '-right-3'}
            w-6 h-6 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700
            rounded-full items-center justify-center
            hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:border-primary-300 dark:hover:border-primary-700
            hover:text-primary-600 dark:hover:text-primary-400
            transition-all duration-200 shadow-md
            text-dark-500
          `}
                >
                    {sidebarOpen ? (
                        <ChevronIcon className="w-4 h-4" />
                    ) : (
                        <ChevronIconOpen className="w-4 h-4" />
                    )}
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
