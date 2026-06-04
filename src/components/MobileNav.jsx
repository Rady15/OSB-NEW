import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    LayoutDashboard,
    Building2,
    FileText,
    Briefcase,
    Settings
} from 'lucide-react';

const MobileNav = () => {
    const { t } = useApp();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'dashboard' },
        { path: '/companies', icon: Building2, label: 'companies' },
        { path: '/transactions', icon: FileText, label: 'transactions' },
        { path: '/services', icon: Briefcase, label: 'services' },
        { path: '/settings', icon: Settings, label: 'settings' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-900 border-t border-dark-100 dark:border-dark-800 z-40 px-6 py-2 pb-safe-area-inset-bottom">
            <div className="flex items-center justify-between">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex flex-col items-center gap-1 transition-colors
                                ${isActive
                                    ? 'text-primary-500'
                                    : 'text-dark-400 dark:text-dark-500 hover:text-dark-600'
                                }
                            `}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] font-medium">{t(item.label)}</span>
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileNav;
