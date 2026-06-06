import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Interceptor to add Bearer Token from localStorage automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Dev-mode diagnostics: log the outgoing request
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
            // Dev-mode diagnostics: log the failed response with context
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
            // 401 means the token is invalid/expired/rejected — force re-login.
            // 403 is a permission error (token valid, but role lacks access) — let
            // the calling code handle it; do NOT log the user out for that.
            if (status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                try {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } catch { /* ignore */ }
                // Use replace to avoid back-button loops
                window.location.replace('/login');
            }
            return Promise.reject(error);
        }
        // No response -> network / CORS / timeout
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

export const authAPI = {
    // POST /Account/login
    login: async (email, password) => {
        const response = await api.post('/Account/login', { email, password });
        // Backend returns the JWT as `accessToken` (with optional `refreshToken`).
        // Older mocks used `token` — accept both so we never silently drop it.
        const token = response.data?.accessToken || response.data?.token;
        if (token) {
            localStorage.setItem('token', token);
        }
        if (response.data?.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        return response.data;
    },
    // GET /Account/all
    getAllUsers: async () => {
        const response = await api.get('/Account/all');
        return response.data;
    },
    // GET /Account/AllStaff
    getAllStaff: async () => {
        const response = await api.get('/Account/AllStaff');
        return response.data;
    },
    // POST /Account/create-employee
    addStaff: async (staffData) => {
        // staffData: { email, userName, password, role: "Staff", phoneNumber }
        const response = await api.post('/Account/create-employee', staffData);
        return response.data ?? { success: true };
    },
    // PUT /Account/suspend/{userName}
    suspendUser: async (userName) => {
        const response = await api.put(`/Account/suspend/${userName}`);
        return response.data ?? { success: true };
    },
    // PUT /Account/unsuspend/{userName}
    unsuspendUser: async (userName) => {
        const response = await api.put(`/Account/unsuspend/${userName}`);
        return response.data ?? { success: true };
    },
    // GET /Account/status
    getStatus: async () => {
        const response = await api.get('/Account/status');
        return response.data;
    }
};

export const servicesAPI = {
    // Mock getDashboardStats for dashboard (replace with real endpoint when available)
    getDashboardStats: async () => {
        // Example mock data structure expected by Dashboard
        return {
            stats: [],
            monthlyData: [],
            pieData: []
        };
    },
    // GET recent transactions – uses /UserServices/all, returns last 5
    getRecentTransactions: async () => {
        try {
            const response = await api.get('/UserServices/all');
            const all = Array.isArray(response.data) ? response.data : [];
            // Map server fields to the shape Dashboard expects
            return all.slice(0, 5).map((item) => ({
                id: item.id || item.requestId || item.serviceId || '-',
                company: item.companyName || item.userName || item.clientName || '-',
                type: item.serviceType || item.type || item.serviceName || '-',
                status: item.status || 'pending',
                date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-EG') : '-',
            }));
        } catch {
            return [];
        }
    },
    // GET /UserServices/all (Get All Requests With details)
    getAllRequests: async (config = {}) => {
        const response = await api.get('/UserServices/all', config);
        return response.data;
    },
    // GET /UserServices/MyAllServices (Get All Request For Each User)
    getMyAllServices: async () => {
        const response = await api.get('/UserServices/MyAllServices');
        return response.data;
    },
    // GET /UserServices/my-requests (Get Staff Requests)
    getStaffRequests: async () => {
        const response = await api.get('/UserServices/my-requests');
        return response.data;
    },
    // GET /UserServices/AllZakat
    getAllZakat: async () => {
        const response = await api.get('/UserServices/AllZakat');
        return response.data;
    },
    // PUT /UserServices/set-price (Admin Set Cost)
    setCost: async (requestId, price) => {
        const response = await api.put('/UserServices/set-price', { requestId, price });
        return response.data ?? { success: true };
    },
    // POST /UserServices/assign-request (Assign request to employee)
    assignRequest: async (requestId, employeeUserId) => {
        const response = await api.post('/UserServices/assign-request', { RequestId: requestId, EmployeeUserId: employeeUserId });
        return response.data ?? { success: true };
    },
    // PUT /UserServices/update-status
    updateStatus: async (requestId, status) => {
        const response = await api.put('/UserServices/update-status', { requestId, status });
        return response.data ?? { success: true };
    },
    // POST /UserServices/add-description
    addDescription: async (requestId, description) => {
        const response = await api.post('/UserServices/add-description', { RequestId: requestId, description });
        return response.data ?? { success: true };
    },
    /**
     * Assign ALL requests of a given company (userId) to an employee.
     * Iterates over every request returned by /UserServices/all and calls
     * /UserServices/assign-request for those that match `companyUserId` and
     * are not already assigned to `employeeUserId`.
     * Returns a summary of successes / failures.
     */
    assignCompanyToEmployee: async (companyUserId, employeeUserId) => {
        const all = await api.get('/UserServices/all');
        const list = Array.isArray(all.data) ? all.data : (all.data?.requests || all.data?.services || []);
        const targets = list.filter(r => r.userId === companyUserId && r.assignedEmployeeUserId !== employeeUserId);
        if (targets.length === 0) {
            return { success: true, assigned: 0, failed: 0, total: 0 };
        }
        const results = await Promise.allSettled(
            targets.map(r => api.post('/UserServices/assign-request', { RequestId: r.requestId, EmployeeUserId: employeeUserId }))
        );
        const assigned = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - assigned;
        return { success: failed === 0, assigned, failed, total: results.length };
    }
};

export const documentsAPI = {
    // GET /CompanyDocuments/admin/all-companies
    // Returns a flat list of every company document on the platform.
    // Each item is expected to carry a companyId / companyUserId / userId
    // (and ideally a companyName) so it can be grouped per company.
    getAllCompaniesDocuments: async () => {
        const response = await api.get('/CompanyDocuments/admin/all-companies');
        return response.data;
    },

    // Group a flat list of documents by company id.
    // Accepts the response from getAllCompaniesDocuments() and returns
    // an array of { companyId, companyName, documents: [...] } groups.
    groupByCompany: (raw) => {
        const list = Array.isArray(raw)
            ? raw
            : (raw?.documents || raw?.data || raw?.items || raw?.companies || []);
        const groups = new Map();
        for (const item of list) {
            const id = item.companyId ?? item.companyUserId ?? item.userId ?? item.ownerId ?? 'unknown';
            const name = item.companyName ?? item.company ?? item.userName ?? null;
            if (!groups.has(id)) {
                groups.set(id, { companyId: id, companyName: name, documents: [] });
            }
            const g = groups.get(id);
            if (!g.companyName && name) g.companyName = name;
            g.documents.push({
                id: item.id ?? item.documentId ?? item.docId ?? null,
                name: item.name ?? item.documentName ?? item.docName ?? item.type ?? item.title ?? '—',
                number: item.number ?? item.documentNumber ?? item.docNumber ?? '—',
                issueDate: (item.issueDate ?? item.issuedAt ?? '').toString().split('T')[0] || '—',
                expiryDate: (item.expiryDate ?? item.expiresAt ?? '').toString().split('T')[0] || '—',
                fileUrl: item.fileUrl ?? item.url ?? item.path ?? '#'
            });
        }
        return Array.from(groups.values());
    }
};

// ---------------------------------------------------------------------------
// Status helpers — bridge between the server enum
// (Pending, InProgress, Completed, Cancelled, WaitingForPayment, Paid,
//  MissingDocuments) and the user-facing label keys used across pages.
// ---------------------------------------------------------------------------

/** Map enum value received from the server to a normalised display key. */
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

/** Map a display key back to the server enum string. */
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

/** Normalised lower-case version (no spaces / underscores / hyphens). */
export function normalizeStatus(s) {
    return (s || '').toLowerCase().replace(/[\s_-]/g, '');
}

export default api;

