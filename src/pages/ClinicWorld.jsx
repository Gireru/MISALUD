import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, AlertTriangle, Zap, Activity, X } from 'lucide-react';
import HabboClinic, { ZONES } from '../components/habbo/HabboClinic';
import ActivityLog from '../components/habbo/ActivityLog';

const SF = '-apple-system, SF Pro Display, BlinkMacSystemFont, sans-serif';

function getCurrentZone(journey) {
  const s = (journey.studies || []).find(s => s.status === 'in_progress');
  if (s) return s.area;
  return 'Sala de Espera';
}

function PriorityBadge({ priority }) {
  const cfg = {
    red:    { bg: '#FEE2E2', text: '#DC2626', label: 'Urgente' },
    yellow: { bg: '#FEF3C7', text: '#D97706', label: 'Elevado' },
    green:  { bg: '#DCFCE7', text: '#16A34A', label: 'Normal' },
    auto:   { bg: '#DBEAFE', text: '#2563EB', label: 'Normal' },
  }[priority || 'auto'];
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
      {cfg.label}
    </span>
  );
}

// Detail panel for selected patient
function PatientDetailPanel({ journey, onClose }) {
  if (!journey) return null;
  const studies = journey.studies || [];
  const done = studies.filter(s => s.status === 'completed').length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="rounded-3xl p-5 bg-white shadow-xl border border-gray-100"
      style={{ fontFamily: SF }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-gray-900">{journey.patient_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <PriorityBadge priority={journey.priority_color} />
            {(journey.penalty_count || 0) > 0 && (
              <span className="text-[10px] text-red-500 font-semibold">⚠️ {journey.penalty_count} ausencia(s)</span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${studies.length > 0 ? (done / studies.length) * 100 : 0}%`, background: 'linear-gradient(90deg,#7ED957,#008F4C)' }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-600">{done}/{studies.length}</span>
      </div>

      {/* Studies list */}
      <div className="space-y-2">
        {studies.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{
              background: s.status === 'completed' ? 'rgba(126,217,87,0.08)' : s.status === 'in_progress' ? 'rgba(59,158,255,0.08)' : 'rgba(0,0,0,0.03)',
              border: s.status === 'in_progress' ? '1px solid rgba(59,158,255,0.25)' : '1px solid transparent',
            }}
          >
            <span className="text-base">
              {s.status === 'completed' ? '✅' : s.status === 'in_progress' ? '🔵' : '⏳'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{s.study_name}</p>
              <p className="text-[10px] text-gray-400">{s.cubicle || s.area} · {s.estimated_minutes} min</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current location */}
      <div className="mt-4 px-3 py-2 rounded-xl" style={{ background: 'rgba(126,217,87,0.06)', border: '1px solid rgba(126,217,87,0.15)' }}>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Ubicación actual</p>
        <p className="text-sm font-bold text-gray-800">
          {ZONES[getCurrentZone(journey)]?.emoji || '🏥'} {getCurrentZone(journey)}
        </p>
      </div>
    </motion.div>
  );
}

export default function ClinicWorld() {
  const queryClient = useQueryClient();
  const [selectedJourney, setSelectedJourney] = useState(null);

  const { data: journeys = [] } = useQuery({
    queryKey: ['world-journeys'],
    queryFn: () => base44.entities.ClinicalJourney.filter({ status: 'active' }, '-created_date', 80),
    refetchInterval: 8000,
  });

  const { data: allJourneys = [] } = useQuery({
    queryKey: ['world-all-journeys'],
    queryFn: () => base44.entities.ClinicalJourney.list('-created_date', 100),
    refetchInterval: 15000,
  });

  // Real-time subscription
  useEffect(() => {
    const u1 = base44.entities.ClinicalJourney.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['world-journeys'] });
      queryClient.invalidateQueries({ queryKey: ['world-all-journeys'] });
    });
    return () => u1();
  }, [queryClient]);

  // Stats
  const urgent = journeys.filter(j => j.priority_color === 'red').length;
  const penalized = journeys.filter(j => (j.penalty_count || 0) > 0).length;
  const totalStudies = journeys.reduce((sum, j) => sum + (j.studies || []).length, 0);
  const completedStudies = journeys.reduce((sum, j) => sum + (j.studies || []).filter(s => s.status === 'completed').length, 0);

  const handleSelectJourney = (journey) => {
    setSelectedJourney(prev => prev?.id === journey.id ? null : journey);
  };

  // Update selected journey when data refreshes
  useEffect(() => {
    if (!selectedJourney) return;
    const updated = journeys.find(j => j.id === selectedJourney.id);
    if (updated) setSelectedJourney(updated);
  }, [journeys]);

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: '#f0f4ff', fontFamily: SF }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              className="w-2 h-2 rounded-full bg-[#7ED957]"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] font-bold tracking-widest text-[#3dba1e] uppercase">Vista en Vivo</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">🏥 Clínica World</h1>
          <p className="text-xs text-gray-400 mt-0.5">{journeys.length} pacientes activos en tiempo real</p>
        </div>
        <a
          href="/staff"
          className="text-xs px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Mission Control
        </a>
      </motion.div>

      {/* Quick stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Activos', value: journeys.length, icon: '👥', color: '#3B9EFF' },
          { label: 'Urgentes', value: urgent, icon: '🚨', color: '#FF6B6B' },
          { label: 'Penalizados', value: penalized, icon: '⚠️', color: '#FFB347' },
          { label: 'Estudios', value: `${completedStudies}/${totalStudies}`, icon: '✅', color: '#7ED957' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl px-4 py-3 bg-white shadow-sm border border-white/80 text-center"
          >
            <p className="text-lg">{s.icon}</p>
            <p className="text-xl font-bold text-gray-900" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-gray-400 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-4 gap-5">

        {/* Habbo Clinic — takes 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl overflow-hidden shadow-lg border border-white/50"
            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}
          >
            <div className="px-5 pt-4 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#7ED957]" />
              <span className="text-sm font-bold text-gray-800">Vista Isométrica del Consultorio</span>
              <span className="ml-auto text-[10px] text-gray-400">Haz click en un personaje para ver detalles</span>
            </div>
            <HabboClinic
              journeys={journeys}
              onSelectJourney={handleSelectJourney}
              selectedId={selectedJourney?.id}
            />
          </motion.div>

          {/* Selected patient detail */}
          <AnimatePresence>
            {selectedJourney && (
              <PatientDetailPanel
                journey={selectedJourney}
                onClose={() => setSelectedJourney(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right panel — Activity log */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl p-5 shadow-lg border border-white/50 h-full"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}
          >
            <ActivityLog journeys={journeys} allJourneys={allJourneys} />
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5 rounded-2xl px-5 py-3 flex flex-wrap gap-4 items-center"
        style={{ background: 'rgba(255,255,255,0.7)' }}
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Leyenda:</span>
        {[
          { color: '#3B9EFF', label: 'Normal' },
          { color: '#7ED957', label: 'Prioritario (verde)' },
          { color: '#FFB347', label: 'Elevado (amarillo)' },
          { color: '#FF6B6B', label: 'Urgente (rojo)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            <span className="text-xs text-gray-600">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <motion.div className="w-2 h-2 rounded-full bg-[#7ED957]" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-[10px] text-gray-400">Actualización cada 8s · Eventos en tiempo real</span>
        </div>
      </motion.div>
    </div>
  );
}