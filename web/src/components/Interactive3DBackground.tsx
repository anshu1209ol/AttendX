'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
}

// Store mouse state in a ref — zero React re-renders on mouse move
interface MouseState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  active: boolean;
}

export default function Interactive3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // ✅ useRef instead of useState — mutations never trigger re-renders
  const mouseRef = useRef<MouseState>({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic color palettes matching AttendX premium theme
    const colors = [
      'rgba(99, 102, 241, ',   // Indigo
      'rgba(147, 51, 234, ',   // Purple
      'rgba(59, 130, 246, ',   // Blue
      'rgba(6, 182, 212, ',    // Cyan
    ];

    // Setup 3D settings
    const particleCount = Math.min(65, Math.floor((width * height) / 22000));
    const fov = 400;
    const particles: Particle[] = [];

    // Initialize particles in 3D space
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * width * 1.2;
      const y = (Math.random() - 0.5) * height * 1.2;
      const z = Math.random() * fov * 2 - fov;

      particles.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // ✅ Mouse handlers mutate the ref directly — no setState, no re-renders
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX - width / 2;
      mouseRef.current.targetY = e.clientY - height / 2;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D rotation angles — constant slow auto-rotation
    const angleY = 0.001;
    const angleX = 0.0005;

    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    // Animation Loop — pure canvas drawing, zero React state touched
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // ✅ Smooth mouse interpolation via direct ref mutation (no setState!)
      const m = mouseRef.current;
      const dx = m.targetX - m.x;
      const dy = m.targetY - m.y;
      m.x += dx * 0.08;
      m.y += dy * 0.08;

      // Calculate interactive 3D rotation from mouse position
      const mouseAngleY = m.active ? (m.x / width) * 0.3 : 0;
      const mouseAngleX = m.active ? (m.y / height) * 0.3 : 0;

      const mCosY = Math.cos(mouseAngleY);
      const mSinY = Math.sin(mouseAngleY);
      const mCosX = Math.cos(mouseAngleX);
      const mSinX = Math.sin(mouseAngleX);

      // Update and project particles
      const projected: { sx: number; sy: number; sz: number; color: string; alpha: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply slow drift velocities
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Keep inside virtual 3D boundaries
        const boundaryX = width * 0.7;
        const boundaryY = height * 0.7;
        if (Math.abs(p.x) > boundaryX) p.vx *= -1;
        if (Math.abs(p.y) > boundaryY) p.vy *= -1;
        if (Math.abs(p.z) > fov) p.vz *= -1;

        // Constant Y-axis rotation
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        // Constant X-axis rotation
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        // Interactive mouse-driven tilt
        let rx = p.x;
        let ry = p.y;
        let rz = p.z;

        if (m.active) {
          const tempX = rx * mCosY - rz * mSinY;
          const tempZ = rz * mCosY + rx * mSinY;
          const tempY = ry * mCosX - tempZ * mSinX;
          rx = tempX;
          ry = tempY;
          rz = tempZ + fov;
        } else {
          rz += fov;
        }

        if (rz <= 0) rz = 1;

        // 3D Perspective Projection
        const scale = fov / rz;
        const sx = width / 2 + rx * scale;
        const sy = height / 2 + ry * scale;

        // Depth-based opacity
        const alpha = Math.max(0.05, Math.min(0.65, 1 - rz / (fov * 2)));

        projected.push({ sx, sy, sz: rz, color: p.color, alpha });

        // Draw particle dot
        const size = Math.max(1, scale * 1.5);
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
      }

      // Draw connection lines between nearby particles
      ctx.lineWidth = 0.55;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];

          const ddx = p1.sx - p2.sx;
          const ddy = p1.sy - p2.sy;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);

          const maxDist = width < 768 ? 85 : 130;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * Math.min(p1.alpha, p2.alpha) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);

            const grad = ctx.createLinearGradient(p1.sx, p1.sy, p2.sx, p2.sy);
            grad.addColorStop(0, `${p1.color}${lineAlpha})`);
            grad.addColorStop(1, `${p2.color}${lineAlpha})`);

            ctx.strokeStyle = grad;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // ✅ Empty dependency array — runs once, never restarts

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden -z-20 bg-background">
      {/* 3D Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Floating slow-rotating CSS glowing orbs for deep 3D background layering */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '14s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/5 blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '18s', animationDelay: '2s' }} />
      <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/5 blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '22s', animationDelay: '4s' }} />
    </div>
  );
}
