import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Ticket } from 'lucide-react';
import axios from '../../api/axiosConfig';
import { useSocket } from '../../context/SocketContext';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        active: 0,
        pending: 0,
        completed: 0
    });
    const [nextBooking, setNextBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const containerRef = React.useRef(null);

    useGSAP(() => {
        if (!loading && containerRef.current) {
            gsap.fromTo('.dashboard-item',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
            );
            gsap.fromTo('.blueprint-line',
                { scaleX: 0 },
                { scaleX: 1, duration: 0.8, delay: 0.4, ease: 'power2.out', transformOrigin: 'left' }
            );
        }
    }, [loading]);

    const fetchDashboardData = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }

        try {
            const { data } = await axios.get(`/api/bookings/mybookings/${userInfo._id}`);

            const now = new Date();
            let activeCount = 0;
            let pendingCount = 0;
            let completedCount = 0;
            let upcoming = [];

            data.forEach(b => {
                const endDate = new Date(b.endTime);
                const startDate = new Date(b.startTime);
                const isPast = now > endDate;

                if (b.status === 'Pending') {
                    pendingCount++;
                } else if (b.status === 'Approved') {
                    if (isPast) {
                        completedCount++;
                    } else {
                        activeCount++;
                        upcoming.push({ ...b, startDate, endDate });
                    }
                } else if (b.status === 'Rejected' || b.status === 'Cancelled') {
                    completedCount++;
                }
            });

            setStats({
                active: activeCount,
                pending: pendingCount,
                completed: completedCount
            });

            // Find next booking
            if (upcoming.length > 0) {
                // Sort by start date ascending
                upcoming.sort((a, b) => a.startDate - b.startDate);
                setNextBooking(upcoming[0]);
            } else {
                setNextBooking(null);
            }

            setLoading(false);

        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [navigate]);

    // Socket Listener to refresh data
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = (data) => {
            console.log("[Dashboard] Real-time update received, refreshing data...", data);
            fetchDashboardData();
        };

        socket.on('booking_status_update', handleUpdate);

        return () => {
            socket.off('booking_status_update', handleUpdate);
        };
    }, [socket]);

    if (loading) return <DashboardSkeleton />;

    return (
        <div ref={containerRef} className="space-y-[var(--density-space)]">
            {/* Welcome Banner */}
            <header className="relative mb-12 dashboard-item opacity-0">
                <h2 className="text-3xl font-black text-ink uppercase tracking-tight">Dashboard Overview</h2>

                {/* Decorative Line */}
                <div className="h-[2px] w-24 bg-primary mt-4 blueprint-line scale-x-0"></div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--density-space)]">
                <Link to="/bookings?filter=Approved" className="dashboard-item opacity-0">
                    <StatCard
                        label="Active Bookings"
                        value={stats.active.toString().padStart(2, '0')}
                        icon={Ticket}
                        color="text-primary"
                        borderColor="border-primary/30"
                    />
                </Link>
                <Link to="/bookings?filter=Pending" className="dashboard-item opacity-0">
                    <StatCard
                        label="Pending Approval"
                        value={stats.pending.toString().padStart(2, '0')}
                        icon={Clock}
                        color="text-amber-600"
                        borderColor="border-amber-600/30"
                    />
                </Link>
                <Link to="/bookings?filter=History" className="dashboard-item opacity-0">
                    <StatCard
                        label="Completed"
                        value={stats.completed.toString().padStart(2, '0')}
                        icon={CheckCircle2}
                        color="text-emerald-700"
                        borderColor="border-emerald-700/30"
                    />
                </Link>
            </div>

            {/* "Blueprint" Section for Upcoming */}
            <div className="mt-10 dashboard-item opacity-0">
                <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-secondary blueprint-line scale-x-0"></span>
                    Next Scheduled Protocol
                </h3>

                {nextBooking ? (
                    <div className="relative p-6 border-2 border-dashed border-secondary/20 bg-paper/40 rounded-sm">
                        {/* "Tape" visual decoration */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#f0e6d2] shadow-sm rotate-1 opacity-80 z-10"></div>

                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-ink">{nextBooking.resource?.name || 'Unknown Resource'}</h4>
                                <p className="text-xs text-secondary font-mono mt-1">ID: #{nextBooking._id.slice(-5).toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-ink">
                                    {nextBooking.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-xs text-secondary uppercase">
                                    {nextBooking.startDate.toDateString() === new Date().toDateString() ? 'Today' : nextBooking.startDate.toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-secondary/10 flex gap-4 text-xs font-mono text-secondary">
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                                Duration: {Math.ceil((new Date(nextBooking.endTime) - new Date(nextBooking.startTime)) / (1000 * 60 * 60))}h
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                                {nextBooking.resource?.building || 'Unspecified Location'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 border-2 border-dashed border-secondary/10 bg-paper/20 rounded-sm text-center">
                        <p className="text-secondary font-mono text-sm">No upcoming protocols scheduled.</p>
                        <Link to="/catalog" className="text-primary font-bold text-xs uppercase mt-2 inline-block hover:underline">
                            + Initiate New Protocol
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, borderColor }) => {
    return (
        <div className={`relative p-6 bg-paper border ${borderColor} shadow-sm group hover:-translate-y-1 transition-transform duration-300`}>
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current opacity-50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current opacity-50" />

            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 bg-paper/50 rounded-md ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-4xl font-black text-ink opacity-80">{value}</span>
            </div>

            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">{label}</h3>
        </div>
    );
}

const DashboardSkeleton = () => {
    return (
        <div className="space-y-[var(--density-space)] animate-pulse">
            <header className="relative mb-12">
                <div className="h-8 w-64 bg-secondary/20 rounded-sm"></div>
                <div className="h-[2px] w-24 bg-primary/30 mt-4"></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--density-space)]">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-6 border border-secondary/10 bg-paper/50 shadow-sm relative h-36">
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-secondary/20" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-secondary/20" />

                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-secondary/20 rounded-md"></div>
                            <div className="w-16 h-10 bg-secondary/20 rounded-md"></div>
                        </div>
                        <div className="w-24 h-4 bg-secondary/20 rounded-sm mt-8"></div>
                    </div>
                ))}
            </div>

            <div className="mt-10">
                <div className="h-4 w-48 bg-secondary/20 rounded-sm mb-4"></div>
                <div className="h-32 border-2 border-dashed border-secondary/20 bg-paper/40 rounded-sm"></div>
            </div>
        </div>
    );
};

export default Dashboard;
