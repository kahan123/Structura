import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';

export default function LoadingScreen({ onFinished }) {
    const { progress, active } = useProgress();
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const textRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let interval;

        if (active) {
            const targetText = "INITIALIZING SYSTEM";
            let iterations = 0;

            interval = setInterval(() => {
                if (textRef.current) {
                    textRef.current.innerText = targetText
                        .split("")
                        .map((letter, index) => {
                            if (index < iterations) return letter;
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join("");

                    if (iterations >= targetText.length) {
                        clearInterval(interval);
                    }
                    iterations += 1 / 3;
                }
            }, 30);
        }
        return () => clearInterval(interval);
    }, [active]);

    useEffect(() => {
        gsap.to(gridRef.current, {
            backgroundPosition: "100px 100px",
            duration: 4,
            ease: "none",
            repeat: -1
        });

        const svg = svgRef.current;
        if (svg) {
            const paths = svg.querySelectorAll("path, rect");

            paths.forEach((path) => {
                const length = path.getTotalLength ? path.getTotalLength() : 200;

                gsap.set(path, {
                    strokeDasharray: length,
                    strokeDashoffset: length,
                    fillOpacity: 0,
                    stroke: "#d97706",
                    strokeWidth: 0.5
                });
            });

            const tl = gsap.timeline();

            tl.to(paths, {
                strokeDashoffset: 0,
                duration: 2.5,
                stagger: 0.05,
                ease: "power2.inOut"
            })
                .to(paths, {
                    fillOpacity: 1,
                    strokeOpacity: 0,
                    duration: 1,
                    ease: "sine.inOut"
                }, "-=0.5");
        }
    }, []);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => {
                gsap.to(containerRef.current, {
                    clipPath: "inset(0% 0% 0% 100%)", // Right-to-left wipe
                    duration: 1.2,
                    ease: "power4.inOut",
                    onComplete: () => {
                        if (onFinished) onFinished();
                    }
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [progress, onFinished]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-50 bg-[#1a1816] flex flex-col items-center justify-center overflow-hidden"
            style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        >
            <div
                ref={gridRef}
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(#d97706 1px, transparent 1px), linear-gradient(90deg, #d97706 1px, transparent 1px)`,
                    backgroundSize: "40px 40px"
                }}
            />

            <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                    <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-2 border border-primary/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                    <div className="absolute inset-x-0 h-px bg-primary/30 top-1/2 -translate-y-1/2 animate-pulse" />
                    <div className="absolute inset-y-0 w-px bg-primary/30 left-1/2 -translate-x-1/2 animate-pulse" />

                    <svg ref={svgRef} version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
                        width="128px" height="128px" viewBox="0 0 64 64" enableBackground="new 0 0 64 64" xmlSpace="preserve"
                        className="w-32 h-32 text-primary drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]">
                        <g>
                            <g>
                                <path fill="#B4CCB9" d="M2,15v46c0,1.104,0.896,2,2,2h12V13H4C2.896,13,2,13.896,2,15z" />
                                <path fill="#B4CCB9" d="M44,3H20c-1.104,0-2,0.896-2,2v58l0.001,0.002H27V54c0-0.553,0.447-1,1-1h8c0.553,0,1,0.447,1,1v9.002h8.999L46,63V5C46,3.896,45.104,3,44,3z" />
                                <path fill="#B4CCB9" d="M60,23H48v40h12c1.104,0,2-0.896,2-2V25C62,23.896,61.104,23,60,23z" />
                            </g>
                            <path fill="#394240" d="M60,21H48V5c0-2.211-1.789-4-4-4H20c-2.211,0-4,1.789-4,4v6H4c-2.211,0-4,1.789-4,4v46c0,2.211,1.789,4,4,4h56c2.211,0,4-1.789,4-4V25C64,22.789,62.211,21,60,21z M16,63H4c-1.104,0-2-0.896-2-2V15c0-1.104,0.896-2,2-2h12V63z M35,63.002h-6V55h6V63.002z M46,63l-0.001,0.002H37V54c0-0.553-0.447-1-1-1h-8c-0.553,0-1,0.447-1,1v9.002h-8.999L18,63V5c0-1.104,0.896-2,2-2h24c1.104,0,2,0.896,2,2V63z M62,61c0,1.104-0.896,2-2,2H48V23h12c1.104,0,2,0.896,2,2V61z" />
                            <path fill="#394240" d="M7,25h4c0.553,0,1-0.447,1-1v-4c0-0.553-0.447-1-1-1H7c-0.553,0-1,0.447-1,1v4C6,24.553,6.447,25,7,25z M8,21h2v2H8V21z" />
                            <path fill="#394240" d="M7,35h4c0.553,0,1-0.447,1-1v-4c0-0.553-0.447-1-1-1H7c-0.553,0-1,0.447-1,1v4C6,34.553,6.447,35,7,35z M8,31h2v2H8V31z" />
                            <path fill="#394240" d="M7,45h4c0.553,0,1-0.447,1-1v-4c0-0.553-0.447-1-1-1H7c-0.553,0-1,0.447-1,1v4C6,44.553,6.447,45,7,45z M8,41h2v2H8V41z" />
                            <path fill="#394240" d="M29,19h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C30,19.447,29.553,19,29,19z M28,23h-2v-2h2V23z" />
                            <path fill="#394240" d="M29,29h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C30,29.447,29.553,29,29,29z M28,33h-2v-2h2V33z" />
                            <path fill="#394240" d="M29,39h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C30,39.447,29.553,39,29,39z M28,43h-2v-2h2V43z" />
                            <path fill="#394240" d="M39,19h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C40,19.447,39.553,19,39,19z M38,23h-2v-2h2V23z" />
                            <path fill="#394240" d="M29,9h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C30,9.447,29.553,9,29,9z M28,13h-2v-2h2V13z" />
                            <path fill="#394240" d="M39,9h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C40,9.447,39.553,9,39,9z M38,13h-2v-2h2V13z" />
                            <path fill="#394240" d="M39,29h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C40,29.447,39.553,29,39,29z M38,33h-2v-2h2V33z" />
                            <path fill="#394240" d="M39,39h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C40,39.447,39.553,39,39,39z M38,43h-2v-2h2V43z" />
                            <path fill="#394240" d="M57,29h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C58,29.447,57.553,29,57,29z M56,33h-2v-2h2V33z" />
                            <path fill="#394240" d="M57,39h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C58,39.447,57.553,39,57,39z M56,43h-2v-2h2V43z" />
                            <path fill="#394240" d="M57,49h-4c-0.553,0-1,0.447-1,1v4c0,0.553,0.447,1,1,1h4c0.553,0,1-0.447,1-1v-4C58,49.447,57.553,49,57,49z M56,53h-2v-2h2V53z" />
                            <path fill="#394240" d="M7,55h4c0.553,0,1-0.447,1-1v-4c0-0.553-0.447-1-1-1H7c-0.553,0-1,0.447-1,1v4C6,54.553,6.447,55,7,55z M8,51h2v2H8V51z" />
                            <g opacity="0.15">
                                <path d="M2,15v46c0,1.104,0.896,2,2,2h12V13H4C2.896,13,2,13.896,2,15z" />
                                <path d="M60,23H48v40h12c1.104,0,2-0.896,2-2V25C62,23.896,61.104,23,60,23z" />
                            </g>
                            <rect x="29" y="55" fill="#F76D57" width="6" height="8.002" />
                            <g>
                                <rect x="8" y="21" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="8" y="31" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="8" y="41" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="8" y="51" fill="#506C7F" width="2.001" height="2.002" />
                                <rect x="26" y="11" fill="#506C7F" width="2.001" height="2.002" />
                                <rect x="26" y="21" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="26" y="31" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="26" y="41" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="36" y="11" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="36" y="21" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="36" y="31" fill="#506C7F" width="2.001" height="2.002" />
                                <rect x="36" y="41" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="54" y="31" fill="#F9EBB2" width="2.001" height="2.002" />
                                <rect x="54" y="41" fill="#506C7F" width="2.001" height="2.002" />
                                <rect x="54" y="51" fill="#F9EBB2" width="2.001" height="2.002" />
                            </g>
                        </g>
                    </svg>
                </div>

                <h2
                    ref={textRef}
                    className="text-2xl font-mono font-bold text-primary tracking-widest mb-4"
                >
                    INITIALIZING
                </h2>

                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-xs font-mono text-primary/60">
                        <span>ASSETS_LOADED</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1 bg-primary/10 w-full overflow-hidden">
                        <div
                            className="h-full bg-primary shadow-[0_0_10px_#d97706]"
                            style={{ width: `${progress}%`, transition: "width 0.2s linear" }}
                        />
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 font-mono text-xs text-primary/30">
                SYS_VER_1.0
            </div>
        </div>
    );
}