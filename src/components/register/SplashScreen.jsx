import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG wave path helper
const Wave = ({ delay, duration, opacity, scaleY, color, yOffset }) => (
  <motion.div
    className="absolute left-0 right-0 pointer-events-none"
    style={{ bottom: yOffset, height: 220 }}
    initial={{ x: '0%' }}
    animate={{ x: ['-5%', '5%', '-5%'] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  >
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      className="w-full h-full"
      style={{ transform: `scaleY(${scaleY})`, opacity }}
    >
      <motion.path
        fill={color}
        animate={{
          d: [
            'M0,80 C240,140 480,20 720,80 C960,140 1200,20 1440,80 L1440,220 L0,220 Z',
            'M0,100 C200,40 480,160 720,100 C960,40 1200,160 1440,100 L1440,220 L0,220 Z',
            'M0,80 C240,140 480,20 720,80 C960,140 1200,20 1440,80 L1440,220 L0,220 Z',
          ]
        }}
        transition={{ duration: duration * 0.9, delay, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  </motion.div>
);

const Bubble = ({ x, delay, size, duration }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      left: `${x}%`,
      background: 'rgba(255,255,255,0.35)',
      bottom: '15%',
    }}
    initial={{ y: 0, opacity: 0, scale: 0 }}
    animate={{ y: -500, opacity: [0, 0.8, 0.6, 0], scale: [0, 1, 0.8] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeOut', repeatDelay: Math.random() * 1.5 }}
  />
);

const bubbles = [
  { x: 10, delay: 0,   size: 10, duration: 3.5 },
  { x: 22, delay: 0.6, size: 6,  duration: 4   },
  { x: 38, delay: 1.2, size: 14, duration: 3   },
  { x: 52, delay: 0.3, size: 8,  duration: 4.5 },
  { x: 65, delay: 0.9, size: 12, duration: 3.8 },
  { x: 78, delay: 1.5, size: 6,  duration: 3.2 },
  { x: 88, delay: 0.4, size: 10, duration: 4.2 },
];

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('wave'); // wave → logo → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 800);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(onDone, 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center"
      style={{ background: 'white' }}
      animate={phase === 'exit' ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
    >
      {/* Full green background rising up */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #3dba1e 0%, #7ED957 50%, #a8ed6e 100%)' }}
        initial={{ y: '100%' }}
        animate={{ y: phase === 'wave' ? '45%' : '0%' }}
        transition={{ duration: phase === 'wave' ? 0.7 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Wave layers on top of the green fill */}
      <Wave delay={0}   duration={3.5} opacity={0.35} scaleY={1}    color="#008F4C" yOffset="38%" />
      <Wave delay={0.3} duration={4.2} opacity={0.25} scaleY={0.85} color="#5cca38" yOffset="42%" />
      <Wave delay={0.6} duration={5}   opacity={0.15} scaleY={1.1}  color="#ffffff" yOffset="44%" />

      {/* Rising bubbles */}
      {bubbles.map((b, i) => <Bubble key={i} {...b} />)}

      {/* Water surface shimmer */}
      <motion.div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ bottom: '44%', height: 3, background: 'rgba(255,255,255,0.4)', filter: 'blur(2px)' }}
        animate={{ scaleX: [1, 1.03, 0.98, 1], opacity: [0.4, 0.9, 0.5, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Center Logo */}
      <AnimatePresence>
        {phase !== 'wave' && (
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.3, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {/* Logo circle */}
            <motion.div
              className="relative mb-5"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glow rings */}
              {[1.5, 1.8, 2.2].map((s, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: s, opacity: 0 }}
                  transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: 'easeOut' }}
                />
              ))}

              <motion.div
                className="w-32 h-32 rounded-[36px] flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 0 0 4px rgba(255,255,255,0.5)',
                }}
                animate={{
                  boxShadow: [
                    '0 24px 60px rgba(0,0,0,0.18), 0 0 0 4px rgba(255,255,255,0.5)',
                    '0 32px 80px rgba(0,0,0,0.22), 0 0 0 8px rgba(255,255,255,0.3)',
                    '0 24px 60px rgba(0,0,0,0.18), 0 0 0 4px rgba(255,255,255,0.5)',
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(120deg, transparent 30%, rgba(126,217,87,0.3) 50%, transparent 70%)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.2 }}
                />
                <span className="text-7xl select-none relative z-10">🏥</span>
              </motion.div>
            </motion.div>

            {/* Brand name */}
            <motion.h1
              className="text-5xl font-extrabold text-white tracking-tight mb-1"
              style={{
                fontFamily: '-apple-system, SF Pro Display, sans-serif',
                textShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Salud Digna
            </motion.h1>

            <motion.p
              className="text-white/80 text-sm font-medium tracking-widest uppercase"
              style={{ fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Tu salud, nuestra misión
            </motion.p>

            {/* Bouncing dots */}
            <motion.div
              className="flex gap-2 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[0, 0.15, 0.3].map((d, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/70"
                  animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.7, delay: d, repeat: Infinity }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}