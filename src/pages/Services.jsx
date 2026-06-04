import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Briefcase,
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Grid,
    List
} from 'lucide-react';

const Services = () => {
    const { t, isRTL } = useApp();
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [servicesList, setServicesList] = useState([
        {
            id: 1,
            name: 'تجديد السجل التجاري',
            nameEn: 'Commercial Registration Renewal',
            category: 'commercialRegistration',
            price: 1500,
            duration: '3-5 أيام',
            status: 'active',
            description: 'خدمة تجديد السجل التجاري للشركات والمؤسسات',
            icon: '📋'
        },
        {
            id: 2,
            name: 'إصدار رخصة تجارية',
            nameEn: 'Commercial License Issuance',
            category: 'licenses',
            price: 2500,
            duration: '5-7 أيام',
            status: 'active',
            description: 'خدمة إصدار الرخص التجارية الجديدة',
            icon: '📜'
        },
        {
            id: 3,
            name: 'تسجيل في الزكاة والدخل',
            nameEn: 'Zakat & Income Registration',
            category: 'zakatAndIncome',
            price: 1800,
            duration: '2-3 أيام',
            status: 'active',
            description: 'خدمة التسجيل في هيئة الزكاة والدخل',
            icon: '💰'
        },
        {
            id: 4,
            name: 'تسجيل في التأمينات',
            nameEn: 'Insurance Registration',
            category: 'insurance',
            price: 1200,
            duration: '1-2 أيام',
            status: 'active',
            description: 'خدمة التسجيل في التأمينات الاجتماعية',
            icon: '🛡️'
        },
        {
            id: 5,
            name: 'فتح ملف مكتب العمل',
            nameEn: 'Labor Office File Opening',
            category: 'laborOffice',
            price: 2000,
            duration: '3-4 أيام',
            status: 'active',
            description: 'خدمة فتح ملف في مكتب العمل',
            icon: '👔'
        },
        {
            id: 6,
            name: 'الاشتراك في الغرفة التجارية',
            nameEn: 'Chamber of Commerce Subscription',
            category: 'chamberOfCommerce',
            price: 1000,
            duration: '1 يوم',
            status: 'active',
            description: 'خدمة الاشتراك في الغرفة التجارية',
            icon: '🏛️'
        },
        {
            id: 7,
            name: 'تسجيل علامة تجارية',
            nameEn: 'Trademark Registration',
            category: 'intellectualProperty',
            price: 3500,
            duration: '30-60 يوم',
            status: 'active',
            description: 'خدمة تسجيل وحماية العلامات التجارية',
            icon: '™️'
        },
        {
            id: 8,
            name: 'إصدار تأشيرات عمل',
            nameEn: 'Work Visa Issuance',
            category: 'laborOffice',
            price: 5000,
            duration: '7-14 يوم',
            status: 'active',
            description: 'خدمة إصدار تأشيرات العمل للموظفين',
            icon: '🎫'
        },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedService, setSelectedService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        category: 'commercialRegistration',
        price: 0,
        duration: '',
        description: '',
        icon: '📋',
        status: 'active'
    });

    const categories = [
        { value: 'all', label: isRTL ? 'جميع الفئات' : 'All Categories' },
        { value: 'commercialRegistration', label: t('commercialRegistration') },
        { value: 'licenses', label: t('licenses') },
        { value: 'zakatAndIncome', label: t('zakatAndIncome') },
        { value: 'insurance', label: t('insurance') },
        { value: 'laborOffice', label: t('laborOffice') },
        { value: 'chamberOfCommerce', label: t('chamberOfCommerce') },
        { value: 'intellectualProperty', label: t('intellectualProperty') },
    ];

    const getCategoryColor = (category) => {
        const colors = {
            commercialRegistration: 'from-blue-500 to-blue-600',
            licenses: 'from-purple-500 to-purple-600',
            zakatAndIncome: 'from-emerald-500 to-emerald-600',
            insurance: 'from-amber-500 to-amber-600',
            laborOffice: 'from-orange-500 to-orange-600',
            chamberOfCommerce: 'from-indigo-500 to-indigo-600',
            intellectualProperty: 'from-pink-500 to-pink-600',
        };
        return colors[category] || 'from-gray-500 to-gray-600';
    };

    const handleOpenModal = (mode, service = null) => {
        setModalMode(mode);
        setSelectedService(service);
        if (service) {
            setFormData({ ...service });
        } else {
            setFormData({
                name: '',
                nameEn: '',
                category: 'commercialRegistration',
                price: 0,
                duration: '',
                description: '',
                icon: '📋',
                status: 'active'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedService(null);
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
            setServicesList(prev => prev.map(s => s.id === selectedService.id ? { ...formData } : s));
        } else {
            setServicesList(prev => [...prev, { ...formData, id: Date.now() }]);
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?')) {
            setServicesList(prev => prev.filter(s => s.id !== id));
        }
    };

    const filteredServices = servicesList.filter(service => {
        const matchesSearch = service.name.includes(searchQuery) ||
            service.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('servicesTitle')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1">
                        {t('servicesSubtitle')}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal('add')}
                    className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    {t('addService')}
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* Search */}
                    <div className="flex-1 relative w-full">
                        <Search className={`w-5 h-5 text-dark-400 absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'}`} />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`input-field ${isRTL ? 'pr-12' : 'pl-12'}`}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="input-field w-full md:w-56"
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex items-center bg-dark-100 dark:bg-dark-700 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-500' : 'text-dark-500'}`}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-500' : 'text-dark-500'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Services Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredServices.map((service) => (
                        <div
                            key={service.id}
                            className="card card-hover p-6 group"
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 bg-gradient-to-br ${getCategoryColor(service.category)} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <span className="text-2xl">{service.icon}</span>
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-2">
                                {isRTL ? service.name : service.nameEn}
                            </h3>
                            <p className="text-sm text-dark-500 dark:text-dark-400 mb-4 line-clamp-2 min-h-[40px]">
                                {service.description}
                            </p>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-sm text-dark-500 dark:text-dark-400 mb-4">
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span>{service.price} {isRTL ? 'ريال' : 'SAR'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{service.duration}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-dark-100 dark:border-dark-700">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`}>
                                    <CheckCircle className="w-3 h-3" />
                                    {t('active')}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleOpenModal('view', service)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal('edit', service)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-amber-500"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-dark-50 dark:bg-dark-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        {t('serviceName')}
                                    </th>
                                    <th className="px-6 py-4 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        {t('serviceCategory')}
                                    </th>
                                    <th className="px-6 py-4 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        {t('servicePrice')}
                                    </th>
                                    <th className="px-6 py-4 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        {t('duration')}
                                    </th>
                                    <th className="px-6 py-4 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        {t('status')}
                                    </th>
                                    <th className="px-6 py-4 text-start text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        {t('actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                                {filteredServices.map((service) => (
                                    <tr key={service.id} className="table-row">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{service.icon}</span>
                                                <span className="font-medium text-dark-700 dark:text-dark-200">
                                                    {isRTL ? service.name : service.nameEn}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                                            {t(service.category)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-dark-800 dark:text-white">
                                                {service.price} {isRTL ? 'ريال' : 'SAR'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-dark-600 dark:text-dark-300">
                                            {service.duration}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`}>
                                                <CheckCircle className="w-3 h-3" />
                                                {t('active')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal('view', service)}
                                                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-primary-500"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal('edit', service)}
                                                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-amber-500"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg transition-colors text-dark-500 hover:text-red-500"
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
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-6 border-b border-dark-100 dark:border-dark-700 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-dark-800 dark:text-white">
                                {modalMode === 'add' ? t('addService') : modalMode === 'edit' ? t('edit') : t('view')}
                            </h2>
                            <button onClick={handleCloseModal} className="text-dark-400 hover:text-dark-600 dark:hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('serviceName')} ({isRTL ? 'عربي' : 'Arabic'})
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder={isRTL ? 'أدخل اسم الخدمة' : 'Enter service name'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('serviceName')} ({isRTL ? 'إنجليزي' : 'English'})
                                    </label>
                                    <input
                                        type="text"
                                        name="nameEn"
                                        value={formData.nameEn}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder="Enter service name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('serviceCategory')}
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    >
                                        {categories.filter(c => c.value !== 'all').map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('servicePrice')}
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {t('duration')}
                                    </label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder={isRTL ? 'مثال: 3-5 أيام' : 'Example: 3-5 days'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                        {isRTL ? 'الأيقونة' : 'Icon'}
                                    </label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleInputChange}
                                        disabled={modalMode === 'view'}
                                        className="input-field"
                                        placeholder="📋"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                                    {isRTL ? 'الوصف' : 'Description'}
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={modalMode === 'view'}
                                    className="input-field"
                                    rows="3"
                                    placeholder={isRTL ? 'أدخل وصف الخدمة' : 'Enter service description'}
                                ></textarea>
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
        </div>
    );
};

export default Services;
