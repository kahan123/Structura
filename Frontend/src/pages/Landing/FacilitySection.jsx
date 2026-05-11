import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Wind, Projector, Wifi, Speaker, Zap, X, Maximize2 } from 'lucide-react';

const FacilitySection = ({ setHideNavbar }) => {
    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const domRefs = useRef([]);
    const textRefs = useRef([]);
    const cursorRef = useRef(null);

    const bodiesRef = useRef([]);

    const [isHovering, setIsHovering] = useState(false);
    const [expandedFeatureId, setExpandedFeatureId] = useState(null);

    const features = [
        { id: 1, label: "Climate", icon: <Wind size={28} />, color: "#22d3ee", desc: "Smart AC & Ventilation. Automated climate control ensures a comfortable learning environment regardless of external weather conditions." },
        { id: 2, label: "Visuals", icon: <Projector size={28} />, color: "#fbbf24", desc: "4K Projection Systems. High-definition visual aids with wireless casting capabilities for seamless presentations." },
        { id: 3, label: "Connectivity", icon: <Wifi size={28} />, color: "#34d399", desc: "Enterprise-grade connectivity covering every corner of the room for uninterrupted access." },
        { id: 4, label: "Audio", icon: <Speaker size={28} />, color: "#a78bfa", desc: "Dolby Surround Sound. Acoustic optimization and crystal-clear audio distribution for lectures and media." },
        { id: 5, label: "Power", icon: <Zap size={28} />, color: "#f472b6", desc: "Universal Charging Ports. Accessible power outlets and USB-C charging stations at every desk cluster." },
    ];

    const getFeatureById = (id) => features.find(f => f.id === id);

    useEffect(() => {
        const Engine = Matter.Engine,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Runner = Matter.Runner,
            Events = Matter.Events,
            Body = Matter.Body,
            Composite = Matter.Composite,
            Constraint = Matter.Constraint;

        const engine = Engine.create();
        engine.world.gravity.y = 0;
        engineRef.current = engine;

        const width = sceneRef.current.clientWidth;
        const height = sceneRef.current.clientHeight;
        const isMobile = width < 768;

        const orbRadius = isMobile ? 35 : 45;
        const orbSize = isMobile ? 80 : 120;
        const orbOffset = orbSize / 2;

        const anchors = [
            { x: width * 0.15, y: height * (isMobile ? 0.40 : 0.25) },
            { x: width * 0.85, y: height * (isMobile ? 0.40 : 0.25) },
            { x: width * 0.5, y: height * (isMobile ? 0.60 : 0.5) },
            { x: width * 0.15, y: height * (isMobile ? 0.80 : 0.70) },
            { x: width * 0.85, y: height * (isMobile ? 0.80 : 0.70) },
        ];

        const bodies = [];
        const constraints = [];

        anchors.forEach((anchor, i) => {
            const body = Bodies.circle(anchor.x, anchor.y, orbRadius, {
                restitution: 0.8,
                friction: 0.1,
                frictionAir: 0.05,
                density: 0.001,
                label: `orb-${i}`,
                render: { visible: false }
            });

            const tether = Constraint.create({
                pointA: anchor,
                bodyB: body,
                stiffness: 0.005,
                damping: 0.1,
                render: { visible: false }
            });

            bodies.push(body);
            constraints.push(tether);
        });

        bodiesRef.current = bodies;
        World.add(engine.world, [...bodies, ...constraints]);

        const mousePos = { x: -1000, y: -1000 };
        const handleInput = (x, y) => {
            mousePos.x = x;
            mousePos.y = y;
        };

        const handleMouseMove = (e) => handleInput(e.clientX, e.clientY);
        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                handleInput(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchstart', handleTouchMove, { passive: true });

        Events.on(engine, 'beforeUpdate', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (mousePos.x <= 0 || mousePos.x >= width || mousePos.y <= 0 || mousePos.y >= height) {
                bodies.forEach((body) => {
                    if (body.isStatic) return;
                    Body.applyForce(body, body.position, {
                        x: (Math.random() - 0.5) * 0.0005,
                        y: (Math.random() - 0.5) * 0.0005
                    });
                });
            }

            if (mousePos.x > 0 && mousePos.x < width && mousePos.y > 0 && mousePos.y < height) {
                const isMobile = width < 768;
                const magnetRadius = isMobile ? 120 : 300;

                bodies.forEach((body) => {
                    if (body.isStatic) return;

                    const vector = { x: mousePos.x - body.position.x, y: mousePos.y - body.position.y };
                    const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

                    if (distance < magnetRadius) {
                        const normal = { x: vector.x / distance, y: vector.y / distance };
                        const forceMagnitude = 0.2 * (1 - distance / magnetRadius);

                        Body.applyForce(body, body.position, {
                            x: normal.x * forceMagnitude,
                            y: normal.y * forceMagnitude
                        });
                    }
                });
            }
        });

        const updatePositions = () => {
            if (!engineRef.current) return;
            const allBodies = Composite.allBodies(engineRef.current.world).filter(b => b.label.startsWith('orb-'));

            allBodies.forEach((body, i) => {
                const orbEl = domRefs.current[i];
                const textEl = textRefs.current[i];

                if (orbEl && textEl) {
                    const { x, y } = body.position;

                    orbEl.style.transform = `translate3d(${x - orbOffset}px, ${y - orbOffset}px, 0)`;

                    if (!body.isStatic) {
                        const anchor = anchors[i];
                        const dx = x - anchor.x;
                        const dy = y - anchor.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        textEl.style.left = `${anchor.x}px`;
                        textEl.style.top = `${anchor.y}px`;

                        const opacity = 0.05 + Math.min((dist - 2) / 50, 0.95);
                        textEl.style.opacity = opacity;

                        textEl.style.transform = `translate(-50%, 65px)`;

                        if (dist > 2) {
                            orbEl.style.boxShadow = `0 0 50px ${features[i].color}40`;
                            orbEl.style.borderColor = features[i].color;
                            orbEl.style.background = `${features[i].color}10`;
                        } else {
                            orbEl.style.boxShadow = `0 0 30px ${features[i].color}10`;
                            orbEl.style.borderColor = `${features[i].color}40`;
                            orbEl.style.background = 'rgba(10,10,10,0.6)';
                        }
                    } else {
                        textEl.style.opacity = 0;
                    }
                }
            });
        };

        let animationFrameId;
        const loop = () => {
            updatePositions();
            animationFrameId = requestAnimationFrame(loop);
        };
        loop();

        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
            Runner.stop(runner);
            World.clear(engine.world);
            Engine.clear(engine);
        };
    }, []);

    useEffect(() => {
        const moveCursor = (e) => {
            if (cursorRef.current && !expandedFeatureId) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }
        };
        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, [expandedFeatureId]);

    const handleOrbClick = (index) => {
        if (expandedFeatureId !== null) return;
        const body = bodiesRef.current[index];
        if (body) {
            Matter.Body.setStatic(body, true);
            setExpandedFeatureId(features[index].id);
        }
    };

    const handleCloseExpand = (e) => {
        e.stopPropagation();
        if (expandedFeatureId === null) return;

        const index = features.findIndex(f => f.id === expandedFeatureId);
        const body = bodiesRef.current[index];
        if (body) {
            Matter.Body.setStatic(body, false);
            Matter.Body.setAwake(body, true);
        }
        setExpandedFeatureId(null);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (setHideNavbar) {
                    setHideNavbar(entry.isIntersecting);
                }
            },
            { threshold: 0.5 }
        );

        if (sceneRef.current) {
            observer.observe(sceneRef.current.parentElement);
        }

        return () => observer.disconnect();
    }, [setHideNavbar]);

    return (
        <section
            style={{ height: '100vh' }}
            className={`relative w-full bg-gradient-to-b from-transparent via-[#050505]/95 to-[#050505] overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-cyan-500/30 snap-start ${isHovering && !expandedFeatureId ? 'cursor-none' : ''}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-50" />
            </div>

            {/* Pure CSS Custom Magnet Cursor */}
            <div
                ref={cursorRef}
                className={`fixed top-0 left-0 w-16 h-16 pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400/50 bg-cyan-400/5 backdrop-blur-sm transition-transform duration-200 ease-out ${isHovering && !expandedFeatureId ? 'scale-100' : 'scale-0'}`}
            />

            <div ref={sceneRef} className="absolute inset-0 pointer-events-none" />

            <div className="absolute inset-0 pointer-events-none">
                {features.map((feature, i) => (
                    <div
                        key={`text-${feature.id}`}
                        ref={el => textRefs.current[i] = el}
                        className="absolute w-60 text-center"
                        style={{ opacity: 0 }}
                    >
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1 block">0{i + 1}</span>
                        <h3 className="text-xl font-medium text-white tracking-wide uppercase mb-2">{feature.label}</h3>
                        <p className="text-xs text-white/60 font-light leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 pointer-events-auto">
                {features.map((feature, i) => {
                    const isExpanded = expandedFeatureId === feature.id;
                    return (
                        <div
                            key={feature.id}
                            ref={el => domRefs.current[i] = el}
                            onClick={() => handleOrbClick(i)}
                            className={`absolute top-0 left-0 w-[80px] h-[80px] md:w-[120px] md:h-[120px] rounded-full flex items-center justify-center 
                                        transition-all duration-300 cursor-pointer group z-20
                                        ${isExpanded ? 'z-50 !scale-100 !opacity-0 pointer-events-none' : 'hover:scale-110 active:scale-95'}`}
                            style={{
                                boxShadow: `0 0 30px ${feature.color}10`,
                                border: `1px solid ${feature.color}40`,
                                background: 'rgba(10,10,10,0.6)',
                                backdropFilter: 'blur(4px)'
                            }}
                        >
                            <div className="relative z-10 text-white/90 group-hover:text-white transition-colors" style={{ color: feature.color }}>
                                {feature.icon}
                            </div>

                            <div className="absolute inset-2 rounded-full border border-white/5 group-hover:border-white/10 transition-colors" />
                            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `radial-gradient(circle at center, ${feature.color}20, transparent 70%)` }}
                            />
                        </div>
                    );
                })}
            </div>

            {expandedFeatureId && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={handleCloseExpand}
                >
                    <div
                        className="relative w-full max-w-md bg-[#0a0a0a]/80 border border-white/10 p-8 rounded-2xl shadow-2xl scale-95 animate-in zoom-in-95 duration-300 backdrop-blur-xl"
                        onClick={e => e.stopPropagation()}
                        style={{ borderTop: `4px solid ${getFeatureById(expandedFeatureId).color}` }}
                    >
                        <button
                            onClick={handleCloseExpand}
                            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6 inline-flex p-4 rounded-full bg-white/5 border border-white/5" style={{ color: getFeatureById(expandedFeatureId).color }}>
                            {getFeatureById(expandedFeatureId).icon}
                        </div>

                        <div className="flex items-baseline justify-between mb-2">
                            <h3 className="text-3xl text-white font-light">{getFeatureById(expandedFeatureId).label}</h3>
                            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                SPEC_ID_0{getFeatureById(expandedFeatureId).id}
                            </span>
                        </div>

                        <p className="text-white/60 leading-relaxed font-light mb-8">
                            {getFeatureById(expandedFeatureId).desc}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-[10px] text-white/30 uppercase mb-1">Status</span>
                                <div className="flex items-center gap-2 text-green-400 text-xs font-mono">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Active
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="block text-[10px] text-white/30 uppercase mb-1">Integration</span>
                                <div className="flex items-center gap-2 text-white text-xs font-mono">
                                    <Maximize2 size={10} /> Full Logic
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`absolute top-12 pointer-events-none text-center transition-opacity duration-300 ${expandedFeatureId ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-cyan-200 uppercase tracking-widest">Live Infrastructure</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-light text-white mb-4 tracking-tight">
                    Equipped for <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Every Requirement</span>.
                </h2>
                <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed mb-2">
                    Don't just book a room; book the right environment. Our system maps every facility—from Air Conditioning to Sound Systems—so you know exactly what is available.
                </p>
                <p className="text-white/30 text-xs uppercase tracking-[0.3em]">
                    Infrastructure Transparency
                </p>
            </div>

        </section>
    );
};

export default FacilitySection;