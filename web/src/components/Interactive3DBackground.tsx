'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
}

export default function Interactive3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

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
      'rgba(99, 102, 241, ',  // Indigo
      'rgba(147, 51, 234, ',  // Purple
      'rgba(59, 130, 246, ',  // Blue
      'rgba(6, 182, 212, ',   // Cyan
    ];

    // Setup 3D settings
    const particleCount = Math.min(65, Math.floor((width * height) / 22000));
    const fov = 400; // Field of view / depth scaling factor
    const particles: Particle[] = [];

    // Initialize particles in 3D space
    for (let i = 0; i < particleCount; i++) {
      // Random coordinates inside a virtual 3D box
      const x = (Math.random() - 0.5) * width * 1.2;
      const y = (Math.random() - 0.5) * height * 1.2;
      const z = Math.random() * fov * 2 - fov;

      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Handle mouse move
    const handleMouseMove = (e: MouseEvent) => {
      setMouse((prev) => ({
        ...prev,
        targetX: e.clientX - width / 2,
        targetY: e.clientY - height / 2,
        active: true,
      }));
    };

    const handleMouseLeave = () => {
      setMouse((prev) => ({ ...prev, active: false }));
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

    // 3D rotation angles
    let angleY = 0.001; // slow continuous horizontal rotation
    let angleX = 0.0005; // slow continuous vertical rotation

    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      setMouse((prev) => {
        const dx = prev.targetX - prev.x;
        const dy = prev.targetY - prev.y;
        return {
          ...prev,
          x: prev.x + dx * 0.08,
          y: prev.y + dy * 0.08,
        };
      });

      // Calculate temporary interactive 3D rotation based on mouse position
      const mouseAngleY = mouse.active ? (mouse.x / width) * 0.3 : 0;
      const mouseAngleX = mouse.active ? (mouse.y / height) * 0.3 : 0;
      
      const mCosY = Math.cos(mouseAngleY);
      const mSinY = Math.sin(mouseAngleY);
      const mCosX = Math.cos(mouseAngleX);
      const mSinX = Math.sin(mouseAngleX);

      // 1. Update and project particles
      const projected: { sx: number; sy: number; sz: number; color: string; alpha: number }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply constant slow drift velocities
        p.baseX += p.vx;
        p.baseY += p.vy;
        p.baseZ += p.vz;

        // Keep inside virtual 3D boundaries
        const boundaryX = width * 0.7;
        const boundaryY = height * 0.7;
        if (Math.abs(p.baseX) > boundaryX) p.vx *= -1;
        if (Math.abs(p.baseY) > boundaryY) p.vy *= -1;
        if (Math.abs(p.baseZ) > fov) p.vz *= -1;

        // Perform standard rotation updates around Y axis
        let x1 = p.baseX * cosY - p.baseZ * sinY;
        let z1 = p.baseZ * cosY + p.baseX * sinY;

        // Perform rotation updates around X axis
        let y2 = p.baseY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.baseY * sinX;

        p.baseX = x1;
        p.baseY = y2;
        p.baseZ = z2;

        // Interactive mouse distortion (adds a springy 3D depth tilt!)
        let rx = p.baseX;
        let ry = p.baseY;
        let rz = p.baseZ;

        if (mouse.active) {
          // Rotate coordinates around temporary interactive mouse vectors
          const tempX = rx * mCosY - rz * mSinY;
          const tempZ = rz * mCosY + rx * mSinY;
          const tempY = ry * mCosX - tempZ * mSinX;
          
          rx = tempX;
          ry = tempY;
          rz = tempZ + fov; // Shift depth offset
        } else {
          rz += fov; // Shift depth offset
        }

        // Prevent division by zero
        if (rz <= 0) rz = 1;

        // 3D Perspective Projection
        const scale = fov / rz;
        const sx = width / 2 + rx * scale;
        const sy = height / 2 + ry * scale;

        // Calculate opacity based on depth (z-depth)
        const alpha = Math.max(0.05, Math.min(0.65, 1 - rz / (fov * 2)));

        projected.push({ sx, sy, sz: rz, color: p.color, alpha });

        // Draw particle dot
        const size = Math.max(1, scale * 1.5);
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
      }

      // 2. Draw connections (lines) between close particles in 3D
      ctx.lineWidth = 0.55;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];

          // Calculate visual distance
          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect if close, and blend their depths/colors
          const maxDist = width < 768 ? 85 : 130;
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * Math.min(p1.alpha, p2.alpha) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            
            // Create nice gradient between nodes
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
  }, [mouse.active, mouse.x, mouse.y]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden -z-20 bg-background">
      {/* 3D Interactive Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Floating Slow-Rotating CSS Glowing Orbs for deep 3D background visual layering */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '14s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/5 blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '18s', animationDelay: '2s' }} />
      <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/5 blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '22s', animationDelay: '4s' }} />
    </div>
  );
}
