import React, { useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Wrench, LogOut, Settings } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const MaintenanceLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    // Role Guard: Require Maintenance clearance
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
        } else {
            const parsed = JSON.parse(userInfo);
            const roleStr = (parsed.role || '').toLowerCase();
            if (roleStr !== 'maintenance') {
                if (roleStr === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }
        }
    }, [navigate]);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/maintenance" },
        { icon: Wrench, label: "My Tasks", path: "/maintenance/tasks" }, // Could point to same dashboard if small
        { icon: MessageSquare, label: "Messages", path: "/maintenance/messages" },
        { icon: Settings, label: "Settings", path: "/maintenance/settings" },
        { icon: Settings, label: "Settings", path: "/maintenance/settings" },
    ];

    const containerRef = useRef(null);
    useGSAP(() => {
        gsap.from('.maintenance-sidebar-item',
            { opacity: 0, x: -20, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: "all" }
        );
        gsap.from('.maintenance-mobile-nav',
            { opacity: 0, y: 20, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.2, clearProps: "all" }
        );
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="flex h-screen bg-paper font-mono overflow-hidden selection:bg-secondary/20">
            {/* Sidebar */}
            <aside className="w-64 bg-darker border-r-2 border-dashed border-secondary/30 hidden md:flex flex-col relative z-20 shadow-[5px_0_15px_rgba(0,0,0,0.02)]">
                <div className="p-8 pb-4 maintenance-sidebar-item">
                    <h1 className="text-xl font-bold uppercase tracking-widest text-ink flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        Structura
                        <span className="text-[10px] bg-secondary/10 px-1.5 py-0.5 rounded text-secondary font-bold ml-auto opacity-70">STAFF</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 mt-6 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/maintenance' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`maintenance-sidebar-item group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden
                                    ${isActive ? 'text-primary font-bold bg-secondary/10 shadow-sm' : 'text-secondary hover:text-ink hover:bg-secondary/5'}
                                `}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                <span className={`text-xs uppercase tracking-widest ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t-2 border-dashed border-secondary/20 bg-paper maintenance-sidebar-item">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-paper flex items-center justify-center font-bold text-xs">
                            BB
                        </div>
                        <div>
                            <p className="text-xs font-bold text-ink">Bob Builder</p>
                            <p className="text-[10px] text-secondary">Maintenance Staff</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-secondary hover:text-red-500 py-2 border border-secondary/20 hover:bg-secondary/10 transition-all rounded">
                        <LogOut className="w-3 h-3" /> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-paper border-t-2 border-dashed border-secondary/30 z-50 flex justify-around items-center p-2 pb-safe shadow-[-5px_0_15px_rgba(0,0,0,0.05)]">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`maintenance-mobile-nav flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${isActive ? 'text-primary' : 'text-secondary'}`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                        </Link>
                    );
                })}
            </nav>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto pb-20 md:pb-0">
                <div className="fixed inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(#78716c 1px, transparent 1px)', backgroundSize: '24px 24px', zIndex: 0 }} />
                <div className="relative z-10 p-[var(--density-space)] max-w-7xl mx-auto">
                    {/* Mobile Header */}
                    <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-dashed border-secondary/20">
                        <h1 className="text-lg font-bold uppercase tracking-widest text-ink flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div> Structura Staff
                        </h1>
                    </div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MaintenanceLayout;
