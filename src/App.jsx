import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import { authAPI } from './services/api';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Companies = lazy(() => import('./pages/Companies'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Services = lazy(() => import('./pages/Services'));
const Employees = lazy(() => import('./pages/Employees'));
const Users = lazy(() => import('./pages/Users'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const EmployeePermissionsPage = lazy(() => import('./pages/EmployeePermissions'));
const DevHub = lazy(() => import('./pages/DevHub'));
const MyTasks = lazy(() => import('./pages/MyTasks'));

const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
            <div className="spinner w-10 h-10"></div>
            <p className="text-sm text-dark-500 dark:text-dark-400">Loading...</p>
        </div>
    </div>
);

function App() {
    // One-time health check on app load (dev only) to confirm the API is reachable
    // through the configured baseURL. If the proxy is broken, this surfaces a clear
    // log line that helps diagnose 403/CORS/network issues.
    useEffect(() => {
        if (!import.meta.env.DEV) return;
        (async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('[health] baseURL =', '/api', '| token in localStorage =', !!token);
                // Use a lightweight call; if not logged in, just confirm proxy is reachable
                if (token) {
                    await authAPI.getStatus();
                    console.log('[health] API reachable through proxy ✓');
                }
            } catch (err) {
                const status = err?.response?.status;
                console.warn(
                    '[health] API health check failed:',
                    status ? `HTTP ${status}` : err?.message,
                    '| baseURL:', '/api',
                    '| isHttpsPage:', typeof window !== 'undefined' && window.location.protocol === 'https:',
                    '| currentOrigin:', typeof window !== 'undefined' ? window.location.origin : 'n/a'
                );
            }
        })();
    }, []);

    return (
        <AuthProvider>
            <AppProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route index element={
                                <Suspense fallback={<PageLoader />}>
                                    <Dashboard />
                                </Suspense>
                            } />
                            <Route path="my-tasks" element={
                                <Suspense fallback={<PageLoader />}>
                                    <MyTasks />
                                </Suspense>
                            } />
                            <Route path="companies" element={
                                <Suspense fallback={<PageLoader />}>
                                    <Companies />
                                </Suspense>
                            } />
                            <Route path="transactions" element={
                                <Suspense fallback={<PageLoader />}>
                                    <Transactions />
                                </Suspense>
                            } />
                            <Route path="services" element={
                                <Suspense fallback={<PageLoader />}>
                                    <Services />
                                </Suspense>
                            } />
                            <Route path="employees" element={
                                <Suspense fallback={<PageLoader />}>
                                    <Employees />
                                </Suspense>
                            } />
                            <Route path="users" element={
                                <Suspense fallback={<PageLoader />}>
                                    <Users />
                                </Suspense>
                            } />
                            <Route path="reports" element={
                                <Suspense fallback={<PageLoader />}>
                                    <Reports />
                                </Suspense>
                            } />
                            <Route path="settings" element={
                                <Suspense fallback={<PageLoader />}>
                                    <Settings />
                                </Suspense>
                            } />
                            <Route path="dev-hub" element={
                                <Suspense fallback={<PageLoader />}>
                                    <DevHub />
                                </Suspense>
                            } />
                            <Route path="employee-permissions" element={
                                <ProtectedRoute requiredPermissions={['manage_employees']}>
                                    <Suspense fallback={<PageLoader />}>
                                        <EmployeePermissionsPage />
                                    </Suspense>
                                </ProtectedRoute>
                            } />
                        </Route>
                    </Routes>
                </Router>
            </AppProvider>
        </AuthProvider>
    );
}

export default App;
