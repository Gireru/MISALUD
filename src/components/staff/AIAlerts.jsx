import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Lightbulb, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIAlerts({ modules }) {
  const alerts = [];

  modules.forEach(mod => {
    if (mod.saturation_level === 'critical') {
      alerts.push({
        type: 'critical',
        icon: AlertTriangle,
        message: `⚠️ ${mod.area_name} en saturación crítica (${mod.current_capacity}/${mod.max_capacity})`,
        suggestion: `Considere redirigir pacientes o asignar personal adicional`,
      });
    } else if (mod.saturation_level === 'high') {
      alerts.push({
        type: 'warning',
        icon: Lightbulb,
        message: `${mod.area_name}: Saturación alta detectada`,
        suggestion: `Mover personal al área de ${mod.area_name}: Saturación prevista en 10 min`,
      });
    }
  });

  // Find areas with low saturation for rebalancing
  const lowAreas = modules.filter(m => m.saturation_level === 'low');
  const highAreas = modules.filter(m => m.saturation_level === 'high' || m.saturation_level === 'critical');

  if (lowAreas.length > 0 && highAreas.length > 0) {
    alerts.push({
      type: 'suggestion',
      icon: ArrowRightLeft,
      message: `Oportunidad de rebalanceo detectada`,
      suggestion: `${lowAreas[0].area_name} tiene disponibilidad. Considere redirigir pacientes de ${highAreas[0].area_name}`,
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
        Todo fluye con normalidad. Sin alertas activas.
      </div>
    );
  }

  const typeStyles = {
    critical: 'bg-destructive/5 border-destructive/20',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
    suggestion: 'bg-primary/5 border-primary/20',
  };

  const iconStyles = {
    critical: 'text-destructive',
    warning: 'text-amber-600',
    suggestion: 'text-primary',
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {alerts.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ delay: i * 0.1 }}
              className={cn('rounded-xl border p-4', typeStyles[alert.type])}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', iconStyles[alert.type])} />
                <div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.suggestion}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}