import React, { useState, useEffect } from 'react';
import { User, Bell, Save, Moon, Sun, Lock, Layout, Shield, AlertTriangle, Monitor, Power, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import axios from '../../api/axiosConfig';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import CustomAlert from '../../components/CustomAlert';

const AdminSettings = () => {
    // ----- State -----
    const [activeTab, setActiveTab] = useState('general');

    // Theme Context
    const { appearance, setAppearance } = useTheme();

    // Admin Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: 'Admin',
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

    // System Settings (Admin Specific)
    const [systemSettings, setSystemSettings] = useState({
        maintenanceMode: false,
        allowNewBookings: true,
        autoApproveStudents: false,
        maxBookingDuration: 4
    });

    // Notification State
    const [notifPrefs, setNotifPrefs] = useState({
        emailAlerts: true,
        dailyDigest: true,
        urgentSMS: false
    });

    // Fetch Admin Profile and System Settings
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const profileRes = await axios.get('/api/auth/profile');
                setProfile({
                    name: profileRes.data.name || '',
                    email: profileRes.data.email || '',
                    role: profileRes.data.role || 'Admin',
                    phone: profileRes.data.phone || '',
                    avatar: null
                });

                const systemRes = await axios.get('/api/settings/system');
                setSystemSettings({
                    maintenanceMode: systemRes.data.maintenanceMode === true || systemRes.data.maintenanceMode === 'true',
                    allowNewBookings: systemRes.data.allowNewBookings === true || systemRes.data.allowNewBookings === 'true',
                    autoApproveStudents: systemRes.data.autoApproveStudents === true || systemRes.data.autoApproveStudents === 'true',
                    maxBookingDuration: parseInt(systemRes.data.maxBookingDuration) || 4
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to load admin settings data:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSystemToggle = (key) => {
        setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveConfig = async () => {
        try {
            // Save Profile changes
            const profileRes = await axios.put('/api/auth/profile', {
                phone: profile.phone
            });
            // Update localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo) {
                userInfo.phone = profileRes.data.phone;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }

            // Save System Config changes
            await axios.post('/api/settings/system', systemSettings);

            triggerAlert("Configurations Saved", "Configurations and profile settings saved successfully!", "success");
        } catch (err) {
            console.error("Failed to save configs:", err);
            triggerAlert("Failed", "Failed to save settings. Please try again.", "danger");
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
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
        gsap.fromTo('.blueprint-line',
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, ease: 'power2.out', transformOrigin: 'left' }
        );
    }, [activeTab]);

    return (
        <div ref={containerRef} className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-ink uppercase tracking-tight mb-2">Admin Settings</h1>
                <p className="text-secondary text-sm">Configure system preferences and admin profile.</p>
            </div>

            {/* Quick Tabs */}
            <div className="flex gap-4 border-b border-secondary/10 pb-1 overflow-x-auto">
                {['general', 'system', 'notifications', 'appearance'].map(tab => (
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
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4">Admin Profile</h3>
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-ink text-white flex items-center justify-center font-bold text-xl">
                                        {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-ink">{profile.name || 'Admin User'}</p>
                                        <p className="text-xs text-secondary">{profile.role || 'Admin'}</p>
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

                    {/* --- SYSTEM SETTINGS --- */}
                    {activeTab === 'system' && (
                        <div className="space-y-8">
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4 flex items-center gap-2">
                                    <Monitor className="w-4 h-4" /> Global Configurations
                                </h3>

                                <div className="space-y-4">
                                    {/* Maintenance Mode */}
                                    <div className="flex items-center justify-between p-3 border border-secondary/10 rounded bg-secondary/5">
                                        <div className="flex gap-3">
                                            <div className="mt-1"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>
                                            <div>
                                                <p className="text-sm font-bold text-ink">Maintenance Mode</p>
                                                <p className="text-[10px] text-secondary">Disable all user bookings. Only Admins can access.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSystemToggle('maintenanceMode')}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${systemSettings.maintenanceMode ? 'bg-amber-500' : 'bg-stone-300'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-paper rounded-full transition-all ${systemSettings.maintenanceMode ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {/* Allow Bookings */}
                                    <div className="flex items-center justify-between p-3">
                                        <div>
                                            <p className="text-sm font-bold text-ink">Allow New Bookings</p>
                                            <p className="text-[10px] text-secondary">Users can submit new requests.</p>
                                        </div>
                                        <button
                                            onClick={() => handleSystemToggle('allowNewBookings')}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${systemSettings.allowNewBookings ? 'bg-emerald-500' : 'bg-stone-300'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-paper rounded-full transition-all ${systemSettings.allowNewBookings ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-secondary/10">
                                        <label className="block text-[10px] font-bold text-secondary uppercase mb-2">Maximum Session Duration (Hours)</label>
                                        <input
                                            type="number"
                                            value={systemSettings.maxBookingDuration}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, maxBookingDuration: parseInt(e.target.value) })}
                                            className="w-full bg-paper border border-secondary/20 rounded p-2 text-sm text-ink max-w-[100px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- NOTIFICATIONS --- */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-8">
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4">Alert Preferences</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-ink">Email Alerts for New Requests</span>
                                        <input type="checkbox" checked={notifPrefs.emailAlerts} onChange={() => setNotifPrefs({ ...notifPrefs, emailAlerts: !notifPrefs.emailAlerts })} className="accent-primary" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-ink">Daily Summary Report</span>
                                        <input type="checkbox" checked={notifPrefs.dailyDigest} onChange={() => setNotifPrefs({ ...notifPrefs, dailyDigest: !notifPrefs.dailyDigest })} className="accent-primary" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-ink">Urgent Maintenance SMS</span>
                                        <input type="checkbox" checked={notifPrefs.urgentSMS} onChange={() => setNotifPrefs({ ...notifPrefs, urgentSMS: !notifPrefs.urgentSMS })} className="accent-primary" />
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
                                        className={`p-4 border-2 rounded-lg text-left transition-all relative overflow-hidden flex-shrink-0 ${appearance.theme === 'latte' ? 'border-primary bg-paper' : 'border-secondary/20 hover:border-secondary/50'} `}
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

                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4 flex items-center gap-2">
                                    <Layout className="w-4 h-4" /> Layout Density
                                </h3>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="density"
                                            value="comfortable"
                                            checked={appearance.density === 'comfortable'}
                                            onChange={() => setAppearance({ ...appearance, density: 'comfortable' })}
                                            className="accent-primary"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors">Comfortable</p>
                                            <p className="text-[10px] text-secondary">Standard spacing for readability.</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="density"
                                            value="compact"
                                            checked={appearance.density === 'compact'}
                                            onChange={() => setAppearance({ ...appearance, density: 'compact' })}
                                            className="accent-primary"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-ink group-hover:text-primary transition-colors">Compact</p>
                                            <p className="text-[10px] text-secondary">Show more data at once.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Sidebar Summary */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-paper border border-secondary/20 p-6 rounded-lg shadow-lg sticky top-8">
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">System Status</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-secondary">Status:</span>
                                <span className="font-bold text-emerald-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Operational</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-secondary">Version:</span>
                                <span className="font-mono text-ink">v1.2.0</span>
                            </div>
                        </div>

                        <button onClick={handleSaveConfig} className="w-full bg-primary text-paper py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-ink hover:text-paper transition-all flex items-center justify-center gap-2 group">
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

export default AdminSettings;
