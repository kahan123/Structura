import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axiosConfig';
import { Wrench, CheckCircle, Clock, AlertTriangle, Filter, Plus, Calendar, X, ShieldAlert, User, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const MaintenanceDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [resourcesList, setResourcesList] = useState([]);
    const [workersList, setWorkersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        resource: '',
        maintenanceType: 'Routine Check',
        scheduledDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '11:00',
        blocksBookings: true,
        notes: '',
        assignedTo: ''
    });

    const modalRef = useRef(null);
    const containerRef = useRef(null);

    // Fetch maintenance tasks, resources, and users (workers)
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [tasksRes, resourcesRes, usersRes] = await Promise.all([
                axios.get('/api/maintenance'),
                axios.get('/api/resources'),
                axios.get('/api/admin/users')
            ]);
            setTasks(tasksRes.data);
            setResourcesList(resourcesRes.data);
            // Filter users to only include those with 'Maintenance' role
            const maintenanceWorkers = usersRes.data.filter(u => u.role === 'Maintenance');
            setWorkersList(maintenanceWorkers);
            setError('');
        } catch (err) {
            console.error("Failed to load maintenance dashboard data:", err);
            setError('Failed to fetch dashboard data. Make sure you are authorized.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axios.patch(`/api/maintenance/${taskId}/status`, { status: newStatus });
            setSuccess(`Task status updated to ${newStatus} successfully!`);
            loadDashboardData();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            console.error("Error updating status:", err);
            setError('Failed to update task status.');
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const { resource, maintenanceType, scheduledDate, startTime, endTime, blocksBookings, notes, assignedTo } = newTicket;
            
            if (!resource) {
                setError('Please select a resource.');
                return;
            }

            // Create combined date strings
            const finalStartTime = new Date(`${scheduledDate}T${startTime}:00`);
            const finalEndTime = new Date(`${scheduledDate}T${endTime}:00`);

            if (finalStartTime >= finalEndTime) {
                setError('End time must be strictly after start time.');
                return;
            }

            const payload = {
                resource,
                maintenanceType,
                scheduledDate: new Date(scheduledDate),
                startTime: finalStartTime,
                endTime: finalEndTime,
                blocksBookings,
                notes,
                assignedTo: assignedTo || undefined
            };

            await axios.post('/api/maintenance', payload);
            setSuccess(`Maintenance scheduled successfully! Overlapping bookings have been cancelled.`);
            setIsModalOpen(false);
            // Reset ticket form
            setNewTicket({
                resource: '',
                maintenanceType: 'Routine Check',
                scheduledDate: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                endTime: '11:00',
                blocksBookings: true,
                notes: '',
                assignedTo: ''
            });
            loadDashboardData();
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error("Failed to schedule maintenance:", err);
            setError(err.response?.data?.message || 'Failed to create maintenance schedule.');
        }
    };

    const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-secondary/10 text-secondary border-secondary/20';
        }
    };

    useGSAP(() => {
        if (!loading) {
            gsap.fromTo('.blueprint-line',
                { scaleX: 0 },
                { scaleX: 1, duration: 0.8, ease: 'power2.out', transformOrigin: 'left' }
            );
            gsap.fromTo('.maintenance-card',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [filter, filteredTasks.length, loading]);

    useGSAP(() => {
        if (isModalOpen && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.95, y: 10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' }
            );
        }
    }, [isModalOpen]);

    return (
        <div ref={containerRef} className="space-y-[var(--density-space)] relative h-full flex flex-col pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-ink uppercase tracking-tight">Maintenance</h2>
                    <div className="h-[2px] w-12 bg-primary mt-2 blueprint-line scale-x-0"></div>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-paper px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-ink transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Schedule Servicing
                </button>
            </div>

            {/* Error/Success Feedbacks */}
            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold border border-red-200 rounded flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 text-green-700 text-xs font-bold border border-green-200 rounded flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {success}
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-paper border border-secondary/20 p-2 rounded-lg flex overflow-x-auto gap-2">
                {['All', 'Scheduled', 'Pending', 'In Progress', 'Completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${filter === status
                            ? 'bg-ink text-paper'
                            : 'text-secondary hover:bg-secondary/5'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="p-10 text-center text-secondary font-mono">Loading active tickets...</div>
            ) : (
                <>
                    {/* Task Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTasks.map(task => (
                            <div key={task._id} className="maintenance-card opacity-0 bg-paper border border-secondary/20 rounded-lg p-6 flex flex-col relative group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                                {/* Status Badge */}
                                <div className={`absolute top-4 right-4 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusColor(task.status)}`}>
                                    {task.status}
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-ink mb-1">{task.resource ? task.resource.name : "Deleted Resource"}</h3>
                                    <div className="flex items-center gap-2 text-xs text-secondary font-mono">
                                        <Wrench className="w-3 h-3 text-primary" />
                                        {task.maintenanceType}
                                    </div>
                                </div>

                                <p className="text-sm text-secondary/80 mb-4 flex-1 italic">
                                    "{task.notes || 'No custom notes provided.'}"
                                </p>

                                {/* Duration & Blocking details */}
                                <div className="bg-secondary/5 border border-secondary/10 rounded p-2 mb-4 text-[10px] font-mono text-secondary space-y-1">
                                    <div className="flex justify-between">
                                        <span>WINDOW:</span>
                                        <span className="font-bold text-ink">
                                            {task.startTime ? new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'} - {task.endTime ? new Date(task.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>BLOCKS BOOKINGS:</span>
                                        <span className={`font-bold ${task.blocksBookings ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {task.blocksBookings ? 'YES (CASCADING CANCEL)' : 'NO'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-secondary/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-secondary uppercase">
                                        <Calendar className="w-3 h-3 text-primary" />
                                        {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'N/A'}
                                    </div>

                                    {task.status !== 'Completed' && (
                                        <div className="flex gap-2">
                                            {task.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleStatusChange(task._id, 'Scheduled')}
                                                    className="text-[10px] font-black uppercase text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleStatusChange(task._id, 'Completed')}
                                                className="text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                            >
                                                <CheckCircle className="w-3 h-3" /> Done
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredTasks.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-secondary opacity-40 border-2 border-dashed border-secondary/10 rounded-lg">
                            <CheckCircle className="w-12 h-12 mb-4" />
                            <p className="font-bold uppercase tracking-widest text-sm">No tasks found</p>
                        </div>
                    )}
                </>
            )}

            {/* Gorgeous Modal for scheduling new maintenance */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div 
                        ref={modalRef}
                        className="bg-paper border-2 border-primary rounded-xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative blueprint lines */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-ink" />

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-primary" />
                                <h3 className="text-xl font-black text-ink uppercase tracking-tight">Schedule Maintenance</h3>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 hover:bg-secondary/10 rounded-full text-secondary hover:text-ink transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            {/* Resource Dropdown */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-secondary mb-1">Target Resource *</label>
                                <select
                                    required
                                    value={newTicket.resource}
                                    onChange={(e) => setNewTicket({ ...newTicket, resource: e.target.value })}
                                    className="w-full bg-paper border border-secondary/20 p-2.5 rounded font-bold text-ink uppercase tracking-wide text-xs focus:border-primary focus:outline-none"
                                >
                                    <option value="">-- Choose Resource --</option>
                                    {resourcesList.map(r => (
                                        <option key={r._id} value={r._id}>{r.name} - Floor {r.floor} ({r.building})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Maintenance Type */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-secondary mb-1">Service Type</label>
                                    <select
                                        value={newTicket.maintenanceType}
                                        onChange={(e) => setNewTicket({ ...newTicket, maintenanceType: e.target.value })}
                                        className="w-full bg-paper border border-secondary/20 p-2.5 rounded font-bold text-ink text-xs focus:border-primary focus:outline-none"
                                    >
                                        <option value="Routine Check">Routine Check</option>
                                        <option value="Repair">Repair</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Hardware Upgrade">Hardware Upgrade</option>
                                        <option value="Software Install">Software Install</option>
                                    </select>
                                </div>

                                {/* Scheduled Date */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-secondary mb-1">Scheduled Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={newTicket.scheduledDate}
                                        onChange={(e) => setNewTicket({ ...newTicket, scheduledDate: e.target.value })}
                                        className="w-full bg-paper border border-secondary/20 p-2.5 rounded font-bold text-ink text-xs focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Start Time */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-secondary mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={newTicket.startTime}
                                        onChange={(e) => setNewTicket({ ...newTicket, startTime: e.target.value })}
                                        className="w-full bg-paper border border-secondary/20 p-2.5 rounded font-bold text-ink text-xs focus:border-primary focus:outline-none"
                                    />
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-secondary mb-1">End Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={newTicket.endTime}
                                        onChange={(e) => setNewTicket({ ...newTicket, endTime: e.target.value })}
                                        className="w-full bg-paper border border-secondary/20 p-2.5 rounded font-bold text-ink text-xs focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Assignee Dropdown */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-secondary mb-1">Assign Worker</label>
                                <select
                                    value={newTicket.assignedTo}
                                    onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                                    className="w-full bg-paper border border-secondary/20 p-2.5 rounded font-bold text-ink text-xs focus:border-primary focus:outline-none"
                                >
                                    <option value="">-- Unassigned / Pool --</option>
                                    {workersList.map(w => (
                                        <option key={w._id} value={w._id}>{w.name} ({w.email})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Blocks Bookings toggle */}
                            <div className="flex items-center gap-3 bg-red-50/50 p-3 border border-red-100 rounded">
                                <input
                                    type="checkbox"
                                    id="blocksBookings"
                                    checked={newTicket.blocksBookings}
                                    onChange={(e) => setNewTicket({ ...newTicket, blocksBookings: e.target.checked })}
                                    className="w-4 h-4 text-primary focus:ring-primary border-secondary/20 rounded cursor-pointer"
                                />
                                <label htmlFor="blocksBookings" className="text-xs font-bold text-ink cursor-pointer select-none">
                                    Enforce Blocking & Cascade Cancel Conflicting Bookings
                                </label>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-secondary mb-1">Service Notes / Scope of Work</label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter specific issues, items to clean, or parts to upgrade..."
                                    value={newTicket.notes}
                                    onChange={(e) => setNewTicket({ ...newTicket, notes: e.target.value })}
                                    className="w-full bg-paper border border-secondary/20 p-2.5 rounded text-xs text-ink focus:border-primary focus:outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-paper py-3 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-ink transition-colors flex items-center justify-center gap-2 mt-2"
                            >
                                <Check className="w-4 h-4" /> Schedule & Dispatch
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceDashboard;
