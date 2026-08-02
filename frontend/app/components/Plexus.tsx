'use client';

import { useEffect, useRef } from 'react';

const NODE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

type Node = { x: number; y: number; vx: number; vy: number; color: string };

/**
 * Animated network of drifting, connected nodes — purely decorative page background.
 */
export default function Plexus({
  className = '',
  maxNodes = 90,
  linkDistance = 150,
}: {
  className?: string;
  maxNodes?: number;
  linkDistance?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(Math.round((width * height) / 16000), maxNodes);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
      }));
    }

    function step() {
      ctx!.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x <= 0 || n.x >= width) n.vx *= -1;
        if (n.y <= 0 || n.y >= height) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDistance) {
            ctx!.strokeStyle = `rgba(167,139,250,${(1 - dist / linkDistance) * 0.3})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx!.fillStyle = n.color;
        ctx!.globalAlpha = 0.8;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }

      frame = requestAnimationFrame(step);
    }

    resize();
    step();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, [maxNodes, linkDistance]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
