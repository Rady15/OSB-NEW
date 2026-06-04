import { useState } from 'react';
import { useApp } from '../context/AppContext';

const EmployeePermissions = ({ employee, onUpdatePermissions }) => {
    const { t, isRTL } = useApp();
    
    const allPermissions = [
        { id: 'view_dashboard', label: 'viewDashboard', description: 'Can view dashboard' },
        { id: 'view_companies', label: 'viewCompanies', description: 'Can view companies' },
        { id: 'view_transactions', label: 'viewTransactions', description: 'Can view transactions' },
        { id: 'view_services', label: 'viewServices', description: 'Can view services' },
        { id: 'view_users', label: 'viewUsers', description: 'Can view users' },
        { id: 'view_employees', label: 'viewEmployees', description: 'Can view employees' },
        { id: 'view_reports', label: 'viewReports', description: 'Can view reports' },
        { id: 'view_settings', label: 'viewSettings', description: 'Can view settings' },
        { id: 'manage_transactions', label: 'manageTransactions', description: 'Can manage transactions' },
        { id: 'manage_companies', label: 'manageCompanies', description: 'Can manage companies' },
        { id: 'manage_users', label: 'manageUsers', description: 'Can manage users' },
        { id: 'manage_employees', label: 'manageEmployees', description: 'Can manage employees' },
    ];

    const [permissions, setPermissions] = useState(employee.permissions || []);

    const togglePermission = (permissionId) => {
        let newPermissions;
        if (permissions.includes(permissionId)) {
            newPermissions = permissions.filter(p => p !== permissionId);
        } else {
            newPermissions = [...permissions, permissionId];
        }
        
        setPermissions(newPermissions);
        onUpdatePermissions(employee.id, newPermissions);
    };

    const hasPermission = (permissionId) => permissions.includes(permissionId);

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-dark-800 dark:text-white">{employee.name}</h3>
                    <p className="text-sm text-dark-500 dark:text-dark-400">{employee.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    employee.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                    {t(employee.role)}
                </span>
            </div>

            <div className="space-y-3">
                <h4 className="font-medium text-dark-700 dark:text-dark-300">
                    {isRTL ? 'صلاحيات الوصول' : 'Access Permissions'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allPermissions.map((perm) => (
                        <label 
                            key={perm.id} 
                            className="flex items-start gap-3 p-3 rounded-lg border border-dark-200 dark:border-dark-700 hover:bg-dark-50 dark:hover:bg-dark-700/50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={hasPermission(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="mt-1 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                                <div className="font-medium text-dark-700 dark:text-dark-200">
                                    {t(perm.label)}
                                </div>
                                <div className="text-xs text-dark-500 dark:text-dark-400">
                                    {t(perm.description)}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmployeePermissions;