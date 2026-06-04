import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import EmployeePermissions from '../components/EmployeePermissions';
import { Building2, Users, Settings, UserCog } from 'lucide-react';

const EmployeePermissionsPage = () => {
    const { t, isRTL } = useApp();
    const { user } = useAuth();
    
    // Mock employee data - in a real app this would come from an API
    const [employees, setEmployees] = useState([
        {
            id: 1,
            name: 'أحمد محمد',
            email: 'ahmed@example.com',
            role: 'employee',
            permissions: ['view_transactions', 'manage_transactions']
        },
        {
            id: 2,
            name: 'سارة أحمد',
            email: 'sara@example.com',
            role: 'employee',
            permissions: ['view_companies', 'view_transactions']
        },
        {
            id: 3,
            name: 'محمد علي',
            email: 'mohamed@example.com',
            role: 'employee',
            permissions: ['view_reports', 'view_settings']
        },
        {
            id: 4,
            name: 'فاطمة خالد',
            email: 'fatima@example.com',
            role: 'employee',
            permissions: ['view_users', 'manage_users']
        },
        {
            id: 5,
            name: 'علي حسن',
            email: 'ali@example.com',
            role: 'employee',
            permissions: ['view_employees', 'view_transactions']
        },
        {
            id: 6,
            name: 'نورة سعد',
            email: 'noura@example.com',
            role: 'employee',
            permissions: ['view_services', 'view_transactions']
        },
        {
            id: 7,
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
            permissions: ['view_all', 'manage_all']
        }
    ]);

    const updateEmployeePermissions = (employeeId, newPermissions) => {
        setEmployees(prev => 
            prev.map(emp => 
                emp.id === employeeId 
                    ? { ...emp, permissions: newPermissions }
                    : emp
            )
        );
    };

    // Filter out admin users if current user is not admin
    const filteredEmployees = user?.role === 'admin' 
        ? employees.filter(emp => emp.role !== 'admin')
        : employees.filter(emp => emp.id === user?.id);

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-dark-800 dark:text-white mb-2">
                        {t('accessDenied')}
                    </h2>
                    <p className="text-dark-600 dark:text-dark-400 mb-4">
                        {t('insufficientPermissions')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-800 dark:text-white">
                        {t('employeePermissions')}
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mt-1 text-sm">
                        {t('manageEmployeePermissions')}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="card p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-bold text-dark-800 dark:text-white">
                                {employees.filter(e => e.role === 'employee').length}
                            </p>
                            <p className="text-xs text-dark-500 dark:text-dark-400">
                                {t('totalEmployees')}
                            </p>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                            <UserCog className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                <div className="card p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-bold text-dark-800 dark:text-white">
                                {employees.filter(e => e.permissions.includes('view_transactions')).length}
                            </p>
                            <p className="text-xs text-dark-500 dark:text-dark-400">
                                {t('canViewTransactions')}
                            </p>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                <div className="card p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-bold text-dark-800 dark:text-white">
                                {employees.filter(e => e.permissions.includes('manage_transactions')).length}
                            </p>
                            <p className="text-xs text-dark-500 dark:text-dark-400">
                                {t('canManageTransactions')}
                            </p>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                            <Settings className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>

                <div className="card p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xl font-bold text-dark-800 dark:text-white">
                                {employees.filter(e => e.permissions.includes('view_companies')).length}
                            </p>
                            <p className="text-xs text-dark-500 dark:text-dark-400">
                                {t('canViewCompanies')}
                            </p>
                        </div>
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                            <Users className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Permissions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredEmployees.map(employee => (
                    <EmployeePermissions
                        key={employee.id}
                        employee={employee}
                        onUpdatePermissions={updateEmployeePermissions}
                    />
                ))}
            </div>
        </div>
    );
};

export default EmployeePermissionsPage;