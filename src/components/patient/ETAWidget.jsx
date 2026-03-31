import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

export default function ETAWidget({ totalMinutes }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => (prev < totalMinutes ? prev + 1 : prev));
    }, 60000);
    return () => clearInterval(interval);
  }, [totalMinutes]);

  const remaining = Math.max(0, totalMinutes - elapsed);
  const hours = Math.floor(remaining / 60);
  const mins = remaining % 60;
  const progress = totalMinutes > 0 ? ((totalMinutes - remaining) / totalMinutes) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border p-5 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Timer className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tiempo estimado</p>
          <p className="font-heading text-2xl font-bold text-foreground">
            {hours > 0 ? `${hours}h ` : ''}{mins} min
          </p>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        Progreso de tu visita · Actualizado en tiempo real
      </p>
    </motion.div>
  );
}