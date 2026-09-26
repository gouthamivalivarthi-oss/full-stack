import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground = ({
  className = '',
  intensity = 1,
  showObjects = true,
  interactive = true,
}) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 18;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent canvas
    mount.appendChild(renderer.domElement);

    // Warm Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xfff8ed, 1.2 * intensity);
    scene.add(ambientLight);

    const coralLight = new THREE.DirectionalLight(0xe9785b, 1.8 * intensity);
    coralLight.position.set(12, 14, 10);
    scene.add(coralLight);

    const lavenderLight = new THREE.PointLight(0xb9a7e8, 2.0 * intensity, 40);
    lavenderLight.position.set(-10, -8, 8);
    scene.add(lavenderLight);

    const peachLight = new THREE.PointLight(0xf5b895, 1.5 * intensity, 35);
    peachLight.position.set(0, 10, -5);
    scene.add(peachLight);

    // Particle Field (warm stars / glowing dust)
    const particleCount = prefersReducedMotion ? 60 : 160;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const warmPalette = [
      new THREE.Color(0xf5b895), // Peach
      new THREE.Color(0xe9785b), // Coral
      new THREE.Color(0xb9a7e8), // Lavender
      new THREE.Color(0x9db79b), // Sage
      new THREE.Color(0xfff8ed), // Cream
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;

      const color = warmPalette[Math.floor(Math.random() * warmPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Floating 3D Geometric Objects (Ceramic / Smooth Standard Materials)
    const meshes = [];
    if (showObjects) {
      // 1. Warm Coral Rounded Torus
      const torusGeo = new THREE.TorusGeometry(2.4, 0.75, 24, 60);
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0xe9785b,
        roughness: 0.28,
        metalness: 0.12,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      torusMesh.position.set(7, 3, -4);
      scene.add(torusMesh);
      meshes.push({ mesh: torusMesh, rx: 0.005, ry: 0.008, rz: 0.003, floatSpeed: 0.0015, baseY: 3 });

      // 2. Soft Lavender Icosahedron
      const icoGeo = new THREE.IcosahedronGeometry(1.9, 0);
      const icoMat = new THREE.MeshStandardMaterial({
        color: 0xb9a7e8,
        roughness: 0.35,
        metalness: 0.15,
        flatShading: true,
      });
      const icoMesh = new THREE.Mesh(icoGeo, icoMat);
      icoMesh.position.set(-8, -3, -2);
      scene.add(icoMesh);
      meshes.push({ mesh: icoMesh, rx: -0.006, ry: 0.005, rz: 0.004, floatSpeed: 0.0018, baseY: -3 });

      // 3. Peach Smooth Sphere
      const sphereGeo = new THREE.SphereGeometry(1.4, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xf5b895,
        roughness: 0.2,
        metalness: 0.08,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(-6, 5, -5);
      scene.add(sphereMesh);
      meshes.push({ mesh: sphereMesh, rx: 0.004, ry: 0.004, rz: 0.002, floatSpeed: 0.002, baseY: 5 });

      // 4. Sage Green Octahedron
      const octaGeo = new THREE.OctahedronGeometry(1.5, 0);
      const octaMat = new THREE.MeshStandardMaterial({
        color: 0x9db79b,
        roughness: 0.3,
        metalness: 0.1,
        flatShading: true,
      });
      const octaMesh = new THREE.Mesh(octaGeo, octaMat);
      octaMesh.position.set(9, -4.5, -3);
      scene.add(octaMesh);
      meshes.push({ mesh: octaMesh, rx: 0.006, ry: -0.007, rz: 0.003, floatSpeed: 0.0012, baseY: -4.5 });
    }

    // Mouse Interaction / Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      if (!interactive || prefersReducedMotion) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = x * 1.5;
      targetY = y * 1.2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      if (!prefersReducedMotion) {
        mouseX += (targetX - mouseX) * 0.04;
        mouseY += (targetY - mouseY) * 0.04;
        camera.position.x = mouseX * 2;
        camera.position.y = mouseY * 1.5;
        camera.lookAt(0, 0, 0);

        // Rotate particles
        particles.rotation.y = elapsedTime * 0.02;
        particles.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;

        // Floating meshes
        meshes.forEach(({ mesh, rx, ry, rz, floatSpeed, baseY }) => {
          mesh.rotation.x += rx;
          mesh.rotation.y += ry;
          mesh.rotation.z += rz;
          mesh.position.y = baseY + Math.sin(elapsedTime * 1.5 + baseY) * 0.45;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();

      meshes.forEach(({ mesh }) => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        scene.remove(mesh);
      });

      renderer.dispose();
    };
  }, [intensity, showObjects, interactive]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};

export default ThreeBackground;
