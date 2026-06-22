import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { serviceCategoriesAPI, servicesManagementAPI, serviceRequestsAPI } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import {
    Briefcase,
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    Grid,
    List,
    RefreshCw,
    AlertCircle,
    Tag,
    Layers,
    ToggleLeft,
    ToggleRight,
    ChevronDown,
    X,
    Image as ImageIcon,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────
const CATEGORY_GRADIENTS = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-orange-500 to-orange-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
];
const getGradient = (idx) => CATEGORY_GRADIENTS[idx % CATEGORY_GRADIENTS.length];

// ─── main component ──────────────────────────────────────────────────────────
const Services = () => {
    const { t, isRTL, addNotification } = useApp();

    // ── view state
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'services' | 'requests'
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // ── data
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'view'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedService, setSelectedService] = useState(null);

    // ── category form
    const [catForm, setCatForm] = useState({ nameAr: '', nameEn: '', image: null });
    // ── service form
    const [svcForm, setSvcForm] = useState({ nameAr: '', nameEn: '', description: '', categoryId: '', isActive: true, image: null });

    // ── saving
    const [saving, setSaving] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null, danger: false });
    const showConfirm = (title, message, onConfirm, danger = true) => setConfirmDialog({ show: true, title, message, onConfirm, danger });

    // ─── fetch all ────────────────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        const [cats, svcs, reqs] = await Promise.allSettled([
            serviceCategoriesAPI.getCategories(),
            servicesManagementAPI.getAllServices(),
            serviceRequestsAPI.getAllRequests(),
        ]);

        const extractData = (result, keys) => {
            if (result.status === 'rejected') {
                console.error('[Services] API failed:', result.reason);
                return [];
            }
            const val = result.value;
            if (Array.isArray(val)) return val;
            for (const key of keys) {
                if (val?.[key] && Array.isArray(val[key])) return val[key];
            }
            return [];
        };

        setCategories(extractData(cats, ['data', 'categories']));
        setServices(extractData(svcs, ['data', 'services']));
        setRequests(extractData(reqs, ['data', 'requests']));

        const errors = [cats, svcs, reqs].filter(r => r.status === 'rejected');
        if (errors.length > 0) {
            setError(isRTL ? 'فشل تحميل بعض البيانات' : 'Failed to load some data');
        }
        setLoading(false);
    }, [isRTL]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ─── category modal ───────────────────────────────────────────────────────
    const openCategoryModal = (mode, cat = null) => {
        setModalMode(mode);
        setSelectedCategory(cat);
        setCatForm(cat
            ? { nameAr: cat.nameAr || cat.name || '', nameEn: cat.nameEn || '', image: null }
            : { nameAr: '', nameEn: '', image: null }
        );
        setShowCategoryModal(true);
    };

    const saveCategoryModal = async () => {
        if (!catForm.nameAr.trim()) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('NameAr', catForm.nameAr);
            fd.append('NameEn', catForm.nameEn);
            if (catForm.image) fd.append('Image', catForm.image);

            if (modalMode === 'edit' && selectedCategory) {
                await serviceCategoriesAPI.editCategory(selectedCategory.id, fd);
                addNotification(isRTL ? 'تم تعديل الفئة بنجاح' : 'Category updated', 'success');
            } else {
                await serviceCategoriesAPI.addCategory(fd);
                addNotification(isRTL ? 'تمت إضافة الفئة بنجاح' : 'Category added', 'success');
            }
            setShowCategoryModal(false);
            fetchAll();
        } catch (err) {
            addNotification(isRTL ? 'فشلت العملية' : 'Operation failed', 'danger');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const deleteCategory = async (id) => {
        showConfirm(
            isRTL ? 'حذف الفئة' : 'Delete Category',
            isRTL ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Delete this category?',
            async () => {
                try {
                    await serviceCategoriesAPI.deleteCategory(id);
                    addNotification(isRTL ? 'تم حذف الفئة' : 'Category deleted', 'success');
                    fetchAll();
                } catch (err) {
                    addNotification(isRTL ? 'فشل الحذف' : 'Delete failed', 'danger');
                    console.error(err);
                }
            }
        );
    };

    // ─── service modal ────────────────────────────────────────────────────────
    const openServiceModal = (mode, svc = null) => {
        setModalMode(mode);
        setSelectedService(svc);
        setSvcForm(svc
            ? { nameAr: svc.nameAr || svc.name || '', nameEn: svc.nameEn || '', description: svc.description || '', categoryId: svc.categoryId || '', isActive: svc.isActive ?? true, image: null }
            : { nameAr: '', nameEn: '', description: '', categoryId: categories[0]?.id || '', isActive: true, image: null }
        );
        setShowServiceModal(true);
    };

    const saveServiceModal = async () => {
        if (!svcForm.nameAr.trim() || !svcForm.categoryId) return;
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('NameAr', svcForm.nameAr);
            fd.append('NameEn', svcForm.nameEn);
            fd.append('Description', svcForm.description);
            fd.append('CategoryId', svcForm.categoryId);
            fd.append('IsActive', svcForm.isActive);
            if (svcForm.image) fd.append('Image', svcForm.image);

            if (modalMode === 'edit' && selectedService) {
                await servicesManagementAPI.editService(selectedService.id, fd);
                addNotification(isRTL ? 'تم تعديل الخدمة بنجاح' : 'Service updated', 'success');
            } else {
                await servicesManagementAPI.addService(fd);
                addNotification(isRTL ? 'تمت إضافة الخدمة بنجاح' : 'Service added', 'success');
            }
            setShowServiceModal(false);
            fetchAll();
        } catch (err) {
            addNotification(isRTL ? 'فشلت العملية' : 'Operation failed', 'danger');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const deleteService = async (id) => {
        showConfirm(
            isRTL ? 'حذف الخدمة' : 'Delete Service',
            isRTL ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Delete this service?',
            async () => {
                try {
                    await servicesManagementAPI.deleteService(id);
                    addNotification(isRTL ? 'تم حذف الخدمة' : 'Service deleted', 'success');
                    fetchAll();
                } catch (err) {
                    addNotification(isRTL ? 'فشل الحذف' : 'Delete failed', 'danger');
                    console.error(err);
                }
            }
        );
    };

    // ─── update request status ────────────────────────────────────────────────
    const updateStatus = async (id, status) => {
        try {
            await serviceRequestsAPI.updateRequestStatus(id, status);
            addNotification(isRTL ? 'تم تحديث الحالة' : 'Status updated', 'success');
            fetchAll();
        } catch (err) {
            addNotification(isRTL ? 'فشل التحديث' : 'Update failed', 'danger');
            console.error(err);
        }
    };

    // ─── filtered lists ───────────────────────────────────────────────────────
    const filteredCategories = categories.filter(c => {
        const name = c.nameAr || c.name || '';
        return name.includes(searchQuery) || (c.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredServices = services.filter(s => {
        const name = s.nameAr || s.name || '';
        const matchSearch = name.includes(searchQuery) || (s.nameEn || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = categoryFilter === 'all' || s.categoryId === categoryFilter;
        return matchSearch && matchCat;
    });

    const filteredRequests = requests.filter(r => {
        const desc = r.description || r.serviceNameAr || '';
        return desc.includes(searchQuery) || (r.serviceNameAr || '').includes(searchQuery);
    });

    // ─── status helpers ───────────────────────────────────────────────────────
    const statusColor = {
        Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        InProgress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    const statusLabel = {
        Pending: isRTL ? 'قيد الانتظار' : 'Pending',
        InProgress: isRTL ? 'قيد التنفيذ' : 'In Progress',
        Completed: isRTL ? 'مكتمل' : 'Completed',
        Cancelled: isRTL ? 'ملغي' : 'Cancelled',
    };

    const getCatName = (catId) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? (isRTL ? (cat.nameAr || cat.name) : (cat.nameEn || cat.nameAr || cat.name)) : '—';
    };

    // ─── render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {isRTL ? 'إدارة الخدمات' : 'Services Management'}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1">
                        {isRTL ? 'إدارة فئات وخدمات وطلبات النظام' : 'Manage categories, services and requests'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchAll} className="btn-secondary flex items-center gap-2 py-2.5">
                        <RefreshCw className="w-4 h-4" />
                        {isRTL ? 'تحديث' : 'Refresh'}
                    </button>
                    {activeTab === 'categories' && (
                        <button onClick={() => openCategoryModal('add')} className="btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            {isRTL ? 'إضافة فئة' : 'Add Category'}
                        </button>
                    )}
                    {activeTab === 'services' && (
                        <button onClick={() => openServiceModal('add')} className="btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            {isRTL ? 'إضافة خدمة' : 'Add Service'}
                        </button>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="card p-4 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/20 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    <button onClick={fetchAll} className="ml-auto text-xs px-3 py-1 rounded-md bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300 hover:bg-red-200">
                        {isRTL ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-dark-100 dark:bg-dark-800 rounded-xl p-1 w-fit">
                {[
                    { key: 'categories', icon: Tag, label: isRTL ? `الفئات (${categories.length})` : `Categories (${categories.length})` },
                    { key: 'services', icon: Briefcase, label: isRTL ? `الخدمات (${services.length})` : `Services (${services.length})` },
                    { key: 'requests', icon: Layers, label: isRTL ? `الطلبات (${requests.length})` : `Requests (${requests.length})` },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white dark:bg-dark-700 shadow text-primary-600 dark:text-primary-400' : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className={`w-5 h-5 text-dark-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'بحث...' : 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`input-field ${isRTL ? 'pr-12' : 'pl-12'}`}
                        />
                    </div>
                    {activeTab === 'services' && (
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="input-field w-full md:w-56"
                        >
                            <option value="all">{isRTL ? 'كل الفئات' : 'All Categories'}</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {isRTL ? (cat.nameAr || cat.name) : (cat.nameEn || cat.nameAr || cat.name)}
                                </option>
                            ))}
                        </select>
                    )}
                    {activeTab !== 'requests' && (
                        <div className="flex items-center bg-dark-100 dark:bg-dark-700 rounded-xl p-1">
                            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-dark-600 shadow text-primary-500' : 'text-dark-500'}`}>
                                <Grid className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-dark-600 shadow text-primary-500' : 'text-dark-500'}`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                        <div className="spinner w-10 h-10" />
                        <p className="text-sm text-dark-500 dark:text-dark-400">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</p>
                    </div>
                </div>
            )}

            {/* ════ CATEGORIES TAB ════ */}
            {!loading && activeTab === 'categories' && (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredCategories.map((cat, idx) => (
                            <div key={cat.id} className="card card-hover p-6 group">
                                <div className={`w-14 h-14 bg-gradient-to-br ${getGradient(idx)} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform overflow-hidden`}>
                                    {cat.imageUrl ? (
                                        <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Tag className="w-7 h-7 text-white" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-1">
                                    {isRTL ? (cat.nameAr || cat.name) : (cat.nameEn || cat.nameAr || cat.name)}
                                </h3>
                                <p className="text-xs text-dark-400 mb-4">
                                    {services.filter(s => s.categoryId === cat.id).length} {isRTL ? 'خدمة' : 'services'}
                                </p>
                                <div className="flex items-center gap-1 pt-4 border-t border-dark-100 dark:border-dark-700">
                                    <button onClick={() => openCategoryModal('view', cat)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-primary-500">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => openCategoryModal('edit', cat)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-amber-500">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteCategory(cat.id)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredCategories.length === 0 && (
                            <div className="col-span-full text-center py-12 text-dark-400">
                                <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>{isRTL ? 'لا توجد فئات' : 'No categories found'}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-dark-50 dark:bg-dark-800/50">
                                <tr>
                                    {[isRTL ? 'الفئة' : 'Category', isRTL ? 'عدد الخدمات' : 'Services', isRTL ? 'الإجراءات' : 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 text-start text-xs font-semibold text-dark-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                                {filteredCategories.map((cat, idx) => (
                                    <tr key={cat.id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getGradient(idx)} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                                                    {cat.imageUrl ? (
                                                        <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Tag className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-dark-800 dark:text-white">{cat.nameAr || cat.name}</p>
                                                    <p className="text-xs text-dark-400">{cat.nameEn}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                                            {services.filter(s => s.categoryId === cat.id).length}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openCategoryModal('edit', cat)} className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-dark-400 hover:text-amber-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-dark-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ════ SERVICES TAB ════ */}
            {!loading && activeTab === 'services' && (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredServices.map((svc, idx) => (
                            <div key={svc.id} className="card card-hover p-6 group">
                                {svc.imageUrl ? (
                                    <img src={svc.imageUrl} alt="" className="w-14 h-14 rounded-2xl mb-4 shadow-lg object-cover group-hover:scale-110 transition-transform" />
                                ) : (
                                    <div className={`w-14 h-14 bg-gradient-to-br ${getGradient(idx)} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Briefcase className="w-7 h-7 text-white" />
                                    </div>
                                )}
                                <h3 className="text-base font-semibold text-dark-800 dark:text-white mb-1 line-clamp-1">
                                    {isRTL ? (svc.nameAr || svc.name) : (svc.nameEn || svc.nameAr || svc.name)}
                                </h3>
                                <p className="text-xs text-dark-400 mb-1">{getCatName(svc.categoryId)}</p>
                                <p className="text-xs text-dark-500 dark:text-dark-400 line-clamp-2 min-h-[32px]">{svc.description}</p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-100 dark:border-dark-700">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${svc.isActive !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {svc.isActive !== false ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openServiceModal('view', svc)} className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg text-dark-400 hover:text-primary-500 transition-colors"><Eye className="w-4 h-4" /></button>
                                        <button onClick={() => openServiceModal('edit', svc)} className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg text-dark-400 hover:text-amber-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => deleteService(svc.id)} className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg text-dark-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredServices.length === 0 && (
                            <div className="col-span-full text-center py-12 text-dark-400">
                                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>{isRTL ? 'لا توجد خدمات' : 'No services found'}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-dark-50 dark:bg-dark-800/50">
                                <tr>
                                    {[isRTL ? 'الخدمة' : 'Service', isRTL ? 'الفئة' : 'Category', isRTL ? 'الوصف' : 'Description', isRTL ? 'الحالة' : 'Status', isRTL ? 'الإجراءات' : 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 text-start text-xs font-semibold text-dark-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                                {filteredServices.map((svc, idx) => (
                                    <tr key={svc.id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {svc.imageUrl ? (
                                                    <img src={svc.imageUrl} alt="" className="w-9 h-9 rounded-xl flex-shrink-0 object-cover shadow" />
                                                ) : (
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getGradient(idx)} flex items-center justify-center flex-shrink-0`}>
                                                        <Briefcase className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-dark-800 dark:text-white">{svc.nameAr || svc.name}</p>
                                                    <p className="text-xs text-dark-400">{svc.nameEn}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-dark-600 dark:text-dark-300 text-sm">{getCatName(svc.categoryId)}</td>
                                        <td className="px-6 py-4 text-dark-500 dark:text-dark-400 text-sm max-w-[200px] truncate">{svc.description || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${svc.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {svc.isActive !== false ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openServiceModal('edit', svc)} className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-dark-400 hover:text-amber-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => deleteService(svc.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-dark-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* ════ REQUESTS TAB ════ */}
            {!loading && activeTab === 'requests' && (
                <div className="card overflow-hidden">
                    <table className="w-full min-w-max">
                        <thead className="bg-dark-50 dark:bg-dark-800/50">
                            <tr>
                                {[isRTL ? 'رقم الطلب' : 'ID', isRTL ? 'الخدمة' : 'Service', isRTL ? 'الوصف' : 'Description', isRTL ? 'التاريخ' : 'Date', isRTL ? 'الحالة' : 'Status', isRTL ? 'تغيير الحالة' : 'Change Status'].map(h => (
                                    <th key={h} className="px-5 py-4 text-start text-xs font-semibold text-dark-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="table-row">
                                    <td className="px-5 py-3 font-mono text-xs text-primary-500">{(req.id || '').toString().slice(0, 8)}…</td>
                                    <td className="px-5 py-3 text-sm text-dark-700 dark:text-dark-200">{isRTL ? req.serviceNameAr : (req.serviceNameEn || req.serviceNameAr)}</td>
                                    <td className="px-5 py-3 text-sm text-dark-500 dark:text-dark-400 max-w-[200px] truncate">{req.description || '—'}</td>
                                    <td className="px-5 py-3 text-sm text-dark-500 dark:text-dark-400">{req.createdAt && req.createdAt !== '0001-01-01T00:00:00' ? new Date(req.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : '—'}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[req.status] || 'bg-gray-100 text-gray-600'}`}>
                                            {statusLabel[req.status] || req.status || '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <select
                                            defaultValue={req.status}
                                            onChange={(e) => updateStatus(req.id, e.target.value)}
                                            className="input-field py-1 text-xs w-36"
                                        >
                                            {['Pending', 'InProgress', 'Completed', 'Cancelled'].map(s => (
                                                <option key={s} value={s}>{statusLabel[s] || s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-dark-400">
                                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>{isRTL ? 'لا توجد طلبات' : 'No requests found'}</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ════ CATEGORY MODAL ════ */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
                        <div className="p-5 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-dark-800 dark:text-white">
                                {modalMode === 'add' ? (isRTL ? 'إضافة فئة' : 'Add Category') : modalMode === 'edit' ? (isRTL ? 'تعديل الفئة' : 'Edit Category') : (isRTL ? 'تفاصيل الفئة' : 'Category Details')}
                            </h2>
                            <button onClick={() => setShowCategoryModal(false)} className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg text-dark-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {modalMode === 'view' && selectedCategory?.imageUrl && (
                                <div className="flex justify-center mb-2">
                                    <img src={selectedCategory.imageUrl} alt="" className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{isRTL ? 'الاسم (عربي) *' : 'Name (Arabic) *'}</label>
                                <input type="text" value={catForm.nameAr} onChange={e => setCatForm(p => ({ ...p, nameAr: e.target.value }))} disabled={modalMode === 'view'} className="input-field" placeholder="الخدمات القانونية" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                                <input type="text" value={catForm.nameEn} onChange={e => setCatForm(p => ({ ...p, nameEn: e.target.value }))} disabled={modalMode === 'view'} className="input-field" placeholder="Legal Services" />
                            </div>
                            {modalMode !== 'view' && (
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                                        <ImageIcon className="inline w-4 h-4 me-1" />
                                        {isRTL ? 'صورة الفئة' : 'Category Image'}
                                    </label>
                                    <input type="file" accept="image/*" onChange={e => setCatForm(p => ({ ...p, image: e.target.files[0] }))} className="block w-full text-sm text-dark-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100" />
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t border-dark-100 dark:border-dark-700 flex justify-end gap-2">
                            <button onClick={() => setShowCategoryModal(false)} className="btn-secondary">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                            {modalMode !== 'view' && (
                                <button onClick={saveCategoryModal} disabled={saving || !catForm.nameAr.trim()} className="btn-primary disabled:opacity-50">
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : (isRTL ? 'حفظ' : 'Save')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════ SERVICE MODAL ════ */}
            {showServiceModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
                        <div className="p-5 border-b border-dark-100 dark:border-dark-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-dark-800 dark:text-white">
                                {modalMode === 'add' ? (isRTL ? 'إضافة خدمة' : 'Add Service') : modalMode === 'edit' ? (isRTL ? 'تعديل الخدمة' : 'Edit Service') : (isRTL ? 'تفاصيل الخدمة' : 'Service Details')}
                            </h2>
                            <button onClick={() => setShowServiceModal(false)} className="p-1.5 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg text-dark-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {modalMode === 'view' && selectedService?.imageUrl && (
                                <div className="flex justify-center mb-2">
                                    <img src={selectedService.imageUrl} alt="" className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{isRTL ? 'الاسم (عربي) *' : 'Name (Arabic) *'}</label>
                                    <input type="text" value={svcForm.nameAr} onChange={e => setSvcForm(p => ({ ...p, nameAr: e.target.value }))} disabled={modalMode === 'view'} className="input-field" placeholder="تأسيس شركة" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}</label>
                                    <input type="text" value={svcForm.nameEn} onChange={e => setSvcForm(p => ({ ...p, nameEn: e.target.value }))} disabled={modalMode === 'view'} className="input-field" placeholder="Company Formation" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{isRTL ? 'الفئة *' : 'Category *'}</label>
                                <select value={svcForm.categoryId} onChange={e => setSvcForm(p => ({ ...p, categoryId: e.target.value }))} disabled={modalMode === 'view'} className="input-field">
                                    <option value="">{isRTL ? 'اختر فئة' : 'Select category'}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{isRTL ? (cat.nameAr || cat.name) : (cat.nameEn || cat.nameAr || cat.name)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">{isRTL ? 'الوصف' : 'Description'}</label>
                                <textarea rows={3} value={svcForm.description} onChange={e => setSvcForm(p => ({ ...p, description: e.target.value }))} disabled={modalMode === 'view'} className="input-field resize-none" placeholder={isRTL ? 'وصف الخدمة...' : 'Service description...'} />
                            </div>
                            {modalMode !== 'view' && (
                                <div className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700/50 rounded-xl">
                                    <span className="text-sm font-medium text-dark-700 dark:text-dark-300">{isRTL ? 'الخدمة نشطة' : 'Service Active'}</span>
                                    <button onClick={() => setSvcForm(p => ({ ...p, isActive: !p.isActive }))} className={`transition-colors ${svcForm.isActive ? 'text-emerald-500' : 'text-dark-400'}`}>
                                        {svcForm.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                    </button>
                                </div>
                            )}
                            {modalMode !== 'view' && (
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                                        <ImageIcon className="inline w-4 h-4 me-1" />
                                        {isRTL ? 'صورة الخدمة' : 'Service Image'}
                                    </label>
                                    <input type="file" accept="image/*" onChange={e => setSvcForm(p => ({ ...p, image: e.target.files[0] }))} className="block w-full text-sm text-dark-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100" />
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t border-dark-100 dark:border-dark-700 flex justify-end gap-2">
                            <button onClick={() => setShowServiceModal(false)} className="btn-secondary">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                            {modalMode !== 'view' && (
                                <button onClick={saveServiceModal} disabled={saving || !svcForm.nameAr.trim() || !svcForm.categoryId} className="btn-primary disabled:opacity-50">
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : (isRTL ? 'حفظ' : 'Save')}
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

export default Services;
