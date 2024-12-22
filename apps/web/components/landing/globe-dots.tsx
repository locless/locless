'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const INITIAL_DUMMY_MOUSE_POSITION = -100;

function DotGlobe({ parentRef }: { parentRef: React.RefObject<HTMLDivElement> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const mousePosition = useRef(new THREE.Vector2());
  const previousMousePosition = useRef(new THREE.Vector2());
  const velocities = useRef<Float32Array>(new Float32Array(15000 * 3));
  const { camera } = useThree();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    mousePosition.current.x = INITIAL_DUMMY_MOUSE_POSITION;
    mousePosition.current.y = INITIAL_DUMMY_MOUSE_POSITION;
    const updateMousePosition = (event: MouseEvent) => {
      mousePosition.current.x = (event.offsetX / (parentRef.current?.offsetWidth ?? window.innerWidth)) * 2 - 1;
      mousePosition.current.y = -(event.offsetY / (parentRef.current?.offsetHeight ?? window.innerHeight)) * 2 + 1;
    };
    parentRef.current?.addEventListener('mousemove', updateMousePosition);
    return () => parentRef.current?.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const count = 15000;
  const { positions, originalPositions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const initialPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(1 - 2 * Math.random());
      const radius = 1 + Math.random() * 0.2;

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      // Set initial position at the bottom of the screen
      initialPositions[i * 3] = (Math.random() - 0.5) * 4;
      initialPositions[i * 3 + 1] = -2 - Math.random();
      initialPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      positions[i * 3] = initialPositions[i * 3];
      positions[i * 3 + 1] = initialPositions[i * 3 + 1];
      positions[i * 3 + 2] = initialPositions[i * 3 + 2];

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      colors[i * 3] = 1; // Red component
      colors[i * 3 + 1] = 1; // Green component
      colors[i * 3 + 2] = 1; // Blue component
    }

    return { positions, originalPositions, colors, initialPositions };
  }, [count]);

  useFrame(() => {
    if (!meshRef.current || !groupRef.current) return;

    const mesh = meshRef.current;
    const group = groupRef.current;

    // Auto-turning
    group.rotation.y += 0.001; // Slow auto-rotation

    // Calculate mouse velocity
    const mouseVelocity = mousePosition.current.clone().sub(previousMousePosition.current);
    previousMousePosition.current.copy(mousePosition.current);

    const dampingFactor = 0.95;
    const returnForce = 0.02;
    const repulsionForce = 0.5;
    const repulsionRadius = 0.05; // Small radius for the effect
    const trailFactor = 0.2;

    let allDotsInPlace = true;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = positions[i3];
      let y = positions[i3 + 1];
      let z = positions[i3 + 2];

      if (!animationComplete) {
        // Move dots towards their final positions
        const targetX = originalPositions[i3];
        const targetY = originalPositions[i3 + 1];
        const targetZ = originalPositions[i3 + 2];

        const initialAnimationSpeed = 0.03;

        x += (targetX - x) * initialAnimationSpeed;
        y += (targetY - y) * initialAnimationSpeed;
        z += (targetZ - z) * initialAnimationSpeed;

        if (Math.abs(x - targetX) > 0.01 || Math.abs(y - targetY) > 0.01 || Math.abs(z - targetZ) > 0.01) {
          allDotsInPlace = false;
        }
      } else {
        // Regular globe behavior
        let vx = velocities.current[i3];
        let vy = velocities.current[i3 + 1];
        let vz = velocities.current[i3 + 2];

        // Project 3D position to 2D screen space
        const dotPosition = new THREE.Vector3(x, y, z);
        dotPosition.applyMatrix4(group.matrixWorld);
        dotPosition.project(camera);

        // Check if the dot is front-facing
        if (dotPosition.z < 1) {
          const distanceToMouse = new THREE.Vector2(
            dotPosition.x - mousePosition.current.x,
            dotPosition.y - mousePosition.current.y
          ).length();

          if (distanceToMouse < repulsionRadius) {
            const force = Math.pow(1 - distanceToMouse / repulsionRadius, 2) * repulsionForce;
            const repulsionVector = new THREE.Vector3(
              dotPosition.x - mousePosition.current.x,
              dotPosition.y - mousePosition.current.y,
              0
            ).normalize();

            // Add trail effect based on mouse movement
            const trailInfluence = mouseVelocity.clone().multiplyScalar(trailFactor);

            vx += (repulsionVector.x + trailInfluence.x) * force;
            vy += (repulsionVector.y + trailInfluence.y) * force;
            vz += repulsionVector.z * force;

            // Add some turbulence for more dynamic movement
            vx += (Math.random() - 0.5) * force * 0.1;
            vy += (Math.random() - 0.5) * force * 0.1;
            vz += (Math.random() - 0.5) * force * 0.1;
          }
        }

        // Return force towards original position
        const dx = originalPositions[i3] - x;
        const dy = originalPositions[i3 + 1] - y;
        const dz = originalPositions[i3 + 2] - z;

        vx += dx * returnForce;
        vy += dy * returnForce;
        vz += dz * returnForce;

        // Apply damping
        vx *= dampingFactor;
        vy *= dampingFactor;
        vz *= dampingFactor;

        // Update position
        x += vx;
        y += vy;
        z += vz;

        // Store new velocity
        velocities.current[i3] = vx;
        velocities.current[i3 + 1] = vy;
        velocities.current[i3 + 2] = vz;
      }

      // Update position in array
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      mesh.setMatrixAt(i, new THREE.Matrix4().setPosition(x * 2, y * 2, z * 2));
      const color = new THREE.Color(colors[i3], colors[i3 + 1], colors[i3 + 2]);
      mesh.setColorAt(i, color);
    }

    if (!animationComplete && allDotsInPlace) {
      setAnimationComplete(true);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial
          vertexColors
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={1}
          emissive='#ffffff'
          emissiveIntensity={0.5}
        />
      </instancedMesh>
    </group>
  );
}

export default function GlobeDots() {
  const divRef = useRef<HTMLDivElement>(null!);

  return (
    <div ref={divRef} className='flex-1 aspect-square z-10'>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <DotGlobe parentRef={divRef} />
        <Environment preset='night' />
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
