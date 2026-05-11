import React, { useState, useEffect } from 'react';
import { useMemo } from 'react';
import { Users, CalendarCheck, AlertTriangle, TrendingUp, CheckCircle, XCircle, Clock, Server, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { useSocket } from '../../context/SocketContext';

const AdminDashboard = () => {
    // Socket & Data State
    const { socket } = useSocket();
    const [stats, setStats] = useState({
        totalResources: 0,
        activeBookings: 0,
        pendingApprovals: 0,
        maintenanceAlerts: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [bookings, setBookings] = useState([]); // For chart
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30); // 30 or 7 days

    const [showToast, setShowToast] = useState(false);
    const [newBooking, setNewBooking] = useState(null);

    // Fetch Initial Stats
    const fetchStats = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch stats and all bookings for the chart
            const [statsRes, bookingsRes] = await Promise.all([
                axios.get('/api/admin/stats', config),
                axios.get('/api/admin/bookings', config)
            ]);

            setStats(statsRes.data.stats);
            setRecentActivity(statsRes.data.recentActivity);
            setBookings(bookingsRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch admin stats", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Helper: Calculate trend based on timeRange
    const trendData = useMemo(() => {
        // Create an array of the last N days dates
        const days = [];
        for (let i = timeRange - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
        }

        // Map bookings to dates
        const counts = days.reduce((acc, date) => {
            acc[date] = 0;
            return acc;
        }, {});

        bookings.forEach(b => {
            const date = new Date(b.createdAt).toISOString().split('T')[0];
            if (counts[date] !== undefined) {
                counts[date]++;
            }
        });

        // Return array of counts
        return days.map(date => counts[date]);

    }, [bookings, timeRange]);

    const maxTrend = Math.max(...trendData, 1); // Avoid divide by zero

    // Socket Listener for New Bookings
    useEffect(() => {
        if (!socket) return;
        // ... (socket listener code unchanged) ...
        const handleNewBooking = (data) => {
            // ...
            setNewBooking({
                user: "New User Request",
                resource: `Resource: ${data.resourceName || data.resourceId}`,
                time: "Just now",
                id: data.bookingId
            });
            setShowToast(true);
            fetchStats();
            setTimeout(() => setShowToast(false), 5000);
        };
        socket.on('new_booking', handleNewBooking);
        return () => {
            socket.off('new_booking', handleNewBooking);
        };
    }, [socket]);

    return (
        <div className="space-y-[var(--density-space)] relative">
            {/* Socket Toast ... */}
            {showToast && newBooking && (
                <div className="fixed top-24 right-8 bg-paper border-l-4 border-primary shadow-2xl p-4 rounded-r-lg animate-bounce-in z-50 max-w-sm">
                    {/* ... toast content ... */}
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            New Booking Request
                        </div>
                        <button onClick={() => setShowToast(false)} className="text-secondary hover:text-ink">
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-ink font-bold mb-1">{newBooking.resource}</p>
                    <p className="text-xs text-secondary">Requested by <span className="font-bold">{newBooking.user}</span> • {newBooking.time}</p>
                    <div className="mt-3 flex gap-2">
                        <button className="flex-1 bg-primary text-paper py-1.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-ink transition-colors">Review</button>
                        <button onClick={() => setShowToast(false)} className="flex-1 bg-secondary/10 text-secondary py-1.5 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-secondary/20 transition-colors">Dismiss</button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-ink uppercase tracking-tight">System Overview</h2>
                <div className="h-[2px] w-12 bg-primary mt-2"></div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--density-space)]">
                <MetricCard label="Total Resources" value={stats.totalResources} icon={Server} color="text-indigo-500" border="border-indigo-500/30" />
                <MetricCard label="Active Bookings" value={stats.activeBookings} icon={CalendarCheck} color="text-emerald-500" border="border-emerald-500/30" />
                <MetricCard label="Pending Approvals" value={stats.pendingApprovals} icon={Clock} color="text-amber-500" border="border-amber-500/30" />
                <MetricCard label="Maintenance Alerts" value={stats.maintenanceAlerts} icon={AlertTriangle} color="text-red-500" border="border-red-500/30" />
            </div>

            {/* Usage Chart Section */}
            <div className="bg-paper border border-secondary/20 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Usage Trends
                        </h3>
                        <p className="text-2xl font-black text-ink mt-1">Bookings (Last {timeRange} Days)</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(Number(e.target.value))}
                            className="bg-secondary/5 border-none text-xs font-bold text-ink rounded px-3 py-1 outline-none cursor-pointer"
                        >
                            <option value={30}>Last 30 Days</option>
                            <option value={7}>Last 7 Days</option>
                        </select>
                    </div>
                </div>

                {/* CSS-only Responsive Bar Chart Visualization */}
                <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4 border-b border-l border-secondary/10 relative">
                    {/* Y-Axis Lines */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[10px] text-secondary/30 font-mono pl-8 pb-4">
                        <div className="w-full border-b border-dashed border-secondary/5 h-0 flex items-center"><span>{maxTrend}</span></div>
                        <div className="w-full border-b border-dashed border-secondary/5 h-0 flex items-center"><span>{Math.round(maxTrend * 0.75)}</span></div>
                        <div className="w-full border-b border-dashed border-secondary/5 h-0 flex items-center"><span>{Math.round(maxTrend * 0.5)}</span></div>
                        <div className="w-full border-b border-dashed border-secondary/5 h-0 flex items-center"><span>{Math.round(maxTrend * 0.25)}</span></div>
                        <div className="w-full h-0 flex items-center"><span>0</span></div>
                    </div>

                    {trendData.map((count, i) => (
                        <div key={i} className="flex-1 bg-primary/10 rounded-t-sm relative group h-full flex items-end hover:bg-primary/20 transition-colors">
                            <div
                                style={{ height: `${(count / maxTrend) * 100}%` }}
                                className="w-full bg-primary relative rounded-t-sm"
                            >
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] font-bold bg-ink text-paper px-1 rounded pointer-events-none transition-opacity">
                                    {count}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-bold text-secondary uppercase px-4">
                    <span>{timeRange} Days Ago</span>
                    <span>{Math.round(timeRange / 2)} Days Ago</span>
                    <span>Today</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--density-space)]">
                {/* Activity Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-secondary uppercase tracking-widest">Recent Activity</h3>
                        <button className="text-[10px] font-bold text-primary hover:underline">View All Log</button>
                    </div>

                    <div className="bg-paper border border-secondary/20 rounded-lg p-1 shadow-sm">
                        {recentActivity.length > 0 ? (
                            recentActivity.map(item => (
                                <ActivityItem
                                    key={item.id}
                                    user={item.user}
                                    action={item.action}
                                    target={item.target}
                                    time={new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    icon={item.status === 'Approved' ? CheckCircle : item.status === 'Rejected' ? XCircle : Clock}
                                    iconColor={item.status === 'Approved' ? 'text-emerald-500' : item.status === 'Rejected' ? 'text-red-500' : 'text-amber-500'}
                                />
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-secondary">No recent activity</div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / System Status */}
                <div className="space-y-6">
                    <div className="bg-paper border-2 border-dashed border-secondary/20 rounded-lg p-6">
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full py-3 bg-secondary/5 hover:bg-primary/10 hover:text-primary transition-colors border border-secondary/10 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Review Pending
                            </button>
                            <button className="w-full py-3 bg-secondary/5 hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors border border-secondary/10 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                <Users className="w-4 h-4" /> Manage Access
                            </button>
                        </div>
                    </div>

                    <div className="bg-ink text-paper rounded-lg p-6 shadow-lg">
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">System Status</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400 font-bold text-sm">Operational</span>
                        </div>
                        <div className="space-y-2 text-[10px] font-mono opacity-70">
                            <div className="flex justify-between">
                                <span>Server Load</span>
                                <span>24%</span>
                            </div>
                            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[24%]" />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span>Storage</span>
                                <span>65%</span>
                            </div>
                            <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full w-[65%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon: Icon, color, border }) => (
    <div className={`bg-paper p-6 rounded-lg border ${border} shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon className="w-16 h-16" />
        </div>
        <div className="relative z-10">
            <div className={`w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-3xl font-black text-ink mb-1">{value}</h3>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">{label}</p>
        </div>
    </div>
);

const ActivityItem = ({ user, action, target, time, icon: Icon, iconColor }) => (
    <div className="flex items-center gap-4 p-4 border-b border-secondary/5 last:border-0 hover:bg-secondary/5 transition-colors">
        <div className={`p-2 rounded-full bg-paper border border-secondary/10 ${iconColor}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-ink">
                <span className="font-bold">{user}</span> {action} <span className="font-bold">{target}</span>
            </p>
        </div>
        <span className="text-[10px] font-mono text-secondary whitespace-nowrap">{time}</span>
    </div>
);

export default AdminDashboard;
