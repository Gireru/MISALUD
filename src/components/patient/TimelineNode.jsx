import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, FlaskConical, Scan, Stethoscope, Heart, Syringe, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const areaIcons = {
  'Laboratorio': FlaskConical,
  'Rayos X': Scan,
  'Ultrasonido': Stethoscope,
  'Cardiología': Heart,
  'Vacunación': Syringe,
  'Oftalmología': Eye,
};

export default function TimelineNode({ study, index, isLast }) {
  const Icon = areaIcons[study.area] || FlaskConical;
  const isCompleted = study.status === 'completed';
  const isCurrent = study.status === 'in_progress';
  const isPending = study.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: 'easeOut' }}
      className="flex gap-4"
    >
      {/* Connector line + dot */}
      <div className="flex flex-col items-center">
        <motion.div
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center border-2 relative z-10',
            isCompleted && 'bg-accent border-accent text-accent-foreground',
            isCurrent && 'bg-primary border-primary text-primary-foreground',
            isPending && 'bg-muted border-border text-muted-foreground'
          )}
          animate={isCurrent ? {
            boxShadow: [
              '0 0 0 0 hsla(275, 100%, 25%, 0.4)',
              '0 0 0 12px hsla(275, 100%, 25%, 0)',
            ]
          } : {}}
          transition={isCurrent ? { duration: 1.8, repeat: Infinity, ease: 'easeOut' } : {}}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </motion.div>
        {!isLast && (
          <div className={cn(
            'w-0.5 flex-1 min-h-[40px]',
            isCompleted ? 'bg-accent' : 'bg-border'
          )} />
        )}
      </div>

      {/* Content card */}
      <motion.div
        className={cn(
          'flex-1 rounded-xl p-4 mb-4 border transition-all duration-500',
          isCompleted && 'bg-accent/5 border-accent/20',
          isCurrent && 'bg-primary/5 border-primary/30 shadow-sm',
          isPending && 'bg-muted/50 border-border'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            'font-heading font-semibold text-sm',
            isCompleted && 'text-accent',
            isCurrent && 'text-primary',
            isPending && 'text-muted-foreground'
          )}>
            {study.study_name}
          </h3>
          {isCurrent && (
            <span className="text-[10px] uppercase tracking-widest font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              En curso
            </span>
          )}
          {isCompleted && (
            <span className="text-[10px] uppercase tracking-widest font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              Listo
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{study.area}</p>
        {study.cubicle && isCurrent && (
          <p className="text-xs font-medium text-primary mt-1">📍 {study.cubicle}</p>
        )}
        {study.preparation_note && (isPending || isCurrent) && (
          <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            💡 {study.preparation_note}
          </div>
        )}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{study.estimated_minutes} min estimados</span>
        </div>
      </motion.div>
    </motion.div>
  );
}