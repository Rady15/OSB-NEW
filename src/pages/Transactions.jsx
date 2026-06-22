import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, authAPI, serverStatusToDisplay, displayToServerStatus, normalizeStatus } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
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
    const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null, danger: false });
    const showConfirm = (title, message, onConfirm, danger = true) => setConfirmDialog({ show: true, title, message, onConfirm, danger });
    const [alertDialog, setAlertDialog] = useState({ show: false, title: '', message: '' });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch transactions/requests from server
                const data = await servicesAPI.getAllRequests();
                const arr = Array.isArray(data) ? data : data.requests || data.services || [];
                const formatted = arr.map(item => {
                    return {
                        id: item.id || `TR-${Date.now()}`,
                        serviceName: item.serviceNameAr || item.serviceNameEn || item.serviceId || '—',
                        status: serverStatusToDisplay(item.status) || 'pending',
                        createdDate: item.createdAt && item.createdAt !== '0001-01-01T00:00:00' ? item.createdAt.split('T')[0] : '—',
                        description: item.description || '',
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
                    id: s.id || s.userName,
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
        id: '', serviceName: '', status: 'pending', createdDate: '', description: ''
    });

    const getStatusBadge = (status) => {
        const config = {
            // Keys produced by serverStatusToDisplay() — all lower-case,
            // no spaces / underscores / hyphens.
            completed:       { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle, label: 'completed' },
            pending:         { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         icon: Clock,       label: 'pending' },
            inprogress:      { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',             icon: AlertCircle, label: 'inProgress' },
            waitingpayment:  { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',     icon: Clock,       label: 'waitingPayment' },
            paid:            { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',             icon: DollarSign,  label: 'paid' },
            cancelled:       { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 icon: XCircle,     label: 'cancelled' },
            missingdocuments:{ color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',     icon: AlertCircle, label: 'missingDocuments' },
        };
        const key = normalizeStatus(status);
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
        if (tx) {
            setFormData({
                id: tx.id || '',
                serviceName: tx.serviceName || '',
                status: tx.status || 'pending',
                createdDate: tx.createdDate || '',
                description: tx.description || '',
            });
        } else {
            setFormData({
                id: `TR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                serviceName: '',
                status: 'pending',
                createdDate: new Date().toISOString().split('T')[0],
                description: '',
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
            setFormData({
                id: tx.id || '',
                serviceName: tx.serviceName || '',
                status: tx.status || 'pending',
                createdDate: tx.createdDate || '',
                description: tx.description || '',
            });
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
        setAlertDialog({ show: true, title: isRTL ? 'تم الإرسال' : 'Sent', message: `${t('quoteSentSuccessfully')} ${transaction.company}` });
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
            setTransactionsList(prev => prev.map(t => t.id === selectedTransaction.id ? { ...formData } : t));
        } else {
            setTransactionsList(prev => [...prev, { ...formData }]);
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        showConfirm(
            isRTL ? 'حذف المعاملة' : 'Delete Transaction',
            isRTL ? 'هل أنت متأكد من حذف هذه المعاملة؟' : 'Are you sure you want to delete this transaction?',
            () => {
                setTransactionsList(prev => prev.filter(t => t.id !== id));
                addNotification(
                    isRTL
                        ? 'تم حذف المعاملة محلياً (لا يوجد endpoint حذف على الخادم)'
                        : 'Transaction removed locally (no delete endpoint on the server).',
                    'warning'
                );
            }
        );
    };

    const filteredTransactions = transactionsList.filter(tx => {
        const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tx.serviceName || '').includes(searchQuery);
        const matchesStatus = statusFilter === 'all' ||
            normalizeStatus(tx.status) === normalizeStatus(statusFilter);
        
        return matchesSearch && matchesStatus;
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
                    { label: 'pending',         match: ['pending'],                         value: transactionsList.filter(t => normalizeStatus(t.status) === 'pending').length.toString(),         color: 'from-amber-500 to-amber-600',     icon: Clock },
                    { label: 'inProgress',      match: ['inprogress', 'processing'],         value: transactionsList.filter(t => ['inprogress', 'processing'].includes(normalizeStatus(t.status))).length.toString(), color: 'from-blue-500 to-blue-600',   icon: AlertCircle },
                    { label: 'waitingPayment',  match: ['waitingpayment'],                  value: transactionsList.filter(t => normalizeStatus(t.status) === 'waitingpayment').length.toString(),  color: 'from-purple-500 to-purple-600', icon: DollarSign },
                    { label: 'completed',       match: ['completed'],                       value: transactionsList.filter(t => normalizeStatus(t.status) === 'completed').length.toString(),       color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
                    { label: 'cancelled',       match: ['cancelled', 'rejected'],            value: transactionsList.filter(t => ['cancelled', 'rejected'].includes(normalizeStatus(t.status))).length.toString(), color: 'from-red-500 to-red-600',   icon: XCircle },
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
                                    <option value="inProgress">{t('inProgress')}</option>
                                    <option value="waitingPayment">{t('waitingPayment')}</option>
                                    <option value="completed">{t('completed')}</option>
                                    <option value="cancelled">{t('cancelled')}</option>
                                    <option value="paid">{t('paid')}</option>
                                    <option value="missingDocuments">{t('missingDocuments')}</option>
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
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[160px]">
                                    {t('service')}
                                </th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[100px]">
                                    {t('date')}
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
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-dark-700 dark:text-dark-200 text-sm">{tx.serviceName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-dark-500 dark:text-dark-400 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs">{tx.createdDate}</span>
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
                                    <input type="text" value={formData.id} disabled className="input-field bg-dark-50 dark:bg-dark-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('service')}
                                    </label>
                                    <input type="text" value={formData.serviceName} disabled className="input-field bg-dark-50 dark:bg-dark-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('date')}
                                    </label>
                                    <input type="text" value={formData.createdDate} disabled className="input-field bg-dark-50 dark:bg-dark-700" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('status')}
                                    </label>
                                    <input type="text" value={formData.status} disabled className="input-field bg-dark-50 dark:bg-dark-700" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('description')}
                                    </label>
                                    <textarea rows={3} value={formData.description} disabled className="input-field bg-dark-50 dark:bg-dark-700 resize-none" />
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
            )}

            {alertDialog.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                    <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-1">{alertDialog.title}</h3>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">{alertDialog.message}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-6 flex justify-end">
                            <button onClick={() => setAlertDialog({ show: false })} className="btn-primary">
                                {isRTL ? 'موافق' : 'OK'}
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

export default Transactions;
