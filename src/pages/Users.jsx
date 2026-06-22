import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { authAPI, dashboardAPI, documentsAPI } from '../services/api';
import {
    Users as UsersIcon,
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    Shield,
    Mail,
    Phone,
    Calendar,
    MoreVertical,
    CheckCircle,
    XCircle,
    Key,
    FileText,
    Building2,
    MapPin
} from 'lucide-react';

const Users = () => {
    const { t, isRTL } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [usersList, setUsersList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '', nameEn: '', email: '', phone: '', role: 'employee', status: 'active'
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const [companiesData, allDocsData] = await Promise.all([
                    dashboardAPI.getCompaniesStats(),
                    documentsAPI.getAdminAllDocuments()
                ]);
                const companies = companiesData?.companies || [];
                const allDocs = Array.isArray(allDocsData) ? allDocsData : (allDocsData?.documents || allDocsData?.data || []);
                const docsByUser = new Map();
                for (const doc of allDocs) {
                    const uid = doc.userId ?? doc.appUserId;
                    if (!uid) continue;
                    if (!docsByUser.has(uid)) docsByUser.set(uid, []);
                    docsByUser.get(uid).push(doc);
                }
                const list = companies.map(c => ({
                    id: c.userId || c.id,
                    userId: c.userId,
                    name: c.nameAr || c.userName || '—',
                    nameEn: c.nameEn || c.userName || '—',
                    email: c.userEmail || c.email || '—',
                    phone: c.phone || '—',
                    role: 'user',
                    status: 'active',
                    companyName: c.nameAr || c.nameEn || '—',
                    companyType: c.companyType || '—',
                    capital: c.capital,
                    city: c.city || '—',
                    activities: c.activities || [],
                    commercialRegisterNumber: c.commercialRegisterNumber,
                    unifiedNumber: c.unifiedNumber,
                    zakatTaxNumber: c.zakatTaxNumber,
                    nitaqatNumber: c.nitaqatNumber,
                    laborOfficeNumber: c.laborOfficeNumber,
                    vatNumber: c.vatNumber,
                    partners: c.partners || [],
                    managers: c.managers || [],
                    totalDocuments: docsByUser.get(c.userId)?.length || 0,
                    documents: (docsByUser.get(c.userId) || []).map(d => ({
                        id: d.id,
                        name: d.documentName || d.documentType || '—',
                        number: d.referenceNumber || '—',
                        issueDate: (d.issueDate || '').split('T')[0] || '—',
                        expiryDate: (d.expiryDate || '').split('T')[0] || '—',
                        fileUrl: d.fileUrl || '#',
                    })),
                }));
                setUsersList(list);
            } catch {
                setUsersList([]);
            }
        };
        fetchUsers();
    }, []);

    const getRoleBadge = (role) => {
        const config = {
            admin: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: isRTL ? 'مدير النظام' : 'Admin' },
            manager: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: isRTL ? 'مدير' : 'Manager' },
            employee: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: isRTL ? 'موظف' : 'Employee' },
            viewer: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: isRTL ? 'مشاهد' : 'Viewer' },
            user: { color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', label: isRTL ? 'مستخدم تطبيق' : 'App User' },
        };
        const { color, label } = config[role] || config.user;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                <Shield className="w-3 h-3" />
                {label}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        return status === 'active' ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                {t('active')}
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="w-3 h-3" />
                {t('inactive')}
            </span>
        );
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleOpenModal = async (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        if (user) {
            const form = { ...user };
            if (mode === 'view' && user.userId) {
                try {
                    const docsData = await documentsAPI.getUserDocuments(user.userId);
                    const list = Array.isArray(docsData) ? docsData : (docsData?.documents || docsData?.data || []);
                    form.documents = list.map(d => ({
                        id: d.id,
                        name: d.documentName || d.documentType || '—',
                        number: d.referenceNumber || '—',
                        issueDate: (d.issueDate || '').split('T')[0] || '—',
                        expiryDate: (d.expiryDate || '').split('T')[0] || '—',
                        fileUrl: d.fileUrl || '#',
                    }));
                    form.totalDocuments = form.documents.length;
                    setSelectedUser(prev => prev ? { ...prev, documents: form.documents, totalDocuments: form.documents.length } : null);
                } catch {
                    form.documents = form.documents || [];
                }
            }
            setFormData(form);
        } else {
            setFormData({
                name: '',
                nameEn: '',
                email: '',
                phone: '',
                role: 'employee',
                status: 'active'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (modalMode === 'view') {
            handleCloseModal();
            return;
        }

        if (modalMode === 'edit') {
            setUsersList(prev => prev.map(u => u.id === selectedUser.id ? { ...formData } : u));
        } else {
            setUsersList(prev => [{ ...formData, id: Date.now(), lastLogin: '-' }, ...prev]);
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) {
            setUsersList(prev => prev.filter(u => u.id !== id));
        }
    };

    const filteredUsers = usersList.filter(user => {
        const q = searchQuery.toLowerCase();
        return user.name.includes(q) ||
            user.nameEn.toLowerCase().includes(q) ||
            user.email.toLowerCase().includes(q) ||
            user.companyName?.toLowerCase().includes(q) ||
            user.phone?.includes(q);
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('usersTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1">
                        {t('usersSubtitle')}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    {t('addUser')}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: isRTL ? 'إجمالي المستخدمين' : 'Total Users', value: usersList.length.toString(), color: 'from-blue-500 to-blue-600' },
                    { label: isRTL ? 'لديهم مستندات' : 'With Documents', value: usersList.filter(u => u.totalDocuments > 0).length.toString(), color: 'from-emerald-500 to-emerald-600' },
                    { label: isRTL ? 'بدون مستندات' : 'No Documents', value: usersList.filter(u => !u.totalDocuments).length.toString(), color: 'from-orange-500 to-orange-600' },
                    { label: isRTL ? 'إجمالي المستندات' : 'Total Documents', value: usersList.reduce((s, u) => s + (u.totalDocuments || 0), 0).toString(), color: 'from-amber-500 to-amber-600' },
                    { label: isRTL ? 'شركات مسجلة' : 'Registered Companies', value: usersList.filter(u => u.totalDocuments > 0).length.toString(), color: 'from-purple-500 to-purple-600' },
                ].map((stat, index) => (
                    <div key={index} className="card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold text-dark-800 dark:text-white">{stat.value}</p>
                                <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
                            </div>
                            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                                <UsersIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex-1 relative">
                    <Search className={`w-5 h-5 text-dark-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`} />
                    <input
                        type="text"
                        placeholder={t('search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`input-field ${isRTL ? 'pr-12' : 'pl-12'}`}
                    />
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="card card-hover p-6 group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                    {getInitials(isRTL ? user.name : user.nameEn)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-dark-800 dark:text-white">
                                        {isRTL ? user.name : user.nameEn}
                                    </h3>
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>
                            <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
                                <MoreVertical className="w-4 h-4 text-dark-400" />
                            </button>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400">
                                <Phone className="w-4 h-4" />
                                <span dir="ltr">{user.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400">
                                <Building2 className="w-4 h-4" />
                                <span>{user.companyName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400">
                                <MapPin className="w-4 h-4" />
                                <span>{user.city}</span>
                            </div>
                            <div className="flex items-center gap-3 text-dark-500 dark:text-dark-400">
                                <FileText className="w-4 h-4" />
                                <span>{isRTL ? `المستندات: ${user.totalDocuments || 0}` : `Documents: ${user.totalDocuments || 0}`}</span>
                            </div>
                            {user.activities?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {user.activities.slice(0, 3).map((a, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-medium">
                                            {a}
                                        </span>
                                    ))}
                                    {user.activities.length > 3 && (
                                        <span className="text-[10px] text-dark-400">+{user.activities.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-100 dark:border-dark-700">
                            {getStatusBadge(user.status)}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleOpenModal('view', user)}
                                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleOpenModal('edit', user)}
                                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-dark-500 hover:text-amber-500"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-dark-500 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-dark-800 dark:text-white">
                                {modalMode === 'add' ? t('addUser') : modalMode === 'edit' ? t('edit') : t('view')}
                            </h2>
                            <button onClick={handleCloseModal} className="text-dark-400 hover:text-dark-600 dark:hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('name')} ({isRTL ? 'عربي' : 'Arabic'})
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder={isRTL ? 'أدخل الاسم' : 'Enter name'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('name')} ({isRTL ? 'إنجليزي' : 'English'})
                                    </label>
                                    <input
                                        type="text"
                                        name="nameEn"
                                        value={formData.nameEn}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder="Enter English name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('email')}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('phone')}
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder="+966..."
                                    />
                                </div>
                                {modalMode === 'view' && formData.companyName && (
                                    <div className="border-t border-dark-100 dark:border-dark-700 pt-4 mt-2 space-y-3">
                                        <h3 className="font-semibold text-dark-800 dark:text-white text-sm flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-primary-500" />
                                            {isRTL ? 'بيانات الشركة' : 'Company Info'}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-dark-400 text-xs">{isRTL ? 'الشركة' : 'Company'}</span>
                                                <p className="text-dark-700 dark:text-dark-200 font-medium">{formData.companyName}</p>
                                            </div>
                                            <div>
                                                <span className="text-dark-400 text-xs">{isRTL ? 'النوع' : 'Type'}</span>
                                                <p className="text-dark-700 dark:text-dark-200 font-medium">{formData.companyType}</p>
                                            </div>
                                            {formData.capital != null && (
                                                <div>
                                                    <span className="text-dark-400 text-xs">{isRTL ? 'رأس المال' : 'Capital'}</span>
                                                    <p className="text-dark-700 dark:text-dark-200 font-medium">{Number(formData.capital).toLocaleString()}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-dark-400 text-xs">{isRTL ? 'المدينة' : 'City'}</span>
                                                <p className="text-dark-700 dark:text-dark-200 font-medium">{formData.city || '—'}</p>
                                            </div>
                                        </div>
                                        {formData.activities?.length > 0 && (
                                            <div>
                                                <span className="text-dark-400 text-xs">{isRTL ? 'الأنشطة' : 'Activities'}</span>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {formData.activities.map((a, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium">{a}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {isRTL ? 'الدور' : 'Role'}
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    >
                                        <option value="admin">{isRTL ? 'مدير النظام' : 'Admin'}</option>
                                        <option value="manager">{isRTL ? 'مدير' : 'Manager'}</option>
                                        <option value="employee">{isRTL ? 'موظف' : 'Employee'}</option>
                                        <option value="viewer">{isRTL ? 'مشاهد' : 'Viewer'}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('status')}
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    >
                                        <option value="active">{t('active')}</option>
                                        <option value="inactive">{t('inactive')}</option>
                                    </select>
                                </div>
                            </div>

                            {modalMode === 'view' && formData.documents?.length > 0 && (
                                <div className="border-t border-dark-100 dark:border-dark-700 pt-4 mt-4">
                                    <h3 className="text-lg font-semibold text-dark-800 dark:text-white flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-primary-500" />
                                        {isRTL ? 'المستندات' : 'Documents'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {formData.documents.map(doc => (
                                            <div key={doc.id} className="p-3 rounded-xl border border-dark-100 dark:border-dark-700 bg-dark-50/50 dark:bg-dark-800/40">
                                                <p className="font-semibold text-sm text-dark-800 dark:text-white">{doc.name}</p>
                                                <p className="text-xs text-dark-500 mt-1">{isRTL ? 'رقم:' : 'No:'} {doc.number}</p>
                                                <p className="text-xs text-dark-500">{isRTL ? 'تاريخ الإصدار:' : 'Issue:'} {doc.issueDate}</p>
                                                <p className="text-xs text-dark-500">{isRTL ? 'تاريخ الانتهاء:' : 'Expiry:'} {doc.expiryDate}</p>
                                                {doc.fileUrl && doc.fileUrl !== '#' && (
                                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                                                       className="text-xs text-primary-500 hover:text-primary-600 font-semibold mt-2 inline-block">
                                                        {isRTL ? 'عرض الملف' : 'View File'}
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-dark-100 dark:border-dark-700 flex justify-end gap-3">
                            <button onClick={handleCloseModal} className="btn-secondary">
                                {modalMode === 'view' ? t('close') : t('cancel')}
                            </button>
                            {modalMode !== 'view' && (
                                <button onClick={handleSave} className="btn-primary">
                                    {t('save')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
