import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { useApp } from '../context/AppContext';

const Layout = () => {
    const { sidebarOpen, isRTL } = useApp();

    return (
        <div className="min-h-screen bg-dark-50 dark:bg-dark-950 transition-colors duration-300">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className={`
          flex-1 min-h-screen transition-all duration-300 overflow-hidden
          ${isRTL ? (sidebarOpen ? 'lg:mr-72' : 'lg:mr-16') : (sidebarOpen ? 'lg:ml-72' : 'lg:ml-16')}
        `}>
                    {/* Header */}
                    <Header />

                    {/* Page Content */}
                    <main className="p-4 lg:p-6 pb-24 lg:pb-6 animate-fade-in text-start overflow-x-auto">
                        <Outlet />
                    </main>

                    {/* Mobile Bottom Nav */}
                    <MobileNav />
                </div>
            </div>
        </div>
    );
};

export default Layout;
