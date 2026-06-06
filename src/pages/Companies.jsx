import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { authAPI, servicesAPI, documentsAPI } from '../services/api';
import {
    Building2,
    Search,
    Plus,
    Filter,
    Download,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    UserPlus
} from 'lucide-react';

const Companies = () => {
    const { t, isRTL, addNotification } = useApp();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [companiesList, setCompaniesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [docsByCompany, setDocsByCompany] = useState({});

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const [data, rawDocs] = await Promise.all([
                authAPI.getAllUsers(),
                documentsAPI.getAllCompaniesDocuments()
                    .then(d => documentsAPI.groupByCompany(d))
                    .catch(err => {
                        console.warn('documents fetch failed:', err?.message || err);
                        return [];
                    })
            ]);
            const docsMap = {};
            for (const g of rawDocs) {
                docsMap[String(g.companyId)] = g.documents;
            }
            setDocsByCompany(docsMap);
            // Map api users to company schema
            const formatted = (Array.isArray(data) ? data : data.users || []).map(u => {
                const id = u.id || u.userName;
                const realDocs = docsMap[String(id)] || docsMap[String(u.userName)] || [];
                return {
                    id,
                    name: u.fullName || u.userName || 'مستخدم بدون اسم',
                    nameEn: u.userName || 'User',
                    type: u.role || 'عميل',
                    registrationNumber: u.phoneNumber || '1010XXXXXX',
                    taxNumber: u.taxNumber || '300XXXXXXXXXXXX',
                    status: u.isActive === false ? 'inactive' : 'active',
                    registrationDate: u.createdAt?.split('T')[0] || '2026-01-01',
                    expiryDate: '2027-01-01',
                    phone: u.phoneNumber || '—',
                    email: u.email || '—',
                    address: u.address || 'الرياض',
                    documents: realDocs.length > 0 ? realDocs : (u.documents || [
                        { id: 1, name: 'السجل التجاري', number: u.phoneNumber || '1010XXXXXX', issueDate: '2025-05-15', expiryDate: '2027-05-15', fileUrl: '#' }
                    ])
                };
            });
            setCompaniesList(formatted);
        } catch (error) {
            console.error('Error fetching companies:', error);
            // Fallback mock if server fails
            setCompaniesList([
                { id: 1, name: 'شركة التقنية المتقدمة', nameEn: 'Advanced Tech', type: 'عميل', registrationNumber: '1010123456', taxNumber: '300123456789012', status: 'active', registrationDate: '2020-05-15', expiryDate: '2027-05-15', phone: '+966501234567', email: 'info@advtech.sa', address: 'الرياض، العليا', documents: [{ id: 1, name: 'السجل التجاري', number: '1010123456', issueDate: '2020-05-15', expiryDate: '2027-05-15', fileUrl: '#' }] }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        type: 'ذات مسؤولية محدودة',
        registrationNumber: '',
        taxNumber: '',
        expiryDate: '',
        email: '',
        phone: '',
        address: '',
        status: 'active'
    });

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        const icons = {
            active: CheckCircle,
            pending: Clock,
            inactive: XCircle,
        };
        const Icon = icons[status];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                <Icon className="w-3.5 h-3.5" />
                {t(status)}
            </span>
        );
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleOpenModal = (mode, company = null) => {
        setModalMode(mode);
        setSelectedCompany(company);
        if (company) {
            setFormData({ ...company });
        } else {
            setFormData({
                name: '',
                nameEn: '',
                type: 'ذات مسؤولية محدودة',
                registrationNumber: '',
                taxNumber: '',
                expiryDate: '',
                email: '',
                phone: '',
                address: '',
                status: 'active'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCompany(null);
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
            const previous = companiesList;
            setCompaniesList(prev => prev.map(c => c.id === selectedCompany.id ? { ...formData } : c));
            handleCloseModal();

            // Persist status change via the user suspend/unsuspend endpoint when changed
            const newStatus = formData.status;
            const oldStatus = selectedCompany.status;
            if (newStatus !== oldStatus) {
                const userName = selectedCompany.id || selectedCompany.nameEn;
                try {
                    if (newStatus === 'inactive') {
                        await authAPI.suspendUser(userName);
                    } else if (newStatus === 'active') {
                        await authAPI.unsuspendUser(userName);
                    }
                    addNotification(
                        isRTL
                            ? `تم تحديث حالة الشركة: ${formData.name}`
                            : `Company status updated: ${formData.name}`,
                        'success'
                    );
                } catch (err) {
                    // Rollback
                    setCompaniesList(previous);
                    const apiMsg = err?.response?.data?.message || err?.response?.data || err?.message;
                    addNotification(
                        (isRTL ? 'فشل تحديث الحالة: ' : 'Failed to update status: ') +
                        (typeof apiMsg === 'string' ? apiMsg : 'server error'),
                        'danger'
                    );
                }
            } else {
                addNotification(
                    isRTL ? `تم تعديل بيانات الشركة: ${formData.name}` : `Company updated: ${formData.name}`,
                    'info'
                );
            }
        } else {
            // Backend has no public "create company" endpoint, so this stays local
            const newCompany = {
                ...formData,
                id: Date.now(),
                registrationDate: new Date().toISOString().split('T')[0]
            };
            setCompaniesList(prev => [...prev, newCompany]);
            addNotification(
                isRTL
                    ? `تمت إضافة الشركة محلياً: ${newCompany.name} (لا يوجد endpoint إضافة على الخادم)`
                    : `Company added locally: ${newCompany.name} (no create endpoint on the server)`,
                'warning'
            );
            handleCloseModal();
        }
    };

    const handleDelete = (id) => {
        const target = companiesList.find(c => c.id === id);
        if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه الشركة؟' : 'Are you sure you want to delete this company?')) {
            setCompaniesList(prev => prev.filter(c => c.id !== id));
            if (target) {
                addNotification(
                    isRTL
                        ? `تم حذف الشركة محلياً: ${target.name} (لا يوجد endpoint حذف على الخادم)`
                        : `Company removed locally: ${target.name} (no delete endpoint on the server)`,
                    'warning'
                );
            }
        }
    };

    const handleToggleSuspend = async (company) => {
        const previous = companiesList;
        const userName = company.id || company.nameEn;
        const willSuspend = company.status !== 'inactive';
        setCompaniesList(prev => prev.map(c => c.id === company.id ? { ...c, status: willSuspend ? 'inactive' : 'active' } : c));
        try {
            if (willSuspend) {
                await authAPI.suspendUser(userName);
            } else {
                await authAPI.unsuspendUser(userName);
            }
            addNotification(
                willSuspend
                    ? (isRTL ? `تم إيقاف الشركة: ${company.name}` : `Suspended: ${company.name}`)
                    : (isRTL ? `تم تفعيل الشركة: ${company.name}` : `Activated: ${company.name}`),
                willSuspend ? 'warning' : 'success'
            );
        } catch (err) {
            setCompaniesList(previous);
            const apiMsg = err?.response?.data?.message || err?.response?.data || err?.message;
            addNotification(
                (isRTL ? 'فشل تغيير الحالة: ' : 'Failed to change status: ') +
                (typeof apiMsg === 'string' ? apiMsg : 'server error'),
                'danger'
            );
        }
    };

    const filteredCompanies = companiesList.filter(company => {
        const matchesSearch = company.name.includes(searchQuery) ||
            company.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.registrationNumber.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Admin-only: assign an entire company file (all its requests) to an employee
    const [assignModal, setAssignModal] = useState({ open: false, company: null });
    const [assignEmployee, setAssignEmployee] = useState('');
    const [staffOptions, setStaffOptions] = useState([]);
    const [assignBusy, setAssignBusy] = useState(false);

    useEffect(() => {
        if (user?.role !== 'admin') return;
        authAPI.getAllStaff()
            .then(d => {
                const arr = Array.isArray(d) ? d : (d?.users || []);
                setStaffOptions(arr.map(s => ({ id: s.id || s.userName, label: `${s.userName} (${s.email || s.userName})` })));
            })
            .catch(() => setStaffOptions([]));
    }, [user]);

    const openAssignModal = (company) => {
        setAssignModal({ open: true, company });
        setAssignEmployee('');
    };
    const closeAssignModal = () => {
        if (assignBusy) return;
        setAssignModal({ open: false, company: null });
        setAssignEmployee('');
    };

    const submitAssignCompany = async () => {
        if (!assignModal.company || !assignEmployee) return;
        setAssignBusy(true);
        try {
            const result = await servicesAPI.assignCompanyToEmployee(assignModal.company.id, assignEmployee);
            const ok = result.success;
            addNotification(
                ok
                    ? (isRTL
                        ? `تم توكيل ${result.total} معاملة للموظف بنجاح`
                        : `Assigned ${result.total} transactions to the employee`)
                    : (isRTL
                        ? `تم توكيل ${result.assigned} من ${result.total} (${result.failed} فشلت)`
                        : `Assigned ${result.assigned} of ${result.total} (${result.failed} failed)`),
                ok ? 'success' : 'warning'
            );
            if (ok) closeAssignModal();
        } catch (err) {
            const apiMsg = err?.response?.data?.message || err?.response?.data || err?.message;
            addNotification(
                (isRTL ? 'فشل توكيل الشركة: ' : 'Failed to assign company: ') +
                (typeof apiMsg === 'string' ? apiMsg : 'server error'),
                'danger'
            );
        } finally {
            setAssignBusy(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('companiesTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">
                        {t('companiesSubtitle')}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="btn-primary flex items-center justify-center gap-2 py-2.5 text-sm w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    {t('addCompany')}
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className={`w-5 h-5 text-dark-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`} />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchQuery}
                            onChange={handleSearch}
                            className={`input-field ${isRTL ? 'pr-12' : 'pl-12'}`}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        {/* Status Filter */}
                        <div className="relative flex-1 min-w-[140px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input-field w-full appearance-none"
                            >
                                <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                                <option value="active">{t('active')}</option>
                                <option value="pending">{t('pending')}</option>
                                <option value="inactive">{t('inactive')}</option>
                            </select>
                            <Filter className={`w-4 h-4 text-dark-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} pointer-events-none`} />
                        </div>

                        {/* Export */}
                        <button className="btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm">
                            <Download className="w-4 h-4" />
                            <span>{t('exportExcel')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Companies Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-dark-50 dark:bg-dark-800/50">
                            <tr>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[140px]">
                                    {t('companyName')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[120px]">
                                    {t('registrationNumber')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[120px]">
                                    {t('companyType')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[100px]">
                                    {t('expiryDate')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[100px]">
                                    {t('status')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[120px]">
                                    {t('actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                            {filteredCompanies.map((company) => (
                                <tr key={company.id} className="table-row">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Building2 className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-dark-800 dark:text-white text-sm">{company.name}</p>
                                                <p className="text-xs text-dark-400">{company.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs text-dark-600 dark:text-dark-300">{company.registrationNumber}</span>
                                    </td>
                                    <td className="px-4 py-3 text-dark-600 dark:text-dark-300 text-sm">
                                        {company.type}
                                    </td>
                                    <td className="px-4 py-3 text-dark-600 dark:text-dark-300 text-sm">
                                        {company.expiryDate}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(company.status)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleOpenModal('view', company)}
                                                className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                                title={t('view')}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal('edit', company)}
                                                className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-amber-500"
                                                title={t('edit')}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleSuspend(company)}
                                                className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-orange-500"
                                                title={company.status === 'inactive' ? (isRTL ? 'تفعيل' : 'Unsuspend') : (isRTL ? 'إيقاف' : 'Suspend')}
                                            >
                                                {company.status === 'inactive' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(company.id)}
                                                className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-red-500"
                                                title={t('delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {user?.role === 'admin' && (
                                                <button
                                                    onClick={() => openAssignModal(company)}
                                                    className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                                    title={t('assignCompanyToEmployee')}
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-dark-100 dark:border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-dark-500">
                        {isRTL ? `عرض 1-${filteredCompanies.length} من ${filteredCompanies.length}` : `Showing 1-${filteredCompanies.length} of ${filteredCompanies.length}`}
                    </p>
                    <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50" disabled>
                            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                        <button className="w-8 h-8 bg-primary-500 text-white rounded-lg text-sm font-medium">1</button>
                        <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50" disabled>
                            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-dark-800 dark:text-white">
                                {modalMode === 'add' ? t('addCompany') : modalMode === 'edit' ? t('edit') : t('viewCompanyDetails') || 'تفاصيل الشركة'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-dark-400 hover:text-dark-600 dark:hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Company Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('companyName')} ({isRTL ? 'عربي' : 'Arabic'})
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder={isRTL ? 'أدخل اسم الشركة' : 'Enter company name'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('companyName')} ({isRTL ? 'إنجليزي' : 'English'})
                                    </label>
                                    <input
                                        type="text"
                                        name="nameEn"
                                        value={formData.nameEn}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('registrationNumber')}
                                    </label>
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder="1010XXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('taxNumber')}
                                    </label>
                                    <input
                                        type="text"
                                        name="taxNumber"
                                        value={formData.taxNumber}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder="3XXXXXXXXXXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('companyType')}
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    >
                                        <option value="ذات مسؤولية محدودة">{isRTL ? 'ذات مسؤولية محدودة' : 'LLC'}</option>
                                        <option value="مؤسسة فردية">{isRTL ? 'مؤسسة فردية' : 'Sole Proprietorship'}</option>
                                        <option value="شركة مساهمة">{isRTL ? 'شركة مساهمة' : 'Joint Stock'}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('expiryDate')}
                                    </label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
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
                                        placeholder="company@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('phone')}
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder="+966XXXXXXXXX"
                                    />
                                </div>
                                {modalMode !== 'add' && (
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
                                            <option value="pending">{t('pending')}</option>
                                            <option value="inactive">{t('inactive')}</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    {t('address')}
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={modalMode === 'view'}
                                    className="input-field"
                                    rows="2"
                                    placeholder={isRTL ? 'أدخل العنوان' : 'Enter address'}
                                ></textarea>
                            </div>

                            {/* Section: Company Documents & Expiry Tracking (Visible only in 'view' mode or editable if needed) */}
                            {modalMode === 'view' && (
                                <div className="border-t border-dark-100 dark:border-dark-700 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-dark-800 dark:text-white flex items-center gap-2">
                                            <Building2 className="w-5 h-5 text-primary-500" />
                                            {isRTL ? 'مستندات ووثائق الشركة وصلاحياتها' : 'Company Documents & Expiries'}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                const docName = prompt(isRTL ? 'أدخل اسم الوثيقة الجديدة:' : 'Enter document name:');
                                                if (!docName) return;
                                                const docNum = prompt(isRTL ? 'أدخل رقم الوثيقة:' : 'Enter document number:');
                                                const issueDate = prompt(isRTL ? 'أدخل تاريخ الإصدار (YYYY-MM-DD):' : 'Enter issue date (YYYY-MM-DD):');
                                                const expiryDate = prompt(isRTL ? 'أدخل تاريخ الانتهاء (YYYY-MM-DD):' : 'Enter expiry date (YYYY-MM-DD):');
                                                if (!expiryDate) return;

                                                const newDoc = {
                                                    id: Date.now(),
                                                    name: docName,
                                                    number: docNum || '—',
                                                    issueDate: issueDate || '—',
                                                    expiryDate: expiryDate,
                                                    fileUrl: '#'
                                                };

                                                setCompaniesList(prev => prev.map(c => {
                                                    if (c.id === selectedCompany.id) {
                                                        const docs = c.documents ? [...c.documents, newDoc] : [newDoc];
                                                        return { ...c, documents: docs };
                                                    }
                                                    return c;
                                                }));

                                                setSelectedCompany(prev => ({
                                                    ...prev,
                                                    documents: prev.documents ? [...prev.documents, newDoc] : [newDoc]
                                                }));

                                                addNotification(`تمت إضافة وثيقة جديدة (${docName}) لشركة ${selectedCompany.name}`, 'success');
                                            }}
                                            className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-semibold hover:bg-primary-600 transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            {isRTL ? 'إضافة وثيقة' : 'Add Document'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(selectedCompany.documents || [
                                            { id: 1, name: 'السجل التجاري', number: selectedCompany.registrationNumber, issueDate: '2020-05-15', expiryDate: selectedCompany.expiryDate, fileUrl: '#' },
                                            { id: 2, name: 'رخصة البلدية', number: 'MUNI-98234', issueDate: '2021-06-20', expiryDate: '2026-06-20', fileUrl: '#' },
                                            { id: 3, name: 'شهادة الغرفة التجارية', number: 'CC-33291', issueDate: '2022-02-10', expiryDate: '2025-02-10', fileUrl: '#' }
                                        ]).map(doc => {
                                            const daysRemaining = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                            const isExpired = daysRemaining < 0;
                                            const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 30;

                                            return (
                                                <div key={doc.id} className="p-4 rounded-xl border border-dark-100 dark:border-dark-700 bg-dark-50/50 dark:bg-dark-800/40 flex flex-col justify-between space-y-3 hover:border-primary-500/50 hover:shadow-md transition-all duration-300">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2.5 h-2.5 rounded-full ${
                                                                    isExpired ? 'bg-red-500' : isExpiringSoon ? 'bg-amber-500' : 'bg-emerald-500'
                                                                }`} />
                                                                <p className="font-semibold text-sm text-dark-800 dark:text-white">{doc.name}</p>
                                                            </div>
                                                        </div>

                                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            isExpiringSoon ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }`}>
                                                            {isExpired ? (isRTL ? 'منتهية الصلاحية' : 'Expired') :
                                                             isExpiringSoon ? (isRTL ? 'تقترب من الانتهاء' : 'Expiring Soon') :
                                                             (isRTL ? 'سارية الصلاحية' : 'Active')}
                                                        </span>

                                                        <div className="space-y-2 text-xs text-dark-500 dark:text-dark-400">
                                                            <div className="flex justify-between border-b border-dark-100/30 dark:border-dark-700/30 pb-1">
                                                                <span className="opacity-75">{isRTL ? 'رقم الوثيقة:' : 'Doc Number:'}</span>
                                                                <span className="font-mono font-bold text-dark-700 dark:text-dark-300">{doc.number}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-dark-100/30 dark:border-dark-700/30 pb-1">
                                                                <span className="opacity-75">{isRTL ? 'تاريخ الإصدار:' : 'Issue Date:'}</span>
                                                                <span className="font-bold text-dark-700 dark:text-dark-300">{doc.issueDate}</span>
                                                            </div>
                                                            <div className="flex justify-between border-b border-dark-100/30 dark:border-dark-700/30 pb-1">
                                                                <span className="opacity-75">{isRTL ? 'تاريخ الانتهاء:' : 'Expiry Date:'}</span>
                                                                <span className="font-bold text-dark-700 dark:text-dark-300">{doc.expiryDate}</span>
                                                            </div>
                                                            <div className="flex justify-between pt-1">
                                                                <span className="opacity-75">{isRTL ? 'الأيام المتبقية:' : 'Days Remaining:'}</span>
                                                                <span className={`font-black ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                                    {isExpired ? `${Math.abs(daysRemaining)} ${isRTL ? 'يوم مضى' : 'days ago'}` : `${daysRemaining} ${isRTL ? 'يوم متبقي' : 'days left'}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2 pt-2 border-t border-dark-100/50 dark:border-dark-700/50 text-xs">
                                                        {/* Renew/Edit document directly */}
                                                        <button
                                                            onClick={() => {
                                                                const newExp = prompt(isRTL ? 'أدخل تاريخ الانتهاء الجديد (YYYY-MM-DD):' : 'Enter new expiry date (YYYY-MM-DD):', doc.expiryDate);
                                                                if (!newExp) return;
                                                                
                                                                setCompaniesList(prev => prev.map(c => {
                                                                    if (c.id === selectedCompany.id) {
                                                                        const docs = (c.documents || []).map(d => d.id === doc.id ? { ...d, expiryDate: newExp } : d);
                                                                        return { ...c, documents: docs };
                                                                    }
                                                                    return c;
                                                                }));

                                                                setSelectedCompany(prev => ({
                                                                    ...prev,
                                                                    documents: (prev.documents || []).map(d => d.id === doc.id ? { ...d, expiryDate: newExp } : d)
                                                                }));

                                                                addNotification(`تم تجديد تاريخ صلاحية (${doc.name}) لشركة ${selectedCompany.name} حتى تاريخ ${newExp}`, 'warning');
                                                            }}
                                                            className="text-xs text-primary-500 hover:text-primary-600 font-semibold transition-colors"
                                                        >
                                                            {isRTL ? 'تجديد / تعديل' : 'Renew / Edit'}
                                                        </button>
                                                        <span className="text-dark-300 dark:text-dark-600">|</span>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه الوثيقة؟' : 'Are you sure you want to delete this document?')) {
                                                                    setCompaniesList(prev => prev.map(c => {
                                                                        if (c.id === selectedCompany.id) {
                                                                            const docs = (c.documents || []).filter(d => d.id !== doc.id);
                                                                            return { ...c, documents: docs };
                                                                        }
                                                                        return c;
                                                                    }));

                                                                    setSelectedCompany(prev => ({
                                                                        ...prev,
                                                                        documents: (prev.documents || []).filter(d => d.id !== doc.id)
                                                                    }));

                                                                    addNotification(`تم إتلاف / حذف وثيقة (${doc.name}) لشركة ${selectedCompany.name}`, 'danger');
                                                                }
                                                            }}
                                                            className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors"
                                                        >
                                                            {isRTL ? 'حذف الوثيقة' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
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

            {/* Assign-company-to-employee modal (admin only) */}
            {assignModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
                        <div className="p-6 border-b border-dark-100 dark:border-dark-700">
                            <h2 className="text-xl font-semibold text-dark-800 dark:text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary-500" />
                                {t('assignCompanyToEmployee')}
                            </h2>
                            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                                {isRTL
                                    ? `سيتم توكيل جميع معاملات وطلبات الشركة "${assignModal.company?.name}" للموظف المختار.`
                                    : `All transactions and requests of "${assignModal.company?.name}" will be assigned to the selected employee.`}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    {isRTL ? 'الموظف' : 'Employee'}
                                </label>
                                <select
                                    value={assignEmployee}
                                    onChange={(e) => setAssignEmployee(e.target.value)}
                                    className="input-field w-full"
                                    disabled={assignBusy}
                                >
                                    <option value="">{isRTL ? 'اختر الموظف' : 'Select Employee'}</option>
                                    {staffOptions.map(s => (
                                        <option key={s.id} value={s.id}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-dark-100 dark:border-dark-700 flex justify-end gap-3">
                            <button onClick={closeAssignModal} className="btn-secondary" disabled={assignBusy}>
                                {t('cancel')}
                            </button>
                            <button
                                onClick={submitAssignCompany}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!assignEmployee || assignBusy}
                            >
                                {assignBusy ? t('assigning') : t('assignCompany')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Companies;
