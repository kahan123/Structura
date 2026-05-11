import React from 'react';
import { Search, Info, Calendar, CheckCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const BookingSteps = ({ currentStep }) => {
    const steps = [
        { id: 1, label: "Browse", icon: Search },
        { id: 2, label: "Details", icon: Info },
        { id: 3, label: "Time", icon: Calendar },
        { id: 4, label: "Confirm", icon: CheckCircle },
    ];

    const containerRef = React.useRef(null);
    useGSAP(() => {
        gsap.fromTo('.step-item',
            { opacity: 0, y: -10, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
        );
    }, [currentStep]);

    return (
        <div ref={containerRef} className="w-full mb-8 flex justify-center sticky top-4 z-40 pointer-events-none">
            {/* 
                Using pointer-events-none on wrapper so it doesn't block clicks around it, 
                but auto on the actual bar 
            */}
            <div className="bg-paper/90 backdrop-blur-md border border-secondary/20 rounded-full p-1 shadow-xl flex items-center pointer-events-auto transition-all hover:scale-105 duration-300">

                {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const isPending = step.id > currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="step-item opacity-0 flex items-center">

                            {/* Step Item */}
                            <div
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500
                                    ${isActive
                                        ? 'bg-ink text-paper shadow-lg ring-2 ring-primary/20'
                                        : isCompleted
                                            ? 'text-primary'
                                            : 'text-secondary/30'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${isActive ? 'block' : 'hidden md:block'}`}>
                                    {step.label}
                                </span>

                                {isCompleted && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20 ml-1" />
                                )}
                            </div>

                            {/* Separator */}
                            {index < steps.length - 1 && (
                                <div className={`px-1 ${isCompleted ? 'text-primary' : 'text-secondary/10'}`}>
                                    <div className="w-4 h-[1px] bg-current" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingSteps;
