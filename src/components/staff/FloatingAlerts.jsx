import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lightbulb, ArrowRightLeft, X, Sparkles } from 'lucide-react';

const typeConfig = {
  critical: {
    gradient: 'linear-gradient(135deg, #ff2d55, #ff6b35)',
    bg: 'rgba(255,45,85,0.06)',
    border: 'rgba(255,45,85,0.15)',
    icon: AlertTriangle,
    iconColor: '#ff2d55',
  },
  warning: {
    gradient: 'linear-gradient(135deg, #f5a623, #ff9500)',
    bg: 'rgba(245,166,35,0.06)',
    border: 'rgba(245,166,35,0.2)',
    icon: Lightbulb,
    iconColor: '#f5a623',
  },
  suggestion: {
    gradient: 'linear-gradient(135deg, #4B0082, #7B00CC)',
    bg: 'rgba(75,0,130,0.06)',
    border: 'rgba(75,0,130,0.12)',
    icon: ArrowRightLeft,
    iconColor: '#4B0082',
  },
};

export default function FloatingAlerts({ modules }) {
  const [dismissed, setDismissed] = useState([]);
  const alerts = [];

  modules.forEach(mod => {
    if (mod.saturation_level === 'critical') {
      alerts.push({
        id: `critical-${mod.area_name}`,
        type: 'critical',
        title: `${mod.area_name} — Crítico`,
        body: `${mod.current_capacity}/${mod.max_capacity} pacientes. Acción inmediata requerida.`,
      });
    } else if (mod.saturation_level === 'high') {
      alerts.push({
        id: `high-${mod.area_name}`,
        type: 'warning',
        title: `${mod.area_name} — Alta saturación`,
        body: `Saturación prevista a capacidad en ~10 min. Considere refuerzo.`,
      });
    }
  });

  const lowAreas = modules.filter(m => m.saturation_level === 'low');
  const highAreas = modules.filter(m => m.saturation_level === 'high' || m.saturation_level === 'critical');
  if (lowAreas.length > 0 && highAreas.length > 0) {
    alerts.push({
      id: 'rebalance',
      type: 'suggestion',
      title: 'Rebalanceo disponible',
      body: `${lowAreas[0].area_name} puede absorber flujo de ${highAreas[0].area_name}.`,
    });
  }

  const visible = alerts.filter(a => !dismissed.includes(a.id));

  if (visible.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 gap-3"
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(0,143,76,0.08)' }}
        >
          <Sparkles className="w-5 h-5 text-[#008F4C]" />
        </div>
        <p
          className="text-sm font-medium text-gray-800"
          style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}
        >
          Flujo óptimo
        </p>
        <p className="text-xs text-gray-400">Sin alertas activas</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {visible.map((alert, i) => {
          const cfg = typeConfig[alert.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.96 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="relative rounded-2xl overflow-hidden p-4"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
              }}
            >
              {/* Color accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                style={{ background: cfg.gradient }}
              />

              <div className="pl-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: cfg.iconColor }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold text-gray-900 mb-0.5"
                      style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}
                    >
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">{alert.body}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDismissed(prev => [...prev, alert.id])}
                  className="shrink-0 w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}