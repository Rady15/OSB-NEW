import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    // Initialize states from localStorage
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'ar';
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([
        { id: 1, message: 'معاملة جديدة مطلوبة - شركة التقنية المتقدمة', time: '5 دقائق', read: false, type: 'info' },
        { id: 2, message: 'تم إكمال معاملة بنجاح - مؤسسة النور', time: '1 ساعة', read: false, type: 'success' },
        { id: 3, message: 'تذكير: موعد تجديد السجل التجاري لشركة الإبداع', time: '2 ساعة', read: true, type: 'warning' },
    ]);
    const [toasts, setToasts] = useState([]);

    // Translation function
    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    // Add Notification in Real-time and trigger Toast
    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        const newNotif = {
            id,
            message,
            time: 'الآن',
            read: false,
            type
        };
        
        // Add to Notifications List
        setNotifications(prev => [newNotif, ...prev]);

        // Add to active Toasts
        const newToast = { id, message, type };
        setToasts(prev => [...prev, newToast]);

        // Remove toast automatically after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    // Remove specific Toast manually
    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Toggle language
    const toggleLanguage = () => {
        const newLang = language === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Toggle sidebar
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Apply theme to document
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Apply language direction
    useEffect(() => {
        document.documentElement.setAttribute('lang', language);
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    }, [language]);

    // Mark notification as read
    const markNotificationRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    // Clear all notifications
    const clearNotifications = () => {
        setNotifications([]);
    };

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
        toggleTheme,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        notifications,
        setNotifications,
        markNotificationRead,
        clearNotifications,
        addNotification,
        toasts,
        removeToast,
        t,
        isRTL: language === 'ar',
        isDark: theme === 'dark',
    };

    return (
        <AppContext.Provider value={value}>
            {children}

            {/* Global Toasts UI overlay */}
            <div className={`fixed z-50 bottom-5 space-y-2 max-w-sm w-full ${language === 'ar' ? 'right-5' : 'left-5'} animate-in fade-in slide-in-from-bottom-5 duration-300`}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        onClick={() => removeToast(toast.id)}
                        className={`p-4 rounded-xl shadow-lg border flex items-center justify-between gap-3 cursor-pointer text-white transform hover:scale-[1.02] transition-transform duration-200 ${
                            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
                            toast.type === 'warning' ? 'bg-amber-600 border-amber-500' :
                            toast.type === 'danger' ? 'bg-red-600 border-red-500' :
                            'bg-blue-600 border-blue-500'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">
                                {toast.type === 'success' ? 'check_circle' :
                                 toast.type === 'warning' ? 'warning' :
                                 toast.type === 'danger' ? 'error' :
                                 'info'}
                            </span>
                            <p className="text-xs font-semibold leading-relaxed text-right">{toast.message}</p>
                        </div>
                        <button className="text-white/70 hover:text-white text-xs font-black">×</button>
                    </div>
                ))}
            </div>
        </AppContext.Provider>
    );
};
