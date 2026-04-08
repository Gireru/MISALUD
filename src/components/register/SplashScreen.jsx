import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #0f1a0f 50%, #0a1a08 100%)' }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Background glow orbs */}
      <motion.div
        className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(126,217,87,0.12) 0%, transparent 70%)', top: '15%', left: '50%', transform: 'translateX(-50%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,143,76,0.15) 0%, transparent 70%)', bottom: '20%', right: '15%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />

      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="relative mb-8"
      >
        {/* Outer ring pulse */}
        <motion.div
          className="absolute -inset-4 rounded-full"
          style={{ border: '1px solid rgba(126,217,87,0.25)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
        />
        <motion.div
          className="absolute -inset-8 rounded-full"
          style={{ border: '1px solid rgba(126,217,87,0.1)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 1 }}
        />

        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7ED957, #3dba1e)',
            boxShadow: '0 0 60px rgba(126,217,87,0.4), 0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          <span className="text-5xl relative z-10">🏥</span>
        </div>
      </motion.div>

      {/* Brand name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-2"
      >
        <h1
          className="text-4xl font-extrabold tracking-tight"
          style={{
            fontFamily: '-apple-system, SF Pro Display, sans-serif',
            background: 'linear-gradient(135deg, #7ED957, #a8f870)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Salud Digna
        </h1>
        <motion.span
          initial={{ opacity: 0, letterSpacing: '0.3em' }}
          animate={{ opacity: 1, letterSpacing: '0.5em' }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-xs font-semibold uppercase block mt-1"
          style={{ color: 'rgba(126,217,87,0.6)' }}
        >
          NX · Nuevo León
        </motion.span>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-sm mt-4"
        style={{ color: 'rgba(255,255,255,0.35)', fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
      >
        Tu salud, nuestra misión
      </motion.p>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="flex gap-2 mt-12"
      >
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#7ED957' }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}