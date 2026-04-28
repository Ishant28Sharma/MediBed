"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export const ThreeWaveBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 15;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    // Particles Configuration (Match Obsidian Emerald palette subtly)
    // We use a plane geometry converted to points to create a wave grid
    const geometry = new THREE.PlaneGeometry(50, 50, 60, 60);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xc29bff, // Primary purple/emerald hint
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation Loop
    let t = 0;
    let animationFrameId: number;

    const positions = geometry.attributes.position.array;
    const initialY: number[] = [];
    for (let i = 0; i < positions.length; i += 3) {
      initialY.push(positions[i + 1]);
    }

    const animate = () => {
      t += 0.01;

      for (let i = 0; i < positions.length; i += 3) {
        const index = i / 3;
        const x = positions[i];
        const z = positions[i + 2];
        // Create wave motion
        positions[i + 1] = initialY[index] + Math.sin(t + x * 0.5) * 1.5 + Math.cos(t + z * 0.5) * 1.5;
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" 
      style={{ overflow: 'hidden' }}
    />
  );
};
