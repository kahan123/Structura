import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useTexture } from "@react-three/drei";

import Navbar from './Navbar';
import Scene from './Scene';
import Overlay from './Overlay';
import LoadingScreen from './LoadingScreen';
import FacilitySection from './FacilitySection';
import AutomationPipelineSection from './AutomationPipelineSection';
import ArchitecturalAssemblySection from './ArchitecturalAssemblySection';

// Preload models to ensure they start loading immediately
useGLTF.preload('/model/school.glb');
useTexture.preload('/texttures/schoolTexture.png');

export default function LandingPage() {
    const [started, setStarted] = useState(false);
    const [hideNavbar, setHideNavbar] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(true);
    const overlayRef = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setOverlayVisible(entry.isIntersecting);
            },
            { threshold: 0 }
        );

        if (overlayRef.current) {
            observer.observe(overlayRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full relative overflow-x-hidden">
            {!started && <LoadingScreen onFinished={() => setStarted(true)} />}

            <Navbar isHidden={hideNavbar} />

            {/* 3D Scene Background (Fixed) */}
            <div className="fixed top-0 left-0 w-full h-screen z-0">
                <Canvas
                    className="w-full h-full"
                    dpr={Math.min(window.devicePixelRatio, 2)}
                    gl={{ powerPreference: "high-performance", antialias: true }}
                    camera={{ position: [0, 0, 10], fov: 30 }}
                    frameloop={overlayVisible ? 'always' : 'never'}
                    eventSource={document.body}
                    eventPrefix="client"
                >
                    <Suspense fallback={null}>
                        <Scene />
                    </Suspense>
                </Canvas>
            </div>

            {/* Scrollable Overlay (Foreground) */}
            <div className="relative z-10 pointer-events-none">
                <div ref={overlayRef}>
                    <Overlay />
                </div>
                <div className="pointer-events-auto">
                    <FacilitySection setHideNavbar={setHideNavbar} />
                    <AutomationPipelineSection />
                    <ArchitecturalAssemblySection />
                </div>
            </div>
        </div>
    );
}