import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, authAPI, serverStatusToDisplay, normalizeStatus } from '../services/api';
import {
    FileText,
    Building2,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Calendar,
    ChevronRight,
    Inbox,
    Eye,
    Edit2,
    DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MyTasks = () => {
    const { t, isRTL } = useApp();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const isAdmin = user?.role === 'admin';
                const calls = isAdmin
                    ? [servicesAPI.getAllRequests().catch(() => []), authAPI.getAllUsers().catch(() => [])]
                    : [servicesAPI.getStaffRequests().catch(() => []), authAPI.getAllUsers().catch(() => [])];

                const [reqs, users] = await Promise.all(calls);

                const reqList = Array.isArray(reqs) ? reqs : (reqs?.requests || reqs?.services || []);
                const userList = Array.isArray(users) ? users : (users?.users || []);
                const userLookup = new Map();
                for (const u of userList) {
                    if (u.id) userLookup.set(u.id, u);
                    if (u.userName) userLookup.set(u.userName, u);
                    if (u.email) userLookup.set(u.email, u);
                }

                const myId = user?.id || user?.name;
                const myAssigned = isAdmin
                    ? reqList.filter(r => r.appUserId === myId || r.assignedEmployeeUserId === myId)
                    : reqList;

                const myTx = myAssigned.map(item => {
                    const u = userLookup.get(item.appUserId);
                    return {
                        id: item.id,
                        serviceName: item.serviceNameAr || item.serviceNameEn || '—',
                        status: serverStatusToDisplay(item.status) || 'pending',
                        createdDate: item.createdAt && item.createdAt !== '0001-01-01T00:00:00' ? item.createdAt.split('T')[0] : '—',
                        description: item.description || '',
                    };
                });

                const seen = new Set();
                const myCompanies = [];
                for (const r of myAssigned) {
                    const cid = r.appUserId;
                    if (!cid || seen.has(cid)) continue;
                    seen.add(cid);
                    const u = userLookup.get(cid) || {};
                    myCompanies.push({
                        id: cid,
                        name: u.userName || cid,
                        email: u.email || '—',
                        phone: u.phoneNumber || '—',
                        status: u.isActive === false ? 'inactive' : 'active',
                        requestCount: myAssigned.filter(x => x.appUserId === cid).length,
                    });
                }

                setTransactions(myTx);
                setCompanies(myCompanies);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const getStatusBadge = (status) => {
        const config = {
            completed:         { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle, label: 'completed' },
            pending:           { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',         icon: Clock,       label: 'pending' },
            inprogress:        { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',             icon: AlertCircle, label: 'inProgress' },
            waitingpayment:    { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',     icon: Clock,       label: 'waitingPayment' },
            paid:              { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',             icon: DollarSign,  label: 'paid' },
            cancelled:         { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',                 icon: XCircle,     label: 'cancelled' },
            missingdocuments:  { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',     icon: AlertCircle, label: 'missingDocuments' },
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

    const stats = useMemo(() => {
        return [
            { label: 'pending',         value: transactions.filter(x => normalizeStatus(x.status) === 'pending').length,         color: 'from-amber-500 to-amber-600',     icon: Clock },
            { label: 'inProgress',      value: transactions.filter(x => ['inprogress', 'processing'].includes(normalizeStatus(x.status))).length, color: 'from-blue-500 to-blue-600', icon: AlertCircle },
            { label: 'waitingPayment',  value: transactions.filter(x => normalizeStatus(x.status) === 'waitingpayment').length,  color: 'from-purple-500 to-purple-600',   icon: DollarSign },
            { label: 'completed',       value: transactions.filter(x => normalizeStatus(x.status) === 'completed').length,      color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
            { label: 'cancelled',       value: transactions.filter(x => ['cancelled', 'rejected'].includes(normalizeStatus(x.status))).length, color: 'from-red-500 to-red-600', icon: XCircle },
        ];
    }, [transactions]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('myTasksTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">
                        {t('myTasksSubtitle')}
                    </p>
                </div>
                <div className="text-sm text-dark-500 dark:text-dark-400">
                    {isRTL ? 'مرحباً' : 'Hello'}, <span className="font-semibold text-dark-800 dark:text-white">{user?.name}</span>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="card p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xl font-bold text-dark-800 dark:text-white">{s.value}</p>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{t(s.label)}</p>
                            </div>
                            <div className={`p-2 bg-gradient-to-br ${s.color} rounded-lg shadow-lg`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* My companies */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-primary-500" />
                        <div>
                            <h2 className="text-lg font-semibold text-dark-800 dark:text-white">{t('myAssignedCompanies')}</h2>
                            <p className="text-xs text-dark-400">{companies.length} {isRTL ? 'شركة' : 'companies'}</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 text-sm text-dark-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
                    ) : companies.length === 0 ? (
                        <div className="p-10 flex flex-col items-center gap-3 text-center">
                            <Inbox className="w-10 h-10 text-dark-300" />
                            <p className="text-sm text-dark-500">{t('noAssignedItems')}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-max">
                            <thead className="bg-dark-50 dark:bg-dark-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{isRTL ? 'الشركة' : 'Company'}</th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{isRTL ? 'البريد' : 'Email'}</th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{isRTL ? 'الهاتف' : 'Phone'}</th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{isRTL ? 'الطلبات' : 'Requests'}</th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{t('status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                                {companies.map(c => (
                                    <tr key={c.id} className="table-row">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-dark-800 dark:text-white text-sm">{c.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">{c.email}</td>
                                        <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300" dir="ltr">{c.phone}</td>
                                        <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 text-xs font-semibold">
                                                {c.requestCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* My transactions */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary-500" />
                        <div>
                            <h2 className="text-lg font-semibold text-dark-800 dark:text-white">{t('myAssignedTransactions')}</h2>
                            <p className="text-xs text-dark-400">{transactions.length} {isRTL ? 'معاملة' : 'transactions'}</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-6 text-sm text-dark-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-10 flex flex-col items-center gap-3 text-center">
                            <Inbox className="w-10 h-10 text-dark-300" />
                            <p className="text-sm text-dark-500">{t('noAssignedItems')}</p>
                            <Link to="/transactions" className="text-sm text-primary-500 hover:text-primary-600 inline-flex items-center gap-1">
                                {isRTL ? 'تصفح كل الطلبات' : 'Browse all requests'}
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full min-w-max">
                            <thead className="bg-dark-50 dark:bg-dark-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{t('transactionId')}</th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{t('service')}</th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{t('status')}</th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{t('date')}</th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="table-row">
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs text-primary-500 font-medium">{tx.id}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-200">{tx.serviceName}</td>
                                        <td className="px-4 py-3">{getStatusBadge(tx.status)}</td>
                                        <td className="px-4 py-3 text-sm text-dark-500 dark:text-dark-400">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {tx.createdDate}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    to={`/transactions?open=${encodeURIComponent(tx.id)}&mode=view`}
                                                    className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                                    title={t('view')}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/transactions?open=${encodeURIComponent(tx.id)}&mode=edit`}
                                                    className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-amber-500"
                                                    title={t('edit')}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTasks;
