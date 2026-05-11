import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import axios from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const navigate = useNavigate();
    const { registerUser } = useSocket();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Clean up any stale sessions on mount
    useEffect(() => {
        localStorage.removeItem('userInfo');
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const dbToDisplayRole = (dbRole) => {
        if (dbRole === 'Student') return 'User';
        if (dbRole === 'Maintenance') return 'Maintenance';
        return dbRole; // 'Admin'
    };

    const displayToDbRole = (displayRole) => {
        if (displayRole === 'User') return 'Student';
        if (displayRole === 'Maintenance') return 'Maintenance';
        return displayRole; // 'Admin'
    };

    const handleRoleChange = (displayRole) => {
        setFormData({ ...formData, role: displayToDbRole(displayRole) });
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const url = isLogin
            ? '/api/auth/login'
            : '/api/auth/signup';

        try {
            const { data } = await axios.post(url, formData);
            localStorage.setItem('userInfo', JSON.stringify(data));
            console.log('Auth Success:', data);

            // Register socket immediately
            registerUser(data);

            // Redirect based on role (case-insensitive check)
            const roleStr = (data.role || '').toLowerCase();
            if (roleStr === 'admin') {
                navigate('/admin');
            } else if (roleStr === 'maintenance') {
                navigate('/maintenance');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Measure container for dynamic SVG border
    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        const resizeObserver = new ResizeObserver(() => updateDimensions());
        resizeObserver.observe(containerRef.current);

        // Initial measure
        updateDimensions();

        return () => resizeObserver.disconnect();
    }, []);

    // Parallax Effect for Background
    const bgRef = useRef(null);
    useGSAP(() => {
        const handleMouseMove = (e) => {
            if (!bgRef.current) return;
            const x = (e.clientX / window.innerWidth - 0.5) * 20; // Move up to 20px
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            gsap.to(bgRef.current, { x, y, duration: 1, ease: 'power2.out' });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Sketch Animation: Triggers on Load, Toggle, or Dimension Change
    useGSAP(() => {
        if (dimensions.width === 0) return; // Wait for measurements

        const tl = gsap.timeline();

        // 1. Draw the container border
        // Reset stroke state first to ensure re-playability
        tl.fromTo(".rough-border-path",
            { strokeDasharray: 2500, strokeDashoffset: 2500, opacity: 0 },
            { strokeDashoffset: 0, opacity: 1, duration: 1.5, ease: "power2.inOut" }
        )
            // 2. Fade in content and sketch inputs staggeredly
            .fromTo(".login-content",
                { opacity: 0 },
                { opacity: 1, duration: 0.5 },
                "-=0.8"
            )
            .fromTo(".sketch-input-line",
                { scaleX: 0 },
                { scaleX: 1, duration: 0.6, stagger: 0.1, ease: "rough({ template: power1.inOut, strength: 1, points: 20, taper: 'none', randomize: true, clamp: false})" },
                "-=0.4"
            );

    }, [isLogin, dimensions.width, dimensions.height]); // Re-run when mode or size changes

    // Generate Dynamic Path with Top-Left Gap
    const w = dimensions.width;
    const h = dimensions.height;
    // Start 40px from top-left (gap), go right -> down -> left -> up -> stop 10px from top (gap)
    const borderPath = w > 0 ?
        `M 40 2 L ${w - 5} 2 Q ${w} 2 ${w} 7 L ${w} ${h - 5} Q ${w} ${h} ${w - 5} ${h} L 5 ${h} Q 0 ${h} 0 ${h - 5} L 0 40`
        : "";

    return (
        <div className="min-h-screen flex items-center justify-center bg-paper relative overflow-hidden font-mono selection:bg-secondary/30">

            {/* SVG Filter for "Rough" Look */}
            <svg className="absolute w-0 h-0">
                <defs>
                    <filter id="roughpaper">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                    </filter>
                </defs>
            </svg>

            {/* Parallax Background Grid */}
            <div ref={bgRef} className="absolute inset-[-5%] w-[110%] h-[110%] pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(#78716c 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Main Sketch Container */}
            <div ref={containerRef} className={`relative w-full max-w-md ${isLogin ? 'p-8' : 'p-8'} z-10 mx-6 transition-all duration-300`}>

                {/* Hand-Drawn Border SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ filter: 'url(#roughpaper)' }}>
                    {/* Path replaces Rect to create a deliberate "Open Corner" gap at Top-Left */}
                    <path
                        d={borderPath}
                        fill="none"
                        stroke="#78716c" /* Secondary Stone */
                        strokeWidth="2"
                        className="rough-border-path"
                    />
                </svg>

                {/* Content */}
                <div className="login-content relative">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-ink mb-1 uppercase tracking-widest" style={{ fontFamily: 'Courier New, monospace' }}>
                            {isLogin ? "Access Portal" : "New Blueprint"}
                        </h1>
                        <p className="text-secondary text-[10px] tracking-wide">
                            {isLogin ? "// ENTER CREDENTIALS TO PROCEED" : "// INITIALIZE USER PROTOCOL"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 text-red-600 text-xs text-center uppercase tracking-widest font-bold">
                            // ERROR: {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleAuth}>

                        {!isLogin && (
                            <SketchInput
                                label="Full Designation"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                            />
                        )}

                        <SketchInput
                            label="Digital ID (Email)"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@university.edu"
                        />

                        <div className="space-y-1">
                            <SketchInput
                                label="Secret Key"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                            {isLogin && (
                                <div className="text-right">
                                    <a href="#" className="text-[10px] text-primary hover:text-accent uppercase tracking-wider before:content-['['] after:content-[']'] hover:before:mr-1 hover:after:ml-1 transition-all">
                                        Reset Key
                                    </a>
                                </div>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="pt-1">
                                <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Clearance Level</label>
                                <RoleToggle selected={dbToDisplayRole(formData.role)} onSelect={handleRoleChange} />
                            </div>
                        )}

                        {/* Action Button: "Stamped" look */}
                        <button type="submit" disabled={loading} className="w-full group relative bg-ink text-paper font-bold py-2.5 px-6 mt-2 overflow-hidden shadow-lg transition-transform active:scale-95 disabled:opacity-50">
                            <span className="relative z-10 tracking-[0.2em] uppercase text-xs">
                                {loading ? "Processing..." : (isLogin ? "Authenticate" : "Register")}
                            </span>
                            {/* Hover "Ink Fill" Effect */}
                            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                        </button>

                        {/* Social Divider */}
                        <div className="relative flex py-3 items-center">
                            <div className="flex-grow border-t border-secondary/20 border-dashed"></div>
                            <span className="flex-shrink-0 mx-3 text-secondary text-[9px] uppercase">Or Link With</span>
                            <div className="flex-grow border-t border-secondary/20 border-dashed"></div>
                        </div>

                        <button type="button" className="w-full border border-secondary/30 text-ink text-[10px] font-bold py-2.5 uppercase tracking-widest hover:bg-white/40 transition-colors flex items-center justify-center gap-3">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-3.5 h-3.5 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
                            Google Systems
                        </button>

                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline decoration-wavy underline-offset-4"
                        >
                            {isLogin ? "[ Create New Account ]" : "[ Return to Login ]"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sketchy Input Component
const SketchInput = ({ label, type, placeholder, name, value, onChange }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className="group relative">
            <label className="block text-xs font-bold text-secondary uppercase tracking-widest mb-1 transition-colors group-focus-within:text-ink">
                {label}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent py-2 px-1 text-ink font-mono text-sm outline-none placeholder:text-secondary/30 pr-8"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {/* The "Sketch" Line */}
            <div className="sketch-input-line absolute bottom-0 left-0 w-full h-[2px] bg-secondary/30 origin-left" />
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 ease-in-out origin-left" style={{ filter: 'url(#roughpaper)' }} />
        </div>
    );
};

// Wooden Toggle Switch
const RoleToggle = ({ selected, onSelect }) => {
    const options = ['User', 'Admin', 'Maintenance'];
    const toggleRef = useRef(null);

    // Initial position based on selected prop
    useEffect(() => {
        const index = options.indexOf(selected);
        if (toggleRef.current) {
            gsap.to(toggleRef.current, {
                x: index * 100 + '%',
                duration: 1.2,
                ease: "elastic.out(1, 0.5)"
            });
        }
    }, [selected]);


    return (
        <div className="relative flex bg-secondary/10 p-1 rounded-sm overflow-hidden" style={{ filter: 'url(#roughpaper)' }}>
            {/* The Puck (Indicator) */}
            <div
                ref={toggleRef}
                className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] z-0 p-[2px]"
            >
                <div className="w-full h-full bg-paper border border-secondary/20 shadow-sm rounded-sm" />
            </div>

            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={(e) => { e.preventDefault(); onSelect(opt); }}
                    className={`flex-1 relative z-10 py-2 text-[10px] font-bold uppercase tracking-wider text-center transition-colors duration-300 ${selected === opt ? 'text-primary' : 'text-secondary'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
};

export default Login;
