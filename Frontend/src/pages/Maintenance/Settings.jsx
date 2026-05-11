import React, { useState, useEffect } from 'react';
import { User, Bell, Save, Moon, Sun, Lock, Layout, Shield, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import axios from '../../api/axiosConfig';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import CustomAlert from '../../components/CustomAlert';

const MaintenanceSettings = () => {
    // ----- State -----
    const [activeTab, setActiveTab] = useState('general');

    // Theme Context
    const { appearance, setAppearance } = useTheme();

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        staffId: '',
        email: '',
        phone: '',
        avatar: null
    });

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success',
        confirmText: 'OK',
        onConfirm: () => {}
    });

    const triggerAlert = (title, message, type = 'success') => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type,
            confirmText: 'OK',
            onConfirm: () => {
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Notification State
    const [notifPrefs, setNotifPrefs] = useState({
        newAssignment: true,
        urgentAlerts: true,
        dailySchedule: true
    });

    // Load actual maintenance profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/api/auth/profile');
                setProfile({
                    name: data.name || '',
                    staffId: data.staffId || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    avatar: null
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch profile info:", err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // ----- Handlers -----
    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async () => {
        try {
            const { data } = await axios.put('/api/auth/profile', {
                phone: profile.phone,
                staffId: profile.staffId
            });
            // Update localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo) {
                userInfo.phone = data.phone;
                userInfo.staffId = data.staffId;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }
            triggerAlert("Profile Updated", "Profile settings saved successfully!", "success");
        } catch (err) {
            console.error("Failed to save changes:", err);
            triggerAlert("Update Failed", "Failed to save settings. Please try again.", "danger");
        }
    };

    const handleUpdatePassword = async () => {
        if (!password.trim()) {
            triggerAlert("Validation Error", "Please enter a new password", "warning");
            return;
        }
        try {
            await axios.put('/api/auth/profile', { password });
            triggerAlert("Password Updated", "Password updated successfully!", "success");
            setPassword("");
        } catch (err) {
            console.error("Failed to update password:", err);
            triggerAlert("Update Failed", "Failed to update password. Please try again.", "danger");
        }
    };

    const containerRef = React.useRef(null);
    useGSAP(() => {
        gsap.fromTo('.settings-block',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
        );
    }, [activeTab]);

    return (
        <div ref={containerRef} className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-ink uppercase tracking-tight mb-2">Settings</h1>
                <p className="text-secondary text-sm">Manage profile and work preferences.</p>
            </div>

            {/* Quick Tabs */}
            <div className="flex gap-4 border-b border-secondary/10 pb-1 overflow-x-auto">
                {['general', 'notifications', 'appearance'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-2 text-xs font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-primary' : 'text-secondary hover:text-ink'} `}
                    >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Main Settings Form */}
                <div className="md:col-span-2 space-y-8">

                    {/* --- GENERAL SETTINGS --- */}
                    {activeTab === 'general' && (
                        <div className="space-y-8">
                            {/* Profile Section */}
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm space-y-4">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4">Staff Profile</h3>
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xl relative">
                                        {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ST'}
                                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-paper rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full border border-paper" title="Active Status"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-ink">{profile.name || 'Staff User'}</p>
                                        <p className="text-xs text-secondary">{profile.staffId || 'No ID'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Email</label>
                                        <input type="email" value={profile.email} readOnly className="w-full bg-secondary/5 border border-secondary/10 rounded p-2 text-sm text-secondary/70 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Phone</label>
                                        <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full bg-paper border border-secondary/20 rounded p-2 text-sm text-ink focus:border-primary focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Password Change */}
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm space-y-4">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Security
                                </h3>
                                <div>
                                    <label className="block text-[10px] font-bold text-secondary uppercase mb-1">New Password</label>
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-paper border border-secondary/20 rounded p-2 text-sm text-ink focus:border-primary focus:outline-none" />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button onClick={handleUpdatePassword} className="bg-ink text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-primary transition-colors">
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- NOTIFICATIONS --- */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-8">
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4">Work Alerts</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-ink">New Task Assignments</span>
                                        <input type="checkbox" checked={notifPrefs.newAssignment} onChange={() => setNotifPrefs({ ...notifPrefs, newAssignment: !notifPrefs.newAssignment })} className="accent-primary" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-ink">Urgent Maintenance SMS</span>
                                        <input type="checkbox" checked={notifPrefs.urgentAlerts} onChange={() => setNotifPrefs({ ...notifPrefs, urgentAlerts: !notifPrefs.urgentAlerts })} className="accent-primary" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-ink">Daily Schedule Email</span>
                                        <input type="checkbox" checked={notifPrefs.dailySchedule} onChange={() => setNotifPrefs({ ...notifPrefs, dailySchedule: !notifPrefs.dailySchedule })} className="accent-primary" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- APPEARANCE SETTINGS --- */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-8">
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4">Theme</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setAppearance({ ...appearance, theme: 'latte' })}
                                        className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${appearance.theme === 'latte' ? 'border-primary bg-paper' : 'border-secondary/20 hover:border-secondary/50'} `}
                                    >
                                        <div className="w-full h-20 bg-paper mb-3 rounded border border-dashed border-secondary/20 relative">
                                            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-primary opacity-20" />
                                        </div>
                                        <p className="font-bold text-ink text-xs uppercase mb-1">Warm Latte</p>
                                        <p className="text-[10px] text-secondary">Default organic parchment style.</p>
                                        {appearance.theme === 'latte' && <div className="absolute top-2 right-2 text-primary"><CheckCircle /></div>}
                                    </button>

                                    <button
                                        onClick={() => setAppearance({ ...appearance, theme: 'midnight' })}
                                        className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${appearance.theme === 'midnight' ? 'border-cyan-500 bg-paper' : 'border-secondary/20 hover:border-secondary/50'} `}
                                    >
                                        <div className="w-full h-20 bg-slate-900 mb-3 rounded border border-cyan-500/20 relative shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                            <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-cyan-500 opacity-50 shadow-[0_0_10px_#06b6d4]" />
                                        </div>
                                        <p className={`font-bold text-xs uppercase mb-1 ${appearance.theme === 'midnight' ? 'text-cyan-400' : 'text-ink'} `}>Midnight Protocol</p>
                                        <p className={`text-[10px] ${appearance.theme === 'midnight' ? 'text-secondary' : 'text-secondary'} `}>Futuristic neon dark mode.</p>
                                    </button>

                                    <button
                                        onClick={() => setAppearance({ ...appearance, theme: 'contrast' })}
                                        className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden ${appearance.theme === 'contrast' ? 'border-ink bg-paper' : 'border-secondary/20 hover:border-secondary/50'} `}
                                    >
                                        <div className="w-full h-20 bg-paper mb-3 rounded border-2 border-ink relative shadow-[4px_4px_0px_var(--color-ink)]">
                                            <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-ink" />
                                        </div>
                                        <p className="font-bold text-ink text-xs uppercase mb-1">Stark Contrast</p>
                                        <p className="text-[10px] text-ink/70">Minimalist structural focus.</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Sidebar Summary */}
                <div className="md:col-span-1 space-y-4 settings-block opacity-0">
                    <div className="bg-paper border border-secondary/20 p-6 rounded-lg shadow-lg sticky top-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center font-bold text-lg text-white">
                                {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ST'}
                            </div>
                            <div>
                                <p className="font-bold text-ink text-sm">{profile.name || 'Staff User'}</p>
                                <p className="text-[10px] text-secondary">Maintenance Staff</p>
                            </div>
                        </div>

                        <button onClick={handleSaveChanges} className="w-full bg-primary text-paper py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-ink hover:text-paper transition-all flex items-center justify-center gap-2 group">
                            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Save Config
                        </button>
                    </div>
                </div>

            </div>

            {/* Custom Premium Alert Dialog */}
            <CustomAlert {...alertConfig} />
        </div>
    );
};

export default MaintenanceSettings;
