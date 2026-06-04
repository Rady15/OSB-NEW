import React, { useState } from 'react';
import { authAPI, servicesAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { Play, Code, CheckCircle, XCircle, AlertCircle, Cpu, ShieldAlert, Key } from 'lucide-react';

const DevHub = () => {
    const { t, isRTL } = useApp();
    const [activeResponse, setActiveResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('auth');

    // Input States
    const [loginEmail, setLoginEmail] = useState('admin.mohamed@gmail.com');
    const [loginPass, setLoginPass] = useState('Admin@29');
    
    const [suspendUser, setSuspendUser] = useState('Hedaya');
    const [unsuspendUser, setUnsuspendUser] = useState('Hedaya');

    const [staffEmail, setStaffEmail] = useState('testtt@example.com');
    const [staffUser, setStaffUser] = useState('aayaa');
    const [staffPass, setStaffPass] = useState('Pa$$w0rd!');
    const [staffPhone, setStaffPhone] = useState('011132843743');

    const [priceReqId, setPriceReqId] = useState('eed78af1-6d2b-4f78-85e0-4517143c2b99');
    const [priceVal, setPriceVal] = useState('200.00');

    const [assignReqId, setAssignReqId] = useState('20cb3141-c4ef-41eb-b823-c14a240197ec');
    const [assignEmpId, setAssignEmpId] = useState('aya1');

    const [statusReqId, setStatusReqId] = useState('b11d76fe-7c19-4cb2-a12e-be1733d09d4e');
    const [statusVal, setStatusVal] = useState('Completed');

    const [descReqId, setDescReqId] = useState('aya12');
    const [descVal, setDescVal] = useState('please upload your INN');

    const handleRun = async (apiCall, name) => {
        setLoading(true);
        setActiveResponse({ name, status: 'loading', data: null });
        try {
            const data = await apiCall();
            setActiveResponse({
                name,
                status: 'success',
                statusCode: 200,
                data: JSON.stringify(data, null, 2)
            });
        } catch (error) {
            setActiveResponse({
                name,
                status: 'error',
                statusCode: error.response?.status || 500,
                data: JSON.stringify(error.response?.data || error.message, null, 2)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-dark-800 dark:text-white flex items-center gap-2">
                    <Cpu className="w-8 h-8 text-primary-500" />
                    Dev Hub (مركز اختبار المسارات والمطورين)
                </h1>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                    أداة فحص واختبار المسارات الفعالة والـ APIs المربوطة بسيرفر الموبايل الرئيسي ach.runasp.net
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left panel: list of APIs */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Tabs */}
                    <div className="flex border-b border-dark-200 dark:border-dark-700">
                        <button
                            onClick={() => setActiveTab('auth')}
                            className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
                                activeTab === 'auth' ? 'border-primary-500 text-primary-600' : 'border-transparent text-dark-400'
                            }`}
                        >
                            الحسابات والتوثيق (Account API)
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
                                activeTab === 'services' ? 'border-primary-500 text-primary-600' : 'border-transparent text-dark-400'
                            }`}
                        >
                            الخدمات والمعاملات (UserServices API)
                        </button>
                    </div>

                    {/* Auth Endpoints */}
                    {activeTab === 'auth' && (
                        <div className="space-y-4">
                            {/* Login */}
                            <div className="card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded text-xs font-bold font-mono">POST</span>
                                    <span className="font-mono text-xs dark:text-dark-300">/api/Account/login</span>
                                </div>
                                <h3 className="font-bold text-sm">تسجيل دخول كمسؤول (Login As Admin)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Email" />
                                    <input type="text" value={loginPass} onChange={e => setLoginPass(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Password" />
                                </div>
                                <button onClick={() => handleRun(() => authAPI.login(loginEmail, loginPass), 'تسجيل دخول كمسؤول')} className="btn-primary w-full flex items-center justify-center gap-1 py-2 text-xs">
                                    <Play className="w-3.5 h-3.5" /> إرسال الطلب
                                </button>
                            </div>

                            {/* Get All Users */}
                            <div className="card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded text-xs font-bold font-mono">GET</span>
                                    <span className="font-mono text-xs dark:text-dark-300">/api/Account/all</span>
                                </div>
                                <h3 className="font-bold text-sm">جلب جميع المستخدمين (Get All Users)</h3>
                                <button onClick={() => handleRun(authAPI.getAllUsers, 'جلب جميع المستخدمين')} className="btn-secondary w-full flex items-center justify-center gap-1 py-2 text-xs">
                                    <Play className="w-3.5 h-3.5" /> إرسال الطلب
                                </button>
                            </div>

                            {/* Get All Staff */}
                            <div className="card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded text-xs font-bold font-mono">GET</span>
                                    <span className="font-mono text-xs dark:text-dark-300">/api/Account/AllStaff</span>
                                </div>
                                <h3 className="font-bold text-sm">جلب جميع الموظفين (Get All Staff)</h3>
                                <button onClick={() => handleRun(authAPI.getAllStaff, 'جلب جميع الموظفين')} className="btn-secondary w-full flex items-center justify-center gap-1 py-2 text-xs">
                                    <Play className="w-3.5 h-3.5" /> إرسال الطلب
                                </button>
                            </div>

                            {/* Add Staff */}
                            <div className="card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded text-xs font-bold font-mono">POST</span>
                                    <span className="font-mono text-xs dark:text-dark-300">/api/Account/create-employee</span>
                                </div>
                                <h3 className="font-bold text-sm">إضافة موظف جديد (Add Staff)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" value={staffUser} onChange={e => setStaffUser(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Username" />
                                    <input type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Email" />
                                    <input type="text" value={staffPass} onChange={e => setStaffPass(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Password" />
                                    <input type="text" value={staffPhone} onChange={e => setStaffPhone(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Phone" />
                                </div>
                                <button onClick={() => handleRun(() => authAPI.addStaff({ email: staffEmail, userName: staffUser, password: staffPass, role: 'Staff', phoneNumber: staffPhone }), 'إضافة موظف جديد')} className="btn-primary w-full flex items-center justify-center gap-1 py-2 text-xs">
                                    <Play className="w-3.5 h-3.5" /> إرسال الطلب
                                </button>
                            </div>

                            {/* Suspend User */}
                            <div className="card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded text-xs font-bold font-mono">PUT</span>
                                    <span className="font-mono text-xs dark:text-dark-300">/api/Account/suspend/{"{username}"}</span>
                                </div>
                                <h3 className="font-bold text-sm">إيقاف مستخدم (Suspend User)</h3>
                                <input type="text" value={suspendUser} onChange={e => setSuspendUser(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Username" />
                                <button onClick={() => handleRun(() => authAPI.suspendUser(suspendUser), 'إيقاف مستخدم')} className="btn-secondary w-full text-red-500 border border-red-500/20 hover:bg-red-500/10 flex items-center justify-center gap-1 py-2 text-xs">
                                    <Play className="w-3.5 h-3.5" /> إرسال الطلب
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Services Endpoints */}
                    {activeTab === 'services' && (
                        <div className="space-y-4">
                            {/* Get All Requests */}
                            <div className="card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="bg-blue-500/10 text-blue-600 px-2.5 py-1 rounded text-xs font-bold font-mono">GET</span>
                                    <span className="font-mono text-xs dark:text-dark-300">/api/UserServices/all</span>
                                </div>
                                <h3 className="font-bold text-sm">جلب جميع المعاملات وتفاصيلها (Get All Requests)</h3>
                                <button onClick={() => handleRun(servicesAPI.getAllRequests, 'جلب جميع المعاملات')} className="btn-secondary w-full flex items-center justify-center gap-1 py-2 text-xs">
                                    <Play className="w-3.5 h-3.5" /> إرسال الطلب
                                </button>
                            </div>

                            {/* Set Cost */}
                            <div className="card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded text-xs font-bold font-mono">PUT</span>
                                    <span className="font-mono text-xs dark:text-dark-300">/api/UserServices/set-price</span>
                                </div>
                                <h3 className="font-bold text-sm">تحديد تكلفة المعاملة (Admin Set Cost)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" value={priceReqId} onChange={e => setPriceReqId(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Request ID" />
                                    <input type="text" value={priceVal} onChange={e => setPriceVal(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Price" />
                                </div>
                                <button onClick={() => handleRun(() => servicesAPI.setCost(priceReqId, priceVal), 'تحديد تكلفة')} className="btn-primary w-full flex items-center justify-center gap-1 py-2 text-xs">
                                    <Play className="w-3.5 h-3.5" /> إرسال الطلب
                                </button>
                            </div>

                            {/* Assign Request */}
                            <div className="card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded text-xs font-bold font-mono">POST</span>
                                    <span className="font-mono text-xs dark:text-dark-300">/api/UserServices/assign-request</span>
                                </div>
                                <h3 className="font-bold text-sm">تكليف موظف بالمعاملة (Assign Request)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" value={assignReqId} onChange={e => setAssignReqId(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Request ID" />
                                    <input type="text" value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Employee UserID" />
                                </div>
                                <button onClick={() => handleRun(() => servicesAPI.assignRequest(assignReqId, assignEmpId), 'تكليف موظف')} className="btn-primary w-full flex items-center justify-center gap-1 py-2 text-xs">
                                    <Play className="w-3.5 h-3.5" /> إرسال الطلب
                                </button>
                            </div>

                            {/* Update Status */}
                            <div className="card p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded text-xs font-bold font-mono">PUT</span>
                                    <span className="font-mono text-xs dark:text-dark-300">/api/UserServices/update-status</span>
                                </div>
                                <h3 className="font-bold text-sm">تحديث حالة المعاملة (Update Status)</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" value={statusReqId} onChange={e => setStatusReqId(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Request ID" />
                                    <input type="text" value={statusVal} onChange={e => setStatusVal(e.target.value)} className="input-field py-1.5 text-xs" placeholder="Status" />
                                </div>
                                <button onClick={() => handleRun(() => servicesAPI.updateStatus(statusReqId, statusVal), 'تحديث الحالة')} className="btn-primary w-full flex items-center justify-center gap-1 py-2 text-xs">
                                    <Play className="w-3.5 h-3.5" /> إرسال الطلب
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right panel: response console */}
                <div className="lg:col-span-1">
                    <div className="card p-4 h-full flex flex-col min-h-[400px]">
                        <div className="border-b border-dark-100 dark:border-dark-700 pb-3 mb-3 flex items-center justify-between">
                            <span className="font-bold text-sm flex items-center gap-1.5">
                                <Code className="w-4 h-4 text-primary-500" /> Console / Response
                            </span>
                            {activeResponse && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    activeResponse.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                                    activeResponse.status === 'loading' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {activeResponse.status === 'loading' ? 'Running...' : `HTTP ${activeResponse.statusCode}`}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 bg-dark-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[500px]">
                            {activeResponse ? (
                                activeResponse.status === 'loading' ? (
                                    <div className="flex flex-col items-center justify-center h-full py-20 text-blue-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mb-2"></div>
                                        <p>جارٍ معالجة وإرسال الطلب للسيرفر...</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-white border-b border-dark-800 pb-2 mb-2 font-bold">{activeResponse.name}</p>
                                        <pre className="whitespace-pre-wrap leading-relaxed">{activeResponse.data}</pre>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-20 text-dark-500">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p>لم يتم إرسال أي طلب حتى الآن.</p>
                                    <p className="text-[10px] mt-1 opacity-70">اختر مساراً واضغط "إرسال الطلب" لعرض النتائج هنا.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevHub;
