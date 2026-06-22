import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import {
    Users as UsersIcon,
    Search,
    Eye,
    Shield,
    Mail,
    Calendar,
    MoreVertical,
    CheckCircle,
    XCircle,
    AlertTriangle,
    UserCheck,
    UserX,
    Clock
} from 'lucide-react';

const Users = () => {
    const { t, isRTL } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null, danger: false });
    const showConfirm = (title, message, onConfirm, danger = true) => setConfirmDialog({ show: true, title, message, onConfirm, danger });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await authAPI.getAllUsers();
            const list = Array.isArray(data) ? data : (data?.users || data?.data || []);
            setUsersList(list);
        } catch {
            setUsersList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getRoleBadge = (roles) => {
        const role = roles?.[0] || 'User';
        const config = {
            Admin: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: isRTL ? 'مدير النظام' : 'Admin' },
            User: { color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', label: isRTL ? 'مستخدم' : 'User' },
            Employee: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: isRTL ? 'موظف' : 'Employee' },
        };
        const { color, label } = config[role] || config.User;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                <Shield className="w-3 h-3" />
                {label}
            </span>
        );
    };

    const getStatusBadge = (isSuspended) => {
        return !isSuspended ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                {isRTL ? 'نشط' : 'Active'}
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="w-3 h-3" />
                {isRTL ? 'موقوف' : 'Suspended'}
            </span>
        );
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '0001-01-01T00:00:00') return '—';
        return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleToggleSuspend = (user) => {
        if (user.isSuspended) {
            showConfirm(
                isRTL ? 'إلغاء الإيقاف' : 'Unsuspend User',
                isRTL ? `هل تريد إلغاء إيقاف المستخدم "${user.displayName}"؟` : `Unsuspend user "${user.displayName}"?`,
                async () => {
                    try {
                        await authAPI.unsuspendUser(user.id);
                        setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, isSuspended: false } : u));
                    } catch {
                        // silent
                    }
                }
            );
        } else {
            showConfirm(
                isRTL ? 'إيقاف المستخدم' : 'Suspend User',
                isRTL ? `هل تريد إيقاف المستخدم "${user.displayName}"؟` : `Suspend user "${user.displayName}"?`,
                async () => {
                    try {
                        await authAPI.suspendUser(user.id);
                        setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, isSuspended: true } : u));
                    } catch {
                        // silent
                    }
                }
            );
        }
    };

    const filteredUsers = usersList.filter(user => {
        if (roleFilter !== 'all' && (user.roles?.[0] || 'User') !== roleFilter) return false;
        const q = searchQuery.toLowerCase();
        return (user.displayName || '').toLowerCase().includes(q) ||
            (user.email || '').toLowerCase().includes(q);
    });

    const activeCount = usersList.filter(u => !u.isSuspended).length;
    const suspendedCount = usersList.filter(u => u.isSuspended).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('usersTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1">
                        {t('usersSubtitle')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: isRTL ? 'إجمالي المستخدمين' : 'Total Users', value: usersList.length.toString(), color: 'from-blue-500 to-blue-600', icon: UsersIcon },
                    { label: isRTL ? 'المستخدمين النشطين' : 'Active', value: activeCount.toString(), color: 'from-emerald-500 to-emerald-600', icon: UserCheck },
                    { label: isRTL ? 'المستخدمين الموقوفين' : 'Suspended', value: suspendedCount.toString(), color: 'from-red-500 to-red-600', icon: UserX },
                    { label: isRTL ? 'المسؤولين' : 'Admins', value: usersList.filter(u => u.roles?.includes('Admin')).length.toString(), color: 'from-amber-500 to-amber-600', icon: Shield },
                ].map((stat, index) => (
                    <div key={index} className="card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-dark-800 dark:text-white">{stat.value}</p>
                                <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
                            </div>
                            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className={`w-5 h-5 text-dark-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`input-field ${isRTL ? 'pr-12' : 'pl-12'}`}
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="input-field sm:w-44"
                    >
                        <option value="all">{isRTL ? 'جميع الأدوار' : 'All Roles'}</option>
                        <option value="User">{isRTL ? 'مستخدم' : 'User'}</option>
                        <option value="Admin">{isRTL ? 'مدير' : 'Admin'}</option>
                        <option value="Employee">{isRTL ? 'موظف' : 'Employee'}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="card card-hover p-6 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${user.isSuspended ? 'from-red-400 to-red-500' : 'from-primary-500 to-accent-500'} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                                        {getInitials(user.displayName)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-dark-800 dark:text-white truncate">
                                            {user.displayName || '—'}
                                        </h3>
                                        {getRoleBadge(user.roles)}
                                    </div>
                                </div>
                                <div className="relative">
                                    <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
                                        <MoreVertical className="w-4 h-4 text-dark-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <span>{isRTL ? 'تاريخ التسجيل: ' : 'Joined: '}{formatDate(user.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400">
                                    <Clock className="w-4 h-4 shrink-0" />
                                    <span>{isRTL ? 'آخر نشاط: ' : 'Last active: '}{formatDate(user.lastActiveAt)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-100 dark:border-dark-700">
                                {getStatusBadge(user.isSuspended)}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleViewUser(user)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                        title={isRTL ? 'عرض' : 'View'}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleSuspend(user)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            user.isSuspended
                                                ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                                : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        }`}
                                        title={user.isSuspended ? (isRTL ? 'إلغاء الإيقاف' : 'Unsuspend') : (isRTL ? 'إيقاف' : 'Suspend')}
                                    >
                                        {user.isSuspended ? <UserCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-dark-400">
                            <UsersIcon className="w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg font-medium">{isRTL ? 'لا يوجد مستخدمين' : 'No users found'}</p>
                        </div>
                    )}
                </div>
            )}

            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
                        <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-dark-800 dark:text-white">
                                {isRTL ? 'تفاصيل المستخدم' : 'User Details'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-dark-400 hover:text-dark-600 dark:hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-dark-100 dark:border-dark-700">
                                <div className={`w-16 h-16 bg-gradient-to-br ${selectedUser.isSuspended ? 'from-red-400 to-red-500' : 'from-primary-500 to-accent-500'} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                    {getInitials(selectedUser.displayName)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-dark-800 dark:text-white">{selectedUser.displayName || '—'}</h3>
                                    {getRoleBadge(selectedUser.roles)}
                                    <div className="mt-1">{getStatusBadge(selectedUser.isSuspended)}</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-dark-400 shrink-0" />
                                    <span className="text-dark-700 dark:text-dark-200">{selectedUser.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-dark-400 shrink-0" />
                                    <span className="text-dark-700 dark:text-dark-200">
                                        {isRTL ? 'تاريخ التسجيل: ' : 'Joined: '}{formatDate(selectedUser.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="w-4 h-4 text-dark-400 shrink-0" />
                                    <span className="text-dark-700 dark:text-dark-200">
                                        {isRTL ? 'آخر نشاط: ' : 'Last active: '}{formatDate(selectedUser.lastActiveAt)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Shield className="w-4 h-4 text-dark-400 shrink-0" />
                                    <span className="text-dark-700 dark:text-dark-200">
                                        {isRTL ? 'الدور: ' : 'Role: '}{(selectedUser.roles || []).join(', ') || (isRTL ? 'لا يوجد' : 'None')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-dark-100 dark:border-dark-700 flex justify-end gap-3">
                            <button onClick={handleCloseModal} className="btn-secondary">
                                {t('close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                show={confirmDialog.show}
                title={confirmDialog.title}
                message={confirmDialog.message}
                danger={confirmDialog.danger}
                onConfirm={() => { confirmDialog.onConfirm?.(); setConfirmDialog({ show: false }); }}
                onCancel={() => setConfirmDialog({ show: false })}
            />
        </div>
    );
};

export default Users;
