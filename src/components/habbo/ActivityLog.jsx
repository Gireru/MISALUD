import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, UserPlus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function fmtTime(iso) {
  if (!iso) return '--:--';
  try { return format(new Date(iso), 'HH:mm:ss', { locale: es }); } catch { return '--:--'; }
}

function getLastEvent(journey) {
  const studies = journey.studies || [];
  // Find most recently completed study
  const completed = studies.filter(s => s.completed_at).sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  const current = studies.find(s => s.status === 'in_progress');
  return { completed: completed[0], current };
}

const PRIORITY_DOT = {
  red:    'bg-red-500',
  yellow: 'bg-yellow-400',
  green:  'bg-green-500',
  auto:   'bg-blue-400',
};

export default function ActivityLog({ journeys, allJourneys }) {
  const listRef = useRef(null);

  // Build a flat sorted activity list
  const events = React.useMemo(() => {
    const list = [];

    (allJourneys || journeys).forEach(j => {
      // Registration event
      list.push({
        id: `reg-${j.id}`,
        time: j.created_date,
        type: 'register',
        patient: j.patient_name,
        detail: `Registrado — ${(j.studies || []).length} estudio(s)`,
        priority: j.priority_color || 'auto',
        journeyId: j.id,
      });

      // Study transitions
      (j.studies || []).forEach(s => {
        if (s.completed_at) {
          list.push({
            id: `done-${j.id}-${s.study_name}`,
            time: s.completed_at,
            type: 'complete',
            patient: j.patient_name,
            detail: `✓ ${s.study_name} completado`,
            priority: j.priority_color || 'auto',
            journeyId: j.id,
          });
        }
        if (s.status === 'in_progress') {
          list.push({
            id: `active-${j.id}-${s.study_name}`,
            time: j.updated_date,
            type: 'move',
            patient: j.patient_name,
            detail: `→ ${s.study_name} · ${s.cubicle || s.area}`,
            priority: j.priority_color || 'auto',
            journeyId: j.id,
          });
        }
      });

      // Penalty events
      if ((j.penalty_count || 0) > 0) {
        list.push({
          id: `penalty-${j.id}`,
          time: j.updated_date,
          type: 'penalty',
          patient: j.patient_name,
          detail: `⚠️ Ausencia registrada (${j.penalty_count}/3)`,
          priority: 'red',
          journeyId: j.id,
        });
      }
    });

    return list.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 80);
  }, [journeys, allJourneys]);

  // Auto-scroll to top on new events
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [events.length]);

  const iconFor = (type) => {
    if (type === 'register') return <UserPlus className="w-3 h-3 text-blue-500" />;
    if (type === 'complete') return <CheckCircle2 className="w-3 h-3 text-green-500" />;
    if (type === 'penalty')  return <AlertTriangle className="w-3 h-3 text-red-500" />;
    return <ArrowRight className="w-3 h-3 text-purple-500" />;
  };

  const bgFor = (type) => {
    if (type === 'register') return 'rgba(59,158,255,0.07)';
    if (type === 'complete') return 'rgba(126,217,87,0.07)';
    if (type === 'penalty')  return 'rgba(220,38,38,0.07)';
    return 'rgba(167,139,250,0.07)';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <Clock className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-800">Bitácora de Actividad</h3>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
          {events.length} eventos
        </span>
      </div>

      <div
        ref={listRef}
        className="overflow-y-auto space-y-1.5 pr-1"
        style={{ maxHeight: 520, scrollbarWidth: 'thin' }}
      >
        <AnimatePresence initial={false}>
          {events.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ delay: i < 5 ? i * 0.03 : 0 }}
              className="flex items-start gap-2.5 px-3 py-2 rounded-xl"
              style={{ background: bgFor(ev.type), border: `1px solid ${bgFor(ev.type).replace('0.07', '0.18')}` }}
            >
              {/* Priority dot */}
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[ev.priority] || 'bg-gray-400'}`} />

              {/* Icon */}
              <div className="shrink-0 mt-0.5">{iconFor(ev.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-800 truncate">
                  {ev.patient.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-[10px] text-gray-500 leading-snug truncate">{ev.detail}</p>
              </div>

              {/* Time */}
              <p className="text-[10px] text-gray-400 font-mono shrink-0 mt-0.5">
                {fmtTime(ev.time)}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {events.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-8">Sin actividad registrada</p>
        )}
      </div>
    </div>
  );
}