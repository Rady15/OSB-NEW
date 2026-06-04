import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
    Search,
    Bell,
    Moon,
    Sun,
    Globe,
    Menu,
    User,
    LogOut,
    Settings,
    ChevronDown,
    Check
} from 'lucide-react';

const Header = () => {
    const {
        t,
        isRTL,
        isDark,
        toggleTheme,
        toggleLanguage,
        toggleSidebar,
        notifications,
        markNotificationRead,
        language
    } = useApp();
    
    const { user, logout } = useAuth();

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-20 bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 dark:text-dark-400 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search */}
                <div className="hidden md:flex items-center relative">
                    <Search className={`w-5 h-5 text-dark-400 absolute ${isRTL ? 'right-4' : 'left-4'}`} />
                    <input
                        type="text"
                        placeholder={t('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`
              w-64 lg:w-80 py-2.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}
              bg-dark-50 dark:bg-dark-800 border border-transparent
              rounded-xl text-dark-700 dark:text-white
              placeholder:text-dark-400 dark:placeholder:text-dark-500
              focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-dark-700
              transition-all duration-200
            `}
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 dark:text-dark-400 transition-all duration-200 hover:scale-105"
                    title={isDark ? t('lightMode') : t('darkMode')}
                >
                    {isDark ? (
                        <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </button>

                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 dark:text-dark-400 transition-all duration-200 hover:scale-105"
                    title={t('language')}
                >
                    <Globe className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">
                        {language === 'ar' ? 'EN' : 'ع'}
                    </span>
                </button>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-500 dark:text-dark-400 transition-all duration-200 hover:scale-105"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className={`
              absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-[calc(100vw-2rem)] sm:w-80
              bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-dark-100 dark:border-dark-700
              overflow-hidden animate-slide-up z-50
            `}>
                            <div className="p-4 border-b border-dark-100 dark:border-dark-700">
                                <h3 className="font-semibold text-dark-800 dark:text-white">{t('notifications')}</h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-dark-400">
                                        {t('noData')}
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => markNotificationRead(notification.id)}
                                            className={`
                                                p-4 border-b border-dark-50 dark:border-dark-700 cursor-pointer
                                                hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors flex items-start gap-3
                                                ${!notification.read ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''}
                                            `}
                                        >
                                            <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                                                notification.type === 'success' ? 'bg-emerald-500' :
                                                notification.type === 'warning' ? 'bg-amber-500' :
                                                notification.type === 'danger' ? 'bg-red-500' :
                                                'bg-blue-500'
                                            }`} />
                                            <div>
                                                <p className="text-sm text-dark-700 dark:text-dark-200">{notification.message}</p>
                                                <p className="text-xs text-dark-400 mt-1">{notification.time}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-all duration-200"
                    >
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden lg:block text-right">
                            <p className="text-sm font-medium text-dark-700 dark:text-white">{user?.name || 'User'}</p>
                            <p className="text-xs text-dark-400">{user?.role || t('user')}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-dark-400 hidden lg:block" />
                    </button>

                    {/* Profile Dropdown */}
                    {showProfile && (
                        <div className={`
              absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56
              bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-dark-100 dark:border-dark-700
              overflow-hidden animate-slide-up z-50
            `}>
                            <div className="p-4 border-b border-dark-100 dark:border-dark-700">
                                <p className="font-semibold text-dark-800 dark:text-white">{user?.name || 'User'}</p>
                                <p className="text-sm text-dark-400">{user?.email || 'user@example.com'}</p>
                            </div>
                            <div className="p-2">
                                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
                                    <Settings className="w-4 h-4" />
                                    <span className="text-sm">{t('settings')}</span>
                                </button>
                                <button 
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm">{t('logout')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
