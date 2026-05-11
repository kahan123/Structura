import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2, AlertTriangle, Wrench, ArrowRight, Activity, Database } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const AutomationPipelineSection = () => {
    const sectionRef = useRef(null);
    const pathRef = useRef(null);
    const glowPathRef = useRef(null);
    const packetRef = useRef(null);
    const packetGlowRef = useRef(null);

    const nodesRef = useRef([]);
    const cardsRef = useRef([]);

    const [isMobile, setIsMobile] = React.useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current = cardsRef.current.slice(0, 3);
            nodesRef.current = nodesRef.current.slice(0, 3);

            gsap.set(cardsRef.current, { opacity: 0, y: 30, scale: 0.95 });
            gsap.set(nodesRef.current, { scale: 1, fill: "#1a1a1a", strokeWidth: 2 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=3000",
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1
                }
            });

            if (pathRef.current) {
                const pathLength = pathRef.current.getTotalLength();

                gsap.set([pathRef.current, glowPathRef.current], {
                    strokeDasharray: pathLength,
                    strokeDashoffset: pathLength
                });

                tl.to([pathRef.current, glowPathRef.current], {
                    strokeDashoffset: 0,
                    duration: 10,
                    ease: "none"
                });

                tl.to(nodesRef.current[0], {
                    scale: isMobile ? 1 : 1.5,
                    fill: "#10b981", stroke: "#34d399", strokeWidth: 4, duration: 0.5
                }, 1)
                    .to(cardsRef.current[0], {
                        opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)"
                    }, 1);

                tl.fromTo(nodesRef.current[1],
                    { scale: 1, fill: "#1a1a1a", strokeWidth: 2 },
                    { scale: isMobile ? 1 : 1.5, fill: "#f59e0b", stroke: "#fbbf24", strokeWidth: 4, duration: 0.5, immediateRender: false },
                    5
                )
                    .fromTo(cardsRef.current[1],
                        { opacity: 0, y: 30, scale: 0.95 },
                        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)", immediateRender: false },
                        5
                    );

                tl.fromTo(nodesRef.current[2],
                    { scale: 1, fill: "#1a1a1a", strokeWidth: 2 },
                    { scale: isMobile ? 1 : 1.5, fill: "#3b82f6", stroke: "#60a5fa", strokeWidth: 4, duration: 0.5, immediateRender: false },
                    9
                )
                    .fromTo(cardsRef.current[2],
                        { opacity: 0, y: 30, scale: 0.95 },
                        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)", immediateRender: false },
                        9
                    );
            }

        }, sectionRef);

        return () => ctx.revert();
    }, [isMobile]);

    const desktopPath = "M 50,200 L 250,200 L 300,150 L 700,150 L 750,200 L 950,200";
    const mobilePath = "M 200,0 L 200,150 L 250,200 L 250,500 L 200,550 L 200,900";

    const activePath = isMobile ? mobilePath : desktopPath;
    const viewBox = isMobile ? "0 0 400 800" : "0 0 1000 400";

    const nodes = isMobile
        ? [{ x: 200, y: 150 }, { x: 250, y: 500 }, { x: 200, y: 800 }]
        : [{ x: 150, y: 200 }, { x: 500, y: 150 }, { x: 850, y: 200 }];

    return (
        <section
            id="analytics"
            ref={sectionRef}
            className="w-full h-screen pt-24 bg-[#050505] flex flex-col items-center justify-start relative overflow-hidden font-sans selection:bg-green-500/30"
        >

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

                {/* Context-Aware HUD Text */}
                <div className="absolute top-10 left-10 font-mono text-[10px] text-white/20">
                    <div>ZONE: BLOCK-A // CAMPUS_MAP</div>
                    <div>MODE: AUTO_PILOT</div>
                </div>
                <div className="absolute top-10 right-10 font-mono text-[10px] text-white/20 text-right">
                    <div>RESOURCES: SYNCED</div>
                    <div>PING: 12ms</div>
                </div>
                <div className="absolute bottom-10 left-10 font-mono text-[10px] text-white/20">
                    <div>SECURE LINK</div>
                    <div className="text-green-500/50">ENCRYPTED</div>
                </div>
            </div>

            <div className="relative text-center z-10 w-full px-4 mb-2 md:mb-[-50px]">
                <h2 className="text-4xl md:text-7xl font-light text-white mb-4 md:mb-6 tracking-tight">
                    Automated <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 font-normal">Lifecycle</span> Loops.
                </h2>
                <p className="text-white/50 text-sm md:text-lg max-w-xl mx-auto font-light leading-relaxed">
                    A self-correcting ecosystem. System <span className="text-white font-medium">instantaneously dispatches</span> teams.
                </p>
            </div>

            <div className={`relative w-full ${isMobile ? 'h-[80%]' : 'h-[60%]'} max-w-7xl mx-auto flex items-center justify-center`}>

                <svg
                    viewBox={viewBox}
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full absolute inset-0 overflow-visible z-0"
                >
                    <defs>
                        <linearGradient id="lineMainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <filter id="glow-heavy" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Richer Dark Blue-Grey Background Trace */}
                    <path
                        d={activePath}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth={isMobile ? "8" : "12"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <path
                        d={activePath}
                        fill="none"
                        stroke="#2a2a2a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="4 20"
                        className="animate-[dash_20s_linear_infinite]"
                    >
                        <style>{`
                            @keyframes dash {
                                to { stroke-dashoffset: -1000; }
                            }
                        `}</style>
                    </path>

                    <path
                        ref={glowPathRef}
                        d={activePath}
                        fill="none"
                        stroke="url(#lineMainGradient)"
                        strokeWidth={isMobile ? "4" : "6"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow-heavy)"
                        className="opacity-60 blur-[3px]"
                    />
                    <path
                        ref={pathRef}
                        d={activePath}
                        fill="none"
                        stroke="url(#lineMainGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {nodes.map((n, i) => (
                        <circle
                            key={i}
                            cx={n.x}
                            cy={n.y}
                            r={isMobile ? "8" : "12"}
                            ref={el => nodesRef.current[i] = el}
                            fill="#0a0a0a"
                            stroke="#333"
                            strokeWidth="2"
                        />
                    ))}
                </svg>


                <div
                    ref={el => cardsRef.current[0] = el}
                    className={`absolute ${isMobile ? 'left-1/2 top-[15%]' : 'left-[15%] top-[65%]'} -translate-x-1/2 w-80 scale-90 md:scale-100`}
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-green-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-[#0d0d0d]/90 border border-white/10 p-5 rounded-xl backdrop-blur-xl shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-transparent opacity-50" />
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-mono text-green-500 mb-1">REQ-ID: #99281</span>
                                    <h3 className="text-white font-medium text-lg">Booking Ends</h3>
                                </div>
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                                    <CheckCircle2 size={20} />
                                </div>
                            </div>
                        </div>
                        <div className={`absolute ${isMobile ? 'hidden' : '-top-10 left-1/2 h-10 w-px'} bg-gradient-to-b from-green-500/50 to-transparent -translate-x-1/2`} />
                    </div>
                </div>

                <div
                    ref={el => cardsRef.current[1] = el}
                    className={`absolute ${isMobile ? 'left-1/2 top-[45%]' : 'left-[50%] top-[65%]'} -translate-x-1/2 w-80 z-20 scale-90 md:scale-100`}
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-[#0d0d0d]/90 border border-amber-500/30 p-6 rounded-xl backdrop-blur-xl shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
                            <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider z-10">
                                Auto-Dispatch
                            </div>
                            <div className="flex items-center gap-3 mb-2 mt-2 text-left">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-amber-500 block">SYS_ALERT_Lvl_3</span>
                                    <h3 className="text-white font-medium text-lg">Maintenance</h3>
                                </div>
                            </div>
                        </div>
                        <div className={`absolute ${isMobile ? 'hidden' : '-top-24 left-1/2 h-24 w-px'} bg-gradient-to-b from-amber-500/50 to-transparent -translate-x-1/2`} />
                    </div>
                </div>

                <div
                    ref={el => cardsRef.current[2] = el}
                    className={`absolute ${isMobile ? 'left-1/2 top-[75%]' : 'left-[85%] top-[65%]'} -translate-x-1/2 w-80 scale-90 md:scale-100`}
                >
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-[#0d0d0d]/90 border border-white/10 p-5 rounded-xl backdrop-blur-xl shadow-2xl overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-blue-500 to-transparent opacity-50" />
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex flex-col text-left">
                                    <span className="text-[10px] font-mono text-blue-500 mb-1">DB_UPDATE: OK</span>
                                    <h3 className="text-white font-medium text-lg">Ready</h3>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <Database size={20} />
                                </div>
                            </div>
                        </div>
                        <div className={`absolute ${isMobile ? 'hidden' : '-top-10 left-1/2 h-10 w-px'} bg-gradient-to-b from-blue-500/50 to-transparent -translate-x-1/2`} />
                    </div>
                </div>

            </div>

            <div className={`absolute ${isMobile ? 'bottom-20' : 'bottom-10'} left-0 w-full flex justify-center opacity-100`}>
                <div className="flex items-center gap-4 md:gap-8 text-[10px] font-mono uppercase tracking-widest text-white bg-white/5 px-6 py-2 rounded-full border border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> <span className="hidden md:inline">Input</span>
                    </div>
                    <ArrowRight size={10} />
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> <span className="hidden md:inline">Logic</span>
                    </div>
                    <ArrowRight size={10} />
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> <span className="hidden md:inline">Output</span>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default AutomationPipelineSection;