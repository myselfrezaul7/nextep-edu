"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";

interface HubCoordinate {
    name: string;
    coords: [number, number, number];
}

const DHAKA: [number, number, number] = [0, 0, 0];

const DESTINATIONS: HubCoordinate[] = [
    { name: "London", coords: [-3.8, 2.0, -1.2] },
    { name: "Berlin", coords: [-2.9, 2.4, -0.8] },
    { name: "Boston", coords: [-5.4, 1.6, -2.4] },
    { name: "Toronto", coords: [-5.7, 2.0, -2.1] },
    { name: "Sydney", coords: [3.2, -3.2, -1.4] },
    { name: "Seoul", coords: [3.6, 1.3, -0.6] },
    { name: "Tokyo", coords: [4.3, 1.1, -0.8] },
    { name: "Beijing", coords: [2.6, 1.7, -0.5] },
];

export function HeroCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const isMobile = window.innerWidth < 768;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isDark = resolvedTheme === "dark";

        // Colors based on theme
        const colors = {
            dhaka: isDark ? 0xd4af37 : 0xb8860b,
            hub: isDark ? 0x38bdf8 : 0x0284c7,
            arc: isDark ? 0xd4af37 : 0xca8a04,
            arcOpacity: isDark ? 0.35 : 0.16,
            packet: isDark ? 0xfef08a : 0xd4af37,
            dust: isDark ? 0x94a3b8 : 0x64748b,
            dustOpacity: isDark ? 0.35 : 0.14,
        };

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );
        camera.position.set(0, 0, 11);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.domElement.style.pointerEvents = "none";
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        container.appendChild(renderer.domElement);

        // Group for constellation objects
        const constellationGroup = new THREE.Group();
        scene.add(constellationGroup);

        // 2. Origin Node (Dhaka)
        const originGeo = new THREE.SphereGeometry(0.14, 16, 16);
        const originMat = new THREE.MeshBasicMaterial({
            color: colors.dhaka,
            transparent: true,
            opacity: 0.95,
        });
        const originMesh = new THREE.Mesh(originGeo, originMat);
        originMesh.position.set(...DHAKA);
        constellationGroup.add(originMesh);

        // Subtle pulsing halo ring for Dhaka
        const haloGeo = new THREE.RingGeometry(0.2, 0.28, 32);
        const haloMat = new THREE.MeshBasicMaterial({
            color: colors.dhaka,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide,
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.position.set(...DHAKA);
        constellationGroup.add(haloMesh);

        // 3. Destination Hubs & Arcs
        const activeDestinations = isMobile ? DESTINATIONS.slice(0, 4) : DESTINATIONS;
        const curves: THREE.QuadraticBezierCurve3[] = [];
        const packetMeshes: { mesh: THREE.Mesh; curveIndex: number; speed: number; offset: number }[] = [];

        const hubGeo = new THREE.SphereGeometry(0.09, 14, 14);
        const hubMat = new THREE.MeshBasicMaterial({
            color: colors.hub,
            transparent: true,
            opacity: 0.85,
        });

        const packetGeo = new THREE.SphereGeometry(0.05, 10, 10);
        const packetMat = new THREE.MeshBasicMaterial({
            color: colors.packet,
            transparent: true,
            opacity: 0.95,
        });

        activeDestinations.forEach((dest, i) => {
            // Destination Node
            const hubMesh = new THREE.Mesh(hubGeo, hubMat);
            hubMesh.position.set(...dest.coords);
            constellationGroup.add(hubMesh);

            // 3D Quadratic Arc
            const start = new THREE.Vector3(...DHAKA);
            const end = new THREE.Vector3(...dest.coords);
            // Midpoint elevated outward along Z and Y
            const mid = new THREE.Vector3(
                (start.x + end.x) * 0.5,
                (start.y + end.y) * 0.5 + 0.8,
                (start.z + end.z) * 0.5 + 1.2
            );

            const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
            curves.push(curve);

            const points = curve.getPoints(40);
            const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
            const arcMat = new THREE.LineBasicMaterial({
                color: colors.arc,
                transparent: true,
                opacity: colors.arcOpacity,
                blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
            });
            const arcLine = new THREE.Line(arcGeo, arcMat);
            constellationGroup.add(arcLine);

            // Light pulse packets
            const pMesh = new THREE.Mesh(packetGeo, packetMat);
            pMesh.position.copy(curve.getPoint(0));
            constellationGroup.add(pMesh);

            packetMeshes.push({
                mesh: pMesh,
                curveIndex: i,
                speed: 0.0035 + (i % 3) * 0.001,
                offset: (i * 0.25) % 1,
            });
        });

        // 4. Ambient Holographic Dust Field
        const particleCount = isMobile ? 140 : 650;
        const dustPositions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            dustPositions[i * 3] = (Math.random() - 0.5) * 22;
            dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
            dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
        }

        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
        const dustMat = new THREE.PointsMaterial({
            color: colors.dust,
            size: isMobile ? 0.04 : 0.05,
            transparent: true,
            opacity: colors.dustOpacity,
            blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
        });
        const dustParticles = new THREE.Points(dustGeo, dustMat);
        scene.add(dustParticles);

        // 5. Parallax Mouse Tracking (Zero React Re-renders)
        let targetRotX = 0;
        let targetRotY = 0;
        let currentRotX = 0;
        let currentRotY = 0;

        const handlePointerMove = (e: MouseEvent) => {
            const normX = (e.clientX / window.innerWidth) * 2 - 1;
            const normY = -(e.clientY / window.innerHeight) * 2 + 1;
            targetRotY = normX * 0.22;
            targetRotX = -normY * 0.15;
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });

        // 6. Responsive Resize Handling
        const handleResize = () => {
            if (!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        };

        window.addEventListener("resize", handleResize);

        // 7. Animation Loop with IntersectionObserver
        let animationFrameId = 0;
        let isVisible = true;
        let pulseTime = 0;

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting;
            },
            { threshold: 0.05 }
        );
        observer.observe(container);

        const renderFrame = () => {
            if (!isVisible) {
                animationFrameId = requestAnimationFrame(renderFrame);
                return;
            }

            pulseTime += 1;

            // Smooth parallax lerp
            currentRotX += (targetRotX - currentRotX) * 0.05;
            currentRotY += (targetRotY - currentRotY) * 0.05;
            constellationGroup.rotation.x = currentRotX;
            constellationGroup.rotation.y = currentRotY + Math.sin(pulseTime * 0.005) * 0.04;

            // Halo pulse scale
            const haloScale = 1 + Math.sin(pulseTime * 0.04) * 0.12;
            haloMesh.scale.set(haloScale, haloScale, 1);

            // Animate packet pulses along trajectories
            packetMeshes.forEach((item) => {
                const curve = curves[item.curveIndex];
                if (!curve) return;
                const progress = (pulseTime * item.speed + item.offset) % 1;
                const pos = curve.getPointAt(progress);
                item.mesh.position.copy(pos);
            });

            // Gentle dust rotation
            dustParticles.rotation.y = pulseTime * 0.0003;

            renderer.render(scene, camera);

            if (!prefersReducedMotion) {
                animationFrameId = requestAnimationFrame(renderFrame);
            }
        };

        if (prefersReducedMotion) {
            // Render a single static frame for accessibility
            renderer.render(scene, camera);
        } else {
            animationFrameId = requestAnimationFrame(renderFrame);
        }

        // 8. Strict Cleanup (React 19 Safe)
        return () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("resize", handleResize);

            // Traverse and dispose all WebGL resources
            scene.traverse((obj) => {
                if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
                    if (obj.geometry) {
                        obj.geometry.dispose();
                    }
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach((m) => m.dispose());
                        } else {
                            obj.material.dispose();
                        }
                    }
                }
            });

            renderer.dispose();
            renderer.forceContextLoss();

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [resolvedTheme]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
        />
    );
}
