import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PATIENTS = [
  { name: 'María González López', phone: '8112345678' },
  { name: 'Carlos Ramírez Vega', phone: '8198765432' },
  { name: 'Ana Martínez Flores', phone: '8123456789' },
  { name: 'Jorge Hernández Cruz', phone: '8187654321' },
  { name: 'Sofía Torres Ruiz', phone: '8134567890' },
  { name: 'Luis Sánchez Morales', phone: '8176543210' },
  { name: 'Patricia Jiménez Díaz', phone: '8145678901' },
  { name: 'Roberto Mendoza García', phone: '8165432109' },
  { name: 'Laura Pérez Castillo', phone: '8156789012' },
  { name: 'Miguel Ángel Reyes Lara', phone: '8154321098' },
  { name: 'Carmen Ortiz Vargas', phone: '8167890123' },
  { name: 'Fernando Castro Núñez', phone: '8143210987' },
  { name: 'Daniela Rojas Serrano', phone: '8178901234' },
  { name: 'Alejandro Gutiérrez Peña', phone: '8132109876' },
  { name: 'Gabriela Moreno Aguirre', phone: '8189012345' },
  { name: 'Eduardo Silva Ríos', phone: '8121098765' },
  { name: 'Valentina Cruz Espinoza', phone: '8190123456' },
  { name: 'Héctor Domínguez Ibarra', phone: '8110987654' },
  { name: 'Isabella Fuentes Montes', phone: '8191234567' },
  { name: 'Arturo Vega Sandoval', phone: '8109876543' },
  { name: 'Natalia Ríos Cervantes', phone: '8112233445' },
  { name: 'Ramón Bustamante Leal', phone: '8155667788' },
  { name: 'Claudia Pedraza Núñez', phone: '8199887766' },
  { name: 'Óscar Villanueva Tapia', phone: '8133221100' },
  { name: 'Mónica Esquivel Barrera', phone: '8177665544' },
];

// Different journey templates with varied progress states
const JOURNEY_TEMPLATES = [
  // Patient just arrived — all pending except first in_progress
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'in_progress', estimated_minutes: 15, cubicle: 'Lab-A', steps_done: 1 },
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'pending', estimated_minutes: 10, cubicle: 'RX-1', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Well advanced, 1 done 1 in progress
  {
    studies: [
      { study_name: 'Ultrasonido Abdominal', area: 'Ultrasonido', status: 'completed', estimated_minutes: 20, cubicle: 'US-2', steps_done: 3, completed_at: new Date(Date.now() - 25 * 60000).toISOString() },
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'in_progress', estimated_minutes: 12, cubicle: 'Card-1', steps_done: 1 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // 3 studies, all pending — just registered
  {
    studies: [
      { study_name: 'Resonancia Magnética', area: 'Resonancia', status: 'in_progress', estimated_minutes: 40, cubicle: 'RM-1', steps_done: 0 },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'pending', estimated_minutes: 15, cubicle: 'Lab-B', steps_done: 0 },
      { study_name: 'Nutrición', area: 'Nutrición', status: 'pending', estimated_minutes: 30, cubicle: 'Nut-1', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Urgent patient — marked red
  {
    studies: [
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'in_progress', estimated_minutes: 12, cubicle: 'Card-2', steps_done: 2 },
      { study_name: 'Tomografía', area: 'Tomografía', status: 'pending', estimated_minutes: 30, cubicle: 'TC-1', steps_done: 0 },
    ],
    priority_color: 'red',
    penalty_count: 0,
  },
  // Single study, almost done
  {
    studies: [
      { study_name: 'Mastografía', area: 'Mastografía', status: 'in_progress', estimated_minutes: 15, cubicle: 'Mast-1', steps_done: 2 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // 1 done, 2 pending
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-A', steps_done: 3, completed_at: new Date(Date.now() - 18 * 60000).toISOString() },
      { study_name: 'Densitometría', area: 'Densitometría', status: 'in_progress', estimated_minutes: 20, cubicle: 'Dens-1', steps_done: 1 },
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'pending', estimated_minutes: 15, cubicle: 'Oft-1', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Has 1 penalty
  {
    studies: [
      { study_name: 'Papanicolaou', area: 'Ginecología', status: 'in_progress', estimated_minutes: 15, cubicle: 'Gin-1', steps_done: 0 },
    ],
    priority_color: 'yellow',
    penalty_count: 1,
    penalty_until: new Date(Date.now() + 8 * 60000).toISOString(),
  },
  // 4 studies, 2 done, 1 in progress, 1 pending
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-B', steps_done: 3, completed_at: new Date(Date.now() - 40 * 60000).toISOString() },
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'completed', estimated_minutes: 10, cubicle: 'RX-2', steps_done: 3, completed_at: new Date(Date.now() - 25 * 60000).toISOString() },
      { study_name: 'Ultrasonido 4D', area: 'Ultrasonido', status: 'in_progress', estimated_minutes: 25, cubicle: 'US-3', steps_done: 1 },
      { study_name: 'Nutrición', area: 'Nutrición', status: 'pending', estimated_minutes: 30, cubicle: 'Nut-2', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Quick single study, step 0
  {
    studies: [
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'in_progress', estimated_minutes: 15, cubicle: 'Oft-2', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Long journey, just started
  {
    studies: [
      { study_name: 'Tomografía', area: 'Tomografía', status: 'in_progress', estimated_minutes: 30, cubicle: 'TC-2', steps_done: 1 },
      { study_name: 'Resonancia Magnética', area: 'Resonancia', status: 'pending', estimated_minutes: 40, cubicle: 'RM-2', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Almost fully complete
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-A', steps_done: 3, completed_at: new Date(Date.now() - 50 * 60000).toISOString() },
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'completed', estimated_minutes: 12, cubicle: 'Card-1', steps_done: 3, completed_at: new Date(Date.now() - 30 * 60000).toISOString() },
      { study_name: 'Densitometría', area: 'Densitometría', status: 'in_progress', estimated_minutes: 20, cubicle: 'Dens-2', steps_done: 2 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // 2 penalties, about to cancel
  {
    studies: [
      { study_name: 'Ultrasonido Abdominal', area: 'Ultrasonido', status: 'in_progress', estimated_minutes: 20, cubicle: 'US-1', steps_done: 0 },
    ],
    priority_color: 'red',
    penalty_count: 2,
    penalty_until: new Date(Date.now() + 4 * 60000).toISOString(),
  },
  // Mid journey 2 done
  {
    studies: [
      { study_name: 'Mastografía', area: 'Mastografía', status: 'completed', estimated_minutes: 15, cubicle: 'Mast-1', steps_done: 3, completed_at: new Date(Date.now() - 20 * 60000).toISOString() },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'in_progress', estimated_minutes: 15, cubicle: 'Lab-C', steps_done: 1 },
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'pending', estimated_minutes: 15, cubicle: 'Oft-1', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Urgent single
  {
    studies: [
      { study_name: 'Tomografía', area: 'Tomografía', status: 'in_progress', estimated_minutes: 30, cubicle: 'TC-1', steps_done: 1 },
    ],
    priority_color: 'red',
    penalty_count: 0,
  },
  // 3 studies spread out
  {
    studies: [
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'completed', estimated_minutes: 12, cubicle: 'Card-2', steps_done: 3, completed_at: new Date(Date.now() - 15 * 60000).toISOString() },
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'in_progress', estimated_minutes: 10, cubicle: 'RX-1', steps_done: 1 },
      { study_name: 'Densitometría', area: 'Densitometría', status: 'pending', estimated_minutes: 20, cubicle: 'Dens-1', steps_done: 0 },
    ],
    priority_color: 'yellow',
    penalty_count: 0,
  },
  // Nutrición single
  {
    studies: [
      { study_name: 'Nutrición', area: 'Nutrición', status: 'in_progress', estimated_minutes: 30, cubicle: 'Nut-1', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Papanicolaou + análisis
  {
    studies: [
      { study_name: 'Papanicolaou', area: 'Ginecología', status: 'completed', estimated_minutes: 15, cubicle: 'Gin-2', steps_done: 3, completed_at: new Date(Date.now() - 22 * 60000).toISOString() },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'in_progress', estimated_minutes: 15, cubicle: 'Lab-D', steps_done: 1 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Brand new, step 0 everything
  {
    studies: [
      { study_name: 'Ultrasonido 4D', area: 'Ultrasonido', status: 'in_progress', estimated_minutes: 25, cubicle: 'US-4', steps_done: 0 },
      { study_name: 'Nutrición', area: 'Nutrición', status: 'pending', estimated_minutes: 30, cubicle: 'Nut-3', steps_done: 0 },
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'pending', estimated_minutes: 15, cubicle: 'Oft-3', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Heavy study combo
  {
    studies: [
      { study_name: 'Resonancia Magnética', area: 'Resonancia', status: 'completed', estimated_minutes: 40, cubicle: 'RM-1', steps_done: 3, completed_at: new Date(Date.now() - 45 * 60000).toISOString() },
      { study_name: 'Tomografía', area: 'Tomografía', status: 'completed', estimated_minutes: 30, cubicle: 'TC-2', steps_done: 3, completed_at: new Date(Date.now() - 10 * 60000).toISOString() },
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'in_progress', estimated_minutes: 12, cubicle: 'Card-3', steps_done: 2 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Single quick study just started
  {
    studies: [
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'in_progress', estimated_minutes: 10, cubicle: 'RX-3', steps_done: 0 },
    ],
    priority_color: 'green',
    penalty_count: 0,
  },
  // 3 studies, first just completed, second starting
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-E', steps_done: 3, completed_at: new Date(Date.now() - 12 * 60000).toISOString() },
      { study_name: 'Tomografía', area: 'Tomografía', status: 'in_progress', estimated_minutes: 30, cubicle: 'TC-3', steps_done: 0 },
      { study_name: 'Nutrición', area: 'Nutrición', status: 'pending', estimated_minutes: 30, cubicle: 'Nut-4', steps_done: 0 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
  // Urgent, 2 studies mid-progress
  {
    studies: [
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'in_progress', estimated_minutes: 12, cubicle: 'Card-4', steps_done: 1 },
      { study_name: 'Resonancia Magnética', area: 'Resonancia', status: 'pending', estimated_minutes: 40, cubicle: 'RM-3', steps_done: 0 },
    ],
    priority_color: 'red',
    penalty_count: 0,
  },
  // 4 studies, all pending (just registered)
  {
    studies: [
      { study_name: 'Ultrasonido Abdominal', area: 'Ultrasonido', status: 'in_progress', estimated_minutes: 20, cubicle: 'US-5', steps_done: 0 },
      { study_name: 'Mastografía', area: 'Mastografía', status: 'pending', estimated_minutes: 15, cubicle: 'Mast-2', steps_done: 0 },
      { study_name: 'Densitometría', area: 'Densitometría', status: 'pending', estimated_minutes: 20, cubicle: 'Dens-3', steps_done: 0 },
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'pending', estimated_minutes: 15, cubicle: 'Oft-4', steps_done: 0 },
    ],
    priority_color: 'yellow',
    penalty_count: 0,
  },
  // Almost done, step 2 of last study
  {
    studies: [
      { study_name: 'Papanicolaou', area: 'Ginecología', status: 'completed', estimated_minutes: 15, cubicle: 'Gin-3', steps_done: 3, completed_at: new Date(Date.now() - 30 * 60000).toISOString() },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-F', steps_done: 3, completed_at: new Date(Date.now() - 10 * 60000).toISOString() },
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'in_progress', estimated_minutes: 10, cubicle: 'RX-4', steps_done: 2 },
    ],
    priority_color: 'auto',
    penalty_count: 0,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const created = [];

    for (let i = 0; i < PATIENTS.length; i++) {
      const p = PATIENTS[i];
      const template = JOURNEY_TEMPLATES[i % JOURNEY_TEMPLATES.length];

      // Create patient
      const patient = await base44.asServiceRole.entities.Patient.create({
        name: p.name,
        phone: p.phone,
        current_status: 'in_progress',
        qr_token: `demo-${Date.now()}-${i}`,
      });

      // Calculate total ETA
      const totalEta = template.studies.reduce((sum, s) => sum + (s.estimated_minutes || 0), 0);

      // Build journey
      const journeyData = {
        patient_id: patient.id,
        patient_name: p.name,
        studies: template.studies,
        total_eta_minutes: totalEta,
        status: 'active',
        priority_color: template.priority_color || 'auto',
        penalty_count: template.penalty_count || 0,
        absence_warned: false,
      };

      if (template.penalty_until) {
        journeyData.penalty_until = template.penalty_until;
      }

      const journey = await base44.asServiceRole.entities.ClinicalJourney.create(journeyData);
      created.push({ patient: p.name, journeyId: journey.id });
    }

    return Response.json({
      success: true,
      message: `${created.length} trayectorias demo creadas exitosamente (25 total)`,
      created,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});