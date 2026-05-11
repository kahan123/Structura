import React, { useLayoutEffect, useRef } from 'react';
import { Activity, CheckCircle2, AlertOctagon, Building2, Database, ArrowRight, Layers, ShieldCheck, Globe, ChevronRight, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Overlay() {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {

            const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

            heroTimeline.fromTo(".hero-title-part",
                { y: 50, opacity: 0, rotationX: -20 },
                { y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.2, transformOrigin: '0% 50% -50' }
            )
                .fromTo(".hero-subtitle",
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8 },
                    "-=0.6"
                )
                .fromTo(".hero-button",
                    { scale: 0.9, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" },
                    "-=0.4"
                )
                .fromTo(".hero-feature",
                    { x: -20, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
                    "-=0.2"
                );

            gsap.fromTo(".glass-card",
                { opacity: 0, x: 50 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    stagger: 0.3,
                    scrollTrigger: {
                        trigger: "#problem-solution",
                        start: "top 70%",
                        toggleActions: "play none none reverse"
                    }
                }
            );

            gsap.fromTo(".contrast-card",
                { opacity: 0, x: 50 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: "#features",
                        start: "top 60%",
                        toggleActions: "play none none reverse"
                    }
                }
            );

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="w-full relative z-10 font-sans">

            {/* ==================== Section 1: Hero ==================== */}
            <section id="hero-section" className="h-[100vh] mb-30 pt-24 md:pt-32 w-full flex flex-col items-center justify-center p-6 md:p-10 pointer-events-none relative overflow-hidden">
                
                {/* Premium Noise Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

                <div className="mt-10 md:mt-20 text-center z-10 pointer-events-auto max-w-5xl space-y-6 md:space-y-8 relative">

                    {/* Tighter, Cleaner Backlight */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] bg-[#d97706]/30 blur-[40px] md:blur-[60px] rounded-full pointer-events-none" />

                    <h1 className="text-5xl md:text-8xl font-serif font-black tracking-tighter mb-4 leading-[1.0] md:leading-[0.9] text-[#292524] perspective-1000">
                        <span className="hero-title-part opacity-0 inline-block text-[#292524]">Centralized</span> <br />
                        {/* Added font-mono to bridge the gap to the dark sections */}
                        <span className="hero-title-part opacity-0 inline-block font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#d97706] via-[#b45309] to-[#d97706] animate-gradient bg-[length:200%_auto]">
                            Resource Management.
                        </span>
                    </h1>

                    <p className="hero-subtitle opacity-0 text-lg md:text-2xl font-light text-[#78716c] max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
                        A unified platform to manage shared resources like classrooms, labs, and auditoriums. Streamline utilization in one digital ecosystem.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center mt-8 md:mt-12">
                        <button className="hero-button opacity-0 relative group px-8 py-4 md:px-10 md:py-5 bg-[#292524] text-[#fcf6e6] font-bold rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[#d97706]/40 text-sm md:text-base">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#d97706] to-[#b45309] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />

                            <div className="relative flex items-center gap-3">
                                <span>Explore the System</span>
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </div>
                        </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 md:gap-12 pointer-events-auto text-[#78716c]/80 font-medium text-xs md:text-sm uppercase tracking-wide pt-6 md:pt-8 border-t border-[#78716c]/10 mt-6 md:mt-8">
                        <span className="hero-feature opacity-0 flex items-center gap-2"><CheckCircle2 size={14} className="text-green-600 md:w-4 md:h-4" /> Instant Booking</span>
                        <span className="hero-feature opacity-0 flex items-center gap-2"><CheckCircle2 size={14} className="text-green-600 md:w-4 md:h-4" /> Real-time Status</span>
                    </div>
                </div>
            </section>


            {/* ==================== Section 2: Problem vs Solution ==================== */}
            <section id="problem-solution" className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center md:justify-end p-6 md:p-20 pointer-events-none">
                <div className="w-full md:w-[500px] pointer-events-auto space-y-6 md:space-y-8 perspective-1000 mt-20 md:mt-0">

                    <div className="glass-card group relative bg-white/70 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_60px_-15px_rgba(239,68,68,0.2)] transition-all duration-500 hover:-translate-y-2 section-2-problem overflow-hidden w-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 to-red-600" />
                        <AlertOctagon className="absolute -right-6 -top-6 text-red-500/10 group-hover:rotate-12 transition-transform duration-700" size={100} strokeWidth={1} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-50 text-red-600 shadow-sm border border-red-100 shrink-0">
                                    <AlertOctagon size={20} className="md:w-6 md:h-6" />
                                </span>
                                <h2 className="text-xl md:text-2xl font-bold text-[#292524]">The Challenge</h2>
                            </div>
                            <p className="text-[#78716c] leading-relaxed text-sm md:text-base">
                                Managing resources manually leads to confusion, double bookings, and poor utilization of campus assets.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card group relative bg-[#fffbeb]/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-[#d97706]/20 shadow-[0_20px_40px_-15px_rgba(217,119,6,0.15)] hover:shadow-[0_40px_60px_-15px_rgba(217,119,6,0.25)] transition-all duration-500 hover:-translate-y-2 section-2-solution overflow-hidden w-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#d97706] to-[#b45309]" />
                        <CheckCircle2 className="absolute -right-6 -top-6 text-[#d97706]/10 group-hover:scale-110 transition-transform duration-700" size={100} strokeWidth={1} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-[#fff7ed] text-[#d97706] shadow-sm border border-[#fed7aa] shrink-0">
                                    <CheckCircle2 size={20} className="md:w-6 md:h-6" />
                                </span>
                                <h2 className="text-xl md:text-2xl font-bold text-[#292524]">The Solution</h2>
                            </div>
                            <p className="text-[#a16207] leading-relaxed font-medium text-sm md:text-base">
                                Digitizing the entire process ensures organization, transparency, and proper utilization of every asset.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card group relative bg-white/70 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_60px_-15px_rgba(37,99,235,0.2)] transition-all duration-500 hover:-translate-y-2 section-2-data overflow-hidden w-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-blue-600" />
                        <Database className="absolute -right-6 -top-6 text-blue-500/10 group-hover:translate-y-2 transition-transform duration-700" size={100} strokeWidth={1} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100 shrink-0">
                                    <Database size={20} className="md:w-6 md:h-6" />
                                </span>
                                <h2 className="text-xl md:text-2xl font-bold text-[#292524]">Building Data</h2>
                            </div>
                            <p className="text-[#78716c] leading-relaxed text-sm md:text-base">
                                The system tracks buildings by name, number, and total floors to link resources to specific locations.
                            </p>
                        </div>
                    </div>

                </div>
            </section>


            {/* ==================== Section 3: Booking Logic ==================== */}
            <section id="features" className="min-h-[200vh] md:h-[200vh] w-full flex flex-col items-center md:items-end justify-center p-6 md:p-20 pointer-events-none relative">

                <div className="pointer-events-auto w-full md:w-[500px] md:mr-10 relative flex flex-col space-y-4 md:space-y-6 mt-10 md:mt-0">

                    <div className="contrast-card group relative bg-[#1c1917] rounded-xl overflow-hidden shadow-2xl border border-[#d97706]/30 transition-transform hover:scale-[1.02]">
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className="text-[10px] text-[#78716c] font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">ONLINE</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                        </div>

                        <div className="flex items-stretch">
                            <div className="w-20 md:w-24 bg-[#292524] flex flex-col items-center justify-center border-r border-[#d97706]/10 relative group-hover:bg-[#322c28] transition-colors shrink-0">
                                <Building2 size={24} className="text-[#d97706] mb-2 md:w-8 md:h-8" />
                                <span className="text-[#d97706]/50 text-[10px] md:text-xs font-mono">STEP 01</span>
                            </div>

                            <div className="flex-1 p-4 md:p-6">
                                <h4 className="text-[#fcf6e6] font-bold text-lg md:text-xl mb-1 md:mb-2">Select Resource</h4>
                                <p className="text-[#a8a29e] text-xs md:text-sm leading-relaxed mb-3 md:mb-4">Choose from Classrooms, Labs, or Auditoriums based on your needs.</p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-[#78716c] font-mono hover:text-[#d97706] transition-colors">#Capacity60+</span>
                                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-[#78716c] font-mono hover:text-[#d97706] transition-colors">#SmartBoard</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contrast-card group relative bg-[#1c1917] rounded-xl overflow-hidden shadow-2xl border border-[#d97706]/30 transition-transform hover:scale-[1.02]">
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className="text-[10px] text-[#78716c] font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">ACTIVE</span>
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
                        </div>

                        <div className="flex items-stretch">
                            <div className="w-20 md:w-24 bg-[#292524] flex flex-col items-center justify-center border-r border-[#d97706]/10 relative group-hover:bg-[#322c28] transition-colors shrink-0">
                                <ShieldCheck size={24} className="text-[#d97706] mb-2 md:w-8 md:h-8" />
                                <span className="text-[#d97706]/50 text-[10px] md:text-xs font-mono">STEP 02</span>
                            </div>

                            <div className="flex-1 p-4 md:p-6">
                                <h4 className="text-[#fcf6e6] font-bold text-lg md:text-xl mb-1 md:mb-2">Check Availability</h4>
                                <p className="text-[#a8a29e] text-xs md:text-sm leading-relaxed mb-3 md:mb-4">System verifies conflict-free slots instantly against the schedule.</p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-[#78716c] font-mono hover:text-[#d97706] transition-colors">#RealTimeDB</span>
                                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-[#78716c] font-mono hover:text-[#d97706] transition-colors">#ConflictFree</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="contrast-card group relative bg-[#1c1917] rounded-xl overflow-hidden shadow-2xl border border-[#d97706]/30 transition-transform hover:scale-[1.02]">
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className="text-[10px] text-[#78716c] font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">SENT</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                        </div>

                        <div className="flex items-stretch">
                            <div className="w-20 md:w-24 bg-[#292524] flex flex-col items-center justify-center border-r border-[#d97706]/10 relative group-hover:bg-[#322c28] transition-colors shrink-0">
                                <Globe size={24} className="text-[#d97706] mb-2 md:w-8 md:h-8" />
                                <span className="text-[#d97706]/50 text-[10px] md:text-xs font-mono">STEP 03</span>
                            </div>

                            <div className="flex-1 p-4 md:p-6">
                                <h4 className="text-[#fcf6e6] font-bold text-lg md:text-xl mb-1 md:mb-2">Smart Approval</h4>
                                <p className="text-[#a8a29e] text-xs md:text-sm leading-relaxed mb-3 md:mb-4">Automatic approval routing for instant confirmation.</p>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-[#78716c] font-mono hover:text-[#d97706] transition-colors">#AutoRoute</span>
                                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-[#78716c] font-mono hover:text-[#d97706] transition-colors">#InstantAck</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </div>
    );
}