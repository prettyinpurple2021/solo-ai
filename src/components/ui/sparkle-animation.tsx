'use client';

import { motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

interface SparkleAnimationProps {
  children: ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  size?: 'small' | 'medium' | 'large';
  color?: 'purple' | 'cyan' | 'pink' | 'rainbow';
  className?: string;
}

// Generate REAL sparkle particles like the reference image
const generateSparkles = (count: number, color: string, size: string) => {
  return Array.from({ length: count }).map((_, i) => {
    const randomDelay = Math.random() * 3;
    const randomDuration = 1 + Math.random() * 2;
    const randomX = Math.random() * 400 - 200;
    const randomY = Math.random() * 400 - 200;
    const randomRotation = Math.random() * 360;
    
    return (
      <motion.div
        key={i}
        className="absolute pointer-events-none"
        initial={{ 
          opacity: 0, 
          scale: 0, 
          rotate: 0,
          x: randomX,
          y: randomY
        }}
        animate={{
          opacity: [0, 1, 0.8, 0],
          scale: [0, 1.2, 0.8, 0],
          rotate: [0, randomRotation, randomRotation * 2],
          x: [randomX, randomX + (Math.random() - 0.5) * 50],
          y: [randomY, randomY + (Math.random() - 0.5) * 50],
        }}
        transition={{
          duration: randomDuration,
          repeat: Infinity,
          delay: randomDelay,
          ease: "easeInOut",
        }}
        style={{
          width: size === 'small' ? '2px' : size === 'medium' ? '4px' : '6px',
          height: size === 'small' ? '2px' : size === 'medium' ? '4px' : '6px',
          background: color,
          borderRadius: '50%',
          filter: `drop-shadow(0 0 3px ${color}) brightness(1.5)`,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    );
  });
};

export const SparkleAnimation = ({
  children,
  intensity = 'medium',
  size = 'medium',
  color = 'rainbow',
  className,
}: SparkleAnimationProps) => {
  const sparkleCount = intensity === 'low' ? 8 : intensity === 'medium' ? 20 : 40;
  
  const sparkleColor = color === 'purple' 
    ? '#B621FF' 
    : color === 'cyan' 
    ? '#18FFFF' 
    : color === 'pink' 
    ? '#FF1FAF' 
    : `linear-gradient(45deg, #B621FF, #18FFFF, #FF1FAF)`;

  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      {children}
      <span className="absolute inset-0 pointer-events-none">
        {generateSparkles(sparkleCount, sparkleColor, size)}
      </span>
    </span>
  );
};

interface GlitterEffectProps {
  children: ReactNode;
  className?: string;
}

export const GlitterEffect = ({ children, className }: GlitterEffectProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {/* This uses the CSS .holo-glitter class for dense glitter */}
      <div className="holo-glitter" />
    </div>
  );
};

interface GlassShineProps {
  children: ReactNode;
  className?: string;
}

export const GlassShine = ({ children, className }: GlassShineProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%', skewX: '-15deg' }}
        animate={{ x: '200%', skewX: '-15deg' }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 3,
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
          width: '50%',
          height: '100%',
        }}
      />
    </div>
  );
};

// New component for dense holographic glitter overlay
interface HolographicGlitterProps {
  children: ReactNode;
  className?: string;
  density?: 'light' | 'medium' | 'heavy';
}

export const HolographicGlitter = ({ 
  children, 
  className,
  density = 'medium'
}: HolographicGlitterProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    const count = density === 'light' ? 30 : density === 'medium' ? 60 : 100;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      color: ['#B621FF', '#18FFFF', '#FF1FAF', '#FFFFFF'][Math.floor(Math.random() * 4)],
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, [density]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            initial={{ 
              opacity: 0, 
              scale: 0,
              x: `${particle.x}%`,
              y: `${particle.y}%`
            }}
            animate={{
              opacity: [0, 1, 0.8, 0],
              scale: [0, 1.5, 0.5, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              filter: `drop-shadow(0 0 4px ${particle.color}) brightness(1.5)`,
              boxShadow: `0 0 8px ${particle.color}`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
