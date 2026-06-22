import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { servicesAPI, dashboardAPI, normalizeStatus } from '../services/api';
import { SkeletonCard, SkeletonTable } from '../components/Skeleton';
import {
    Building2,
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    RefreshCw,
    Calendar,
    DollarSign,
    AlertCircle,
    Users,
    Layers,
    ShieldCheck
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

function extractCount(data, ...keys) {
    if (!data) return 0;
    for (const key of keys) {
        const v = data[key];
        if (typeof v === 'number') return v;
    }
    if (typeof data === 'number') return data;
    if (typeof data?.total === 'number') return data.total;
    if (typeof data?.count === 'number') return data.count;
    if (Array.isArray(data)) return data.length;
    return 0;
}

const Dashboard = () => {
    const { t, isRTL, isDark } = useApp();
    const [stats, setStats] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    
    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            try {
                setFetchError(null);

                const [usersRaw, companiesRaw, servicesRaw, documentsRaw, requestsRaw, allData] = await Promise.all([
                    dashboardAPI.getUsersStats().catch(() => ({})),
                    dashboardAPI.getCompaniesStats().catch(() => ({})),
                    dashboardAPI.getServicesStats().catch(() => ({})),
                    dashboardAPI.getDocumentsStats().catch(() => ({})),
                    dashboardAPI.getRequestsStats().catch(() => ({})),
                    servicesAPI.getAllRequests({ signal: controller.signal }).catch(() => []),
                ]);

                const all = Array.isArray(allData) ? allData : (allData?.requests || allData?.services || []);

                // Extract counts from dashboard endpoints
                const usersCount     = extractCount(usersRaw, 'totalUsers', 'total', 'count', 'users');
                const companiesCount = extractCount(companiesRaw, 'totalCompanies', 'total', 'count', 'companies');
                const servicesCount  = extractCount(servicesRaw, 'totalServices', 'total', 'count', 'services');
                const docsCount      = extractCount(documentsRaw, 'totalDocuments', 'total', 'count', 'documents');
                const reqTotal       = extractCount(requestsRaw, 'totalRequests', 'total', 'count', 'requests');
                const reqPending     = extractCount(requestsRaw, 'pending', 'pendingCount');
                const reqCompleted   = extractCount(requestsRaw, 'completed', 'completedCount');

                // Fallback: compute from the requests list if dashboard endpoint didn't return numbers
                const pending    = reqPending    || all.filter(i => normalizeStatus(i.status) === 'pending').length;
                const completed  = reqCompleted  || all.filter(i => normalizeStatus(i.status) === 'completed').length;
                const totalReqs  = reqTotal      || all.length;

                setStats([
                    { label: 'totalUsers',       value: usersCount.toString(),     gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',       shadowColor: 'shadow-blue-200 dark:shadow-blue-900/30',       trend: 'up', change: '', icon: Users },
                    { label: 'totalCompanies',   value: companiesCount.toString(), gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',   shadowColor: 'shadow-purple-200 dark:shadow-purple-900/30',   trend: 'up', change: '', icon: Building2 },
                    { label: 'totalServices',    value: servicesCount.toString(),  gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',  shadowColor: 'shadow-indigo-200 dark:shadow-indigo-900/30',   trend: 'up', change: '', icon: Layers },
                    { label: 'totalDocuments',   value: docsCount.toString(),      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',    shadowColor: 'shadow-amber-200 dark:shadow-amber-900/30',     trend: 'up', change: '', icon: FileText },
                    { label: 'pending',          value: pending.toString(),        gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',  shadowColor: 'shadow-orange-200 dark:shadow-orange-900/30',   trend: 'up', change: '', icon: Clock },
                    { label: 'completed',        value: completed.toString(),      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',shadowColor: 'shadow-emerald-200 dark:shadow-emerald-900/30', trend: 'up', change: '', icon: ShieldCheck },
                ]);

                // Monthly chart from requests list
                const monthMap = {};
                all.forEach(item => {
                    if (item.createdAt) {
                        const d = new Date(item.createdAt);
                        if (!isNaN(d)) {
                            const key = `${d.getFullYear()}-${d.getMonth()}`;
                            monthMap[key] = (monthMap[key] || 0) + 1;
                        }
                    }
                });
                const monthly = [];
                const now = new Date();
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const key = `${d.getFullYear()}-${d.getMonth()}`;
                    monthly.push({
                        name: d.toLocaleString(isRTL ? 'ar' : 'en', { month: 'short' }),
                        transactions: monthMap[key] || 0,
                    });
                }
                setMonthlyData(monthly);

                // Pie chart from service types (respect current language)
                const typeMap = {};
                all.forEach(item => {
                    const key = isRTL
                        ? (item.serviceNameAr || item.categoryNameAr || 'أخرى')
                        : (item.serviceNameEn || item.categoryNameEn || 'Other');
                    typeMap[key] = (typeMap[key] || 0) + 1;
                });
                const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#6366f1'];
                const pieTotal = all.length || totalReqs || 1;
                const pie = Object.entries(typeMap).slice(0, 6).map(([name, value], i) => ({
                    name,
                    value: pieTotal > 0 ? Math.round((value / pieTotal) * 100) : 0,
                    color: colors[i % colors.length],
                }));
                setPieData(pie);

                // Recent 5 transactions
                const recent = all.slice(0, 5).map(item => ({
                    id: item.id || '-',
                    serviceName: item.serviceNameAr || item.serviceNameEn || '-',
                    status: normalizeStatus(item.status) || 'pending',
                    date: item.createdAt && item.createdAt !== '0001-01-01T00:00:00'
                        ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '-',
                }));
                setRecentTransactions(recent);
            } catch (err) {
                if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
                console.error('Error fetching dashboard data', err);
                const status = err?.response?.status;
                setFetchError({
                    status,
                    message: status === 403
                        ? (isRTL ? 'لا تملك صلاحية لعرض هذه البيانات' : 'You don\'t have permission to view this data')
                        : status === 401
                            ? (isRTL ? 'انتهت الجلسة، يرجى تسجيل الدخول' : 'Session expired, please log in again')
                            : (isRTL ? 'تعذّر تحميل البيانات' : 'Failed to load data'),
                });
                setStats([]);
                setMonthlyData([]);
                setPieData([]);
                setRecentTransactions([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        fetchData();
        return () => controller.abort();
    }, []);


    // Stats will be loaded from API; placeholder will show loading state

    // Monthly data will be loaded from API

    // Pie data will be loaded from API

    // Recent transactions will be loaded from API

    const getStatusColor = (status) => {
        switch (normalizeStatus(status)) {
            case 'completed':        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'pending':          return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'inprogress':
            case 'processing':
            case 'active':           return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'waitingpayment':   return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'paid':             return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
            case 'cancelled':
            case 'rejected':         return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'missingdocuments': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            default:                 return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getStatusLabel = (status) => {
        switch (normalizeStatus(status)) {
            case 'completed':        return t('completed');
            case 'pending':          return t('pending');
            case 'inprogress':
            case 'processing':
            case 'active':           return t('inProgress');
            case 'waitingpayment':   return t('waitingPayment');
            case 'paid':             return t('paid');
            case 'cancelled':        return t('cancelled');
            case 'rejected':         return t('rejected');
            case 'missingdocuments': return t('missingDocuments');
            default:                 return status || '-';
        }
    };

    return (
        <div className="space-y-6">
            {/* Error banner */}
            {fetchError && (
                <div className="card p-4 border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                {fetchError.message}
                                {fetchError.status ? ` (HTTP ${fetchError.status})` : ''}
                            </p>
                            {fetchError.status === 403 && (
                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                    {isRTL
                                        ? 'تأكد من أنك قمت بتسجيل الدخول بحساب يملك هذه الصلاحية، أو أن الخادم يسمح بالوصول.'
                                        : 'Make sure you are logged in with an account that has this permission, or that the server allows access.'}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-xs px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/60 flex items-center gap-1"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            {isRTL ? 'إعادة المحاولة' : 'Retry'}
                        </button>
                    </div>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('dashboardTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">
                        {t('dashboardSubtitle')}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
                    <button className="btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{isRTL ? 'يناير 2026' : 'January 2026'}</span>
                    </button>
                    <button className="btn-primary flex items-center justify-center gap-2 py-2.5 text-sm">
                        <RefreshCw className="w-4 h-4" />
                        <span>{isRTL ? 'تحديث' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className={`
                    stat-card ${stat.gradient} text-white
                    shadow-lg ${stat.shadowColor}
                    hover:scale-[1.02] transition-transform duration-300
                    animate-slide-up
                  `}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                                </div>

                                <div className="relative">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-white' : 'text-red-200'}`}>
                                            {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {stat.change}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{stat.value}</h3>
                                    <p className="text-white/80 text-xs">{t(stat.label)}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="card p-4 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-dark-800 dark:text-white">
                                {t('transactionStats')}
                            </h2>
                            <p className="text-xs text-dark-400">{isRTL ? 'إحصائيات آخر 7 أشهر' : 'Last 7 months statistics'}</p>
                        </div>
                        <button className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
                            <MoreHorizontal className="w-5 h-5 text-dark-400" />
                        </button>
                    </div>
                    <div className="h-60 md:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={10} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="transactions"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorTransactions)"
                                    name={isRTL ? 'الطلبات' : 'Requests'}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="card p-4 lg:col-span-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-lg font-semibold text-dark-800 dark:text-white">
                                    {t('services')}
                                </h2>
                                <p className="text-xs text-dark-400">{isRTL ? 'توزيع الخدمات' : 'Services Distribution'}</p>
                            </div>
                        </div>
                        <div className="h-44 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={55}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1e293b' : '#fff',
                                            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                            borderRadius: '12px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="space-y-2 mt-2">
                        {pieData.slice(0, 4).map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-dark-600 dark:text-dark-300">{item.name}</span>
                                </div>
                                <span className="text-xs font-semibold text-dark-800 dark:text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-dark-100 dark:border-dark-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-dark-800 dark:text-white">
                                {t('recentTransactions')}
                            </h2>
                            <p className="text-sm text-dark-400">{isRTL ? 'آخر 5 معاملات' : 'Last 5 transactions'}</p>
                        </div>
                        <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                            {t('viewAll')}
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-4">
                            <SkeletonTable rows={5} />
                        </div>
                    ) : (
                        <table className="w-full min-w-max">
                            <thead className="bg-dark-50 dark:bg-dark-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[120px]">
                                        {t('transactionId')}
                                    </th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[140px]">
                                        {t('service')}
                                    </th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[100px]">
                                        {t('status')}
                                    </th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[100px]">
                                        {t('date')}
                                    </th>
                                    <th className="px-4 py-3 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider min-w-[80px]">
                                        {t('actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                                {recentTransactions.map((transaction, index) => (
                                    <tr key={index} className="table-row">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="font-mono text-sm text-primary-500">{transaction.id}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-dark-700 dark:text-dark-200">{transaction.serviceName}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                                {getStatusLabel(transaction.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-dark-500 dark:text-dark-400">
                                            {transaction.date}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                                                {t('view')}
                                            </button>
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

export default Dashboard;
