import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, authAPI } from '../services/api';
import {
    FileText,
    Search,
    Plus,
    Filter,
    Download,
    Eye,
    Edit2,
    Trash2,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Calendar,
    FileUp,
    X,
    DollarSign
} from 'lucide-react';

const Transactions = () => {
    const { t, isRTL, addNotification } = useApp();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const [employeesList, setEmployeesList] = useState([]);
    const [transactionsList, setTransactionsList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch transactions/requests from server
                const data = await servicesAPI.getAllRequests();
                const arr = Array.isArray(data) ? data : data.requests || data.services || [];
                const formatted = arr.map(item => {
                    const fileUrls = Array.isArray(item.fileUrls) ? item.fileUrls : [];
                    return {
                        id: item.requestId || item.id || item.serviceId || `TR-${Date.now()}`,
                        company: item.userId || item.companyName || item.userName || item.clientName || '—',
                        type: item.serviceType || item.type || item.serviceName || 'commercialRegistration',
                        status: (item.status || 'pending').toLowerCase(),
                        priority: (item.priority || 'medium').toLowerCase(),
                        assignedTo: item.assignedEmployeeUserId || item.assignedTo || item.employeeName || '—',
                        createdDate: item.createdAt ? item.createdAt.split('T')[0] : '—',
                        dueDate: item.dueDate ? item.dueDate.split('T')[0] : '—',
                        amount: item.price || item.amount || item.cost || 0,
                        attachments: fileUrls.map((url, idx) => ({
                            id: `${item.requestId || 'att'}-${idx}`,
                            name: url.split('/').pop() || url,
                            size: '—',
                            uploadedBy: 'العميل',
                            uploadedDate: item.createdAt ? item.createdAt.split('T')[0] : '—',
                            fileUrl: url,
                        })),
                        quotedAmount: item.quotedAmount || item.price || 0,
                        quoteSent: item.quoteSent || false,
                        quoteDate: item.quoteDate || '',
                        description: item.serviceDetails || item.description || '',
                    };
                });
                setTransactionsList(formatted);
            } catch (err) {
                console.error('Error fetching transactions:', err);
                setTransactionsList([]);
            }

            // Fetch staff list for assignment dropdown
            try {
                const staffData = await authAPI.getAllStaff();
                const staffArr = Array.isArray(staffData) ? staffData : staffData.users || [];
                setEmployeesList(staffArr.map(s => ({
                    id: s.userName,
                    userName: s.userName,
                    fullName: s.fullName || s.userName,
                    email: s.email,
                })));
            } catch {
                setEmployeesList([]);
            }

            setLoading(false);
        };
        fetchData();
    }, []);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        company: '',
        type: 'commercialRegistration',
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
        createdDate: '',
        dueDate: '',
        amount: 0,
        quotedAmount: 0,
        quoteSent: false,
        quoteDate: '',
        attachments: []
    });

    const getStatusBadge = (status) => {
        const config = {
            // Lowercase (internal/legacy)
            completed:   { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle,  label: 'completed' },
            pending:     { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         icon: Clock,        label: 'pending'   },
            processing:  { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',             icon: AlertCircle,  label: 'processing' },
            cancelled:   { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 icon: XCircle,      label: 'cancelled' },
            // API PascalCase values
            waitingforpayment: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Clock,        label: 'waitingForPayment' },
            inprogress:        { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',         icon: AlertCircle,  label: 'inProgress' },
            approved:          { color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',         icon: CheckCircle,  label: 'approved' },
            rejected:          { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',             icon: XCircle,      label: 'rejected' },
            onhold:            { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle,  label: 'onHold' },
        };
        const key = (status || '').toLowerCase().replace(/[\s_-]/g, '');
        const entry = config[key] || config.pending;
        const { color, icon: Icon, label } = entry;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                <Icon className="w-3.5 h-3.5" />
                {t(label)}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            high: 'bg-red-500',
            medium: 'bg-amber-500',
            low: 'bg-emerald-500',
        };
        return (
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors[priority]}`}></span>
                <span className="text-sm text-dark-600 dark:text-dark-300">{t(priority)}</span>
            </div>
        );
    };

    const getTypeIcon = (type) => {
        const colors = {
            commercialRegistration: 'from-blue-500 to-blue-600',
            licenses: 'from-purple-500 to-purple-600',
            zakatAndIncome: 'from-emerald-500 to-emerald-600',
            insurance: 'from-amber-500 to-amber-600',
            laborOffice: 'from-orange-500 to-orange-600',
            chamberOfCommerce: 'from-indigo-500 to-indigo-600',
        };
        return colors[type] || 'from-gray-500 to-gray-600';
    };

    const handleOpenModal = (mode, tx = null) => {
        setModalMode(mode);
        setSelectedTransaction(tx);
        // Always seed attachments: [] so the attachments UI never reads
        // `formData.attachments` as undefined (existing transactions on
        // the server don't carry that field).
        if (tx) {
            setFormData({
                id: '',
                company: '',
                type: 'commercialRegistration',
                status: 'pending',
                priority: 'medium',
                assignedTo: '',
                createdDate: '',
                dueDate: '',
                amount: 0,
                quotedAmount: 0,
                quoteSent: false,
                quoteDate: '',
                attachments: [],
                ...tx,
                attachments: Array.isArray(tx.attachments) ? tx.attachments : [],
            });
        } else {
            setFormData({
                id: `TR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                company: '',
                type: 'commercialRegistration',
                status: 'pending',
                priority: 'medium',
                assignedTo: '',
                createdDate: new Date().toISOString().split('T')[0],
                dueDate: '',
                amount: 0,
                quotedAmount: 0,
                quoteSent: false,
                quoteDate: '',
                attachments: []
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTransaction(null);
    };

    // Deep-link: open modal when arriving with ?open=<id>&mode=<mode>
    useEffect(() => {
        const openId = searchParams.get('open');
        const mode = searchParams.get('mode') || 'view';
        if (!openId || loading) return;

        const tx = transactionsList.find(t => String(t.id) === String(openId));
        if (tx) {
            setModalMode(mode);
            setSelectedTransaction(tx);
            setFormData({ ...tx });
            setShowModal(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, transactionsList, loading]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: formatFileSize(file.size),
            uploadedBy: 'العميل',
            uploadedDate: new Date().toISOString().split('T')[0]
        }));
        
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...newFiles]
        }));
    };

    const removeAttachment = (id) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter(file => file.id !== id)
        }));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const sendQuoteToCustomer = (transaction) => {
        // Simulate sending quote to customer
        setTransactionsList(prev => 
            prev.map(t => 
                t.id === transaction.id 
                    ? { ...t, quotedAmount: transaction.quotedAmount, quoteSent: true, quoteDate: new Date().toISOString().split('T')[0] } 
                    : t
            )
        );
        
        // Show success message
        alert(`${t('quoteSentSuccessfully')} ${transaction.company}`);
    };

    const handleQuoteChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            quotedAmount: value
        }));
    };

 

    const handleSave = async () => {
        if (modalMode === 'view') {
            handleCloseModal();
            return;
        }

        if (modalMode === 'edit') {
            const previous = transactionsList;
            setTransactionsList(prev => prev.map(t => t.id === selectedTransaction.id ? { ...formData } : t));

            const requestId = selectedTransaction.id;
            const tasks = [];
            const results = [];

            const newStatus = (formData.status || '').toLowerCase();
            const oldStatus = (selectedTransaction.status || '').toLowerCase();
            if (newStatus && newStatus !== oldStatus) {
                tasks.push(
                    servicesAPI.updateStatus(requestId, formData.status)
                        .then((d) => results.push({ kind: 'status', ok: true, data: d }))
                        .catch((e) => results.push({ kind: 'status', ok: false, error: e }))
                );
            }

            const newAssignee = formData.assignedTo;
            const oldAssignee = selectedTransaction.assignedTo;
            if (newAssignee && newAssignee !== oldAssignee) {
                const employee = employeesList.find(e =>
                    (typeof e === 'string' && e === newAssignee) ||
                    e?.userName === newAssignee ||
                    e?.email === newAssignee ||
                    e?.id === newAssignee
                );
                const employeeUserId = employee?.id || employee?.userName || newAssignee;
                tasks.push(
                    servicesAPI.assignRequest(requestId, employeeUserId)
                        .then((d) => results.push({ kind: 'assign', ok: true, data: d }))
                        .catch((e) => results.push({ kind: 'assign', ok: false, error: e }))
                );
            }

            const newPrice = Number(formData.quotedAmount ?? formData.amount ?? 0);
            const oldPrice = Number(selectedTransaction.quotedAmount ?? selectedTransaction.amount ?? 0);
            if (newPrice && newPrice !== oldPrice) {
                tasks.push(
                    servicesAPI.setCost(requestId, newPrice)
                        .then((d) => results.push({ kind: 'price', ok: true, data: d }))
                        .catch((e) => results.push({ kind: 'price', ok: false, error: e }))
                );
            }

            const newDesc = String(formData.description ?? '').trim();
            const oldDesc = String(selectedTransaction.description ?? '').trim();
            if (newDesc && newDesc !== oldDesc) {
                tasks.push(
                    servicesAPI.addDescription(requestId, newDesc)
                        .then((d) => results.push({ kind: 'desc', ok: true, data: d }))
                        .catch((e) => results.push({ kind: 'desc', ok: false, error: e }))
                );
            }

            if (tasks.length === 0) {
                addNotification(isRTL ? 'لا توجد تغييرات لحفظها' : 'No changes to save', 'info');
                handleCloseModal();
                return;
            }

            try {
                await Promise.all(tasks);
            } catch {
                // individual results tracked below
            }

            const failed = results.filter(r => !r.ok);
            if (failed.length === 0) {
                addNotification(isRTL ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully', 'success');
            } else {
                setTransactionsList(previous);
                const firstErr = failed[0].error;
                const apiMsg = firstErr?.response?.data?.message || firstErr?.response?.data || firstErr?.message;
                addNotification(
                    (isRTL ? 'فشل حفظ بعض التغييرات: ' : 'Some changes failed: ') +
                    (typeof apiMsg === 'string' ? apiMsg : 'server error'),
                    'danger'
                );
            }
        } else {
            const newTransaction = {
                ...formData,
                id: `TR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                createdDate: new Date().toISOString().split('T')[0],
                attachments: formData.attachments
            };
            setTransactionsList(prev => [newTransaction, ...prev]);
            addNotification(
                isRTL
                    ? 'تمت إضافة المعاملة محلياً (لا يوجد endpoint إضافة على الخادم)'
                    : 'Transaction added locally (no create endpoint on the server).',
                'warning'
            );
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه المعاملة؟' : 'Are you sure you want to delete this transaction?')) {
            setTransactionsList(prev => prev.filter(t => t.id !== id));
            addNotification(
                isRTL
                    ? 'تم حذف المعاملة محلياً (لا يوجد endpoint حذف على الخادم)'
                    : 'Transaction removed locally (no delete endpoint on the server).',
                'warning'
            );
        }
    };

    const filteredTransactions = transactionsList.filter(tx => {
        const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.company.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
        const matchesType = typeFilter === 'all' || tx.type === typeFilter;
        
        // If user is an employee, only show transactions assigned to them
        const isEmployee = user && user.role === 'employee';
        const matchesAssignment = !isEmployee || tx.assignedTo === user.name;
        
        return matchesSearch && matchesStatus && matchesType && matchesAssignment;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('transactionsTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">
                        {t('transactionsSubtitle')}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="btn-primary flex items-center justify-center gap-2 py-2.5 text-sm w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    {t('addTransaction')}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                    { label: 'pending',            match: ['pending'],            value: transactionsList.filter(t => ['pending'].includes(t.status)).length.toString(),            color: 'from-amber-500 to-amber-600',     icon: Clock },
                    { label: 'processing',         match: ['processing', 'inprogress'], value: transactionsList.filter(t => ['processing', 'inprogress'].includes(t.status)).length.toString(), color: 'from-blue-500 to-blue-600',   icon: AlertCircle },
                    { label: 'waitingPayment',     match: ['waitingpayment'],     value: transactionsList.filter(t => ['waitingpayment'].includes(t.status)).length.toString(),     color: 'from-purple-500 to-purple-600', icon: DollarSign },
                    { label: 'completed',          match: ['completed'],          value: transactionsList.filter(t => ['completed'].includes(t.status)).length.toString(),          color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
                    { label: 'rejected',           match: ['rejected', 'cancelled'], value: transactionsList.filter(t => ['rejected', 'cancelled'].includes(t.status)).length.toString(), color: 'from-red-500 to-red-600',   icon: XCircle },
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="card p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xl font-bold text-dark-800 dark:text-white">{stat.value}</p>
                                    <p className="text-xs text-dark-500 dark:text-dark-400">{t(stat.label)}</p>
                                </div>
                                <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
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
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`input-field ${isRTL ? 'pr-12' : 'pl-12'}`}
                        />
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Status Filter */}
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="input-field w-full appearance-none"
                                >
                                    <option value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                                    <option value="pending">{t('pending')}</option>
                                    <option value="active">{t('active')}</option>
                                    <option value="completed">{t('completed')}</option>
                                    <option value="cancelled">{t('cancelled')}</option>
                                </select>
                                <Filter className={`w-4 h-4 text-dark-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} pointer-events-none`} />
                            </div>

                            {/* Type Filter */}
                            <div className="relative">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="input-field w-full appearance-none"
                                >
                                    <option value="all">{isRTL ? 'جميع الأنواع' : 'All Types'}</option>
                                    <option value="commercialRegistration">{t('commercialRegistration')}</option>
                                    <option value="licenses">{t('licenses')}</option>
                                    <option value="zakatAndIncome">{t('zakatAndIncome')}</option>
                                    <option value="insurance">{t('insurance')}</option>
                                    <option value="laborOffice">{t('laborOffice')}</option>
                                </select>
                                <Filter className={`w-4 h-4 text-dark-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} pointer-events-none`} />
                            </div>
                        </div>

                        {/* Export */}
                        <button className="btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm w-full">
                            <Download className="w-4 h-4" />
                            <span>{t('exportExcel')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-dark-50 dark:bg-dark-800/50">
                            <tr>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[120px]">
                                    {t('transactionId')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[140px]">
                                    {t('company')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[120px]">
                                    {t('transactionType')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[100px]">
                                    {t('priority')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[100px]">
                                    {t('assignedTo')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[100px]">
                                    {t('dueDate')}
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
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="table-row">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs text-primary-500 font-medium">{tx.id}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 bg-gradient-to-br ${getTypeIcon(tx.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                <FileText className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-dark-700 dark:text-dark-200 text-sm">{tx.company}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-dark-600 dark:text-dark-300 text-sm">
                                        {t(tx.type)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getPriorityBadge(tx.priority)}
                                    </td>
                                    <td className="px-4 py-3 text-dark-600 dark:text-dark-300 text-sm">
                                        {tx.assignedTo || t('unassigned')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-dark-500">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs">{tx.dueDate}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(tx.status)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleOpenModal('view', tx)}
                                                className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal('edit', tx)}
                                                className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-amber-500"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tx.id)}
                                                className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
                        {isRTL ? `عرض 1-${filteredTransactions.length} من ${filteredTransactions.length}` : `Showing 1-${filteredTransactions.length} of ${filteredTransactions.length}`}
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
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-dark-800 dark:text-white">
                                {modalMode === 'add' ? t('addTransaction') : modalMode === 'edit' ? t('edit') : t('view')}
                            </h2>
                            <button onClick={handleCloseModal} className="text-dark-400 hover:text-dark-600 dark:hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('transactionId')}
                                    </label>
                                    <input
                                        type="text"
                                        name="id"
                                        value={formData.id}
                                        disabled
                                        className="input-field bg-dark-50 dark:bg-dark-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('company')}
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder={isRTL ? 'أدخل اسم الشركة' : 'Enter company name'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('transactionType')}
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    >
                                        <option value="commercialRegistration">{t('commercialRegistration')}</option>
                                        <option value="licenses">{t('licenses')}</option>
                                        <option value="zakatAndIncome">{t('zakatAndIncome')}</option>
                                        <option value="insurance">{t('insurance')}</option>
                                        <option value="laborOffice">{t('laborOffice')}</option>
                                        <option value="chamberOfCommerce">{t('chamberOfCommerce')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('priority')}
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    >
                                        <option value="high">{t('high')}</option>
                                        <option value="medium">{t('medium')}</option>
                                        <option value="low">{t('low')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('assignedTo')}
                                    </label>
                                    <select
                                        name="assignedTo"
                                        value={formData.assignedTo}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    >
                                        <option value="">{isRTL ? 'اختر الموظف' : 'Select Employee'}</option>
                                        {employeesList.map((employee, index) => (
                                            <option key={index} value={employee.userName}>
                                                {employee.fullName || employee.userName} {employee.email ? `(${employee.email})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('dueDate')}
                                    </label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('amount')}
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('quotedAmount')}
                                    </label>
                                    <input
                                        type="number"
                                        name="quotedAmount"
                                        value={formData.quotedAmount}
                                        onChange={handleQuoteChange}
                                        className="input-field"
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
                                        <option value="pending">{t('pending')}</option>
                                        <option value="active">{t('active')}</option>
                                        <option value="completed">{t('completed')}</option>
                                        <option value="cancelled">{t('cancelled')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        {/* Attachments Section */}
                        <div className="p-6 space-y-4 border-t border-dark-100 dark:border-dark-700">
                            <h3 className="text-lg font-semibold text-dark-800 dark:text-white">
                                {t('attachments')}
                            </h3>
                            
                            {modalMode !== 'add' && (
                                <div className="space-y-3">
                                    {(formData.attachments && formData.attachments.length > 0) ? formData.attachments.map((attachment) => (
                                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-dark-700 dark:text-dark-200">{attachment.name}</p>
                                                    <p className="text-xs text-dark-500 dark:text-dark-400">{attachment.size} • {attachment.uploadedDate}</p>
                                                </div>
                                            </div>
                                            <a 
                                                href="#" 
                                                className="text-primary-500 hover:text-primary-600 text-sm"
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                {t('download')}
                                            </a>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-dark-400 text-center py-4">{isRTL ? 'لا توجد مرفقات' : 'No attachments'}</p>
                                    )}
                                </div>
                            )}
                            
                            {modalMode !== 'view' && (
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('uploadFiles')}
                                    </label>
                                    <div className="border-2 border-dashed border-dark-200 dark:border-dark-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            multiple
                                            onChange={handleFileUpload}
                                        />
                                        <label 
                                            htmlFor="file-upload" 
                                            className="cursor-pointer inline-flex flex-col items-center gap-2"
                                        >
                                            <FileUp className="w-8 h-8 text-dark-400" />
                                            <span className="text-sm text-dark-600 dark:text-dark-300">
                                                {t('clickToUpload')}
                                            </span>
                                            <span className="text-xs text-dark-400">
                                                {t('fileSizeLimit')}
                                            </span>
                                        </label>
                                    </div>
                                    
                                    {/* Uploaded Files Preview */}
                                    {(formData.attachments?.length ?? 0) > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {formData.attachments.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-dark-50 dark:bg-dark-700 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-blue-500" />
                                                        <span className="text-sm text-dark-700 dark:text-dark-200 truncate max-w-xs">{file.name}</span>
                                                        <span className="text-xs text-dark-500 dark:text-dark-400">{file.size}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(file.id)}
                                                        className="text-red-500 hover:text-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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

export default Transactions;
