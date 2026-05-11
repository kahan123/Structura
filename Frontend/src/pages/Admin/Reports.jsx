import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../api/axiosConfig';
import { BarChart, PieChart, Activity, Calendar, Download, FileText, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const Reports = () => {
    const [bookings, setBookings] = useState([]);
    const [resources, setResources] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [bookingsRes, resourcesRes, usersRes] = await Promise.all([
                    axios.get('/api/admin/bookings', config),
                    axios.get('/api/resources', config),
                    axios.get('/api/admin/users', config)
                ]);

                setBookings(bookingsRes.data);
                setResources(resourcesRes.data);
                setUsers(usersRes.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch report data", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 1. Calculate Aggregate Stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === "Completed" || b.status === "Approved").length;
    const rejectedBookings = bookings.filter(b => b.status === "Rejected").length;
    const pendingBookings = bookings.filter(b => b.status === "Pending").length;
    const approvalRate = totalBookings > 0 ? Math.round(((completedBookings) / totalBookings) * 100) : 0;

    // 2. Resource Utilization Logic
    const resourceStats = useMemo(() => {
        const stats = {};
        bookings.forEach(b => {
            // b.resource might be populated object or just ID depending on endpoint, admin/bookings usually populates
            const resName = b.resource?.name || "Unknown Resource";
            stats[resName] = (stats[resName] || 0) + 1;
        });
        return Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 5); // Top 5
    }, [bookings]);

    // 3. Monthly Trends (Dynamic based on booking creation date)
    const monthlyData = useMemo(() => {
        const months = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        bookings.forEach(b => {
            const date = new Date(b.createdAt);
            const month = monthNames[date.getMonth()];
            months[month] = (months[month] || 0) + 1;
        });

        // Ensure we have at least current month and previous ones if data exists, or just show active months
        // For simplicity, let's show all months that have data, sorted by calendar order if needed, 
        // or just the months present in data. 
        // Let's map to an array for the chart
        return Object.entries(months).map(([month, count]) => ({ month, count }));
    }, [bookings]);

    // Fill in empty months if needed or just use what we have. 
    // If empty, provide a default for UI stability
    const chartData = monthlyData.length > 0 ? monthlyData : [{ month: 'No Data', count: 0 }];
    const maxMonthly = Math.max(...chartData.map(d => d.count)) || 1;

    const containerRef = React.useRef(null);
    useGSAP(() => {
        if (!loading) {
            gsap.fromTo('.report-card',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
            gsap.fromTo('.blueprint-line',
                { scaleX: 0 },
                { scaleX: 1, duration: 0.8, delay: 0.3, ease: 'power2.out', transformOrigin: 'left' }
            );
        }
    }, [loading]);

    if (loading) {
        return <div className="p-8 text-center text-secondary">Loading reports...</div>;
    }

    return (
        <div ref={containerRef} className="space-y-[var(--density-space)] relative h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-ink uppercase tracking-tight">Reports & Analytics</h2>
                    <div className="h-[2px] w-12 bg-primary mt-2 blueprint-line scale-x-0"></div>
                </div>
                <button className="bg-white border border-secondary/20 text-secondary px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-secondary/5 transition-all flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="report-card opacity-0 bg-paper p-4 border border-secondary/20 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total Bookings</span>
                        <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-3xl font-black text-ink">{totalBookings}</p>
                    <div className="text-[10px] text-green-600 mt-1 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Real-time
                    </div>
                </div>

                <div className="bg-paper p-4 border border-secondary/20 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Approval Rate</span>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-black text-ink">{approvalRate}%</p>
                    <div className="w-full h-1 bg-secondary/10 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${approvalRate}%` }}></div>
                    </div>
                </div>

                <div className="bg-paper p-4 border border-secondary/20 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Rejections</span>
                        <XCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-3xl font-black text-ink text-red-500">{rejectedBookings}</p>
                    <span className="text-[10px] text-secondary">Due to conflicts</span>
                </div>

                <div className="bg-paper p-4 border border-secondary/20 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Users</span>
                        <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-ink">{users.length}</p>
                    <span className="text-[10px] text-secondary">Registered Accounts</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                {/* Visual Chart: Monthly Trends (CSS Bar Chart) */}
                <div className="report-card opacity-0 bg-paper border border-secondary/20 rounded-lg p-6 flex flex-col">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Booking Trends
                    </h3>

                    <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-2 border-b border-secondary/10 min-h-[200px] h-[200px]">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex flex-col justify-end items-center gap-2 group w-full h-full">
                                <div
                                    className="w-full max-w-[60px] bg-primary/20 border border-primary/50 text-ink rounded-t group-hover:bg-primary/40 transition-all relative"
                                    style={{ height: `${(d.count / maxMonthly) * 100}%`, minHeight: '4px' }}
                                >
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-ink opacity-0 group-hover:opacity-100 transition-opacity">
                                        {d.count}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-secondary uppercase">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Resources List */}
                <div className="report-card opacity-0 bg-paper border border-secondary/20 rounded-lg p-6">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart className="w-4 h-4" /> Most Used Resources
                    </h3>
                    <div className="space-y-4">
                        {resourceStats.length > 0 ? resourceStats.map(([name, count], idx) => (
                            <div key={name} className="flex items-center gap-3">
                                <span className="text-xs font-mono font-bold text-secondary/50 w-4">0{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-xs font-bold text-ink">{name}</span>
                                        <span className="text-[10px] font-bold text-secondary">{count} Bookings</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-secondary/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(count / bookings.length) * 100}%` }} // Relative to total
                                        />
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-xs text-secondary">No data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Logs Table */}
            <div className="report-card opacity-0 bg-paper border border-secondary/20 rounded-lg overflow-hidden">
                <div className="p-4 bg-secondary/5 border-b border-secondary/10">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Recent Activity Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-secondary/10">
                                <th className="p-4 text-[10px] font-bold text-secondary uppercase">ID</th>
                                <th className="p-4 text-[10px] font-bold text-secondary uppercase">Action</th>
                                <th className="p-4 text-[10px] font-bold text-secondary uppercase">Date</th>
                                <th className="p-4 text-[10px] font-bold text-secondary uppercase">User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.slice(0, 10).map(b => (
                                <tr key={b._id} className="border-b border-secondary/5 hover:bg-secondary/5">
                                    <td className="p-4 text-xs font-mono text-secondary">#{b._id.slice(-6)}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${b.status === 'Completed' || b.status === "Approved" ? 'bg-emerald-100 text-emerald-700' :
                                            b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            Booking {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-ink">{new Date(b.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-xs font-bold text-ink">{b.user?.name || b.user || "Unknown"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
