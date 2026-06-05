import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { authAPI } from '../services/api';
import {
    UserCog,
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    Briefcase,
    Mail,
    Phone,
    MapPin,
    Award,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

const Employees = () => {
    const { t, isRTL, addNotification } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [employeesList, setEmployeesList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const data = await authAPI.getAllStaff();
                const arr = Array.isArray(data) ? data : data.users || [];
                const formatted = arr.map(u => ({
                    id: u.id || u.userName,
                    name: u.fullName || u.userName || 'موظف',
                    nameEn: u.userName || 'Employee',
                    email: u.email || '—',
                    phone: u.phoneNumber || '—',
                    department: u.department || 'transactions',
                    position: u.position || u.role || 'موظف',
                    positionEn: u.positionEn || u.role || 'Employee',
                    tasksCompleted: u.tasksCompleted || 0,
                    tasksPending: u.tasksPending || 0,
                    rating: u.rating || 5.0,
                    status: u.isActive === false ? 'inactive' : (u.status || 'active'),
                    joinDate: u.createdAt ? u.createdAt.split('T')[0] : '—',
                }));
                setEmployeesList(formatted);
            } catch (err) {
                console.error('Error fetching employees:', err);
                setEmployeesList([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        email: '',
        phone: '',
        department: 'transactions',
        position: '',
        positionEn: '',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        tasksCompleted: 0,
        tasksPending: 0,
        rating: 5.0
    });

    const departments = [
        { value: 'all', label: isRTL ? 'جميع الأقسام' : 'All Departments' },
        { value: 'transactions', label: isRTL ? 'المعاملات' : 'Transactions' },
        { value: 'licenses', label: isRTL ? 'التراخيص' : 'Licenses' },
        { value: 'customer-service', label: isRTL ? 'خدمة العملاء' : 'Customer Service' },
        { value: 'accounting', label: isRTL ? 'المحاسبة' : 'Accounting' },
        { value: 'legal', label: isRTL ? 'القانوين' : 'Legal' },
        { value: 'hr', label: isRTL ? 'الموارد البشرية' : 'HR' },
    ];

    const getDepartmentColor = (dept) => {
        const colors = {
            transactions: 'from-blue-500 to-blue-600',
            licenses: 'from-purple-500 to-purple-600',
            'customer-service': 'from-emerald-500 to-emerald-600',
            accounting: 'from-amber-500 to-amber-600',
            legal: 'from-red-500 to-red-600',
            hr: 'from-pink-500 to-pink-600',
        };
        return colors[dept] || 'from-gray-500 to-gray-600';
    };

    const getStatusBadge = (status) => {
        const config = {
            active: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: isRTL ? 'نشط' : 'Active' },
            vacation: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: isRTL ? 'في إجازة' : 'On Vacation' },
            inactive: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: isRTL ? 'غير نشط' : 'Inactive' },
        };
        const { color, label } = config[status] || config.active;
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').slice(0, 2).map(n => n[0]).join('');
    };

    const handleOpenModal = (mode, emp = null) => {
        setModalMode(mode);
        setSelectedEmployee(emp);
        if (emp) {
            setFormData({ ...emp });
        } else {
            setFormData({
                name: '',
                nameEn: '',
                email: '',
                phone: '',
                department: 'transactions',
                position: '',
                positionEn: '',
                status: 'active',
                joinDate: new Date().toISOString().split('T')[0],
                tasksCompleted: 0,
                tasksPending: 0,
                rating: 5.0
            });
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

    const handleSave = async () => {
        if (modalMode === 'view') {
            handleCloseModal();
            return;
        }

        if (modalMode === 'edit') {
            const previous = employeesList;
            setEmployeesList(prev => prev.map(e => e.id === selectedEmployee.id ? { ...formData } : e));
            handleCloseModal();

            const userName = selectedEmployee.id || selectedEmployee.nameEn;
            const newStatus = formData.status;
            const oldStatus = selectedEmployee.status;
            if (newStatus !== oldStatus) {
                try {
                    if (newStatus === 'inactive') {
                        await authAPI.suspendUser(userName);
                    } else if (newStatus === 'active') {
                        await authAPI.unsuspendUser(userName);
                    }
                    addNotification(
                        isRTL
                            ? `تم تحديث حالة الموظف: ${formData.name}`
                            : `Employee status updated: ${formData.name}`,
                        'success'
                    );
                } catch (err) {
                    setEmployeesList(previous);
                    const apiMsg = err?.response?.data?.message || err?.response?.data || err?.message;
                    addNotification(
                        (isRTL ? 'فشل تحديث الحالة: ' : 'Failed to update status: ') +
                        (typeof apiMsg === 'string' ? apiMsg : 'server error'),
                        'danger'
                    );
                }
            } else {
                addNotification(
                    isRTL ? `تم تعديل بيانات الموظف: ${formData.name}` : `Employee updated: ${formData.name}`,
                    'info'
                );
            }
        } else {
            try {
                const created = await authAPI.addStaff({
                    email: formData.email,
                    userName: formData.nameEn || formData.email,
                    password: 'Temp@1234',
                    role: 'Staff',
                    phoneNumber: formData.phone,
                });
                const newEmployee = {
                    ...formData,
                    id: created?.id || formData.nameEn || formData.email,
                };
                setEmployeesList(prev => [newEmployee, ...prev]);
                addNotification(
                    isRTL ? `تمت إضافة الموظف: ${formData.name}` : `Employee added: ${formData.name}`,
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
        }
    };

    const handleDelete = (id) => {
        if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا الموظف؟' : 'Are you sure you want to delete this employee?')) {
            setEmployeesList(prev => prev.filter(e => e.id !== id));
            addNotification(
                isRTL
                    ? 'تم حذف الموظف محلياً (لا يوجد endpoint حذف على الخادم)'
                    : 'Employee removed locally (no delete endpoint on the server).',
                'warning'
            );
        }
    };

    const handleToggleSuspend = async (employee) => {
        const previous = employeesList;
        const userName = employee.id || employee.nameEn;
        const willSuspend = employee.status !== 'inactive';
        setEmployeesList(prev => prev.map(e => e.id === employee.id ? { ...e, status: willSuspend ? 'inactive' : 'active' } : e));
        try {
            if (willSuspend) {
                await authAPI.suspendUser(userName);
            } else {
                await authAPI.unsuspendUser(userName);
            }
            addNotification(
                willSuspend
                    ? (isRTL ? `تم إيقاف الموظف: ${employee.name}` : `Suspended: ${employee.name}`)
                    : (isRTL ? `تم تفعيل الموظف: ${employee.name}` : `Activated: ${employee.name}`),
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
        const matchesSearch = emp.name.includes(searchQuery) ||
            emp.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
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

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: isRTL ? 'إجمالي الموظفين' : 'Total Employees', value: employeesList.length.toString(), color: 'from-blue-500 to-blue-600', icon: UserCog },
                    { label: isRTL ? 'نشط' : 'Active', value: employeesList.filter(e => e.status === 'active').length.toString(), color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
                    { label: isRTL ? 'في إجازة' : 'On Leave', value: employeesList.filter(e => e.status === 'on-leave').length.toString(), color: 'from-amber-500 to-amber-600', icon: Clock },
                    { label: isRTL ? 'المهام المكتملة' : 'Tasks Done', value: employeesList.reduce((acc, curr) => acc + curr.tasksCompleted, 0).toString(), color: 'from-purple-500 to-purple-600', icon: Award },
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

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
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
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="input-field w-full md:w-56"
                    >
                        {departments.map(dept => (
                            <option key={dept.value} value={dept.value}>{dept.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {
                    filteredEmployees.map((employee) => (
                        <div key={employee.id} className="card card-hover overflow-hidden group">
                            {/* Header with gradient */}
                            <div className={`h-24 bg-gradient-to-br ${getDepartmentColor(employee.department)} relative`}>
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute top-4 right-4 animate-fade-in">
                                    {getStatusBadge(employee.status)}
                                </div>
                            </div>

                            {/* Avatar */}
                            <div className="relative px-6 -mt-10">
                                <div className="w-20 h-20 bg-white dark:bg-dark-800 rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-dark-800 group-hover:scale-105 transition-transform duration-300">
                                    <span className={`text-xl font-bold bg-gradient-to-br ${getDepartmentColor(employee.department)} bg-clip-text text-transparent`}>
                                        {getInitials(isRTL ? employee.name : employee.nameEn)}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 pt-4">
                                <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-1">
                                    {isRTL ? employee.name : employee.nameEn}
                                </h3>
                                <p className="text-sm text-primary-500 mb-4 font-medium uppercase tracking-wider">
                                    {isRTL ? employee.position : employee.positionEn}
                                </p>

                                <div className="space-y-2 text-sm text-dark-500 dark:text-dark-400 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{employee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span dir="ltr">{employee.phone}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between py-4 border-y border-dark-100 dark:border-dark-700">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="font-bold">{employee.tasksCompleted}</span>
                                        </div>
                                        <p className="text-xs text-dark-400">{t('completed')}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-bold">{employee.tasksPending}</span>
                                        </div>
                                        <p className="text-xs text-dark-400">{t('pending')}</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                                            <Award className="w-4 h-4" />
                                            <span className="font-bold">{employee.rating}</span>
                                        </div>
                                        <p className="text-xs text-dark-400">{isRTL ? 'التقييم' : 'Rating'}</p>
                                    </div>
                                </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2 pt-4">
                                        <button
                                            onClick={() => handleOpenModal('view', employee)}
                                            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal('edit', employee)}
                                            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-amber-500"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleSuspend(employee)}
                                            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-orange-500"
                                            title={employee.status === 'inactive' ? (isRTL ? 'تفعيل' : 'Unsuspend') : (isRTL ? 'إيقاف' : 'Suspend')}
                                        >
                                            {employee.status === 'inactive' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee.id)}
                                            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Employee Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                            <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-dark-800 dark:text-white">
                                    {modalMode === 'add' ? t('addEmployee') : modalMode === 'edit' ? t('edit') : t('view')}
                                </h2>
                                <button onClick={handleCloseModal} className="text-dark-400 hover:text-dark-600 dark:hover:text-white">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            placeholder="email@company.sa"
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
                                    <div>
                                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                            {isRTL ? 'القسم' : 'Department'}
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            disabled={modalMode === 'view'}
                                            className="input-field"
                                        >
                                            {departments.filter(d => d.value !== 'all').map(dept => (
                                                <option key={dept.value} value={dept.value}>{dept.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                            {isRTL ? 'المسمى الوظيفي' : 'Position'}
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            disabled={modalMode === 'view'}
                                            className="input-field"
                                            placeholder={isRTL ? 'أدخل المسمى الوظيفي' : 'Enter position'}
                                        />
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
                                            <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
                                            <option value="vacation">{isRTL ? 'في إجازة' : 'On Vacation'}</option>
                                            <option value="inactive">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                            {isRTL ? 'تاريخ الانضمام' : 'Join Date'}
                                        </label>
                                        <input
                                            type="date"
                                            name="joinDate"
                                            value={formData.joinDate}
                                            onChange={handleInputChange}
                                            disabled={modalMode === 'view'}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
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
                )
            }
        </div>
    );
};

export default Employees;
