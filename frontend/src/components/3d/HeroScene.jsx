import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroScene = ({ className = '' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8ed, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xe9785b, 2.2);
    mainLight.position.set(8, 10, 8);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xb9a7e8, 1.6);
    fillLight.position.set(-8, -6, 6);
    scene.add(fillLight);

    const backLight = new THREE.PointLight(0xf5b895, 2.0, 30);
    backLight.position.set(0, 0, -6);
    scene.add(backLight);

    // Group for mouse rotation
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Centerpiece: Ceramic Peach/Coral TorusKnot
    const knotGeo = new THREE.TorusKnotGeometry(2.1, 0.65, 128, 32, 2, 3);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0xe9785b,
      emissive: 0x4a180e,
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 0.85,
      clearcoatRoughness: 0.15,
      reflectivity: 0.7,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    worldGroup.add(knotMesh);

    // 2. Orbiting Lavender Dodecahedron
    const dGeo = new THREE.DodecahedronGeometry(0.9, 0);
    const dMat = new THREE.MeshStandardMaterial({
      color: 0xb9a7e8,
      roughness: 0.3,
      metalness: 0.2,
      flatShading: true,
    });
    const dMesh = new THREE.Mesh(dGeo, dMat);
    dMesh.position.set(3.8, 2.4, 1.2);
    worldGroup.add(dMesh);

    // 3. Orbiting Sage Ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.22, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x9db79b,
      roughness: 0.25,
      metalness: 0.1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(-3.6, -2.2, 0.8);
    ringMesh.rotation.x = Math.PI / 3;
    worldGroup.add(ringMesh);

    // 4. Soft Cream Pearl Sphere
    const pearlGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const pearlMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff8ed,
      roughness: 0.15,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const pearlMesh = new THREE.Mesh(pearlGeo, pearlMat);
    pearlMesh.position.set(-3.2, 2.8, -1.0);
    worldGroup.add(pearlMesh);

    // 5. Warm Floating Dust Particles
    const pCount = prefersReducedMotion ? 40 : 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const palette = [0xe9785b, 0xf5b895, 0xb9a7e8, 0xfff8ed, 0x9db79b];

    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const col = new THREE.Color(palette[i % palette.length]);
      pColors[i * 3] = col.r;
      pColors[i * 3 + 1] = col.g;
      pColors[i * 3 + 2] = col.b;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const pMesh = new THREE.Points(pGeo, pMat);
    worldGroup.add(pMesh);

    // Mouse Tracking / Parallax
    let targetRotX = 0;
    let targetRotY = 0;

    const onPointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.7;
      targetRotX = -y * 0.5;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth lerp to mouse rotation
        worldGroup.rotation.y += (targetRotY - worldGroup.rotation.y) * 0.05;
        worldGroup.rotation.x += (targetRotX - worldGroup.rotation.x) * 0.05;

        // Organic self-rotation
        knotMesh.rotation.y = t * 0.35;
        knotMesh.rotation.x = Math.sin(t * 0.25) * 0.25;

        // Orbiting satellites
        dMesh.position.x = Math.cos(t * 0.7) * 4.2;
        dMesh.position.z = Math.sin(t * 0.7) * 2.2;
        dMesh.rotation.y += 0.015;
        dMesh.rotation.x += 0.01;

        ringMesh.position.x = Math.cos(t * 0.5 + 3.14) * 4.4;
        ringMesh.position.z = Math.sin(t * 0.5 + 3.14) * 2.5;
        ringMesh.rotation.z += 0.012;

        pearlMesh.position.y = 2.6 + Math.sin(t * 1.4) * 0.35;

        pMesh.rotation.y = t * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('resize', onResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose geometries & materials
      knotGeo.dispose();
      knotMat.dispose();
      dGeo.dispose();
      dMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pearlGeo.dispose();
      pearlMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[380px] sm:h-[460px] lg:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
      aria-label="Interactive 3D Workspace Scene"
    />
  );
};

export default HeroScene;
