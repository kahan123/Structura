import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Armchair, Server, FileText, User, CheckCircle2, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ArchitecturalAssemblySection = () => {
    const sectionRef = useRef(null);
    const containerRef = useRef(null);
    const logoRef = useRef(null);
    const buttonRef = useRef(null);
    const progressRef = useRef(null);
    const vignetteRef = useRef(null);
    const enterButtonRef = useRef(null);
    const successRef = useRef(null);

    const wireframesRef = useRef([]);

    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const holdAnimationRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            wireframesRef.current = wireframesRef.current.slice(0, 4);

            gsap.set(wireframesRef.current, { opacity: 0 });
            gsap.set(logoRef.current, { scale: 0, opacity: 0 });
            gsap.set(buttonRef.current, { y: 50, opacity: 0 });
            
            // Hide success message initially
            if (successRef.current) {
                gsap.set(successRef.current, { opacity: 0, y: 20 });
            }

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: isMobile ? "top 20%" : "top center",
                    end: "center center",
                    scrub: 1,
                }
            });

            const dist = isMobile ? 100 : 500;

            tl.fromTo(wireframesRef.current[0],
                { x: -dist, y: -dist, opacity: 0, scale: 2 },
                { x: -50, y: -50, opacity: 1, scale: 1, duration: 2, ease: "power2.out" },
                0
            );
            tl.fromTo(wireframesRef.current[1],
                { x: dist, y: -dist, opacity: 0, scale: 2 },
                { x: 50, y: -50, opacity: 1, scale: 1, duration: 2, ease: "power2.out" },
                0
            );
            tl.fromTo(wireframesRef.current[2],
                { x: -dist, y: dist, opacity: 0, scale: 2 },
                { x: -50, y: 50, opacity: 1, scale: 1, duration: 2, ease: "power2.out" },
                0
            );
            tl.fromTo(wireframesRef.current[3],
                { x: dist, y: dist, opacity: 0, scale: 2 },
                { x: 50, y: 50, opacity: 1, scale: 1, duration: 2, ease: "power2.out" },
                0
            );

            tl.to(wireframesRef.current, {
                scale: 0.1,
                opacity: 0,
                duration: 1,
                stagger: 0.1
            }, 2);

            tl.to(logoRef.current, {
                scale: 1,
                opacity: 1,
                duration: 1.5,
                ease: "elastic.out(1, 0.3)"
            }, 2.5);

            tl.to(".logo-path", {
                strokeDashoffset: 0,
                duration: 2,
                ease: "power2.inOut"
            }, 3);

            tl.to(logoRef.current, {
                y: -50,
                duration: 1
            }, 4);

            tl.to(buttonRef.current, {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "back.out(1.7)"
            }, 4.2);


        }, sectionRef);

        return () => ctx.revert();
    }, [isMobile]);

    const startHold = () => {
        if (isComplete) return;
        setIsHolding(true);

        if (holdAnimationRef.current) holdAnimationRef.current.kill();

        holdAnimationRef.current = gsap.to({ p: progress }, {
            p: 100,
            duration: 2 * (1 - progress / 100),
            ease: "none",
            onUpdate: function () {
                const prog = this.targets()[0].p;
                setProgress(prog);

                if (progressRef.current) {
                    gsap.set(progressRef.current, {
                        strokeDashoffset: 302 * (1 - (prog / 100))
                    });
                }
                
                if (enterButtonRef.current) {
                    gsap.set(enterButtonRef.current, {
                        clipPath: `inset(0 ${100 - prog}% 0 0)`
                    });
                }
            },
            onComplete: () => {
                setIsComplete(true);
                handleInitializationComplete();
            }
        });
    };

    const stopHold = () => {
        if (isComplete) return;
        setIsHolding(false);

        if (holdAnimationRef.current) holdAnimationRef.current.kill();

        holdAnimationRef.current = gsap.to({ p: progress }, {
            p: 0,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: function () {
                const prog = this.targets()[0].p;
                setProgress(prog);

                if (progressRef.current) {
                    gsap.set(progressRef.current, {
                        strokeDashoffset: 302 * (1 - (prog / 100))
                    });
                }

                if (enterButtonRef.current) {
                    gsap.set(enterButtonRef.current, {
                        clipPath: `inset(0 ${100 - prog}% 0 0)`
                    });
                }
            }
        });
    };

    const handleInitializationComplete = () => {
        const tl = gsap.timeline();

        tl.to(enterButtonRef.current, {
            scale: 1.05,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
    };

    return (
        <section
            id="support"
            ref={sectionRef}
            className="w-full h-[150vh] bg-[#0b0f15] relative flex flex-col items-center justify-end pb-20 overflow-hidden font-sans selection:bg-cyan-500/30"
        >

            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:10px_10px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-30" />
            </div>

            <div ref={vignetteRef} className="absolute inset-0 bg-black opacity-0 pointer-events-none z-50 transition-colors" />

            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-0">
                <div ref={el => wireframesRef.current[0] = el} className="absolute text-cyan-500/30"><Armchair size={80} strokeWidth={1} /></div>
                <div ref={el => wireframesRef.current[1] = el} className="absolute text-cyan-500/30"><Server size={80} strokeWidth={1} /></div>
                <div ref={el => wireframesRef.current[2] = el} className="absolute text-cyan-500/30"><FileText size={80} strokeWidth={1} /></div>
                <div ref={el => wireframesRef.current[3] = el} className="absolute text-cyan-500/30"><User size={80} strokeWidth={1} /></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center mb-[20vh]">

                <div ref={logoRef} className="relative mb-12 transform-gpu">
                    <svg width="200" height="200" viewBox="0 0 100 100" className="drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                        <defs>
                            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M 50 10 L 90 30 L 90 70 L 50 90 L 10 70 L 10 30 Z M 50 10 L 50 50 M 50 50 L 90 30 M 50 50 L 10 30"
                            fill="none"
                            stroke="url(#neonGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="logo-path"
                            strokeDasharray="400"
                            strokeDashoffset="400"
                        />
                    </svg>
                </div>

                <div className="text-center mb-10 max-w-2xl px-6">
                    <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tighter">
                        Built for <span className="text-cyan-400">Transparency</span>.
                    </h2>
                    <p className="text-slate-400 text-lg font-light leading-relaxed">
                        From the ground floor to the cloud. One system to synchronize your entire campus infrastructure.
                    </p>
                </div>

                <div ref={buttonRef} className="relative group pointer-events-auto flex flex-col items-center justify-center">
                    <svg
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 -rotate-90 pointer-events-none"
                        viewBox="0 0 192 192"
                    >
                        <circle
                            cx="96" cy="96" r="48"
                            stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"
                        />
                        <circle
                            ref={progressRef}
                            cx="96" cy="96" r="48"
                            stroke="#22d3ee" strokeWidth="4" fill="none"
                            strokeDasharray="302"
                            strokeDashoffset="302"
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-none"
                        />
                    </svg>

                    <button
                        onMouseDown={startHold}
                        onMouseUp={stopHold}
                        onMouseLeave={stopHold}
                        onTouchStart={startHold}
                        onTouchEnd={stopHold}
                        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isHolding ? 'scale-95 bg-cyan-500/20 border-cyan-500/50' : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30'} border backdrop-blur-md shadow-2xl group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] cursor-pointer`}
                    >
                        <div className={`w-3 h-3 rounded-sm ${isComplete ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]' : 'bg-white/80'} transition-all duration-300`} />
                    </button>

                    <div className="mt-8 text-center absolute top-[120%] w-max">
                        <span className="text-[10px] md:text-xs font-mono tracking-[0.2em] text-cyan-500/80 uppercase group-hover:text-cyan-400 transition-colors">
                            {isComplete ? 'INITIALIZED' : 'Hold to Initialize'}
                        </span>
                    </div>
                </div>

                {/* The "Building" Platform Button */}
                <div className="mt-20 pointer-events-auto h-14 w-64 relative flex items-center justify-center">
                    
                    {/* Filled Action Button */}
                    <a 
                        ref={enterButtonRef}
                        href={isComplete ? "/login" : "#"}
                        onClick={(e) => { if(!isComplete) e.preventDefault(); }}
                        className={`absolute inset-0 bg-cyan-500 text-black font-bold text-sm tracking-widest uppercase rounded-full shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-3 overflow-hidden ${isComplete ? 'hover:bg-cyan-400 cursor-pointer' : 'cursor-default pointer-events-none'}`}
                        style={{ clipPath: 'inset(0 100% 0 0)' }}
                    >
                        Enter Platform <ArrowRight size={18} />
                    </a>
                </div>

            </div>

            {/* Gradient Fade Footer */}
            <div className="absolute bottom-0 w-full border-t border-slate-800/50 bg-gradient-to-t from-[#0b0f15] via-[#0b0f15]/90 to-transparent p-4 z-20">
                <div className="container mx-auto flex flex-wrap justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-slate-500">

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            System Status: Online
                        </div>
                        <div className="flex items-center gap-2 hidden md:flex">
                            <CheckCircle2 size={12} className="text-cyan-500" />
                            Database: Connected
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <span>Latency: 12ms</span>
                        <span className="text-slate-700">|</span>
                        <span>v2.4.0-build</span>
                    </div>

                </div>
            </div>

        </section>
    );
};

export default ArchitecturalAssemblySection;