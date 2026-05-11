import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, MapPin, Users, Server, Monitor, Speaker, ImageIcon, X, Wrench } from 'lucide-react';
import axios from '../../api/axiosConfig';
import { resources as initialResources, getFullResourceDetails } from '../../data/mockData';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import CustomAlert from '../../components/CustomAlert';

const ResourceManagement = () => {
    // Initialize state with "hydrated" data (joined with building/type info)
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => {},
        onCancel: null
    });

    const triggerAlert = (title, message, type = 'success', onConfirm = null) => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type,
            confirmText: 'OK',
            cancelText: 'Cancel',
            onConfirm: () => {
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
                if (onConfirm) onConfirm();
            },
            onCancel: null
        });
    };

    // Maintenance scheduling state
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [maintenanceResource, setMaintenanceResource] = useState(null);
    const [maintenanceStaff, setMaintenanceStaff] = useState([]);
    const [maintenanceForm, setMaintenanceForm] = useState({
        maintenanceType: 'Routine',
        scheduledDate: '',
        notes: '',
        blocksBookings: true,
        assignedTo: ''
    });

    const handleOpenMaintenance = async (res) => {
        setMaintenanceResource(res);
        setMaintenanceForm({
            maintenanceType: 'Routine',
            scheduledDate: new Date().toISOString().split('T')[0],
            notes: '',
            blocksBookings: true,
            assignedTo: ''
        });
        setIsMaintenanceModalOpen(true);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/admin/users', config);
            const staffMembers = data.filter(u => u.role.toLowerCase() === 'maintenance');
            setMaintenanceStaff(staffMembers);
        } catch (err) {
            console.error("Failed to load maintenance staff", err);
        }
    };

    const handleMaintenanceSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const dateStr = maintenanceForm.scheduledDate;
            const startTime = new Date(`${dateStr}T09:00:00`);
            const endTime = new Date(`${dateStr}T17:00:00`);

            const payload = {
                resource: maintenanceResource.id,
                maintenanceType: maintenanceForm.maintenanceType,
                scheduledDate: dateStr,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                blocksBookings: maintenanceForm.blocksBookings,
                notes: maintenanceForm.notes,
                assignedTo: maintenanceForm.assignedTo || undefined
            };

            await axios.post('/api/maintenance', payload, config);
            setIsMaintenanceModalOpen(false);
            triggerAlert(
                "Maintenance Scheduled",
                `Maintenance has been successfully scheduled for ${maintenanceResource.name}!`,
                "success"
            );
        } catch (err) {
            console.error("Failed to schedule maintenance", err);
            triggerAlert(
                "Error Scheduling",
                "Failed to schedule maintenance: " + (err.response?.data?.message || err.message),
                "danger"
            );
        }
    };

    const fetchResources = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const { data } = await axios.get('/api/resources', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Backend returns raw resource objects, map them if needed or use as is
            // Schema: name, type, building, floor, capacity, facilities, description
            const formatted = data.map(r => ({
                id: r._id,
                name: r.name,
                type: r.type,
                building: r.building,
                floor: r.floor, // e.g., "2nd Floor" or just "2"
                capacity: r.capacity,
                status: 'active', // Default for now
                facilities: r.facilities,
                image: r.image // Verify if backend handles image storage or just URL strings
            }));
            setResources(formatted);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '', type: 'Lab', building: '', floor: '', capacity: '', facilities: [], image: null
    });

    const handleEdit = (res) => {
        setEditingResource(res);
        setFormData(res);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingResource(null);
        setFormData({ name: '', type: 'Lab', building: '', floor: '', capacity: '', facilities: [], image: null });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setAlertConfig({
            isOpen: true,
            title: "Delete Resource",
            message: "Are you sure you want to permanently delete this resource? This action cannot be undone.",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    await axios.delete(`/api/resources/${id}`);
                    setResources(prev => prev.filter(r => r.id !== id));
                    triggerAlert("Deleted", "Resource deleted successfully.", "success");
                } catch (err) {
                    console.error("Failed to delete resource", err);
                    triggerAlert("Delete Failed", "Failed to delete resource.", "danger");
                }
            },
            onCancel: () => {
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingResource) {
                const { data } = await axios.put(`/api/resources/${editingResource.id}`, formData);
                setResources(prev => prev.map(r => r.id === editingResource.id ? { ...formData, id: r.id } : r));
                triggerAlert("Success", "Resource updated successfully.", "success");
            } else {
                const { data } = await axios.post('/api/resources', formData);
                setResources(prev => [...prev, { ...formData, id: data._id, status: 'active' }]);
                triggerAlert("Success", "New resource added successfully.", "success");
            }
            setIsModalOpen(false);
            fetchResources(); // Refresh to be sure
        } catch (err) {
            console.error("Failed to save resource", err);
            triggerAlert("Failed", "Failed to save resource: " + (err.response?.data?.message || err.message), "danger");
        }
    };

    const toggleFacility = (facility) => {
        setFormData(prev => {
            const has = prev.facilities.includes(facility);
            return {
                ...prev,
                facilities: has ? prev.facilities.filter(f => f !== facility) : [...prev.facilities, facility]
            };
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const containerRef = React.useRef(null);
    useGSAP(() => {
        if (!loading) {
            gsap.fromTo('.blueprint-line',
                { scaleX: 0 },
                { scaleX: 1, duration: 0.8, ease: 'power2.out', transformOrigin: 'left' }
            );
            gsap.fromTo('.resource-row',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
            );
        }
    }, [loading]);

    return (
        <div ref={containerRef} className="space-y-[var(--density-space)] relative h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-ink uppercase tracking-tight">Resources</h2>
                    <div className="h-[2px] w-12 bg-primary mt-2"></div>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-primary text-paper px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-ink hover:text-paper transition-all flex items-center gap-2 shadow-lg hover:translate-y-[-2px]"
                >
                    <Plus className="w-4 h-4" /> Add Resource
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-paper border border-secondary/20 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="w-full bg-secondary/5 border border-secondary/10 rounded-full pl-10 pr-4 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-4 py-2 border border-secondary/20 rounded-lg text-xs font-bold uppercase text-secondary hover:text-ink hover:bg-secondary/5 flex items-center justify-center gap-2">
                        <Filter className="w-3 h-3" /> Filters
                    </button>
                </div>
            </div>

            {/* Resource Table */}
            <div className="bg-paper border border-secondary/20 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-secondary/10">
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Resource Name</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Location</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Type</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Capacity</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary">Status</th>
                                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map(res => (
                                <tr key={res.id} className="resource-row opacity-0 border-b border-secondary/5 hover:bg-secondary/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center text-secondary overflow-hidden relative border border-secondary/10">
                                                {res.image ? (
                                                    <img src={res.image} alt={res.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Server className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-ink">{res.name}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {res.facilities.slice(0, 2).map(f => (
                                                        <span key={f} className="text-[9px] bg-secondary/10 px-1 rounded text-secondary/70">{f}</span>
                                                    ))}
                                                    {res.facilities.length > 2 && <span className="text-[9px] text-secondary/50">+{res.facilities.length - 2}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-xs text-secondary">
                                            <MapPin className="w-3 h-3" />
                                            {res.building}, {res.floor}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-mono font-bold text-ink bg-primary/5 px-2 py-1 rounded text-primary">{res.type}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-xs text-secondary">
                                            <Users className="w-3 h-3" />
                                            {res.capacity}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${res.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                            }`}>
                                            {res.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenMaintenance(res)} className="p-2 text-secondary hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors" title="Schedule Maintenance">
                                                <Wrench className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEdit(res)} className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(res.id)} className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
                    <div className="bg-paper p-8 rounded-xl max-w-2xl w-full shadow-2xl border border-secondary/10 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-secondary/10 pb-4">
                            <h3 className="text-xl font-black text-ink uppercase tracking-tight">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-ink transition-colors">
                                <Search className="w-5 h-5 rotate-45" /> {/* Using Search rotate as close icon variant or X */}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload */}
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-lg bg-secondary/5 border-2 border-dashed border-secondary/20 flex items-center justify-center overflow-hidden relative hover:bg-secondary/10 transition-colors group">
                                    {formData.image ? (
                                        <>
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </>
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-secondary/30" />
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-ink uppercase">Resource Image</p>
                                    <p className="text-[10px] text-secondary mt-1">Upload a thumbnail (JPG/PNG)</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase mb-2">Resource Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-primary focus:outline-none"
                                        placeholder="e.g. Computer Lab 3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-primary focus:outline-none"
                                    >
                                        <option>Lab</option>
                                        <option>Hall</option>
                                        <option>Classroom</option>
                                        <option>Auditorium</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase mb-2">Building</label>
                                    <select
                                        value={formData.building}
                                        onChange={e => setFormData({ ...formData, building: e.target.value })}
                                        className="w-full bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-primary focus:outline-none"
                                    >
                                        <option value="">Select Building...</option>
                                        <option>Main Block</option>
                                        <option>North Block</option>
                                        <option>Science Block</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase mb-2">Floor</label>
                                    <input
                                        type="text"
                                        value={formData.floor}
                                        onChange={e => setFormData({ ...formData, floor: e.target.value })}
                                        className="w-full bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-primary focus:outline-none"
                                        placeholder="e.g. 2nd Floor"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase mb-2">Capacity</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                        className="w-full bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-primary focus:outline-none"
                                        placeholder="e.g. 30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-secondary uppercase mb-3">Facilities</label>
                                <div className="flex flex-wrap gap-2">
                                    {['AC', 'Projector', 'PCs', 'Sound', 'Stage', 'Whiteboard', 'Wifi'].map(f => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => toggleFacility(f)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${formData.facilities.includes(f)
                                                ? 'bg-primary text-paper border-primary'
                                                : 'bg-transparent text-secondary border-secondary/30 hover:border-secondary'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-secondary/10">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-paper py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-ink hover:text-paper transition-all"
                                >
                                    {editingResource ? 'Update Resource' : 'Create Resource'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 border border-secondary/20 rounded font-bold uppercase text-xs tracking-widest hover:bg-secondary/5 text-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Schedule Maintenance Modal */}
            {isMaintenanceModalOpen && maintenanceResource && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
                    <div className="bg-paper p-8 rounded-xl max-w-lg w-full shadow-2xl border border-secondary/10">
                        <div className="flex justify-between items-center mb-6 border-b border-secondary/10 pb-4">
                            <div className="flex items-center gap-2 text-amber-500">
                                <Wrench className="w-5 h-5" />
                                <h3 className="text-xl font-black text-ink uppercase tracking-tight">Schedule Maintenance</h3>
                            </div>
                            <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-secondary hover:text-ink transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-secondary mb-4">
                            Scheduling maintenance on <strong className="text-ink">{maintenanceResource.name}</strong>.
                        </p>

                        <form onSubmit={handleMaintenanceSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase mb-2">Maintenance Type</label>
                                    <select
                                        value={maintenanceForm.maintenanceType}
                                        onChange={e => setMaintenanceForm({ ...maintenanceForm, maintenanceType: e.target.value })}
                                        className="w-full bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-primary focus:outline-none text-ink font-bold"
                                    >
                                        <option>Routine</option>
                                        <option>Repair</option>
                                        <option>Upgrade</option>
                                        <option>Emergency</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase mb-2">Scheduled Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={maintenanceForm.scheduledDate}
                                        onChange={e => setMaintenanceForm({ ...maintenanceForm, scheduledDate: e.target.value })}
                                        className="w-full bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-primary focus:outline-none text-ink font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-secondary uppercase mb-2">Assign To Staff</label>
                                <select
                                    value={maintenanceForm.assignedTo}
                                    onChange={e => setMaintenanceForm({ ...maintenanceForm, assignedTo: e.target.value })}
                                    className="w-full bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-primary focus:outline-none text-ink"
                                >
                                    <option value="">-- Leave Unassigned / Pick Worker --</option>
                                    {maintenanceStaff.map(staff => (
                                        <option key={staff._id} value={staff._id}>
                                            {staff.name} ({staff.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="blocksBookings"
                                    checked={maintenanceForm.blocksBookings}
                                    onChange={e => setMaintenanceForm({ ...maintenanceForm, blocksBookings: e.target.checked })}
                                    className="w-4 h-4 accent-primary"
                                />
                                <label htmlFor="blocksBookings" className="text-xs font-bold text-ink uppercase select-none cursor-pointer">
                                    Block All Student Bookings on this Date
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-secondary uppercase mb-2">Notes & Details</label>
                                <textarea
                                    value={maintenanceForm.notes}
                                    onChange={e => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                                    className="w-full bg-secondary/5 border border-secondary/20 rounded p-3 text-sm focus:border-primary focus:outline-none text-ink min-h-[100px]"
                                    placeholder="Provide detailed instruction or description of what needs servicing..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-secondary/10">
                                <button
                                    type="submit"
                                    className="flex-1 bg-amber-500 text-paper py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Wrench className="w-4 h-4" /> Schedule Maintenance
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsMaintenanceModalOpen(false)}
                                    className="px-6 border border-secondary/20 rounded font-bold uppercase text-xs tracking-widest hover:bg-secondary/5 text-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Global Custom Alert Dialog */}
            <CustomAlert {...alertConfig} />
        </div>
    );
};

export default ResourceManagement;
