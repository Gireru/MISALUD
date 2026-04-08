import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Particle = ({ delay, x, y, size }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, left: `${x}%`, top: `${y}%`, background: '#7ED957' }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.7, 0], scale: [0, 1, 0], y: [0, -40, -80] }}
    transition={{ duration: 2.2, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: Math.random() * 2 }}
  />
);

const particles = [
  { delay: 0.2, x: 15, y: 70, size: 6 },
  { delay: 0.5, x: 80, y: 60, size: 4 },
  { delay: 0.8, x: 25, y: 50, size: 8 },
  { delay: 0.3, x: 70, y: 75, size: 5 },
  { delay: 1.0, x: 50, y: 80, size: 6 },
  { delay: 0.6, x: 90, y: 45, size: 4 },
  { delay: 1.2, x: 10, y: 40, size: 7 },
  { delay: 0.9, x: 60, y: 65, size: 5 },
];

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'white' }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Animated background blobs */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(126,217,87,0.18) 0%, transparent 70%)',
          top: '-10%', left: '50%', transform: 'translateX(-50%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 350, height: 350,
          background: 'radial-gradient(circle, rgba(61,186,30,0.12) 0%, transparent 70%)',
          bottom: '-5%', right: '-10%',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(0,143,76,0.1) 0%, transparent 70%)',
          bottom: '20%', left: '-8%',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Ripple rings */}
      {[0, 0.4, 0.8].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ border: '2px solid rgba(126,217,87,0.3)', width: 160 + i * 60, height: 160 + i * 60 }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.4], opacity: [0.5, 0] }}
          transition={{ duration: 2.5, delay: delay + 0.3, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}

      {/* Main logo */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 }}
        className="relative mb-8 z-10"
      >
        <motion.div
          className="w-28 h-28 rounded-[32px] flex items-center justify-center relative overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, #7ED957 0%, #3dba1e 60%, #008F4C 100%)',
            boxShadow: '0 20px 60px rgba(126,217,87,0.5), 0 6px 20px rgba(0,0,0,0.08)',
          }}
          animate={{ boxShadow: [
            '0 20px 60px rgba(126,217,87,0.5), 0 6px 20px rgba(0,0,0,0.08)',
            '0 28px 80px rgba(126,217,87,0.7), 0 6px 20px rgba(0,0,0,0.08)',
            '0 20px 60px rgba(126,217,87,0.5), 0 6px 20px rgba(0,0,0,0.08)',
          ]}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          />
          <span className="text-6xl relative z-10 select-none">🏥</span>
        </motion.div>
      </motion.div>

      {/* Brand text */}
      <motion.div
        className="z-10 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
      >
        <motion.h1
          className="text-5xl font-extrabold tracking-tight"
          style={{
            fontFamily: '-apple-system, SF Pro Display, sans-serif',
            background: 'linear-gradient(135deg, #3dba1e, #7ED957, #008F4C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          Salud Digna
        </motion.h1>

        {/* Animated underline */}
        <motion.div
          className="h-0.5 rounded-full mx-auto mt-2"
          style={{ background: 'linear-gradient(90deg, transparent, #7ED957, transparent)' }}
          initial={{ width: 0 }}
          animate={{ width: '80%' }}
          transition={{ delay: 0.9, duration: 0.8, ease: 'easeOut' }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="text-sm mt-3 font-medium"
          style={{ color: '#7ED957', fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
        >
          Tu salud, nuestra misión
        </motion.p>
      </motion.div>

      {/* Bouncing dots loader */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex gap-2 mt-14 z-10"
      >
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: i === 1 ? '#7ED957' : 'rgba(126,217,87,0.4)' }}
            animate={{ y: [0, -10, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 0.7, delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}