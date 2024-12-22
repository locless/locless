'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';
import GlobeDots from './globe-dots';
import { AnimateOnScroll } from './AnimationOnScroll';

function ParticleBackground() {
  const ref = useRef<THREE.Points>(null!);
  const [positions] = useMemo(() => {
    const p = new Array(5000).fill(0).map((_, i) => {
      return new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 10 + 5);
    });
    return [new Float32Array(p.flatMap(v => v.toArray()))];
  }, []);

  useFrame(state => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.05;
    ref.current.rotation.y = state.clock.elapsedTime * 0.075;
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color='#252525' size={0.05} sizeAttenuation={true} depthWrite={false} />
    </Points>
  );
}

export default function LoclessHero() {
  return (
    <div className='relative w-full min-h-screen bg-[#0d0d0d] text-white overflow-hidden'>
      <header className='sticky top-0 z-50 container bg-background/80 backdrop-blur-[1px] rounded-xl mt-6'>
        <nav className='mx-auto flex max-full items-center justify-between gap-x-6 p-6 lg:px-8' aria-label='Global'>
          <div className='flex lg:flex-1'>
            <AnimateOnScroll>
              <Link className='flex flex-row items-baseline' href='/'>
                <h1 className='relative flex flex-row items-baseline text-2xl font-bold'>
                  <span className='sr-only text-white'>Locless</span>
                  <span className='tracking-tight hover:cursor-pointer text-white'>locless</span>
                  <sup className='absolute left-[calc(100%+.1rem)] top-0 text-xs font-bold text-white'>[BETA]</sup>
                </h1>
              </Link>
            </AnimateOnScroll>
          </div>
          <div className='hidden lg:flex lg:gap-x-12'>
            <AnimateOnScroll delay={0.3}>
              <Link
                href='/docs'
                target='_blank'
                className='text-sm font-semibold leading-6 text-white opacity-80 hover:opacity-100'
                rel='noreferrer'>
                Docs
              </Link>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.6}>
              <Link
                href='/pricing'
                target='_self'
                className='text-sm font-semibold leading-6 text-white opacity-80 hover:opacity-100'
                rel='noreferrer'>
                Pricing
              </Link>
            </AnimateOnScroll>
          </div>
          <div className='hidden flex-1 items-center justify-end gap-x-6 md:flex'>
            <div className='flex items-center gap-4'>
              <AnimateOnScroll delay={0.9}>
                <Link
                  href='/app/projects'
                  className='custom-button h-10 px-4 py-2 text-sm text-primary-foreground bg-btn_bg'>
                  Sign in
                  <div className='custom-button__left'></div>
                  <div className='custom-button__right'></div>
                </Link>
              </AnimateOnScroll>
              <AnimateOnScroll delay={1.2}>
                <Link
                  href='/sign-up'
                  className='custom-button-reverse h-10 px-4 py-2 text-sm text-primary-foreground bg-[#434343] hover:bg-btn_bg'>
                  Create Account
                  <div className='custom-button-reverse__left'></div>
                  <div className='custom-button-reverse__right'></div>
                </Link>
              </AnimateOnScroll>
            </div>
          </div>
        </nav>
      </header>

      <div className='absolute inset-0 z-10'>
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ParticleBackground />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className='container flex flex-row items-center justify-center h-screen mx-auto px-4 sm:px-6 lg:px-8 lg:gap-x-20'>
        <div className='z-20 flex-1.2'>
          <div className='mx-auto flex flex-col justify-center '>
            <AnimateOnScroll delay={0.3}>
              <h1 className='text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-b from-primary-foreground to-gray-500 inline-block text-transparent bg-clip-text'>
                Ship better
                <br />
                Mobile Apps faster
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.6}>
              <p className='mt-6 text-lg leading-8 text-gray-300 max-w-[620px]'>
                Keep your users engaged by delivering fast updates without waiting for store approvals. Fully
                open-source and developer-friendly.
              </p>
            </AnimateOnScroll>
            <div className='mt-10 flex items-center gap-x-6'>
              <AnimateOnScroll delay={0.9}>
                <Link className='custom-button text-primary-foreground bg-btn_bg' href='/app/projects'>
                  Get started
                  <div className='custom-button__left'></div>
                  <div className='custom-button__right'></div>
                </Link>
              </AnimateOnScroll>
              <AnimateOnScroll delay={1.2}>
                <Link className='custom-button-reverse text-primary-foreground bg-btn_bg' href='/docs'>
                  Documentation
                  <div className='custom-button-reverse__left'></div>
                  <div className='custom-button-reverse__right'></div>
                </Link>
              </AnimateOnScroll>
            </div>
          </div>
          {/*<div className='h-[458px] w-[558px] relative overflow-hidden rounded-xl mt-10 mx-auto'>
            <iframe
              width='100%'
              height='100%'
              src='https://www.youtube.com/embed/6rgK8r3k-kE?si=FIr8PG6Uw-A67IJc&autoplay=1&rel=0'
              title='YouTube video player'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              allowFullScreen
            />
          </div>*/}
        </div>
        <GlobeDots />
      </div>
    </div>
  );
}
