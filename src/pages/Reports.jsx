import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, authAPI } from '../services/api';
import {
    Download,
    Calendar,
    FileText,
    TrendingUp,
    Building2,
    Users,
    Filter
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line
} from 'recharts';

const STATUS_COLORS = {
    completed: '#10b981',
    pending: '#f59e0b',
    cancelled: '#ef4444',
    active: '#3b82f6',
    inprogress: '#3b82f6',
    waitingforpayment: '#8b5cf6',
    rejected: '#ef4444',
};

const SERVICE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

const Reports = () => {
    const { t, isRTL, isDark } = useApp();
    const { user } = useAuth();
    const [dateRange, setDateRange] = useState('month');
    const [reportType, setReportType] = useState('transactions');
    const [loading, setLoading] = useState(true);
    const [allRequests, setAllRequests] = useState([]);
    const [allStaff, setAllStaff] = useState([]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [reqs, staff] = await Promise.all([
                    servicesAPI.getAllRequests().catch(() => []),
                    authAPI.getAllStaff().catch(() => []),
                ]);
                setAllRequests(Array.isArray(reqs) ? reqs : (reqs?.requests || []));
                setAllStaff(Array.isArray(staff) ? staff : (staff?.users || []));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Employees only see their own items
    const scopedRequests = useMemo(() => {
        if (user?.role === 'admin') return allRequests;
        const myId = user?.id || user?.name;
        return allRequests.filter(r => r.appUserId === myId);
    }, [allRequests, user]);

    const norm = (s) => (s || '').toString().toLowerCase().replace(/[\s_-]/g, '');

    // Filter by dateRange
    const filtered = useMemo(() => {
        const now = new Date();
        const cutoff = new Date(now);
        if (dateRange === 'week') cutoff.setDate(now.getDate() - 7);
        else if (dateRange === 'month') cutoff.setMonth(now.getMonth() - 1);
        else if (dateRange === 'quarter') cutoff.setMonth(now.getMonth() - 3);
        else if (dateRange === 'year') cutoff.setFullYear(now.getFullYear() - 1);
        return scopedRequests.filter(r => {
            if (!r.createdAt) return true;
            return new Date(r.createdAt) >= cutoff;
        });
    }, [scopedRequests, dateRange]);

    // Summary stats
    const summaryStats = useMemo(() => {
        const total = filtered.length;
        const completed = filtered.filter(r => norm(r.status) === 'completed').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const revenue = 0;
        const uniqueCompanies = new Set(filtered.map(r => r.appUserId).filter(Boolean)).size;
        return [
            { label: isRTL ? 'إجمالي المعاملات' : 'Total Transactions', value: total.toLocaleString(), icon: FileText, color: 'from-blue-500 to-blue-600' },
            { label: isRTL ? 'الشركات المشاركة' : 'Companies', value: uniqueCompanies.toLocaleString(), icon: Building2, color: 'from-emerald-500 to-emerald-600' },
            { label: isRTL ? 'الإيرادات' : 'Revenue', value: revenue > 0 ? `${(revenue / 1000).toFixed(1)}K` : '0', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
            { label: isRTL ? 'معدل الإنجاز' : 'Completion', value: `${completionRate}%`, icon: Users, color: 'from-amber-500 to-amber-600' },
        ];
    }, [filtered, isRTL]);

    // Transactions by month (last 6 buckets relative to current data)
    const transactionsByMonth = useMemo(() => {
        const buckets = {};
        const labels = isRTL
            ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (const r of filtered) {
            if (!r.createdAt) continue;
            const d = new Date(r.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!buckets[key]) buckets[key] = { month: labels[d.getMonth()], completed: 0, pending: 0, cancelled: 0, _sort: d.getTime() };
            const s = norm(r.status);
            if (s === 'completed') buckets[key].completed++;
            else if (s === 'cancelled' || s === 'rejected') buckets[key].cancelled++;
            else buckets[key].pending++;
        }
        return Object.values(buckets).sort((a, b) => a._sort - b._sort).slice(-6).map(({ _sort, ...rest }) => rest);
    }, [filtered, isRTL]);

    // Service distribution
    const serviceDistribution = useMemo(() => {
        const counts = {};
        for (const r of filtered) {
            const k = r.serviceNameAr || r.categoryNameAr || 'Other';
            counts[k] = (counts[k] || 0) + 1;
        }
        return Object.entries(counts)
            .map(([name, value], i) => ({ name, value, color: SERVICE_COLORS[i % SERVICE_COLORS.length] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [filtered]);

    // Revenue by month
    const revenueData = useMemo(() => {
        const buckets = {};
        const labels = isRTL
            ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (const r of filtered) {
            if (!r.createdAt) continue;
            const d = new Date(r.createdAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (!buckets[key]) buckets[key] = { month: labels[d.getMonth()], revenue: 0, _sort: d.getTime() };
        }
        return Object.values(buckets).sort((a, b) => a._sort - b._sort).slice(-6).map(({ _sort, ...rest }) => rest);
    }, [filtered, isRTL]);

    // Top performers (by request count)
    const topPerformers = useMemo(() => {
        const counts = {};
        for (const r of allRequests) {
            const id = r.appUserId;
            if (!id) continue;
            if (!counts[id]) counts[id] = { tasks: 0, completed: 0 };
            counts[id].tasks++;
            if (norm(r.status) === 'completed') counts[id].completed++;
        }
        const merged = allStaff.map(s => {
            const c = counts[s.userName] || { tasks: 0, completed: 0 };
            return {
                name: s.userName,
                tasks: c.tasks,
                completion: c.tasks > 0 ? Math.round((c.completed / c.tasks) * 100) : 0,
            };
        });
        return merged.filter(p => p.tasks > 0).sort((a, b) => b.tasks - a.tasks).slice(0, 5);
    }, [allRequests, allStaff]);

    const isEmpty = !loading && filtered.length === 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('reportsTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1">
                        {t('reportsSubtitle')}
                    </p>
                </div>
                <div className="grid grid-cols-2 lg:flex items-center gap-3">
                    <button className="btn-secondary flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">{t('exportPDF')}</span>
                    </button>
                    <button className="btn-primary flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        <span className="text-sm">{t('exportExcel')}</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-dark-400" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="input-field w-auto"
                        >
                            <option value="week">{isRTL ? 'هذا الأسبوع' : 'This Week'}</option>
                            <option value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</option>
                            <option value="quarter">{isRTL ? 'هذا الربع' : 'This Quarter'}</option>
                            <option value="year">{isRTL ? 'هذه السنة' : 'This Year'}</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-dark-400" />
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="input-field w-auto"
                        >
                            <option value="transactions">{t('transactions')}</option>
                            <option value="companies">{t('companies')}</option>
                            <option value="services">{t('services')}</option>
                            <option value="employees">{t('employees')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="card p-5 group hover:shadow-xl transition-all duration-300">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-dark-800 dark:text-white">{loading ? '…' : stat.value}</p>
                                </div>
                                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transactions Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-6">
                        {isRTL ? 'المعاملات حسب الشهر' : 'Transactions by Month'}
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={transactionsByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                        borderRadius: '12px',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="completed" fill="#10b981" name={t('completed')} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pending" fill="#f59e0b" name={t('pending')} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cancelled" fill="#ef4444" name={t('cancelled')} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Distribution */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-6">
                        {isRTL ? 'توزيع الخدمات' : 'Service Distribution'}
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {serviceDistribution.map((entry, index) => (
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
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 card p-6">
                    <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-6">
                        {isRTL ? 'الإيرادات مقابل الهدف' : 'Revenue vs Target'}
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                        borderRadius: '12px',
                                    }}
                                    formatter={(value) => [`${(value / 1000).toFixed(0)}K`, '']}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                                    name={isRTL ? 'الإيرادات' : 'Revenue'}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="target"
                                    stroke="#94a3b8"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    name={isRTL ? 'الهدف' : 'Target'}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-6">
                        {isRTL ? 'أفضل الموظفين أداءً' : 'Top Performers'}
                    </h3>
                    <div className="space-y-4">
                        {topPerformers.length === 0 ? (
                            <p className="text-sm text-dark-500 dark:text-dark-400">
                                {isRTL ? 'لا توجد بيانات' : 'No data yet'}
                            </p>
                        ) : topPerformers.map((performer, index) => (
                            <div key={performer.name} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-dark-300'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-dark-800 dark:text-white text-sm truncate">{performer.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                                                style={{ width: `${performer.completion}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-dark-500">{performer.completion}%</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-dark-800 dark:text-white">{performer.tasks}</p>
                                    <p className="text-xs text-dark-400">{isRTL ? 'مهمة' : 'tasks'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
