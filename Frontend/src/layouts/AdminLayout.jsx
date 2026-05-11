import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, FileText, Bell, LogOut, CheckCircle, AlertCircle, X, Hammer, Shield, Settings, MessageSquare } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    // Role Guard: Require Admin Clearance
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
        } else {
            const parsed = JSON.parse(userInfo);
            const roleStr = (parsed.role || '').toLowerCase();
            if (roleStr !== 'admin') {
                if (roleStr === 'maintenance') {
                    navigate('/maintenance');
                } else {
                    navigate('/dashboard');
                }
            }
        }
    }, [navigate]);

    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);

    const [showToast, setShowToast] = useState(false);
    const [latestNotif, setLatestNotif] = useState(null);

    useEffect(() => {
        if (!socket) return;

        const handleNewBooking = (data) => {
            console.log("AdminLayout: Received new_booking event", data);
            const newNotification = {
                id: Date.now(),
                type: 'warning',
                title: 'New Booking Request',
                message: `${data.message} for ${data.resourceName || 'Resource'}`,
                time: 'Just now',
                read: false,
                data: data
            };

            setNotifications(prev => [newNotification, ...prev]);
            setLatestNotif(newNotification);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        };

        const handleMessage = (msg) => {
            if (location.pathname === '/admin/messages') return;

            const newNotification = {
                id: Date.now(),
                type: 'message',
                title: 'New Message',
                message: msg.text,
                time: 'Just now',
                read: false
            };

            setNotifications(prev => [newNotification, ...prev]);
            setLatestNotif(newNotification);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        };

        socket.on('new_booking', handleNewBooking);
        socket.on('receive_message', handleMessage);

        return () => {
            socket.off('new_booking', handleNewBooking);
            socket.off('receive_message', handleMessage);
        };
    }, [socket, location.pathname]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
    };

    const clearNotification = (id, e) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: "Overview", path: "/admin" },
        { icon: CalendarCheck, label: "Bookings", path: "/admin/bookings" },
        { icon: Hammer, label: "Resources", path: "/admin/resources" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
        { icon: FileText, label: "Reports", path: "/admin/reports" },
        { icon: Settings, label: "Settings", path: "/admin/settings" },
    ];

    const containerRef = useRef(null);
    useGSAP(() => {
        gsap.from('.admin-sidebar-item',
            { opacity: 0, x: -20, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: "all" }
        );
        gsap.from('.admin-mobile-nav',
            { opacity: 0, y: 20, duration: 0.5, stagger: 0.05, ease: 'power2.out', delay: 0.2, clearProps: "all" }
        );
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="flex h-screen bg-paper font-mono overflow-hidden selection:bg-secondary/20">
            {/* Live Notification Toast */}
            {showToast && latestNotif && (
                <div className="fixed top-24 right-8 bg-paper border-l-4 border-primary shadow-2xl p-4 rounded-r-lg animate-bounce-in z-[100] max-w-sm">
                    <div className="flex justify-between items-start mb-1 gap-4">
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            {latestNotif.type === 'message' ? 'New Message' : 'Admin Alert'}
                        </div>
                        <button onClick={() => setShowToast(false)} className="text-secondary hover:text-ink">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-ink font-bold mb-1">{latestNotif.title}</p>
                    <p className="text-xs text-secondary leading-tight">{latestNotif.message}</p>
                    <div className="mt-3 flex gap-2">
                        <Link
                            to={latestNotif.type === 'message' ? "/admin/messages" : "/admin/bookings"}
                            onClick={() => setShowToast(false)}
                            className="flex-1 bg-primary text-paper py-1.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-ink transition-colors text-center"
                        >
                            {latestNotif.type === 'message' ? "Reply" : "View"}
                        </Link>
                        <button
                            onClick={() => setShowToast(false)}
                            className="flex-1 bg-secondary/10 text-secondary py-1.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-secondary/20 transition-colors"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar - Desktop Only */}
            <aside className="w-64 bg-darker border-r-2 border-dashed border-secondary/30 hidden md:flex flex-col relative z-20 shadow-[5px_0_15px_rgba(0,0,0,0.02)]">
                {/* Header Branding */}
                <div className="p-8 pb-4 admin-sidebar-item">
                    <h1 className="text-xl font-bold uppercase tracking-widest text-ink flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Structura
                        <span className="text-[10px] bg-secondary/10 px-1.5 py-0.5 rounded text-secondary font-bold ml-auto opacity-70">ADMIN</span>
                    </h1>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 mt-6 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-sidebar-item group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden
                                    ${isActive ? 'text-primary font-bold bg-secondary/10 shadow-sm' : 'text-secondary hover:text-ink hover:bg-secondary/5'}
                                `}
                            >
                                {/* Active Indicator "Mark" */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}

                                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                <span className={`text-xs uppercase tracking-widest ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin Profile & Logout */}
                <div className="p-4 border-t-2 border-dashed border-secondary/20 bg-paper admin-sidebar-item">
                    <div className="flex items-center gap-3 mb-4 px-2 relative" ref={notificationRef}>
                        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-paper font-bold text-xs ring-2 ring-paper/50">
                            <Shield className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-ink truncate">Admin User</p>
                            <p className="text-[10px] text-secondary truncate">Super Admin</p>
                        </div>

                        {/* Notification Bell */}
                        <button
                            onClick={handleBellClick}
                            className={`text-secondary hover:text-accent transition-colors relative p-1 rounded-full hover:bg-secondary/10 ${showNotifications ? 'bg-paper text-primary' : ''}`}
                        >
                            <Bell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-paper animate-pulse" />
                            )}
                        </button>

                        {/* Dropdown Panel */}
                        {showNotifications && (
                            <div className="absolute bottom-full left-0 mb-2 w-72 bg-paper rounded-lg shadow-xl border-2 border-secondary/10 overflow-hidden animate-fade-in-up z-50 origin-bottom-left">
                                <div className="p-3 border-b border-secondary/10 bg-secondary/5 flex justify-between items-center">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Admin Alerts</h3>
                                    {unreadCount > 0 && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{unreadCount} New</span>}
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.map(n => (
                                        <div key={n.id} className={`p-3 border-b border-secondary/5 hover:bg-secondary/5 relative group transition-colors ${n.read ? 'opacity-60' : 'bg-primary/5'}`}>
                                            <div className="flex gap-3">
                                                <div className="mt-1">
                                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-ink mb-1">{n.title}</p>
                                                    <p className="text-[10px] text-secondary leading-tight mb-1">{n.message}</p>
                                                    <p className="text-[9px] text-secondary/40 font-mono">{n.time}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => clearNotification(n.id, e)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary/10 rounded transition-all text-secondary"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-secondary hover:text-red-500 py-2 border border-secondary/20 hover:bg-secondary/10 transition-all rounded">
                        <LogOut className="w-3 h-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation - Scrollable */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-paper border-t-2 border-dashed border-secondary/30 z-50 flex items-center p-2 pb-safe shadow-[-5px_0_15px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar gap-1 w-full justify-between">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-mobile-nav flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 min-w-[50px] flex-1 flex-shrink-0
                                ${isActive ? 'text-primary' : 'text-secondary'}
                            `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            <span className="text-[8px] uppercase tracking-widest font-bold whitespace-nowrap">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-y-auto pb-20 md:pb-0">
                {/* Background Grid - Darker/Denser for Admin feel? Keeping same for consistency for now */}
                <div className="fixed inset-0 pointer-events-none opacity-30"
                    style={{
                        backgroundImage: 'radial-gradient(#78716c 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                        zIndex: 0
                    }}
                />

                {/* Dynamic Content */}
                <div className="relative z-10 p-[var(--density-space)] max-w-7xl mx-auto">
                    {/* Mobile Header Branding */}
                    <div className="md:hidden flex items-center justify-between mb-6 pb-4 border-b border-dashed border-secondary/20">
                        <h1 className="text-lg font-bold uppercase tracking-widest text-ink flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            Structura Admin
                        </h1>
                        <button onClick={handleBellClick} className="relative">
                            <Bell className="w-5 h-5 text-secondary" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#paper]" />
                            )}
                        </button>
                    </div>

                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
