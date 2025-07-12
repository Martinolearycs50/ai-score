'use client';

import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface Icon3DProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  glowColor?: string;
  className?: string;
}

export default function Icon3D({ 
  icon: Icon, 
  size = 40, 
  color = 'white',
  glowColor = 'var(--accent-cyan)',
  className = ''
}: Icon3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: size * 1.5,
        height: size * 1.5,
        perspective: '1000px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0 rounded-2xl smooth-transition"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}20 0%, transparent 70%)`,
          transform: `scale(${isHovered ? 1.3 : 1})`,
          filter: `blur(${isHovered ? '15px' : '10px'})`,
        }}
      />
      
      <div
        className="relative smooth-transition"
        style={{
          transform: `
            rotateX(${rotation.x}deg) 
            rotateY(${rotation.y}deg) 
            translateZ(${isHovered ? '20px' : '0px'})
            scale(${isHovered ? 1.1 : 1})
          `,
          transformStyle: 'preserve-3d',
        }}
      >
        <Icon
          size={size}
          color={color}
          strokeWidth={2.5}
          className="drop-shadow-2xl"
          style={{
            filter: isHovered 
              ? `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 0 40px ${glowColor})`
              : `drop-shadow(0 0 10px ${glowColor}30)`,
            transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        />
        
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${glowColor}40 0%, transparent 50%)`,
              transform: 'translateZ(10px)',
              borderRadius: '50%',
              filter: 'blur(8px)',
            }}
          />
        )}
      </div>
      
      {isHovered && (
        <>
          <div
            className="absolute inset-0 pointer-events-none animate-pulse"
            style={{
              border: `2px solid ${glowColor}40`,
              borderRadius: '20px',
              transform: 'scale(1.2)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: `1px solid ${glowColor}20`,
              borderRadius: '20px',
              transform: 'scale(1.4)',
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        </>
      )}
    </div>
  );
}