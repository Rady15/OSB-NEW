import { XCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel, confirmText, cancelText, danger }) => {
    const { isRTL } = useApp();
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-full ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
                            <AlertTriangle className={`w-6 h-6 ${danger ? 'text-red-600 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-1">
                                {title}
                            </h3>
                            <p className="text-sm text-dark-500 dark:text-dark-400">
                                {message}
                            </p>
                        </div>
                        <button onClick={onCancel} className="text-dark-400 hover:text-dark-600 dark:hover:text-white shrink-0">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button onClick={onCancel} className="btn-secondary">
                        {cancelText || (isRTL ? 'إلغاء' : 'Cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={danger ? 'btn-danger' : 'btn-primary'}
                    >
                        {confirmText || (isRTL ? 'تأكيد' : 'Confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
