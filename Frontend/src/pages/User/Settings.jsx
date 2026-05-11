import React, { useState, useEffect } from 'react';
import { User, Bell, Save, Moon, Sun, Smartphone, Mail, Lock, Camera, Layout } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import axios from '../../api/axiosConfig';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import CustomAlert from '../../components/CustomAlert';

const Settings = () => {
    // ----- State -----
    const [activeTab, setActiveTab] = useState('general');

    // Theme Context
    const { appearance, setAppearance } = useTheme();

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        studentId: '',
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
        inApp: true,
        email: true,
        triggers: {
            approval: true,
            reminder: true,
            chat: true
        }
    });

    // Load actual profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/api/auth/profile');
                setProfile({
                    name: data.name || '',
                    studentId: data.studentId || '',
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

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNotifToggle = (key, subKey = null) => {
        if (subKey) {
            setNotifPrefs(prev => ({
                ...prev,
                triggers: { ...prev.triggers, [subKey]: !prev.triggers[subKey] }
            }));
        } else {
            setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
        }
    };

    const handleSaveChanges = async () => {
        try {
            const { data } = await axios.put('/api/auth/profile', {
                phone: profile.phone,
                studentId: profile.studentId,
            });
            // Update localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo) {
                userInfo.phone = data.phone;
                userInfo.studentId = data.studentId;
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
                <p className="text-secondary text-sm">Manage your profile, preferences, and account security.</p>
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
                            {/* Avatar Section */}
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-full bg-ink text-white flex items-center justify-center font-bold text-2xl overflow-hidden ring-4 ring-secondary/5">
                                        {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U')}
                                    </div>
                                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                        <Camera className="w-6 h-6" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="font-bold text-ink text-sm uppercase mb-1">Profile Photo</h3>
                                    <p className="text-xs text-secondary mb-3">Upload a photo to be recognized by admin.</p>
                                    <div className="flex gap-2">
                                        <button className="text-[10px] bg-secondary/10 hover:bg-secondary/20 text-ink px-3 py-1.5 rounded font-bold uppercase transition-colors">Remove</button>
                                    </div>
                                </div>
                            </div>

                            {/* Info Form */}
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm space-y-4">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4">Contact Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Full Name</label>
                                        <input type="text" name="name" value={profile.name} readOnly className="w-full bg-secondary/5 border border-secondary/10 rounded p-2 text-sm text-secondary/70 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Student ID</label>
                                        <input type="text" value={profile.studentId} readOnly className="w-full bg-secondary/5 border border-secondary/10 rounded p-2 text-sm text-secondary/70 cursor-not-allowed" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-secondary uppercase mb-1">University Email</label>
                                        <input type="email" value={profile.email} readOnly className="w-full bg-secondary/5 border border-secondary/10 rounded p-2 text-sm text-secondary/70 cursor-not-allowed" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Phone Number (For Support)</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profile.phone}
                                            onChange={handleProfileChange}
                                            className="w-full bg-paper border border-secondary/20 rounded p-2 text-sm text-ink focus:border-primary focus:outline-none"
                                        />
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

                    {/* --- NOTIFICATION SETTINGS --- */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-8">
                            {/* Channels */}
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4">Channels</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-secondary/5 rounded-full"><Smartphone className="w-4 h-4 text-secondary" /></div>
                                            <div>
                                                <p className="text-sm font-bold text-ink">In-App Notifications</p>
                                                <p className="text-[10px] text-secondary">Receive alerts via the bell icon.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleNotifToggle('inApp')}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${notifPrefs.inApp ? 'bg-primary' : 'bg-stone-300'} `}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-paper rounded-full transition-all ${notifPrefs.inApp ? 'left-6' : 'left-1'} `} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-secondary/5 rounded-full"><Mail className="w-4 h-4 text-secondary" /></div>
                                            <div>
                                                <p className="text-sm font-bold text-ink">Email Notifications</p>
                                                <p className="text-[10px] text-secondary">Receive updates to {profile.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleNotifToggle('email')}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${notifPrefs.email ? 'bg-primary' : 'bg-stone-300'} `}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-paper rounded-full transition-all ${notifPrefs.email ? 'left-6' : 'left-1'} `} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Triggers */}
                            <div className="settings-block opacity-0 bg-paper p-6 rounded-lg border border-secondary/10 shadow-sm">
                                <h3 className="font-bold text-ink text-sm uppercase border-b border-secondary/5 pb-2 mb-4">Triggers</h3>
                                <div className="space-y-3">
                                    {[
                                        { key: 'approval', label: 'Booking Status Updates', desc: 'When your request is approved or rejected.' },
                                        { key: 'reminder', label: 'Booking Reminders', desc: '15 minutes before your session starts.' },
                                        { key: 'chat', label: 'Chat Messages', desc: 'When you receive a new message from support.' },
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center justify-between p-2 hover:bg-secondary/5 rounded transition-colors">
                                            <div>
                                                <p className="text-xs font-bold text-ink">{item.label}</p>
                                                <p className="text-[10px] text-secondary">{item.desc}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifPrefs.triggers[item.key]}
                                                onChange={() => handleNotifToggle(null, item.key)}
                                                className="accent-primary"
                                            />
                                        </div>
                                    ))}
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
                <div className="md:col-span-1 space-y-4 settings-block opacity-0">
                    <div className="bg-paper border border-secondary/20 p-6 rounded-lg shadow-lg sticky top-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-paper/10 flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-paper/20">
                                {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U')}
                            </div>
                            <div>
                                <p className="font-bold text-ink text-sm">{profile.name || 'User'}</p>
                                <p className="text-[10px] text-secondary">{profile.studentId || 'No ID'}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <p className="text-[9px] font-bold uppercase text-secondary mb-1">Theme</p>
                                <p className="text-xs font-bold capitalize flex items-center gap-2">
                                    {appearance.theme === 'latte' && <Sun className="w-3 h-3" />}
                                    {appearance.theme === 'midnight' && <Moon className="w-3 h-3" />}
                                    {appearance.theme}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase text-secondary mb-1">Notifications</p>
                                <p className="text-xs font-bold flex items-center gap-2">
                                    {notifPrefs.inApp ? <span className="text-emerald-400">Enabled</span> : <span className="text-red-400">Disabled</span>}
                                </p>
                            </div>
                        </div>

                        <button onClick={handleSaveChanges} className="w-full bg-primary text-paper py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-ink hover:text-paper transition-all flex items-center justify-center gap-2 group">
                            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Save Changes
                        </button>
                    </div>
                </div>

            </div>

            {/* Custom Premium Alert Dialog */}
            <CustomAlert {...alertConfig} />
        </div>
    );
};

// Helper component for icon check
const CheckCircle = () => (
    <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
    </div>
);

export default Settings;
