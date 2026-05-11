import React from 'react';
import { maintenance, resources } from '../../data/mockData';
import { CheckCircle, Clock, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const StaffDashboard = () => {
    // Stats Calculation
    const myTasks = maintenance; // In real app, filter by user
    const pendingCount = myTasks.filter(t => t.status === 'Pending' || t.status === 'Scheduled').length;
    const inProgressCount = myTasks.filter(t => t.status === 'In Progress').length;
    const completedCount = myTasks.filter(t => t.status === 'Completed').length;

    const todaysTasks = myTasks.filter(t => t.scheduled_date === "2024-03-20"); // Mock "Today"

    const containerRef = React.useRef(null);
    useGSAP(() => {
        gsap.fromTo('.dash-stat',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
        gsap.fromTo('.dash-panel',
            { opacity: 0, scale: 0.98 },
            { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'out', delay: 0.2 }
        );
    }, []);

    return (
        <div ref={containerRef} className="space-y-[var(--density-space)]">
            {/* Welcome Banner */}
            <div className="dash-stat opacity-0 bg-ink text-paper rounded-2xl p-8 relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Welcome Back, Bob</h1>
                    <p className="text-paper/80 max-w-lg">You have <span className="text-amber-400 font-bold">{pendingCount} pending tasks</span> and <span className="text-blue-400 font-bold">{inProgressCount} in progress</span>.</p>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500 rounded-full blur-3xl opacity-20" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="dash-stat opacity-0 bg-paper border border-secondary/20 p-6 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-ink">{pendingCount}</p>
                        <p className="text-xs font-bold uppercase text-secondary">Pending Tickets</p>
                    </div>
                </div>
                <div className="dash-stat opacity-0 bg-paper border border-secondary/20 p-6 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-ink">{inProgressCount}</p>
                        <p className="text-xs font-bold uppercase text-secondary">In Progress</p>
                    </div>
                </div>
                <div className="dash-stat opacity-0 bg-paper border border-secondary/20 p-6 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-ink">{completedCount}</p>
                        <p className="text-xs font-bold uppercase text-secondary">Completed Total</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Schedule */}
                <div className="dash-panel opacity-0 bg-paper border border-secondary/20 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Today's Schedule
                        </h3>
                        <span className="text-[10px] font-mono text-secondary">{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-4">
                        {todaysTasks.length > 0 ? todaysTasks.map(task => {
                            const resourceName = resources.find(r => r.resource_id === task.resource_id)?.resource_name;
                            return (
                                <div key={task.maintenance_id} className="flex items-center gap-4 p-3 bg-secondary/5 rounded border border-secondary/10">
                                    <div className="w-2 h-10 bg-blue-500 rounded-full" />
                                    <div className="flex-1">
                                        <p className="font-bold text-ink text-sm">{resourceName}</p>
                                        <p className="text-[10px] text-secondary uppercase">{task.maintenance_type}</p>
                                    </div>
                                    <span className="text-xs font-bold text-ink bg-white px-2 py-1 rounded shadow-sm">10:00 AM</span>
                                </div>
                            )
                        }) : (
                            <p className="text-sm text-secondary italic">No specific tasks scheduled for today.</p>
                        )}
                    </div>

                    <Link to="/maintenance/tasks" className="mt-6 block text-center text-xs font-bold uppercase text-primary hover:underline">
                        View All Tasks
                    </Link>
                </div>

                {/* Quick Actions / Notices */}
                <div className="dash-panel opacity-0 bg-paper border border-secondary/20 rounded-lg p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Staff Notice Board</h3>
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded text-amber-800 text-xs mb-4">
                            <strong>Note:</strong> Annual fire safety inspection is scheduled for next week. Please review protocols.
                        </div>
                    </div>
                    <Link to="/maintenance/messages" className="flex items-center justify-between p-4 bg-ink text-paper rounded-lg group hover:opacity-90 transition-opacity">
                        <span className="font-bold text-sm">Contact Admin</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
