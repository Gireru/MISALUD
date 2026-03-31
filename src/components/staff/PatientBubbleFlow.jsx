import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const COLORS = [
  { bg: '#4B0082', light: 'rgba(75,0,130,0.08)' },
  { bg: '#008F4C', light: 'rgba(0,143,76,0.08)' },
  { bg: '#f5a623', light: 'rgba(245,166,35,0.08)' },
  { bg: '#ff6b35', light: 'rgba(255,107,53,0.08)' },
  { bg: '#007aff', light: 'rgba(0,122,255,0.08)' },
];

function getInitials(name) {
  return name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

export default function PatientBubbleFlow({ journeys, onUpdate }) {
  const markStudyComplete = async (journey, studyIndex) => {
    const updatedStudies = [...(journey.studies || [])];
    updatedStudies[studyIndex].status = 'completed';
    updatedStudies[studyIndex].completed_at = new Date().toISOString();

    const nextPending = updatedStudies.findIndex(s => s.status === 'pending');
    if (nextPending !== -1) updatedStudies[nextPending].status = 'in_progress';

    const allDone = updatedStudies.every(s => s.status === 'completed');
    await base44.entities.ClinicalJourney.update(journey.id, {
      studies: updatedStudies,
      status: allDone ? 'completed' : 'active',
    });
    if (allDone) {
      await base44.entities.Patient.update(journey.patient_id, { current_status: 'completed' });
    }
    onUpdate?.();
  };

  if (journeys.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No hay trayectos activos en este momento
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {journeys.map((journey, i) => {
        const studies = journey.studies || [];
        const completed = studies.filter(s => s.status === 'completed').length;
        const currentStudy = studies.find(s => s.status === 'in_progress');
        const currentIdx = studies.findIndex(s => s.status === 'in_progress');
        const color = COLORS[i % COLORS.length];

        return (
          <motion.div
            key={journey.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="relative rounded-3xl p-5 overflow-hidden"
            style={{
              background: 'white',
              boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
              style={{ background: `linear-gradient(to right, ${color.bg}, ${COLORS[(i + 1) % COLORS.length].bg})` }}
            />

            <div className="flex items-center gap-4 mb-4">
              <motion.div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: color.bg, fontFamily: '-apple-system, SF Pro Display, sans-serif' }}
                whileHover={{ scale: 1.05 }}
              >
                {getInitials(journey.patient_name)}
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-sm text-gray-900 truncate"
                  style={{ fontFamily: '-apple-system, SF Pro Display, sans-serif' }}
                >
                  {journey.patient_name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {currentStudy ? `En: ${currentStudy.study_name}` : 'Completado'}
                  {currentStudy?.cubicle ? ` · ${currentStudy.cubicle}` : ''}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p
                  className="text-sm font-bold"
                  style={{ color: color.bg, fontFamily: '-apple-system, SF Pro Display, sans-serif' }}
                >
                  {completed}/{studies.length}
                </p>
                <p className="text-[10px] text-gray-400">estudios</p>
              </div>
            </div>

            {/* Study step bubbles */}
            <div className="flex items-center gap-1.5 mb-2">
              {studies.map((s, si) => (
                <motion.button
                  key={si}
                  className="relative flex-1 h-7 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: s.status === 'completed'
                      ? `linear-gradient(135deg, ${color.bg}, ${color.bg}cc)`
                      : s.status === 'in_progress'
                      ? color.light
                      : '#f5f5f7',
                    border: s.status === 'in_progress' ? `1.5px solid ${color.bg}` : '1.5px solid transparent',
                    cursor: s.status === 'in_progress' ? 'pointer' : 'default',
                  }}
                  onClick={() => s.status === 'in_progress' && markStudyComplete(journey, si)}
                  whileHover={s.status === 'in_progress' ? { scale: 1.04 } : {}}
                  whileTap={s.status === 'in_progress' ? { scale: 0.96 } : {}}
                  title={s.study_name}
                >
                  {s.status === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : s.status === 'in_progress' ? (
                    <motion.div
                      className="w-2 h-2 rounded-full"
                      style={{ background: color.bg }}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  )}
                </motion.button>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 mb-3 truncate">
              {studies.map(s => s.study_name).join(' → ')}
            </p>

            {currentStudy && (
              <motion.button
                onClick={() => markStudyComplete(journey, currentIdx)}
                className="w-full py-2.5 rounded-2xl text-xs font-semibold transition-all"
                style={{
                  background: color.light,
                  color: color.bg,
                  border: `1px solid ${color.bg}20`,
                  fontFamily: '-apple-system, SF Pro Text, sans-serif',
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                ✓ Completar: {currentStudy.study_name}
              </motion.button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}