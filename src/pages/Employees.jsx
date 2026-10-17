import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { employeesAPI, authAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import {
    UserCog,
    Search,
    Plus,
    Trash2,
    Eye,
    Mail,
    CheckCircle,
    XCircle,
    Calendar
} from 'lucide-react';

const Employees = () => {
    const { t, isRTL, addNotification } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [employeesList, setEmployeesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null, danger: false });
    const showConfirm = (title, message, onConfirm, danger = true) => setConfirmDialog({ show: true, title, message, onConfirm, danger });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await employeesAPI.getAll();
            setEmployeesList(data);
        } catch (err) {
            console.error('Error fetching employees:', err);
            setEmployeesList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({ displayName: '', email: '', password: '' });

    const handleOpenModal = (mode, emp = null) => {
        setModalMode(mode);
        setSelectedEmployee(emp);
        if (emp && mode === 'view') {
            setFormData({ displayName: emp.displayName, email: emp.email, password: '' });
        } else {
            setFormData({ displayName: '', email: '', password: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEmployee(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAdd = async () => {
        if (!formData.displayName || !formData.email || !formData.password) {
            addNotification(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields', 'warning');
            return;
        }
        try {
            const created = await employeesAPI.add({
                displayName: formData.displayName,
                email: formData.email,
                password: formData.password,
            });
            const newEmployee = {
                id: created?.id || Date.now(),
                displayName: formData.displayName,
                email: formData.email,
                isSuspended: false,
                createdAt: new Date().toISOString(),
            };
            setEmployeesList(prev => [newEmployee, ...prev]);
            addNotification(
                isRTL ? `تمت إضافة الموظف: ${formData.displayName}` : `Employee added: ${formData.displayName}`,
                'success'
            );
            handleCloseModal();
        } catch (err) {
            const apiMsg = err?.response?.data?.message || err?.response?.data || err?.message;
            addNotification(
                (isRTL ? 'فشل إضافة الموظف: ' : 'Failed to add employee: ') +
                (typeof apiMsg === 'string' ? apiMsg : 'server error'),
                'danger'
            );
        }
    };

    const handleDelete = (id, displayName) => {
        showConfirm(
            isRTL ? 'حذف الموظف' : 'Delete Employee',
            isRTL
                ? `هل أنت متأكد من حذف "${displayName}"؟`
                : `Are you sure you want to delete "${displayName}"?`,
            async () => {
                const previous = employeesList;
                setEmployeesList(prev => prev.filter(e => e.id !== id));
                try {
                    await employeesAPI.delete(id);
                    addNotification(
                        isRTL ? `تم حذف الموظف: ${displayName}` : `Employee deleted: ${displayName}`,
                        'success'
                    );
                } catch (err) {
                    setEmployeesList(previous);
                    const apiMsg = err?.response?.data?.message || err?.response?.data || err?.message;
                    addNotification(
                        (isRTL ? 'فشل حذف الموظف: ' : 'Failed to delete employee: ') +
                        (typeof apiMsg === 'string' ? apiMsg : 'server error'),
                        'danger'
                    );
                }
            }
        );
    };

    const handleToggleSuspend = async (employee) => {
        const previous = employeesList;
        const willSuspend = !employee.isSuspended;
        setEmployeesList(prev => prev.map(e => e.id === employee.id ? { ...e, isSuspended: willSuspend } : e));
        try {
            if (willSuspend) {
                await authAPI.suspendUser(employee.id);
            } else {
                await authAPI.unsuspendUser(employee.id);
            }
            addNotification(
                willSuspend
                    ? (isRTL ? `تم إيقاف الموظف: ${employee.displayName}` : `Suspended: ${employee.displayName}`)
                    : (isRTL ? `تم تفعيل الموظف: ${employee.displayName}` : `Activated: ${employee.displayName}`),
                willSuspend ? 'warning' : 'success'
            );
        } catch (err) {
            setEmployeesList(previous);
            const apiMsg = err?.response?.data?.message || err?.response?.data || err?.message;
            addNotification(
                (isRTL ? 'فشل تغيير الحالة: ' : 'Failed to change status: ') +
                (typeof apiMsg === 'string' ? apiMsg : 'server error'),
                'danger'
            );
        }
    };

    const filteredEmployees = employeesList.filter(emp => {
        const q = searchQuery.toLowerCase();
        return emp.displayName.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q);
    });

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    };

    const getStatusBadge = (isSuspended) => {
        if (isSuspended) {
            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{isRTL ? 'موقوف' : 'Suspended'}</span>;
        }
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{isRTL ? 'نشط' : 'Active'}</span>;
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '0001-01-01T00:00:00') return '—';
        return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US');
    };

    const employeeCount = employeesList.length;
    const activeCount = employeesList.filter(e => !e.isSuspended).length;
    const suspendedCount = employeesList.filter(e => e.isSuspended).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('employeesTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1">
                        {t('employeesSubtitle')}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    {t('addEmployee')}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: isRTL ? 'إجمالي الموظفين' : 'Total Employees', value: employeeCount.toString(), color: 'from-blue-500 to-blue-600', icon: UserCog },
                    { label: isRTL ? 'نشط' : 'Active', value: activeCount.toString(), color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
                    { label: isRTL ? 'موقوف' : 'Suspended', value: suspendedCount.toString(), color: 'from-red-500 to-red-600', icon: XCircle },
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="card p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-dark-800 dark:text-white">{stat.value}</p>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
                                </div>
                                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="card p-4">
                <div className="relative">
                    <Search className={`w-5 h-5 text-dark-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`} />
                    <input
                        type="text"
                        placeholder={isRTL ? 'ابحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`input-field w-full ${isRTL ? 'pr-12' : 'pl-12'}`}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="card p-12 text-center text-dark-400">
                    {isRTL ? 'لا يوجد موظفون' : 'No employees found'}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.id} className="card card-hover overflow-hidden">
                            <div className="h-20 bg-gradient-to-br from-primary-500 to-primary-600 relative">
                                <div className="absolute inset-0 bg-black/10" />
                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(employee.isSuspended)}
                                </div>
                            </div>

                            <div className="relative px-6 -mt-10">
                                <div className="w-20 h-20 bg-white dark:bg-dark-800 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-dark-800">
                                    <span className="text-xl font-bold bg-gradient-to-br from-primary-500 to-primary-600 bg-clip-text text-transparent">
                                        {getInitials(employee.displayName)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 pt-4">
                                <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-1">
                                    {employee.displayName}
                                </h3>

                                <div className="space-y-2 text-sm text-dark-500 dark:text-dark-400 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{employee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(employee.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-dark-100 dark:border-dark-700">
                                    <button
                                        onClick={() => handleOpenModal('view', employee)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                        title={isRTL ? 'عرض' : 'View'}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleSuspend(employee)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-orange-500"
                                        title={employee.isSuspended ? (isRTL ? 'تفعيل' : 'Unsuspend') : (isRTL ? 'إيقاف' : 'Suspend')}
                                    >
                                        {employee.isSuspended ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee.id, employee.displayName)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-red-500"
                                        title={isRTL ? 'حذف' : 'Delete'}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-dark-800 dark:text-white">
                                {modalMode === 'add' ? t('addEmployee') : t('view')}
                            </h2>
                            <button onClick={handleCloseModal} className="text-dark-400 hover:text-dark-600 dark:hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    {isRTL ? 'الاسم' : 'Display Name'}
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    disabled={modalMode === 'view'}
                                    className="input-field"
                                    placeholder={isRTL ? 'أدخل الاسم' : 'Enter display name'}
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
                            {modalMode === 'add' && (
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {isRTL ? 'كلمة المرور' : 'Password'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-dark-100 dark:border-dark-700 flex justify-end gap-3">
                            <button onClick={handleCloseModal} className="btn-secondary">
                                {modalMode === 'view' ? t('close') : t('cancel')}
                            </button>
                            {modalMode === 'add' && (
                                <button onClick={handleAdd} className="btn-primary">
                                    {t('save')}
                                </button>
                            )}
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

export default Employees;
