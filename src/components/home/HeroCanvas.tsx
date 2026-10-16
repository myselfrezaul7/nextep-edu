"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    CanvasTexture,
    Color,
    DoubleSide,
    Group,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    NormalBlending,
    PerspectiveCamera,
    Points,
    PointsMaterial,
    QuadraticBezierCurve3,
    RingGeometry,
    Scene,
    Sprite,
    SpriteMaterial,
    Vector3,
    WebGLRenderer,
} from "three";

interface HubCoordinate {
    name: string;
    coords: [number, number, number];
}

interface PacketItem {
    sprite: Sprite;
    curveIndex: number;
    speed: number;
    offset: number;
}

interface ThemeMaterials {
    originMat: SpriteMaterial;
    haloMat: MeshBasicMaterial;
    hubMats: SpriteMaterial[];
    arcMats: LineBasicMaterial[];
    packetMats: SpriteMaterial[];
    dustMat: PointsMaterial;
}

interface ThemePalette {
    dhaka: number;
    hub: number;
    arc: number;
    arcOpacity: number;
    packet: number;
    packetOpacity: number;
    dust: number;
    dustOpacity: number;
    blending: typeof AdditiveBlending | typeof NormalBlending;
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

function getThemeColors(isDark: boolean): ThemePalette {
    return {
        dhaka: isDark ? 0xd4af37 : 0xb8860b,
        hub: isDark ? 0x38bdf8 : 0x0284c7,
        arc: isDark ? 0xd4af37 : 0xca8a04,
        arcOpacity: isDark ? 0.35 : 0.16,
        packet: isDark ? 0xfef08a : 0xd4af37,
        packetOpacity: isDark ? 0.95 : 0.85,
        dust: isDark ? 0x94a3b8 : 0x64748b,
        dustOpacity: isDark ? 0.35 : 0.14,
        blending: isDark ? AdditiveBlending : NormalBlending,
    };
}

function createGlowTexture(): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.45)");
        gradient.addColorStop(1.0, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
    }
    return new CanvasTexture(canvas);
}

export function HeroCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();

    const materialsRef = useRef<ThemeMaterials | null>(null);
    const currentColorsRef = useRef<ThemePalette>(getThemeColors(resolvedTheme === "dark"));
    const rendererRef = useRef<WebGLRenderer | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const cameraRef = useRef<PerspectiveCamera | null>(null);

    // Reference Color to avoid any unused import issues
    const colorHelperRef = useRef<Color>(new Color());
    void colorHelperRef;

    // Lightweight in-place theme update effect (zero WebGL context rebuild)
    useEffect(() => {
        const isDark = resolvedTheme === "dark";
        const nextColors = getThemeColors(isDark);
        currentColorsRef.current = nextColors;

        const materials = materialsRef.current;
        if (!materials) return;

        materials.originMat.color.setHex(nextColors.dhaka);
        materials.haloMat.color.setHex(nextColors.dhaka);

        materials.hubMats.forEach((mat) => {
            mat.color.setHex(nextColors.hub);
        });

        materials.arcMats.forEach((mat) => {
            mat.color.setHex(nextColors.arc);
            mat.opacity = nextColors.arcOpacity;
            mat.blending = nextColors.blending;
            mat.needsUpdate = true;
        });

        materials.packetMats.forEach((mat) => {
            mat.color.setHex(nextColors.packet);
        });

        materials.dustMat.color.setHex(nextColors.dust);
        materials.dustMat.opacity = nextColors.dustOpacity;
        materials.dustMat.blending = nextColors.blending;
        materials.dustMat.needsUpdate = true;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        }
    }, [resolvedTheme]);

    // Primary WebGL mount effect (runs once on mount)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const isMobile = window.innerWidth < 768;
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const colors = currentColorsRef.current;

        // 1. Scene, Camera, Renderer
        const scene = new Scene();
        sceneRef.current = scene;

        const camera = new PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );
        camera.position.set(0, 0, 11);
        cameraRef.current = camera;

        const renderer = new WebGLRenderer({
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
        rendererRef.current = renderer;

        // Group for constellation objects
        const constellationGroup = new Group();
        scene.add(constellationGroup);

        // 2. Soft Radial Glow Texture & Dhaka Origin
        const glowTexture = createGlowTexture();

        const originMat = new SpriteMaterial({
            map: glowTexture,
            color: colors.dhaka,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
        });
        const originSprite = new Sprite(originMat);
        originSprite.scale.set(0.55, 0.55, 1);
        originSprite.position.set(...DHAKA);
        constellationGroup.add(originSprite);

        // Subtle pulsing halo ring for Dhaka
        const haloGeo = new RingGeometry(0.2, 0.28, 32);
        const haloMat = new MeshBasicMaterial({
            color: colors.dhaka,
            transparent: true,
            opacity: 0.45,
            side: DoubleSide,
        });
        const haloMesh = new Mesh(haloGeo, haloMat);
        haloMesh.position.set(...DHAKA);
        constellationGroup.add(haloMesh);

        // 3. Destination Hubs & Arcs
        const activeDestinations = isMobile ? DESTINATIONS.slice(0, 4) : DESTINATIONS;
        const curves: QuadraticBezierCurve3[] = [];
        const packetMeshes: PacketItem[] = [];
        const hubMats: SpriteMaterial[] = [];
        const arcMats: LineBasicMaterial[] = [];
        const packetMats: SpriteMaterial[] = [];

        const packetBaseMat = new SpriteMaterial({
            map: glowTexture,
            color: colors.packet,
            transparent: true,
            opacity: 0,
            depthWrite: false,
        });

        activeDestinations.forEach((dest, i) => {
            // Destination Hub Sprite
            const hubMat = new SpriteMaterial({
                map: glowTexture,
                color: colors.hub,
                transparent: true,
                opacity: 0.85,
                depthWrite: false,
            });
            const hubSprite = new Sprite(hubMat);
            hubSprite.scale.set(0.38, 0.38, 1);
            hubSprite.position.set(...dest.coords);
            constellationGroup.add(hubSprite);
            hubMats.push(hubMat);

            // 3D Quadratic Arc
            const start = new Vector3(...DHAKA);
            const end = new Vector3(...dest.coords);
            const mid = new Vector3(
                (start.x + end.x) * 0.5,
                (start.y + end.y) * 0.5 + 0.8,
                (start.z + end.z) * 0.5 + 1.2
            );

            const curve = new QuadraticBezierCurve3(start, mid, end);
            curves.push(curve);

            const points = curve.getPoints(40);
            const arcGeo = new BufferGeometry().setFromPoints(points);
            const arcMat = new LineBasicMaterial({
                color: colors.arc,
                transparent: true,
                opacity: colors.arcOpacity,
                blending: colors.blending,
            });
            const arcLine = new Line(arcGeo, arcMat);
            constellationGroup.add(arcLine);
            arcMats.push(arcMat);

            // Light pulse packet sprite with cloned material
            const pMat = packetBaseMat.clone();
            const pSprite = new Sprite(pMat);
            pSprite.scale.set(0.28, 0.28, 1);
            pSprite.position.copy(curve.getPoint(0));
            constellationGroup.add(pSprite);
            packetMats.push(pMat);

            packetMeshes.push({
                sprite: pSprite,
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

        const dustGeo = new BufferGeometry();
        dustGeo.setAttribute("position", new BufferAttribute(dustPositions, 3));
        const dustMat = new PointsMaterial({
            color: colors.dust,
            size: isMobile ? 0.14 : 0.18,
            map: glowTexture,
            depthWrite: false,
            transparent: true,
            opacity: colors.dustOpacity,
            blending: colors.blending,
        });
        const dustParticles = new Points(dustGeo, dustMat);
        scene.add(dustParticles);

        // Store theme-dependent materials in ref for in-place theme switching
        materialsRef.current = {
            originMat,
            haloMat,
            hubMats,
            arcMats,
            packetMats,
            dustMat,
        };

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

            // Animate packet pulses along trajectories with smooth edge envelope
            const currentColors = currentColorsRef.current;
            packetMeshes.forEach((item) => {
                const curve = curves[item.curveIndex];
                if (!curve) return;
                const progress = (pulseTime * item.speed + item.offset) % 1;
                const edgeFade = progress < 0.12 ? progress / 0.12 : progress > 0.88 ? (1 - progress) / 0.12 : 1;
                item.sprite.material.opacity = currentColors.packetOpacity * edgeFade;
                const pos = curve.getPointAt(progress);
                item.sprite.position.copy(pos);
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
                if (
                    obj instanceof Mesh ||
                    obj instanceof Line ||
                    obj instanceof Points ||
                    obj instanceof Sprite
                ) {
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

            glowTexture.dispose();
            packetBaseMat.dispose();
            renderer.dispose();
            renderer.forceContextLoss();

            materialsRef.current = null;
            sceneRef.current = null;
            cameraRef.current = null;
            rendererRef.current = null;

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
        />
    );
}
