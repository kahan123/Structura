import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axiosConfig';
import { CheckCircle, Clock, MapPin, AlertTriangle, Calendar, ArrowRight, PlayCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

    const containerRef = useRef(null);

    // Get current logged-in user
    const user = JSON.parse(localStorage.getItem('userInfo')) || {};

    const loadMyTasks = async () => {
        try {
            setLoading(true);
            // Fetch assigned tasks from the backend
            const response = await axios.get(`/api/maintenance/my-tasks?userId=${user._id}`);
            setTasks(response.data);
            setError('');
        } catch (err) {
            console.error("Failed to fetch worker tasks:", err);
            setError('Failed to fetch assigned tasks.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user._id) {
            loadMyTasks();
        } else {
            setError('User profile not found. Please log in again.');
            setLoading(false);
        }
    }, [user._id]);

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await axios.patch(`/api/maintenance/${taskId}/status`, { status: newStatus });
            setSuccess(`Task status updated to "${newStatus}"!`);
            loadMyTasks();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error("Failed to update task status:", err);
            setError('Failed to update task status.');
            setTimeout(() => setError(''), 4000);
        }
    };

    const myActiveTasks = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Rejected');
    const completedTasks = tasks.filter(t => t.status === 'Completed');

    useGSAP(() => {
        if (!loading) {
            gsap.fromTo('.task-card',
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
            );
        }
    }, [activeTab, tasks.length, loading]);

    return (
        <div ref={containerRef} className="space-y-[var(--density-space)] pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-ink uppercase tracking-tight">My Tasks</h2>
                    <p className="text-secondary text-sm">Assignments & Work Orders for {user.name || 'Staff'}</p>
                </div>

                <div className="bg-paper p-1 rounded-lg border border-secondary/20 flex shadow-sm">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-ink text-paper shadow-sm' : 'text-secondary hover:text-ink'}`}
                    >
                        Active ({myActiveTasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-ink text-paper shadow-sm' : 'text-secondary hover:text-ink'}`}
                    >
                        History ({completedTasks.length})
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold border border-red-100 rounded flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 text-green-700 text-xs font-bold border border-green-100 rounded flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {success}
                </div>
            )}

            {loading ? (
                <div className="p-10 text-center text-secondary font-mono">Loading assigned work tickets...</div>
            ) : (
                <div className="space-y-4">
                    {(activeTab === 'active' ? myActiveTasks : completedTasks).map(task => {
                        const resource = task.resource || {};
                        return (
                            <div key={task._id} className="task-card opacity-0 bg-paper border border-secondary/20 border-l-4 border-l-primary rounded-r-lg p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">

                                    {/* Info Section */}
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${task.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                task.status === 'Pending' || task.status === 'Scheduled' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                                {task.status}
                                            </span>
                                            <span className="text-[10px] font-mono text-secondary">
                                                Ticket #{task._id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-ink">{task.maintenanceType}: {resource.name || 'Resource'}</h3>

                                        <div className="flex items-center gap-4 text-xs text-secondary font-bold uppercase tracking-wide">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-primary" />
                                                Floor {resource.floor || 'N/A'}, {resource.building || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-primary" />
                                                Due: {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>

                                        <p className="text-sm text-secondary/80 mt-2 italic bg-secondary/5 p-2 rounded border border-secondary/10 inline-block">
                                            "{task.notes || 'No notes specified.'}"
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                                        {task.status !== 'In Progress' && task.status !== 'Completed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(task._id, 'In Progress')}
                                                className="px-6 py-3 bg-blue-600 text-white rounded font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow"
                                            >
                                                <PlayCircle className="w-4 h-4" /> Start Work
                                            </button>
                                        )}

                                        {task.status !== 'Completed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(task._id, 'Completed')}
                                                className="px-6 py-3 bg-emerald-600 text-white rounded font-bold uppercase text-xs tracking-widest hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Mark Complete
                                            </button>
                                        )}

                                        {task.status === 'Completed' && (
                                            <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded font-bold uppercase text-xs tracking-widest border border-emerald-100 flex items-center justify-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {(activeTab === 'active' ? myActiveTasks : completedTasks).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-secondary border-2 border-dashed border-secondary/10 rounded-lg bg-secondary/5">
                            <CheckCircle className="w-12 h-12 mb-4 opacity-50 text-primary" />
                            <p className="font-bold uppercase tracking-widest text-sm opacity-50">No tasks found in {activeTab}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyTasks;
