import React, { useRef, useLayoutEffect } from 'react';
import Model from './Model';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function degToRad(deg) {
    return deg * Math.PI / 180;
}

export default function Scene() {
    const groupRef = useRef();
    const parallaxRef = useRef();
    const isParallaxActive = useRef(true);
    const { camera, scene } = useThree();

    // Proxy object to animate Three.js colors safely with GSAP
    const colorProxy = React.useRef({ 
        bg: { r: 0.988, g: 0.965, b: 0.902 }, // #fcf6e6
        fog: { r: 0.988, g: 0.965, b: 0.902 }  // #fcf6e6
    });

    useLayoutEffect(() => {
        if (!groupRef.current) return;

        // Set initial background and fog colors
        scene.background = new THREE.Color('#fcf6e6');
        scene.fog = new THREE.Fog('#fcf6e6', 5, 25);

        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                gsap.set(groupRef.current.position, { y: 1.1 });
                gsap.set(groupRef.current.scale, { x: 0.35, y: 0.35, z: 0.35 });
            } else {
                gsap.set(groupRef.current.position, { y: 0 });
                gsap.set(camera.position, { z: 10 });
            }

            ScrollTrigger.create({
                trigger: "#problem-solution",
                start: "top bottom",
                onEnter: () => { isParallaxActive.current = false; },
                onLeaveBack: () => { isParallaxActive.current = true; }
            });

            // Animate background from Day (Warm) to Night (Dark Blue) as user scrolls
            gsap.to(colorProxy.current.bg, {
                r: 0.03, g: 0.04, b: 0.08, // #0b0f15
                scrollTrigger: {
                    trigger: "#problem-solution",
                    start: "top bottom",
                    end: "center center",
                    scrub: 1,
                }
            });
            gsap.to(colorProxy.current.fog, {
                r: 0.03, g: 0.04, b: 0.08, // #0b0f15
                scrollTrigger: {
                    trigger: "#problem-solution",
                    start: "top bottom",
                    end: "center center",
                    scrub: 1,
                }
            });

            gsap.timeline({
                scrollTrigger: {
                    trigger: "#problem-solution",
                    start: "top bottom",
                    end: "center center",
                    scrub: 1,
                }
            })
                .to(groupRef.current.position, {
                    x: isMobile ? 0 : -3,
                    y: isMobile ? -0.2 : -0.8,
                    z: 0,
                    ease: "power2.inOut"
                })
                .to(groupRef.current.rotation, {
                    x: isMobile ? degToRad(-10) : degToRad(10),
                    y: isMobile ? degToRad(360) : degToRad(180),
                    z: degToRad(0),
                    ease: "power2.inOut"
                }, "<");

            gsap.to(".glass-card", {
                scrollTrigger: {
                    trigger: "#problem-solution",
                },
                stagger: 0.5,
                opacity: 1,
                ease: "power2.inOut"
            });

            const featureTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#features-section",
                    start: "top bottom",
                    end: "center center",
                    scrub: 1,
                }
            });

            featureTl
                .to(camera.rotation, {
                    x: isMobile ? 0 : -0.00,
                    y: isMobile ? degToRad(49) : -1.22,
                    z: isMobile ? 0 : -0.00,
                    ease: "power2.inOut",
                })
                .to(camera.position, {
                    x: isMobile ? 0.8 : -4.51,
                    y: isMobile ? 0.2 : -0.16,
                    z: isMobile ? 0.5 : 1.67,
                    ease: "power2.inOut",
                }, "<");
        });

        return () => ctx.revert();
    }, [camera, scene]);

    useFrame((state, delta) => {
        const { mouse } = state;

        // Update Three.js background/fog colors every frame smoothly
        if (scene.background && scene.fog) {
            scene.background.setRGB(colorProxy.current.bg.r, colorProxy.current.bg.g, colorProxy.current.bg.b);
            scene.fog.color.setRGB(colorProxy.current.fog.r, colorProxy.current.fog.g, colorProxy.current.fog.b);
        }

        if (parallaxRef.current && isParallaxActive.current) {
            parallaxRef.current.rotation.y = THREE.MathUtils.lerp(
                parallaxRef.current.rotation.y,
                (mouse.x * Math.PI) / 50,
                0.05
            );
        }
    });

    return (
        <>
            <ambientLight intensity={3} />

            <group ref={groupRef}>
                <group ref={parallaxRef}>
                    <Model />
                </group>
            </group>
        </>
    );
}