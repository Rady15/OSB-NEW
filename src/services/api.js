import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

// Interceptor to add Bearer Token from localStorage automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
        const hasAuth = !!config.headers.Authorization;
        console.log(`[api] ${config.method.toUpperCase()} ${config.url} auth=${hasAuth ? 'yes' : 'NO'}`);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor: convert CORS / network errors into clear messages
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const url = error.config?.url || '';
            if (import.meta.env.DEV) {
                const tokenInStorage = typeof localStorage !== 'undefined' ? !!localStorage.getItem('token') : false;
                const path = typeof window !== 'undefined' ? window.location.pathname : '';
                console.warn(
                    `[api] ${error.config?.method?.toUpperCase() || '?'} ${url} → ${status}` +
                    ` | tokenInStorage=${tokenInStorage}` +
                    ` | page=${path}` +
                    (status === 401 ? ' (token rejected by server — will redirect to /login)' : '')
                );
            }
            if (status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                try {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } catch { /* ignore */ }
                window.location.replace('/login');
            }
            return Promise.reject(error);
        }
        const isCors = typeof window !== 'undefined' && error.message === 'Network Error';
        if (isCors) {
            const friendly = new Error(
                'Cannot reach the API. If you are on the deployed site, the backend is not allowing cross-origin requests (CORS). ' +
                'If you are running locally, make sure the Vite dev server is running on http://localhost:3000.'
            );
            friendly.isCors = true;
            return Promise.reject(friendly);
        }
        if (error.code === 'ECONNABORTED') {
            const friendly = new Error('Request timed out. Please try again.');
            return Promise.reject(friendly);
        }
        return Promise.reject(error);
    }
);

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------
export const authAPI = {
    // POST /Account/login
    login: async (email, password) => {
        const response = await api.post('/Account/login', { email, password });
        const token = response.data?.accessToken || response.data?.token;
        if (token) {
            localStorage.setItem('token', token);
        }
        if (response.data?.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        return response.data;
    },
    // GET /admin/users
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    // GET /Account/AllStaff
    getAllStaff: async () => {
        const response = await api.get('/Account/AllStaff');
        return response.data;
    },
    // POST /Account/create-employee
    addStaff: async (staffData) => {
        const response = await api.post('/Account/create-employee', staffData);
        return response.data ?? { success: true };
    },
    // PUT /admin/users/{id}/suspend
    suspendUser: async (id) => {
        const response = await api.put(`/admin/users/${id}/suspend`);
        return response.data ?? { success: true };
    },
    // PUT /admin/users/{id}/unsuspend
    unsuspendUser: async (id) => {
        const response = await api.put(`/admin/users/${id}/unsuspend`);
        return response.data ?? { success: true };
    },
    // PUT /Account/update-employee
    updateEmployee: async (userName, employeeData) => {
        const response = await api.put('/Account/update-employee', { userName, ...employeeData });
        return response.data ?? { success: true };
    },
    // GET /Account/status
    getStatus: async () => {
        const response = await api.get('/Account/status');
        return response.data;
    },
    // POST /account/refresh-token
    refreshToken: async (refreshToken) => {
        const response = await api.post('/account/refresh-token', { refreshToken });
        const token = response.data?.accessToken || response.data?.token;
        if (token) localStorage.setItem('token', token);
        if (response.data?.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
        return response.data;
    },
};

// ---------------------------------------------------------------------------
// Services API  (uses /admin/services/requests & /services/requests)
// ---------------------------------------------------------------------------
export const servicesAPI = {
    // GET /admin/services/requests — used by Dashboard, Transactions, Reports
    getDashboardStats: async () => {
        const response = await api.get('/admin/services/requests');
        const all = Array.isArray(response.data)
            ? response.data
            : (response.data?.requests || response.data?.services || []);
        return { all };
    },
    // GET /admin/services/requests — returns last 5
    getRecentTransactions: async () => {
        try {
            const response = await api.get('/admin/services/requests');
            const all = Array.isArray(response.data) ? response.data : [];
            return all.slice(0, 5).map((item) => ({
                id: item.id || '-',
                serviceName: item.serviceNameAr || item.serviceNameEn || item.serviceId || '-',
                status: item.status || 'pending',
                date: item.createdAt && item.createdAt !== '0001-01-01T00:00:00'
                    ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '-',
            }));
        } catch {
            return [];
        }
    },
    // GET /admin/services/requests
    getAllRequests: async (config = {}) => {
        const response = await api.get('/admin/services/requests', config);
        return response.data;
    },
    // GET /services/requests  (employee's own requests)
    getStaffRequests: async () => {
        const response = await api.get('/services/requests');
        return response.data;
    },
    // PUT /admin/services/requests/{requestId}/status
    updateStatus: async (requestId, status) => {
        const response = await api.put(`/admin/services/requests/${requestId}/status`, { status });
        return response.data ?? { success: true };
    },
    // PUT /admin/services/requests/{requestId}/cost
    setCost: async (requestId, price) => {
        const response = await api.put(`/admin/services/requests/${requestId}/cost`, { price });
        return response.data ?? { success: true };
    },
    // POST /admin/services/requests/{requestId}/assign
    assignRequest: async (requestId, employeeUserId) => {
        const response = await api.post(`/admin/services/requests/${requestId}/assign`, { employeeUserId });
        return response.data ?? { success: true };
    },
    // PUT /admin/services/requests/{requestId}/description
    addDescription: async (requestId, description) => {
        const response = await api.put(`/admin/services/requests/${requestId}/description`, { description });
        return response.data ?? { success: true };
    },
    // Assign ALL requests of a company to an employee
    assignCompanyToEmployee: async (companyUserId, employeeUserId) => {
        const response = await api.post('/admin/services/requests/assign-bulk', { companyUserId, employeeUserId });
        return response.data ?? { success: true, assigned: 0, failed: 0, total: 0 };
    },
};

// ---------------------------------------------------------------------------
// Service Categories API  →  /api/admin/services/categories
// ---------------------------------------------------------------------------
export const serviceCategoriesAPI = {
    // POST /admin/services/categories
    addCategory: async (formData) => {
        const response = await api.post('/admin/services/categories', formData);
        return response.data;
    },
    // GET /admin/services/categories
    getCategories: async () => {
        const response = await api.get('/admin/services/categories');
        return response.data;
    },
    // PUT /admin/services/categories/{id}
    editCategory: async (id, formData) => {
        const response = await api.put(`/admin/services/categories/${id}`, formData);
        return response.data ?? { success: true };
    },
    // DELETE /admin/services/categories/{id}
    deleteCategory: async (id) => {
        const response = await api.delete(`/admin/services/categories/${id}`);
        return response.data ?? { success: true };
    },
    // GET /services  (user-facing: all categories + services)
    getCategoriesForUser: async () => {
        const response = await api.get('/services');
        return response.data;
    },
    // GET /services/categories/{categoryId}
    getServicesByCategory: async (categoryId) => {
        const response = await api.get(`/services/categories/${categoryId}`);
        return response.data;
    },
};

// ---------------------------------------------------------------------------
// Services Management API  →  /api/admin/services
// ---------------------------------------------------------------------------
export const servicesManagementAPI = {
    // POST /admin/services
    addService: async (payload) => {
        const response = await api.post('/admin/services', payload);
        return response.data;
    },
    // GET /admin/services
    getAllServices: async () => {
        const response = await api.get('/admin/services');
        return response.data;
    },
    // PUT /admin/services/{id}
    editService: async (id, payload) => {
        const response = await api.put(`/admin/services/${id}`, payload);
        return response.data ?? { success: true };
    },
    // DELETE /admin/services/{id}
    deleteService: async (id) => {
        const response = await api.delete(`/admin/services/${id}`);
        return response.data ?? { success: true };
    },
};

// ---------------------------------------------------------------------------
// Service Requests API  →  /api/admin/services/requests  &  /api/services/requests
// ---------------------------------------------------------------------------
export const serviceRequestsAPI = {
    // GET /admin/services/requests
    getAllRequests: async () => {
        const response = await api.get('/admin/services/requests');
        return response.data;
    },
    // GET /admin/services/requests/by-service/{serviceId}
    getRequestsByService: async (serviceId) => {
        const response = await api.get(`/admin/services/requests/by-service/${serviceId}`);
        return response.data;
    },
    // PUT /admin/services/requests/{id}/status
    updateRequestStatus: async (id, status) => {
        const response = await api.put(`/admin/services/requests/${id}/status`, { status });
        return response.data ?? { success: true };
    },
    // POST /services/requests  (user: create request)
    createRequest: async (formData) => {
        const response = await api.post('/services/requests', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    // GET /services/requests  (user: my requests)
    getMyRequests: async () => {
        const response = await api.get('/services/requests');
        return response.data;
    },
};

// ---------------------------------------------------------------------------
// Dashboard API  →  dedicated stats endpoints
// ---------------------------------------------------------------------------
export const dashboardAPI = {
    // GET /dashboard/users
    getUsersStats: async () => {
        const response = await api.get('/dashboard/users');
        return response.data;
    },
    // GET /dashboard/companies
    getCompaniesStats: async () => {
        const response = await api.get('/dashboard/companies');
        return response.data;
    },
    // GET /dashboard/services
    getServicesStats: async () => {
        const response = await api.get('/dashboard/services');
        return response.data;
    },
    // GET /dashboard/documents
    getDocumentsStats: async () => {
        const response = await api.get('/dashboard/documents');
        return response.data;
    },
    // GET /dashboard/requests
    getRequestsStats: async () => {
        const response = await api.get('/dashboard/requests');
        return response.data;
    },
};

// ---------------------------------------------------------------------------
// Documents API
// ---------------------------------------------------------------------------
export const documentsAPI = {
    // GET /documents/types
    getDocumentTypes: async () => {
        const response = await api.get('/documents/types');
        return response.data;
    },
    // POST /documents (form-data: DocumentType, DocumentName, File, IssueDate, ExpiryDate, ReferenceNumber, Notes)
    uploadDocument: async (formData) => {
        const response = await api.post('/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    // GET /documents
    getAllDocuments: async () => {
        const response = await api.get('/documents');
        return response.data;
    },
    // GET /documents/{id}
    getDocumentById: async (id) => {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    },
    // DELETE /documents/{id}
    deleteDocument: async (id) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data ?? { success: true };
    },
    // GET /documents/admin/all
    getAdminAllDocuments: async () => {
        const response = await api.get('/documents/admin/all');
        return response.data;
    },
    // GET /documents/admin/user/{userId}
    getUserDocuments: async (userId) => {
        const response = await api.get(`/documents/admin/user/${userId}`);
        return response.data;
    },
    // Group documents by user/company for the Companies page
    groupByCompany: (raw) => {
        const list = Array.isArray(raw) ? raw : (raw?.documents || raw?.data || raw?.items || []);
        const groups = new Map();
        for (const item of list) {
            const id = item.userId ?? item.appUserId ?? item.companyId ?? 'unknown';
            const name = item.userName ?? item.companyName ?? null;
            if (!groups.has(id)) {
                groups.set(id, { companyId: id, companyName: name, documents: [] });
            }
            const g = groups.get(id);
            if (!g.companyName && name) g.companyName = name;
            g.documents.push({
                id: item.id ?? null,
                name: item.documentName ?? item.name ?? item.documentType ?? '—',
                number: item.referenceNumber ?? item.number ?? '—',
                issueDate: (item.issueDate ?? '').toString().split('T')[0] || '—',
                expiryDate: (item.expiryDate ?? '').toString().split('T')[0] || '—',
                fileUrl: item.fileUrl ?? item.url ?? '#',
            });
        }
        return Array.from(groups.values());
    },
};

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

export function serverStatusToDisplay(s) {
    const raw = (s || '').toLowerCase().replace(/[\s_-]/g, '');
    const map = {
        pending: 'pending',
        inprogress: 'inProgress',
        waitingforpayment: 'waitingPayment',
        paid: 'paid',
        completed: 'completed',
        cancelled: 'cancelled',
        missingdocuments: 'missingDocuments',
    };
    return map[raw] || raw;
}

export function displayToServerStatus(display) {
    const raw = (display || '').toLowerCase().replace(/[\s_-]/g, '');
    const map = {
        pending: 'Pending',
        inprogress: 'InProgress',
        processing: 'InProgress',
        active: 'InProgress',
        waitingpayment: 'WaitingForPayment',
        waitingforpayment: 'WaitingForPayment',
        paid: 'Paid',
        completed: 'Completed',
        cancelled: 'Cancelled',
        rejected: 'Cancelled',
        missingdocuments: 'MissingDocuments',
    };
    return map[raw] || 'Pending';
}

export function normalizeStatus(s) {
    return (s || '').toLowerCase().replace(/[\s_-]/g, '');
}

export default api;
