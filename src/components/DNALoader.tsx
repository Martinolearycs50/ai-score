'use client';

import { useEffect, useRef, useState } from 'react';

interface DNALoaderProps {
  size?: number;
  color1?: string;
  color2?: string;
}

export default function DNALoader({ 
  size = 200, 
  color1 = 'var(--accent-cyan)',
  color2 = 'var(--accent-purple)' 
}: DNALoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isClient) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const amplitude = size * 0.3;
    const frequency = 0.02;
    const helixCount = 20;
    const particleSize = size * 0.03;
    
    let phase = 0;

    const drawHelix = () => {
      ctx.clearRect(0, 0, size, size);
      
      // Draw connection lines
      for (let i = 0; i < helixCount; i++) {
        const y = (i / helixCount) * size;
        const x1 = centerX + Math.sin(y * frequency + phase) * amplitude;
        const x2 = centerX + Math.sin(y * frequency + phase + Math.PI) * amplitude;
        
        // Connection gradient
        const gradient = ctx.createLinearGradient(x1, y, x2, y);
        gradient.addColorStop(0, `${color1}30`);
        gradient.addColorStop(0.5, `${color2}50`);
        gradient.addColorStop(1, `${color1}30`);
        
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw helix strands
      for (let strand = 0; strand < 2; strand++) {
        const phaseOffset = strand * Math.PI;
        
        ctx.beginPath();
        for (let i = 0; i < helixCount; i++) {
          const y = (i / helixCount) * size;
          const x = centerX + Math.sin(y * frequency + phase + phaseOffset) * amplitude;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.strokeStyle = strand === 0 ? color1 : color2;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw particles
        for (let i = 0; i < helixCount; i++) {
          const y = (i / helixCount) * size;
          const x = centerX + Math.sin(y * frequency + phase + phaseOffset) * amplitude;
          
          // Glow effect
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize * 3);
          glowGradient.addColorStop(0, strand === 0 ? `${color1}80` : `${color2}80`);
          glowGradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(x, y, particleSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();
          
          // Core particle
          ctx.beginPath();
          ctx.arc(x, y, particleSize, 0, Math.PI * 2);
          ctx.fillStyle = strand === 0 ? color1 : color2;
          ctx.fill();
        }
      }
      
      phase += 0.05;
      animationFrameRef.current = requestAnimationFrame(drawHelix);
    };

    drawHelix();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [size, color1, color2, isClient]);

  if (!isClient) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="absolute inset-0"
      />
      
      {/* Additional glow effects */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${color1}20 0%, transparent 50%)`,
          filter: 'blur(20px)',
        }}
      />
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${color2}20 0%, transparent 50%)`,
          filter: 'blur(30px)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />
    </div>
  );
}