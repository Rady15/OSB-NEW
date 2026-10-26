import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { documentsAPI } from '../services/api';
import { FileText, Plus, Trash2, Loader2 } from 'lucide-react';

const DocumentTypes = () => {
    const { t, isRTL, addNotification } = useApp();
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nameAr, setNameAr] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [adding, setAdding] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await documentsAPI.getDocumentTypes();
            const items = Array.isArray(data) ? data : (data?.types || data?.data || []);
            setTypes(items);
        } catch (err) {
            addNotification?.(isRTL ? 'طھط¹ط°ظ‘ط± طھط­ظ…ظٹظ„ ط£ظ†ظˆط§ط¹ ط§ظ„ظ…ط³طھظ†ط¯ط§طھ' : 'Failed to load document types', 'danger');
            setTypes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!nameAr.trim()) return;
        setAdding(true);
        try {
            const created = await documentsAPI.createDocumentType({ nameAr: nameAr.trim(), nameEn: nameEn.trim() || null });
            setTypes(prev => [...prev, created]);
            setNameAr('');
            setNameEn('');
            addNotification?.(isRTL ? 'تمت الإضافة' : 'Added', 'success');
        } catch (err) {
            addNotification?.(isRTL ? 'فشلت الإضافة' : 'Add failed', 'danger');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (value) => {
        if (!window.confirm(isRTL ? 'حذف هذا النوع؟' : 'Delete this type?')) return;
        try {
            await documentsAPI.deleteDocumentType(value);
            setTypes(prev => prev.filter(t => t.value !== value));
            addNotification?.(isRTL ? 'تم الحذف' : 'Deleted', 'success');
        } catch (err) {
            addNotification?.(isRTL ? 'فشل الحذف' : 'Delete failed', 'danger');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {isRTL ? 'أنواع المستندات' : 'Document Types'}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">
                        {isRTL ? 'المستندات المطلوبة من العميل لرفعها (تظهر في تطبيق الموبايل)' : 'Required documents for clients to upload (shown in mobile app)'}
                    </p>
                </div>
            </div>

            {isAdmin && (
                <form onSubmit={handleAdd} className="card p-4 flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        placeholder={isRTL ? 'اسم المستند (عربي)' : 'Document name (Arabic)'}
                        className="input-field flex-1"
                    />
                    <input
                        type="text"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder={isRTL ? 'اسم المستند (إنجليزي) - اختياري' : 'Document name (English) - optional'}
                        className="input-field flex-1"
                    />
                    <button type="submit" disabled={adding || !nameAr.trim()} className="btn-primary flex items-center justify-center gap-2">
                        {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {isRTL ? 'إضافة' : 'Add'}
                    </button>
                </form>
            )}

            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-dark-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
                ) : types.length === 0 ? (
                    <div className="p-6 text-center text-dark-400">{isRTL ? 'لا توجد أنواع' : 'No types'}</div>
                ) : (
                    <ul className="divide-y divide-dark-100 dark:divide-dark-700">
                        {types.map((t, i) => (
                            <li key={t.id || t.value || i} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-primary-500" />
                                    <div>
                                        <p className="font-medium text-dark-800 dark:text-white">{t.nameAr || t.name || t.value}</p>
                                        {(t.nameEn || t.nameEN) && <p className="text-xs text-dark-400">{t.nameEn || t.nameEN}</p>}
                                    </div>
                                </div>
                                {isAdmin && (
                                    <button onClick={() => handleDelete(t.id || t.value)} className="text-red-500 hover:text-red-600 p-2">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DocumentTypes;
