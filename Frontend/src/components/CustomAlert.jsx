import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const CustomAlert = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    useGSAP(() => {
        if (isOpen) {
            // Open Animation
            gsap.set(overlayRef.current, { display: 'flex' });

            const tl = gsap.timeline();

            tl.to(overlayRef.current, {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out"
            })
                .fromTo(modalRef.current,
                    { y: 50, opacity: 0, scale: 0.95, rotation: -2 },
                    { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: "back.out(1.7)" },
                    "-=0.2"
                );
        } else {
            // Close Animation
            if (overlayRef.current && overlayRef.current.style.display !== 'none') {
                const tl = gsap.timeline({
                    onComplete: () => gsap.set(overlayRef.current, { display: 'none' })
                });

                tl.to(modalRef.current, {
                    y: 20,
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.2,
                    ease: "power2.in"
                })
                    .to(overlayRef.current, {
                        opacity: 0,
                        duration: 0.2
                    }, "-=0.1");
            }
        }
    }, [isOpen]);

    let iconColorClass = "text-red-600";
    let iconBgClass = "bg-red-50 border-red-200";
    let btnColorClass = "bg-red-600 hover:bg-red-700";
    let IconComponent = AlertTriangle;

    if (type === "success") {
        iconColorClass = "text-emerald-600";
        iconBgClass = "bg-emerald-50 border-emerald-200";
        btnColorClass = "bg-emerald-600 hover:bg-emerald-700";
        IconComponent = CheckCircle;
    } else if (type === "info" || type === "warning") {
        iconColorClass = "text-amber-600";
        iconBgClass = "bg-amber-50 border-amber-200";
        btnColorClass = "bg-primary hover:bg-ink";
        IconComponent = Info;
    }

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm items-center justify-center p-4 hidden opacity-0"
        >
            {/* Modal Card - Architect Paper Style */}
            <div
                ref={modalRef}
                className="bg-paper w-full max-w-sm relative shadow-2xl overflow-hidden"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }} // Clean rect for now, maybe rough later
            >
                {/* Rough Border SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <rect x="2" y="2" width="99%" height="98%" fill="none" stroke="#78716c" strokeWidth="2" strokeDasharray="4 2" />
                </svg>
 
                {/* "Tape" Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-secondary/10 opacity-50 shadow-sm rotate-1" />

                <div className="p-8 relative z-10 text-center">
                    <div className={`w-12 h-12 ${iconBgClass} rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed`}>
                        <IconComponent className={`w-6 h-6 ${iconColorClass}`} />
                    </div>

                    <h3 className="text-xl font-black text-ink uppercase tracking-tight mb-2">{title}</h3>
                    <p className="text-sm text-secondary font-medium mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 px-4 text-xs font-bold uppercase tracking-widest text-secondary hover:bg-secondary/10 hover:text-ink transition-colors border-2 border-transparent hover:border-secondary/10"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3 px-4 ${btnColorClass} text-white text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                {/* Close X */}
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="absolute top-2 right-2 p-2 text-secondary/50 hover:text-ink transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CustomAlert;
