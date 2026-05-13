import React, { useState, useEffect, useRef } from 'react';
import { Building2, Menu, X, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';

export default function Navbar({ isHidden }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const navRef = useRef(null);
    useGSAP(() => {
        // Only run entrance animation once on load
        gsap.fromTo(navRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        );
        gsap.fromTo('.nav-link',
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.5 }
        );
    }, []);

    return (
        <>
            <nav
                ref={navRef}
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out transform ${isHidden ? '-translate-y-full' : 'translate-y-0'
                    } ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-primary/10 py-4 shadow-sm' : 'bg-transparent py-6'}`}
            >
                <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Building2 size={24} className="text-primary" />
                        </div>
                        <span className="text-xl font-serif font-bold text-ink tracking-tight">
                            <span className="text-primary">Structura</span>
                        </span>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'How it Works', 'Analytics', 'Support'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                className="nav-link opacity-0 text-sm font-medium text-secondary hover:text-primary transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="nav-link opacity-0 px-5 py-2.5 bg-white border border-primary/20 text-primary font-bold text-sm rounded-full hover:bg-primary/5 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/login" className="nav-link opacity-0 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-full hover:bg-accent transition-colors shadow-lg hover:shadow-primary/25 flex items-center gap-2">
                            Get Started
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-ink hover:text-primary transition-colors cursor-pointer"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Drawer Overlay */}
            <div 
                className={`fixed inset-0 z-55 bg-black/60 backdrop-blur-md md:hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileMenuOpen(false)}
            >
                {/* Drawer Container */}
                <div 
                    className={`absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-white border-l border-primary/10 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-500 ease-in-out transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/10">
                            <div className="flex items-center gap-2">
                                <Building2 size={20} className="text-primary" />
                                <span className="font-serif font-bold text-ink text-lg">Structura</span>
                            </div>
                            <button 
                                className="p-2 text-secondary hover:text-primary rounded-full hover:bg-primary/5 transition-colors cursor-pointer"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-col gap-6">
                            {['Features', 'How it Works', 'Analytics', 'Support'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                                    className="text-base font-medium text-secondary hover:text-primary transition-colors py-1.5 border-b border-secondary/5"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3 pt-6 border-t border-primary/10">
                        <Link 
                            to="/login" 
                            className="w-full py-3 bg-white border border-primary/20 text-primary font-bold text-sm rounded-full text-center hover:bg-primary/5 transition-colors block"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Sign In
                        </Link>
                        <Link 
                            to="/login" 
                            className="w-full py-3 bg-primary text-white font-bold text-sm rounded-full text-center hover:bg-accent transition-colors shadow-lg shadow-primary/15 flex items-center justify-center gap-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Get Started
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
