import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Scan, Stethoscope, Heart, Syringe, Eye, Check } from 'lucide-react';

const areaIcons = {
  'Laboratorio': FlaskConical,
  'Rayos X': Scan,
  'Ultrasonido': Stethoscope,
  'Cardiología': Heart,
  'Vacunación': Syringe,
  'Oftalmología': Eye,
};

export default function LuxuryTimelineNode({ study, index, isLast }) {
  const Icon = areaIcons[study.area] || FlaskConical;
  const isCompleted = study.status === 'completed';
  const isCurrent = study.status === 'in_progress';
  const isPending = study.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.14, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex gap-6 pb-10"
    >
      {/* Circle node */}
      <div className="relative z-10 flex-shrink-0">
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.14 + 0.2, type: 'spring', stiffness: 400 }}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #008F4C, #00b85e)',
              boxShadow: '0 4px 20px rgba(0,143,76,0.35)',
            }}
          >
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: index * 0.14 + 0.4, duration: 0.4 }}
            >
              <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        )}

        {isCurrent && (
          <>
            {/* Outer glow rings */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: 'radial-gradient(circle, rgba(126,217,87,0.4) 0%, transparent 70%)' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              style={{ background: 'radial-gradient(circle, rgba(126,217,87,0.25) 0%, transparent 70%)' }}
            />
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #7ED957, #3dba1e)',
                boxShadow: '0 0 0 4px rgba(126,217,87,0.2), 0 8px 32px rgba(126,217,87,0.45)',
              }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          </>
        )}

        {isPending && (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: '#f5f5f7',
              border: '2px solid #e5e5ea',
            }}
          >
            <Icon className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-2">
        <div className="flex items-center justify-between mb-1">
          <h3
            className="font-semibold leading-tight"
            style={{
              fontFamily: '-apple-system, SF Pro Display, BlinkMacSystemFont, Segoe UI, sans-serif',
              fontSize: 15,
              color: isCompleted ? '#008F4C' : isCurrent ? '#3dba1e' : '#8e8e93',
            }}
          >
            {study.study_name}
          </h3>
          {isCurrent && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(126,217,87,0.12)', color: '#3dba1e' }}
            >
              Ahora
            </motion.span>
          )}
          {isCompleted && (
            <span
              className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,143,76,0.08)', color: '#008F4C' }}
            >
              Listo
            </span>
          )}
        </div>

        <p
          className="text-xs mb-2"
          style={{ color: '#8e8e93', fontFamily: '-apple-system, SF Pro Text, BlinkMacSystemFont, sans-serif' }}
        >
          {study.area}
        </p>

        {/* Cubicle for current */}
        {study.cubicle && isCurrent && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl mb-2"
            style={{ background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#3dba1e]" />
            <span className="text-xs font-medium text-[#3dba1e]">{study.cubicle}</span>
          </motion.div>
        )}

        {/* Prep note */}
        {study.preparation_note && (isCurrent || isPending) && (
          <div
            className="text-xs px-3 py-2 rounded-xl mb-2"
            style={{
              background: 'rgba(255,196,0,0.07)',
              border: '1px solid rgba(255,196,0,0.2)',
              color: '#8a6800',
              fontFamily: '-apple-system, SF Pro Text, sans-serif',
            }}
          >
            💡 {study.preparation_note}
          </div>
        )}

        {/* Time */}
        <p
          className="text-[11px]"
          style={{ color: '#aeaeb2', fontFamily: '-apple-system, SF Pro Text, sans-serif' }}
        >
          ~{study.estimated_minutes} min
        </p>
      </div>
    </motion.div>
  );
}