import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { Search, Filter, MoreVertical, Shield, GraduationCap, Briefcase, User, Edit2, CheckCircle, Lock, Bell } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastConfig, setToastConfig] = useState({ type: 'success', title: '', message: '' });

    const showNotification = (type, title, message) => {
        setToastConfig({ type, title, message });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/api/admin/users');
            // Backend: _id, name, email, role, isAdmin, createdAt
            const formatted = data.map(u => ({
                user_id: u._id,
                name: u.name,
                email: u.email,
                role: u.role || (u.isAdmin ? 'Admin' : 'Student'),
                created_at: u.createdAt || new Date().toISOString()
            }));
            setUsers(formatted);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            showNotification('error', 'Error', 'Failed to fetch users');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditClick = (user) => {
        setEditingUser(user);
        setSelectedRole(user.role);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.patch(`/api/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
            showNotification('success', 'Role Updated', `User role changed to ${newRole}`);
        } catch (err) {
            console.error("Failed to update role", err);
            showNotification('error', 'Update Failed', err.response?.data?.message || 'Failed to update user role');
        }
    };

    const handleSaveRole = async () => {
        if (!editingUser) return;
        try {
            await axios.patch(`/api/admin/users/${editingUser.user_id}/role`, { role: selectedRole });
            setUsers(prev => prev.map(u => u.user_id === editingUser.user_id ? { ...u, role: selectedRole } : u));
            setEditingUser(null);
            showNotification('success', 'Role Updated', `User role changed to ${selectedRole}`);
        } catch (err) {
            console.error("Failed to update role", err);
            showNotification('error', 'Update Failed', 'Failed to update user role');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Admin': return <Shield className="w-3 h-3 text-red-500" />;
            case 'Faculty': return <Briefcase className="w-3 h-3 text-purple-500" />;
            default: return <GraduationCap className="w-3 h-3 text-blue-500" />;
        }
    };

    const containerRef = React.useRef(null);
    useGSAP(() => {
        if (!loading) {
            gsap.fromTo('.blueprint-line',
                { scaleX: 0 },
                { scaleX: 1, duration: 0.8, ease: 'power2.out', transformOrigin: 'left' }
            );
            gsap.fromTo('.user-row',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [loading, users.length]);

    return (
        <div ref={containerRef} className="space-y-[var(--density-space)] relative h-full flex flex-col">
            {/* Toast Notification */}
            {showToast && (
                <div className={`fixed top-24 right-8 border-l-4 shadow-2xl p-4 rounded-r-lg animate-bounce-in z-[100] max-w-sm bg-paper ${toastConfig.type === 'error' ? 'border-red-500' : 'border-emerald-500'}`}>
                    <div className="flex justify-between items-start mb-1 gap-4">
                        <div className={`flex items-center gap-2 font-bold uppercase tracking-widest text-xs ${toastConfig.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {toastConfig.type === 'error' ? <Lock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {toastConfig.title}
                        </div>
                        <button onClick={() => setShowToast(false)} className="text-secondary hover:text-ink">
                            <Lock className="w-4 h-4 rotate-45" /> {/* Using Lock rotated as X for now or just X */}
                        </button>
                    </div>
                    <p className="text-sm text-ink font-bold mb-1">{toastConfig.message}</p>
                </div>
            )}

            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-ink uppercase tracking-tight">User Management</h2>
                <div className="h-[2px] w-12 bg-primary mt-2 blueprint-line scale-x-0"></div>
            </div>

            {/* Toolbar */}
            <div className="bg-paper border border-secondary/20 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary/5 border border-secondary/10 rounded-full pl-10 pr-4 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-4 py-2 border border-secondary/20 rounded-lg text-xs font-bold uppercase text-secondary hover:text-ink hover:bg-secondary/5 flex items-center justify-center gap-2">
                        <Filter className="w-3 h-3" /> Filter Roles
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-paper border border-secondary/20 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-secondary/10">
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">User</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Role</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Joined</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.user_id} className="user-row opacity-0 border-b border-secondary/5 hover:bg-secondary/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center font-bold text-xs ring-2 ring-paper/50">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-ink">{user.name}</p>
                                                <p className="text-[10px] text-secondary">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(user.role)}
                                            <span className="text-xs font-bold text-ink">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                            Active
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs text-secondary font-mono">{user.created_at.split('T')[0]}</span>
                                    </td>
                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                            className="bg-paper border border-secondary/20 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                                        >
                                            <option value="Student">Student</option>
                                            <option value="Faculty">Faculty</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const { data } = await axios.post(`/api/admin/test-socket/${user.user_id}`);
                                                    showNotification('success', 'Test Sent', `Room Size: ${data.roomSize} | Connected: ${data.connected}`);
                                                } catch (err) {
                                                    showNotification('error', 'Test Failed', err.message);
                                                }
                                            }}
                                            className="ml-2 bg-primary/10 hover:bg-primary/20 text-primary p-1 rounded transition-colors"
                                            title="Send Test Notification"
                                        >
                                            <Bell className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="p-1.5 text-secondary hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Role Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
                    <div className="bg-paper p-6 rounded-lg max-w-sm w-full shadow-2xl border-2 border-secondary/10">
                        <h3 className="text-lg font-black text-ink uppercase tracking-tight mb-4">Edit User Role</h3>
                        <div className="mb-6">
                            <p className="text-sm font-bold text-ink mb-1">{editingUser.name}</p>
                            <p className="text-xs text-secondary mb-4">{editingUser.email}</p>

                            <label className="block text-xs font-bold text-secondary uppercase mb-2">Assign Role</label>
                            <div className="space-y-2">
                                {['Student', 'Faculty', 'Admin'].map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setSelectedRole(role)}
                                        className={`w-full flex items-center gap-3 p-3 rounded border transition-all ${selectedRole === role
                                            ? 'bg-primary/5 border-primary text-primary font-bold'
                                            : 'bg-white border-secondary/20 text-secondary hover:bg-secondary/5'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedRole === role ? 'border-primary' : 'border-secondary/40'
                                            }`}>
                                            {selectedRole === role && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            {getRoleIcon(role)} {role}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveRole}
                                className="flex-1 bg-primary text-paper py-2 rounded font-bold uppercase text-xs tracking-widest hover:bg-ink transition-colors"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="flex-1 border border-secondary/20 text-secondary py-2 rounded font-bold uppercase text-xs tracking-widest hover:bg-secondary/5 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
