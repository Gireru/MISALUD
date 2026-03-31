import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import TimelineNode from '../components/patient/TimelineNode';
import ETAWidget from '../components/patient/ETAWidget';
import ChatAssistant from '../components/patient/ChatAssistant';

export default function PatientView() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ['patient-by-token', token],
    queryFn: () => base44.entities.Patient.filter({ qr_token: token }),
    enabled: !!token,
  });

  const patient = patients?.[0];

  const { data: journeys } = useQuery({
    queryKey: ['journey-for-patient', patient?.id],
    queryFn: () => base44.entities.ClinicalJourney.filter({ patient_id: patient.id }),
    enabled: !!patient?.id,
  });

  const journey = journeys?.[0];

  // Real-time subscription
  useEffect(() => {
    if (!journey?.id) return;
    const unsub = base44.entities.ClinicalJourney.subscribe((event) => {
      if (event.id === journey.id) {
        queryClient.invalidateQueries({ queryKey: ['journey-for-patient'] });
      }
    });
    return unsub;
  }, [journey?.id, queryClient]);

  const studies = journey?.studies || [];
  const completedCount = studies.filter(s => s.status === 'completed').length;
  const remainingMinutes = studies
    .filter(s => s.status !== 'completed')
    .reduce((sum, s) => sum + (s.estimated_minutes || 0), 0);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">SD-NEXUS</h1>
          <p className="text-muted-foreground text-sm">Escanea tu código QR para ver tu trayecto clínico</p>
        </div>
      </div>
    );
  }

  if (!patient || !journey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 px-6 pt-10 pb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sm text-primary">SD-NEXUS</span>
          </div>

          <h1 className="font-heading text-2xl font-bold text-foreground">
            Hola, {patient.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Estamos optimizando tu visita en tiempo real
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent" /> {completedCount} completados
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> {studies.length - completedCount} pendientes
            </span>
          </div>
        </motion.div>
      </div>

      <div className="px-6 -mt-2 space-y-6 pb-24 max-w-lg mx-auto">
        {/* ETA */}
        <ETAWidget totalMinutes={remainingMinutes} />

        {/* Timeline */}
        <div>
          <h2 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Tu trayecto clínico
          </h2>
          <div>
            {studies.map((study, i) => (
              <TimelineNode
                key={i}
                study={study}
                index={i}
                isLast={i === studies.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      <ChatAssistant />
    </div>
  );
}