import React, { useState } from 'react';
import { authAPI, servicesAPI, serviceCategoriesAPI, servicesManagementAPI, serviceRequestsAPI, documentsAPI, dashboardAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { Play, Code, CheckCircle, XCircle, AlertCircle, Cpu, ShieldAlert, Key, Building2, Tag, Briefcase, Layers, FileText, BarChart4 } from 'lucide-react';

const TABS = [
    { key: 'account',        icon: ShieldAlert, label: 'Account' },
    { key: 'dashboard',      icon: BarChart4,   label: 'Dashboard' },
    { key: 'categories',     icon: Tag,         label: 'Categories' },
    { key: 'services',       icon: Briefcase,   label: 'Services' },
    { key: 'requests',       icon: Layers,      label: 'Requests' },
    { key: 'user-services',  icon: FileText,    label: 'User Services' },
    { key: 'docs-companies', icon: Building2,   label: 'Docs & Companies' },
];

const DevHub = () => {
    const { t, isRTL } = useApp();
    const [activeResponse, setActiveResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('account');

    // ── Account inputs ──
    const [loginEmail, setLoginEmail] = useState('admin.mohamed@gmail.com');
    const [loginPass, setLoginPass] = useState('Admin@29');
    const [refreshTok, setRefreshTok] = useState('');
    const [suspendUser, setSuspendUser] = useState('Hedaya');
    const [unsuspendUser, setUnsuspendUser] = useState('Hedaya');
    const [staffEmail, setStaffEmail] = useState('testtt@example.com');
    const [staffUser, setStaffUser] = useState('aayaa');
    const [staffPass, setStaffPass] = useState('Pa$$w0rd!');
    const [staffPhone, setStaffPhone] = useState('011132843743');
    const [updateEmpUser, setUpdateEmpUser] = useState('aya1');
    const [updateEmpName, setUpdateEmpName] = useState('aya');
    const [updateEmpEmail, setUpdateEmpEmail] = useState('aya@example.com');
    const [updateEmpPhone, setUpdateEmpPhone] = useState('0111111111');
    const [updateEmpDept, setUpdateEmpDept] = useState('transactions');
    const [updateEmpPos, setUpdateEmpPos] = useState('موظف');

    // ── Categories inputs ──
    const [catId, setCatId] = useState('');
    const [catNameAr, setCatNameAr] = useState('');
    const [catNameEn, setCatNameEn] = useState('');

    // ── Services inputs ──
    const [svcId, setSvcId] = useState('');
    const [svcNameAr, setSvcNameAr] = useState('');
    const [svcNameEn, setSvcNameEn] = useState('');
    const [svcDesc, setSvcDesc] = useState('');
    const [svcCatId, setSvcCatId] = useState('');
    const [svcActive, setSvcActive] = useState(true);

    // ── Requests inputs ──
    const [reqBySvcId, setReqBySvcId] = useState('');
    const [statusReqId, setStatusReqId] = useState('b11d76fe-7c19-4cb2-a12e-be1733d09d4e');
    const [statusVal, setStatusVal] = useState('Completed');
    const [priceReqId, setPriceReqId] = useState('eed78af1-6d2b-4f78-85e0-4517143c2b99');
    const [priceVal, setPriceVal] = useState('200.00');
    const [assignReqId, setAssignReqId] = useState('20cb3141-c4ef-41eb-b823-c14a240197ec');
    const [assignEmpId, setAssignEmpId] = useState('aya1');
    const [descReqId, setDescReqId] = useState('aya12');
    const [descVal, setDescVal] = useState('please upload your INN');

    // ── User Services inputs ──
    const [userCatId, setUserCatId] = useState('4e0dd87f-b72b-4b3a-9790-c4f42427478f');
    const [createReqSvcId, setCreateReqSvcId] = useState('1a98ae70-c0de-462e-8a02-d2c2334af490');
    const [createReqDesc, setCreateReqDesc] = useState('أحتاج تأسيس شركه');

    // ── Document inputs ──
    const [docId, setDocId] = useState('');
    const [docUserId, setDocUserId] = useState('');
    const [docType, setDocType] = useState('');
    const [docName, setDocName] = useState('');
    const [docIssueDate, setDocIssueDate] = useState('');
    const [docExpiryDate, setDocExpiryDate] = useState('');
    const [docRefNumber, setDocRefNumber] = useState('');
    const [docNotes, setDocNotes] = useState('');

    // ── shared ──
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

    const MethodBadge = ({ method }) => {
        const colors = {
            GET: 'bg-blue-500/10 text-blue-600',
            POST: 'bg-emerald-500/10 text-emerald-600',
            PUT: 'bg-amber-500/10 text-amber-600',
            DELETE: 'bg-red-500/10 text-red-600',
        };
        return <span className={`${colors[method] || 'bg-gray-500/10 text-gray-600'} px-2.5 py-1 rounded text-xs font-bold font-mono`}>{method}</span>;
    };

    const EndpointCard = ({ method, path, title, children, onRun }) => (
        <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <MethodBadge method={method} />
                <span className="font-mono text-xs dark:text-dark-300">{path}</span>
            </div>
            <h3 className="font-bold text-sm">{title}</h3>
            {children}
            <button onClick={onRun} className="btn-primary w-full flex items-center justify-center gap-1 py-2 text-xs">
                <Play className="w-3.5 h-3.5" /> {isRTL ? 'إرسال الطلب' : 'Send'}
            </button>
        </div>
    );

    const InputRow = ({ children }) => <div className="grid grid-cols-2 gap-2">{children}</div>;
    const Input = (props) => <input {...props} className="input-field py-1.5 text-xs" />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-dark-800 dark:text-white flex items-center gap-2">
                    <Cpu className="w-8 h-8 text-primary-500" />
                    Dev Hub
                </h1>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                    {isRTL ? 'أداة فحص واختبار جميع مسارات API' : 'Test all API endpoints'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left panel: tabs + cards */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Tabs */}
                    <div className="flex flex-wrap border-b border-dark-200 dark:border-dark-700 gap-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`py-2 px-3 font-semibold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
                                    activeTab === tab.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-dark-400'
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ═══ ACCOUNT ═══ */}
                    {activeTab === 'account' && (
                        <div className="space-y-4">
                            <EndpointCard method="POST" path="/api/Account/login" title="Login As Admin" onRun={() => handleRun(() => authAPI.login(loginEmail, loginPass), 'Login')}>
                                <InputRow>
                                    <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email" />
                                    <Input type="text" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="POST" path="/api/account/refresh-token" title="Refresh Token" onRun={() => handleRun(() => authAPI.refreshToken(refreshTok), 'Refresh Token')}>
                                <Input type="text" value={refreshTok} onChange={e => setRefreshTok(e.target.value)} placeholder="Refresh Token" />
                            </EndpointCard>

                            <EndpointCard method="GET" path="/api/Account/all" title="Get All Users" onRun={() => handleRun(authAPI.getAllUsers, 'Get All Users')} />

                            <EndpointCard method="GET" path="/api/Account/AllStaff" title="Get All Staff" onRun={() => handleRun(authAPI.getAllStaff, 'Get All Staff')} />

                            <EndpointCard method="POST" path="/api/Account/create-employee" title="Add Staff" onRun={() => handleRun(() => authAPI.addStaff({ email: staffEmail, userName: staffUser, password: staffPass, role: 'Staff', phoneNumber: staffPhone }), 'Add Staff')}>
                                <InputRow>
                                    <Input type="text" value={staffUser} onChange={e => setStaffUser(e.target.value)} placeholder="Username" />
                                    <Input type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} placeholder="Email" />
                                    <Input type="text" value={staffPass} onChange={e => setStaffPass(e.target.value)} placeholder="Password" />
                                    <Input type="text" value={staffPhone} onChange={e => setStaffPhone(e.target.value)} placeholder="Phone" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="PUT" path="/api/Account/update-employee" title="Update Employee" onRun={() => handleRun(() => authAPI.updateEmployee(updateEmpUser, {
                                fullName: updateEmpName, userName: updateEmpUser, email: updateEmpEmail, phoneNumber: updateEmpPhone, department: updateEmpDept, position: updateEmpPos
                            }), 'Update Employee')}>
                                <InputRow>
                                    <Input type="text" value={updateEmpUser} onChange={e => setUpdateEmpUser(e.target.value)} placeholder="Username" />
                                    <Input type="text" value={updateEmpName} onChange={e => setUpdateEmpName(e.target.value)} placeholder="Full Name" />
                                    <Input type="email" value={updateEmpEmail} onChange={e => setUpdateEmpEmail(e.target.value)} placeholder="Email" />
                                    <Input type="text" value={updateEmpPhone} onChange={e => setUpdateEmpPhone(e.target.value)} placeholder="Phone" />
                                    <Input type="text" value={updateEmpDept} onChange={e => setUpdateEmpDept(e.target.value)} placeholder="Department" />
                                    <Input type="text" value={updateEmpPos} onChange={e => setUpdateEmpPos(e.target.value)} placeholder="Position" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="PUT" path="/api/Account/suspend/{username}" title="Suspend User" onRun={() => handleRun(() => authAPI.suspendUser(suspendUser), 'Suspend User')}>
                                <Input type="text" value={suspendUser} onChange={e => setSuspendUser(e.target.value)} placeholder="Username" />
                            </EndpointCard>

                            <EndpointCard method="PUT" path="/api/Account/unsuspend/{username}" title="Unsuspend User" onRun={() => handleRun(() => authAPI.unsuspendUser(unsuspendUser), 'Unsuspend User')}>
                                <Input type="text" value={unsuspendUser} onChange={e => setUnsuspendUser(e.target.value)} placeholder="Username" />
                            </EndpointCard>

                            <EndpointCard method="GET" path="/api/Account/status" title="Get Status" onRun={() => handleRun(authAPI.getStatus, 'Get Status')} />
                        </div>
                    )}

                    {/* ═══ DASHBOARD ═══ */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-4">
                            <EndpointCard method="GET" path="/api/dashboard/users" title="Dashboard Users Stats" onRun={() => handleRun(dashboardAPI.getUsersStats, 'Dashboard Users Stats')} />
                            <EndpointCard method="GET" path="/api/dashboard/companies" title="Dashboard Companies Stats" onRun={() => handleRun(dashboardAPI.getCompaniesStats, 'Dashboard Companies Stats')} />
                            <EndpointCard method="GET" path="/api/dashboard/services" title="Dashboard Services Stats" onRun={() => handleRun(dashboardAPI.getServicesStats, 'Dashboard Services Stats')} />
                            <EndpointCard method="GET" path="/api/dashboard/documents" title="Dashboard Documents Stats" onRun={() => handleRun(dashboardAPI.getDocumentsStats, 'Dashboard Documents Stats')} />
                            <EndpointCard method="GET" path="/api/dashboard/requests" title="Dashboard Requests Stats" onRun={() => handleRun(dashboardAPI.getRequestsStats, 'Dashboard Requests Stats')} />
                        </div>
                    )}

                    {/* ═══ CATEGORIES ═══ */}
                    {activeTab === 'categories' && (
                        <div className="space-y-4">
                            <EndpointCard method="POST" path="/api/admin/services/categories" title="Add Category" onRun={() => {
                                const fd = new FormData();
                                fd.append('NameAr', catNameAr);
                                fd.append('NameEn', catNameEn);
                                return handleRun(() => serviceCategoriesAPI.addCategory(fd), 'Add Category');
                            }}>
                                <InputRow>
                                    <Input type="text" value={catNameAr} onChange={e => setCatNameAr(e.target.value)} placeholder="Name (Arabic)" />
                                    <Input type="text" value={catNameEn} onChange={e => setCatNameEn(e.target.value)} placeholder="Name (English)" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="GET" path="/api/admin/services/categories" title="Get Categories" onRun={() => handleRun(serviceCategoriesAPI.getCategories, 'Get Categories')} />

                            <EndpointCard method="PUT" path="/api/admin/services/categories/{id}" title="Edit Category" onRun={() => {
                                const fd = new FormData();
                                fd.append('NameAr', catNameAr);
                                fd.append('NameEn', catNameEn);
                                return handleRun(() => serviceCategoriesAPI.editCategory(catId, fd), 'Edit Category');
                            }}>
                                <InputRow>
                                    <Input type="text" value={catId} onChange={e => setCatId(e.target.value)} placeholder="Category ID" />
                                    <Input type="text" value={catNameAr} onChange={e => setCatNameAr(e.target.value)} placeholder="Name (Arabic)" />
                                    <Input type="text" value={catNameEn} onChange={e => setCatNameEn(e.target.value)} placeholder="Name (English)" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="DELETE" path="/api/admin/services/categories/{id}" title="Delete Category" onRun={() => handleRun(() => serviceCategoriesAPI.deleteCategory(catId), 'Delete Category')}>
                                <Input type="text" value={catId} onChange={e => setCatId(e.target.value)} placeholder="Category ID" />
                            </EndpointCard>
                        </div>
                    )}

                    {/* ═══ SERVICES ═══ */}
                    {activeTab === 'services' && (
                        <div className="space-y-4">
                            <EndpointCard method="POST" path="/api/admin/services" title="Add Service" onRun={() => handleRun(() => servicesManagementAPI.addService({
                                nameAr: svcNameAr, nameEn: svcNameEn, description: svcDesc, categoryId: svcCatId
                            }), 'Add Service')}>
                                <InputRow>
                                    <Input type="text" value={svcNameAr} onChange={e => setSvcNameAr(e.target.value)} placeholder="Name (Arabic)" />
                                    <Input type="text" value={svcNameEn} onChange={e => setSvcNameEn(e.target.value)} placeholder="Name (English)" />
                                    <Input type="text" value={svcDesc} onChange={e => setSvcDesc(e.target.value)} placeholder="Description" />
                                    <Input type="text" value={svcCatId} onChange={e => setSvcCatId(e.target.value)} placeholder="Category ID" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="GET" path="/api/admin/services" title="Get All Services" onRun={() => handleRun(servicesManagementAPI.getAllServices, 'Get All Services')} />

                            <EndpointCard method="PUT" path="/api/admin/services/{id}" title="Edit Service" onRun={() => handleRun(() => servicesManagementAPI.editService(svcId, {
                                nameAr: svcNameAr, isActive: svcActive
                            }), 'Edit Service')}>
                                <InputRow>
                                    <Input type="text" value={svcId} onChange={e => setSvcId(e.target.value)} placeholder="Service ID" />
                                    <Input type="text" value={svcNameAr} onChange={e => setSvcNameAr(e.target.value)} placeholder="Name (Arabic)" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="DELETE" path="/api/admin/services/{id}" title="Delete Service" onRun={() => handleRun(() => servicesManagementAPI.deleteService(svcId), 'Delete Service')}>
                                <Input type="text" value={svcId} onChange={e => setSvcId(e.target.value)} placeholder="Service ID" />
                            </EndpointCard>
                        </div>
                    )}

                    {/* ═══ REQUESTS ═══ */}
                    {activeTab === 'requests' && (
                        <div className="space-y-4">
                            <EndpointCard method="GET" path="/api/admin/services/requests" title="Get All Requests" onRun={() => handleRun(serviceRequestsAPI.getAllRequests, 'Get All Requests')} />

                            <EndpointCard method="GET" path="/api/admin/services/requests/by-service/{serviceId}" title="Get Requests by Service" onRun={() => handleRun(() => serviceRequestsAPI.getRequestsByService(reqBySvcId), 'Get Requests by Service')}>
                                <Input type="text" value={reqBySvcId} onChange={e => setReqBySvcId(e.target.value)} placeholder="Service ID" />
                            </EndpointCard>

                            <EndpointCard method="PUT" path="/api/admin/services/requests/{id}/status" title="Update Request Status" onRun={() => handleRun(() => serviceRequestsAPI.updateRequestStatus(statusReqId, statusVal), 'Update Status')}>
                                <InputRow>
                                    <Input type="text" value={statusReqId} onChange={e => setStatusReqId(e.target.value)} placeholder="Request ID" />
                                    <Input type="text" value={statusVal} onChange={e => setStatusVal(e.target.value)} placeholder="Status (InProgress, Completed...)" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="PUT" path="/api/admin/services/requests/{id}/cost" title="Set Cost" onRun={() => handleRun(() => servicesAPI.setCost(priceReqId, priceVal), 'Set Cost')}>
                                <InputRow>
                                    <Input type="text" value={priceReqId} onChange={e => setPriceReqId(e.target.value)} placeholder="Request ID" />
                                    <Input type="text" value={priceVal} onChange={e => setPriceVal(e.target.value)} placeholder="Price" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="POST" path="/api/admin/services/requests/{id}/assign" title="Assign Request" onRun={() => handleRun(() => servicesAPI.assignRequest(assignReqId, assignEmpId), 'Assign Request')}>
                                <InputRow>
                                    <Input type="text" value={assignReqId} onChange={e => setAssignReqId(e.target.value)} placeholder="Request ID" />
                                    <Input type="text" value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)} placeholder="Employee User ID" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="PUT" path="/api/admin/services/requests/{id}/description" title="Add Description" onRun={() => handleRun(() => servicesAPI.addDescription(descReqId, descVal), 'Add Description')}>
                                <InputRow>
                                    <Input type="text" value={descReqId} onChange={e => setDescReqId(e.target.value)} placeholder="Request ID" />
                                    <Input type="text" value={descVal} onChange={e => setDescVal(e.target.value)} placeholder="Description" />
                                </InputRow>
                            </EndpointCard>
                        </div>
                    )}

                    {/* ═══ USER SERVICES ═══ */}
                    {activeTab === 'user-services' && (
                        <div className="space-y-4">
                            <EndpointCard method="GET" path="/api/services" title="Get Categories & Services For User" onRun={() => handleRun(serviceCategoriesAPI.getCategoriesForUser, 'Get Categories & Services')} />

                            <EndpointCard method="GET" path="/api/services/categories/{categoryId}" title="Get Services By Category" onRun={() => handleRun(() => serviceCategoriesAPI.getServicesByCategory(userCatId), 'Get Services By Category')}>
                                <Input type="text" value={userCatId} onChange={e => setUserCatId(e.target.value)} placeholder="Category ID" />
                            </EndpointCard>

                            <EndpointCard method="POST" path="/api/services/requests" title="Create Request (User)" onRun={() => {
                                const fd = new FormData();
                                fd.append('ServiceId', createReqSvcId);
                                fd.append('Description', createReqDesc);
                                return handleRun(() => serviceRequestsAPI.createRequest(fd), 'Create Request');
                            }}>
                                <InputRow>
                                    <Input type="text" value={createReqSvcId} onChange={e => setCreateReqSvcId(e.target.value)} placeholder="Service ID" />
                                    <Input type="text" value={createReqDesc} onChange={e => setCreateReqDesc(e.target.value)} placeholder="Description" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="GET" path="/api/services/requests" title="Get My Requests (User)" onRun={() => handleRun(serviceRequestsAPI.getMyRequests, 'Get My Requests')} />
                        </div>
                    )}

                    {/* ═══ DOCS & COMPANIES ═══ */}
                    {activeTab === 'docs-companies' && (
                        <div className="space-y-4">
                            <EndpointCard method="GET" path="/api/documents/types" title="Get Document Types" onRun={() => handleRun(documentsAPI.getDocumentTypes, 'Get Document Types')} />

                            <EndpointCard method="GET" path="/api/documents/admin/all" title="Get Admin All Documents" onRun={() => handleRun(documentsAPI.getAdminAllDocuments, 'Get Admin All Documents')} />

                            <EndpointCard method="GET" path="/api/documents/admin/user/{userId}" title="Get User Documents" onRun={() => handleRun(() => documentsAPI.getUserDocuments(docUserId), 'Get User Documents')}>
                                <Input type="text" value={docUserId} onChange={e => setDocUserId(e.target.value)} placeholder="User ID" />
                            </EndpointCard>

                            <EndpointCard method="GET" path="/api/documents" title="Get My Documents" onRun={() => handleRun(documentsAPI.getAllDocuments, 'Get My Documents')} />

                            <EndpointCard method="GET" path="/api/documents/{id}" title="Get Document By ID" onRun={() => handleRun(() => documentsAPI.getDocumentById(docId), 'Get Document By ID')}>
                                <Input type="text" value={docId} onChange={e => setDocId(e.target.value)} placeholder="Document ID" />
                            </EndpointCard>

                            <EndpointCard method="POST" path="/api/documents" title="Upload Document" onRun={() => {
                                const fd = new FormData();
                                if (docType) fd.append('DocumentType', docType);
                                if (docName) fd.append('DocumentName', docName);
                                if (docIssueDate) fd.append('IssueDate', docIssueDate);
                                if (docExpiryDate) fd.append('ExpiryDate', docExpiryDate);
                                if (docRefNumber) fd.append('ReferenceNumber', docRefNumber);
                                if (docNotes) fd.append('Notes', docNotes);
                                return handleRun(() => documentsAPI.uploadDocument(fd), 'Upload Document');
                            }}>
                                <InputRow>
                                    <Input type="text" value={docType} onChange={e => setDocType(e.target.value)} placeholder="Document Type" />
                                    <Input type="text" value={docName} onChange={e => setDocName(e.target.value)} placeholder="Document Name" />
                                    <Input type="date" value={docIssueDate} onChange={e => setDocIssueDate(e.target.value)} placeholder="Issue Date" />
                                    <Input type="date" value={docExpiryDate} onChange={e => setDocExpiryDate(e.target.value)} placeholder="Expiry Date" />
                                    <Input type="text" value={docRefNumber} onChange={e => setDocRefNumber(e.target.value)} placeholder="Reference Number" />
                                    <Input type="text" value={docNotes} onChange={e => setDocNotes(e.target.value)} placeholder="Notes" />
                                </InputRow>
                            </EndpointCard>

                            <EndpointCard method="DELETE" path="/api/documents/{id}" title="Delete Document" onRun={() => handleRun(() => documentsAPI.deleteDocument(docId), 'Delete Document')}>
                                <Input type="text" value={docId} onChange={e => setDocId(e.target.value)} placeholder="Document ID" />
                            </EndpointCard>

                            <EndpointCard method="GET" path="/api/Account/all" title="Get All Users (Companies)" onRun={() => handleRun(authAPI.getAllUsers, 'Get All Users')} />
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
