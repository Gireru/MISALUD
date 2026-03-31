import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Scan, Stethoscope, Heart, Syringe, Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const areaIcons = {
  'Laboratorio': FlaskConical,
  'Rayos X': Scan,
  'Ultrasonido': Stethoscope,
  'Cardiología': Heart,
  'Vacunación': Syringe,
  'Oftalmología': Eye,
};

const saturationStyles = {
  low: { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent', label: 'Disponible', dot: 'bg-accent' },
  medium: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-700', text: 'text-amber-600', label: 'Moderado', dot: 'bg-amber-500' },
  high: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700', text: 'text-orange-600', label: 'Alto', dot: 'bg-orange-500' },
  critical: { bg: 'bg-destructive/5', border: 'border-destructive/30', text: 'text-destructive', label: 'Crítico', dot: 'bg-destructive' },
};

export default function ClinicHeatmap({ modules }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modules.map((mod, i) => {
        const Icon = areaIcons[mod.area_name] || FlaskConical;
        const style = saturationStyles[mod.saturation_level] || saturationStyles.low;
        const percent = mod.max_capacity > 0 ? Math.round((mod.current_capacity / mod.max_capacity) * 100) : 0;

        return (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={cn('rounded-2xl border p-5 transition-all', style.bg, style.border)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', style.bg)}>
                  <Icon className={cn('w-5 h-5', style.text)} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm">{mod.area_name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn('w-2 h-2 rounded-full animate-pulse', style.dot)} />
                    <span className={cn('text-[11px] font-medium', style.text)}>{style.label}</span>
                  </div>
                </div>
              </div>
              <span className={cn('text-xl font-heading font-bold', style.text)}>{percent}%</span>
            </div>

            <div className="w-full bg-background rounded-full h-2 overflow-hidden mb-2">
              <motion.div
                className={cn('h-full rounded-full', style.dot)}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{mod.current_capacity}/{mod.max_capacity}</span>
              </div>
              <span>~{mod.avg_wait_minutes || 0} min espera</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}