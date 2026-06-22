import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
    Settings as SettingsIcon,
    Globe,
    Moon,
    Sun,
    Bell,
    Shield,
    User,
    Palette,
    Key,
    Smartphone,
    Mail,
    Save,
    Check
} from 'lucide-react';

const NOTIF_KEY = 'app:notificationPrefs';

const Settings = () => {
    const { t, isRTL, isDark, toggleTheme, toggleLanguage, language, addNotification } = useApp();
    const { user } = useAuth();

    const [notifications, setNotifications] = useState(() => {
        try {
            const raw = localStorage.getItem(NOTIF_KEY);
            if (raw) return { ...JSON.parse(raw) };
        } catch { /* ignore */ }
        return {
            email: true,
            push: true,
            sms: false,
            transactions: true,
            updates: true,
            marketing: false,
        };
    });

    // Account form (prefilled from logged-in user)
    const [accountForm, setAccountForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        position: user?.position || (user?.role === 'admin' ? (isRTL ? 'مدير النظام' : 'System Admin') : (isRTL ? 'موظف' : 'Employee')),
    });
    useEffect(() => {
        setAccountForm(prev => ({
            name: user?.name ?? prev.name,
            email: user?.email ?? prev.email,
            phone: user?.phone ?? prev.phone,
            position: prev.position || (user?.role === 'admin' ? (isRTL ? 'مدير النظام' : 'System Admin') : (isRTL ? 'موظف' : 'Employee')),
        }));
    }, [user, isRTL]);

    const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

    const [saved, setSaved] = useState(false);
    const savedTimerRef = useRef(null);

    useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current); }, []);

    const handleAccountChange = (key) => (e) => setAccountForm(prev => ({ ...prev, [key]: e.target.value }));

    const handleSave = () => {
        // Persist notifications to localStorage
        try { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications)); } catch { /* ignore */ }

        // Mirror name back to AuthContext localStorage
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (accountForm.name) parsed.name = accountForm.name;
                localStorage.setItem('user', JSON.stringify(parsed));
            }
        } catch { /* ignore */ }

        // Validate password fields if the user filled them
        if (pwd.current || pwd.next || pwd.confirm) {
            if (!pwd.current || !pwd.next || !pwd.confirm) {
                addNotification?.(isRTL ? 'يرجى ملء جميع حقول كلمة المرور' : 'Fill in all password fields', 'danger');
                return;
            }
            if (pwd.next.length < 6) {
                addNotification?.(isRTL ? 'كلمة المرور الجديدة قصيرة جداً (6 أحرف على الأقل)' : 'New password is too short (min 6)', 'danger');
                return;
            }
            if (pwd.next !== pwd.confirm) {
                addNotification?.(isRTL ? 'كلمتا المرور الجديدتان غير متطابقتين' : 'New passwords do not match', 'danger');
                return;
            }
            // Backend has no change-password endpoint exposed; clear locally and notify
            setPwd({ current: '', next: '', confirm: '' });
            addNotification?.(
                isRTL
                    ? 'تم حفظ الإعدادات محلياً. تغيير كلمة المرور يحتاج endpoint على الخادم.'
                    : 'Settings saved locally. Password change requires a server endpoint.',
                'warning'
            );
        }

        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    };

    const userInitial = (accountForm.name || user?.name || user?.email || '?').charAt(0).toUpperCase();

    const settingsSections = [
        {
            title: isRTL ? 'المظهر' : 'Appearance',
            icon: Palette,
            content: (
                <div className="space-y-6">
                    {/* Theme */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-dark-800 dark:text-white">{t('theme')}</h4>
                            <p className="text-sm text-dark-500">{isRTL ? 'اختر بين الوضع الفاتح والداكن' : 'Choose between light and dark mode'}</p>
                        </div>
                        <div className="flex items-center bg-dark-100 dark:bg-dark-700 rounded-xl p-1">
                            <button
                                onClick={() => !isDark || toggleTheme()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${!isDark ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-500' : 'text-dark-500'
                                    }`}
                            >
                                <Sun className="w-4 h-4" />
                                <span className="text-sm">{t('lightMode')}</span>
                            </button>
                            <button
                                onClick={() => isDark || toggleTheme()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isDark ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-500' : 'text-dark-500'
                                    }`}
                            >
                                <Moon className="w-4 h-4" />
                                <span className="text-sm">{t('darkMode')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-dark-800 dark:text-white">{t('language')}</h4>
                            <p className="text-sm text-dark-500">{isRTL ? 'اختر لغة العرض المفضلة' : 'Choose your preferred display language'}</p>
                        </div>
                        <div className="flex items-center bg-dark-100 dark:bg-dark-700 rounded-xl p-1">
                            <button
                                onClick={() => language !== 'ar' && toggleLanguage()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${language === 'ar' ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-500' : 'text-dark-500'
                                    }`}
                            >
                                <span className="text-sm">العربية</span>
                            </button>
                            <button
                                onClick={() => language !== 'en' && toggleLanguage()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${language === 'en' ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-500' : 'text-dark-500'
                                    }`}
                            >
                                <span className="text-sm">English</span>
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: t('notifications'),
            icon: Bell,
            content: (
                <div className="space-y-4">
                    {[
                        { key: 'email', label: isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications', desc: isRTL ? 'استلام الإشعارات عبر البريد' : 'Receive notifications via email' },
                        { key: 'push', label: isRTL ? 'الإشعارات الفورية' : 'Push Notifications', desc: isRTL ? 'إشعارات المتصفح الفورية' : 'Browser push notifications' },
                        { key: 'sms', label: isRTL ? 'رسائل SMS' : 'SMS Messages', desc: isRTL ? 'إشعارات برسائل نصية' : 'Text message notifications' },
                        { key: 'transactions', label: isRTL ? 'تحديثات الطلبات' : 'Request Updates', desc: isRTL ? 'إشعارات حالة الطلبات' : 'Request status updates' },
                        { key: 'updates', label: isRTL ? 'تحديثات النظام' : 'System Updates', desc: isRTL ? 'إشعارات تحديثات النظام' : 'System update notifications' },
                        { key: 'marketing', label: isRTL ? 'العروض والتسويق' : 'Marketing & Offers', desc: isRTL ? 'عروض وترويجات خاصة' : 'Special offers and promotions' },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-dark-100 dark:border-dark-700 last:border-0">
                            <div>
                                <h4 className="font-medium text-dark-800 dark:text-white">{item.label}</h4>
                                <p className="text-sm text-dark-500">{item.desc}</p>
                            </div>
                            <button
                                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-primary-500' : 'bg-dark-300 dark:bg-dark-600'
                                    }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${notifications[item.key] ? (isRTL ? 'left-1' : 'right-1') : (isRTL ? 'right-1' : 'left-1')
                                    }`} />
                            </button>
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: t('security'),
            icon: Shield,
            content: (
                <div className="space-y-6">
                    {/* Change Password */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-dark-800 dark:text-white">{t('changePassword')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">
                                    {isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
                                </label>
                                <input type="password" className="input-field" placeholder="••••••••" value={pwd.current} onChange={(e) => setPwd(p => ({ ...p, current: e.target.value }))} />
                            </div>
                            <div></div>
                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">
                                    {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                                </label>
                                <input type="password" className="input-field" placeholder="••••••••" value={pwd.next} onChange={(e) => setPwd(p => ({ ...p, next: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">
                                    {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                </label>
                                <input type="password" className="input-field" placeholder="••••••••" value={pwd.confirm} onChange={(e) => setPwd(p => ({ ...p, confirm: e.target.value }))} />
                            </div>
                        </div>
                    </div>

                    {/* Two Factor Auth */}
                    <div className="flex items-center justify-between py-4 border-t border-dark-100 dark:border-dark-700">
                        <div>
                            <h4 className="font-medium text-dark-800 dark:text-white">{t('twoFactorAuth')}</h4>
                            <p className="text-sm text-dark-500">{isRTL ? 'أضف طبقة حماية إضافية لحسابك' : 'Add an extra layer of security to your account'}</p>
                        </div>
                        <button className="btn-secondary flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            {isRTL ? 'تفعيل' : 'Enable'}
                        </button>
                    </div>

                    {/* Active Sessions */}
                    <div className="pt-4 border-t border-dark-100 dark:border-dark-700">
                        <h4 className="font-medium text-dark-800 dark:text-white mb-4">{isRTL ? 'الجلسات النشطة' : 'Active Sessions'}</h4>
                        <div className="space-y-3">
                            {[
                                { device: 'Windows PC - Chrome', location: 'Riyadh, SA', time: isRTL ? 'الآن' : 'Now', current: true },
                                { device: 'iPhone 14 - Safari', location: 'Riyadh, SA', time: isRTL ? 'منذ ساعة' : '1 hour ago', current: false },
                                { device: 'MacBook Pro - Safari', location: 'Jeddah, SA', time: isRTL ? 'منذ 3 أيام' : '3 days ago', current: false },
                            ].map((session, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-5 h-5 text-dark-400" />
                                        <div>
                                            <p className="text-sm font-medium text-dark-800 dark:text-white">{session.device}</p>
                                            <p className="text-xs text-dark-500">{session.location} • {session.time}</p>
                                        </div>
                                    </div>
                                    {session.current ? (
                                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs rounded-full">
                                            {isRTL ? 'الحالية' : 'Current'}
                                        </span>
                                    ) : (
                                        <button className="text-red-500 text-sm hover:underline">
                                            {isRTL ? 'إنهاء' : 'End'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: isRTL ? 'الحساب الشخصي' : 'Account',
            icon: User,
            content: (
                <div className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                            {userInitial}
                        </div>
                        <div>
                            <button className="btn-secondary text-sm" disabled title={isRTL ? 'قريباً' : 'Coming soon'}>
                                {isRTL ? 'تغيير الصورة' : 'Change Photo'}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">
                                {isRTL ? 'الاسم الكامل' : 'Full Name'}
                            </label>
                            <input type="text" className="input-field" value={accountForm.name} onChange={handleAccountChange('name')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">
                                {t('email')}
                            </label>
                            <input type="email" className="input-field" value={accountForm.email} onChange={handleAccountChange('email')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">
                                {t('phone')}
                            </label>
                            <input type="tel" className="input-field" value={accountForm.phone} onChange={handleAccountChange('phone')} dir="ltr" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-600 dark:text-dark-400 mb-2">
                                {isRTL ? 'المنصب' : 'Position'}
                            </label>
                            <input type="text" className="input-field" value={accountForm.position} onChange={handleAccountChange('position')} />
                        </div>
                    </div>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('settingsTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1">
                        {t('settingsSubtitle')}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
                >
                    {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {saved ? (isRTL ? 'تم الحفظ!' : 'Saved!') : t('save')}
                </button>
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">
                {settingsSections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                        <div key={index} className="card overflow-hidden">
                            <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex items-center gap-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <Icon className="w-5 h-5 text-primary-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-dark-800 dark:text-white">{section.title}</h3>
                            </div>
                            <div className="p-6">
                                {section.content}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Settings;
