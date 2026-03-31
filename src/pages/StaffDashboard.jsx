import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import ClinicHeatmap from '../components/staff/ClinicHeatmap';
import PatientJourneyCard from '../components/staff/PatientJourneyCard';
import AIAlerts from '../components/staff/AIAlerts';

export default function StaffDashboard() {
  const queryClient = useQueryClient();

  const { data: modules = [] } = useQuery({
    queryKey: ['clinical-modules'],
    queryFn: () => base44.entities.ClinicalModule.list(),
  });

  const { data: journeys = [] } = useQuery({
    queryKey: ['all-journeys'],
    queryFn: () => base44.entities.ClinicalJourney.filter({ status: 'active' }, '-created_date', 50),
  });

  const { data: allPatients = [] } = useQuery({
    queryKey: ['all-patients'],
    queryFn: () => base44.entities.Patient.list(),
  });

  // Real-time subscriptions
  useEffect(() => {
    const unsub1 = base44.entities.ClinicalJourney.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['all-journeys'] });
    });
    const unsub2 = base44.entities.ClinicalModule.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['clinical-modules'] });
    });
    return () => { unsub1(); unsub2(); };
  }, [queryClient]);

  const handleJourneyUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['all-journeys'] });
  };

  const activePatients = allPatients.filter(p => p.current_status === 'in_progress').length;
  const completedToday = allPatients.filter(p => p.current_status === 'completed').length;
  const avgWait = modules.length > 0
    ? Math.round(modules.reduce((sum, m) => sum + (m.avg_wait_minutes || 0), 0) / modules.length)
    : 0;

  const stats = [
    { label: 'Pacientes activos', value: activePatients, icon: Users, color: 'text-primary bg-primary/10' },
    { label: 'Completados hoy', value: completedToday, icon: CheckCircle2, color: 'text-accent bg-accent/10' },
    { label: 'Espera promedio', value: `${avgWait} min`, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Throughput', value: `${completedToday + activePatients}`, icon: TrendingUp, color: 'text-primary bg-primary/10' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-body space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold">Mission Control</h1>
        <p className="text-muted-foreground text-sm mt-1">Panel de toma de decisiones en tiempo real</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-heading font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Heatmap + Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-heading font-semibold text-lg mb-4">Mapa de Saturación</h2>
          <ClinicHeatmap modules={modules} />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-lg mb-4">Copiloto de IA</h2>
          <AIAlerts modules={modules} />
        </div>
      </div>

      {/* Active Journeys */}
      <div>
        <h2 className="font-heading font-semibold text-lg mb-4">
          Trayectos Activos
          <span className="text-sm font-normal text-muted-foreground ml-2">({journeys.length})</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {journeys.map((journey, i) => (
            <PatientJourneyCard key={journey.id} journey={journey} index={i} onUpdate={handleJourneyUpdate} />
          ))}
          {journeys.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              No hay trayectos activos en este momento
            </div>
          )}
        </div>
      </div>
    </div>
  );
}