import React, { useRef, useEffect } from 'react';

interface NeuralOrbProps {
  active: boolean;
}

export const NeuralOrb: React.FC<NeuralOrbProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let rotY = 0;
    let rotX = 0.15;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * DPR;
      canvas.height = rect.height * DPR;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Create 800 Fibonacci points on sphere for dense particle cloud like screenshot
    const N = 850;
    const points: {
      x: number;
      y: number;
      z: number;
      colorType: 'cyan' | 'teal' | 'gold' | 'amber';
      size: number;
    }[] = [];

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Color distribution matching screenshot:
      // Mostly bright cyan/teal dots, with a cluster of yellow/amber dots on the upper-right hemisphere
      let colorType: 'cyan' | 'teal' | 'gold' | 'amber' = 'cyan';
      if (y > 0.1 && x > 0.1 && Math.random() > 0.35) {
        colorType = Math.random() > 0.5 ? 'gold' : 'amber';
      } else if (Math.random() > 0.75) {
        colorType = 'teal';
      }

      points.push({
        x,
        y,
        z,
        colorType,
        size: Math.random() * 1.5 + 0.8,
      });
    }

    let time = 0;
    const render = () => {
      time += 0.015;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.38;

      const speed = activeRef.current ? 0.014 : 0.005;
      rotY += speed;
      rotX = 0.12 + Math.sin(time * 0.5) * 0.08;

      // Central volumetric nebula glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.95);
      glowGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
      glowGrad.addColorStop(0.3, 'rgba(0, 200, 230, 0.08)');
      glowGrad.addColorStop(0.65, 'rgba(0, 150, 180, 0.03)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Transform 3D coordinates
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const transformed = points.map((p) => {
        // Rotate Y
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.x * sinY + p.z * cosY;

        // Rotate X
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        return {
          px: cx + x1 * R,
          py: cy + y1 * R,
          z: z2,
          colorType: p.colorType,
          size: p.size,
        };
      });

      // Sort by depth
      transformed.sort((a, b) => a.z - b.z);

      for (const p of transformed) {
        const depth = (p.z + 1) / 2; // 0 (back) to 1 (front)
        const size = p.size * (0.6 + depth * 1.4) * DPR * (activeRef.current ? 1.2 : 1);
        const alpha = Math.max(0.12, Math.min(1, depth * 1.1));

        ctx.beginPath();
        ctx.arc(p.px, p.py, size, 0, Math.PI * 2);

        if (p.colorType === 'gold') {
          ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
          if (depth > 0.6) {
            ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
            ctx.shadowBlur = 4 * DPR;
          }
        } else if (p.colorType === 'amber') {
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
          if (depth > 0.6) {
            ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
            ctx.shadowBlur = 4 * DPR;
          }
        } else if (p.colorType === 'teal') {
          ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`;
          if (depth > 0.6) {
            ctx.shadowColor = 'rgba(45, 212, 191, 0.8)';
            ctx.shadowBlur = 4 * DPR;
          }
        } else {
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
          if (depth > 0.6) {
            ctx.shadowColor = 'rgba(0, 240, 255, 0.9)';
            ctx.shadowBlur = 6 * DPR;
          }
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
