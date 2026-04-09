import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PATIENTS = [
  { name: 'María González López',    phone: '8112345678' },
  { name: 'Carlos Ramírez Vega',     phone: '8198765432' },
  { name: 'Ana Martínez Flores',     phone: '8123456789' },
  { name: 'Jorge Hernández Cruz',    phone: '8187654321' },
  { name: 'Sofía Torres Ruiz',       phone: '8134567890' },
  { name: 'Luis Sánchez Morales',    phone: '8176543210' },
  { name: 'Patricia Jiménez Díaz',   phone: '8145678901' },
  { name: 'Roberto Mendoza García',  phone: '8165432109' },
  { name: 'Laura Pérez Castillo',    phone: '8156789012' },
  { name: 'Miguel Ángel Reyes Lara', phone: '8154321098' },
  { name: 'Carmen Ortiz Vargas',     phone: '8167890123' },
  { name: 'Fernando Castro Núñez',   phone: '8143210987' },
  { name: 'Daniela Rojas Serrano',   phone: '8178901234' },
  { name: 'Alejandro Gutiérrez Peña',phone: '8132109876' },
  { name: 'Gabriela Moreno Aguirre', phone: '8189012345' },
  { name: 'Eduardo Silva Ríos',      phone: '8121098765' },
  { name: 'Valentina Cruz Espinoza', phone: '8190123456' },
  { name: 'Héctor Domínguez Ibarra', phone: '8110987654' },
  { name: 'Isabella Fuentes Montes', phone: '8191234567' },
  { name: 'Arturo Vega Sandoval',    phone: '8109876543' },
  { name: 'Natalia Ríos Cervantes',  phone: '8112233445' },
  { name: 'Ramón Bustamante Leal',   phone: '8155667788' },
  { name: 'Claudia Pedraza Núñez',   phone: '8199887766' },
  { name: 'Óscar Villanueva Tapia',  phone: '8133221100' },
  { name: 'Mónica Esquivel Barrera', phone: '8177665544' },
  { name: 'Diego Navarro Herrera',   phone: '8166554433' },
  { name: 'Lucía Aguilar Fuentes',   phone: '8144332211' },
  { name: 'Enrique Medina Prado',    phone: '8122110099' },
  { name: 'Verónica Salinas Bravo',  phone: '8188776655' },
  { name: 'Andrés Montes Cisneros',  phone: '8100998877' },
];

const now = Date.now();
const ago = (min) => new Date(now - min * 60000).toISOString();
const future = (min) => new Date(now + min * 60000).toISOString();

const JOURNEY_TEMPLATES = [
  // 0 — Normal, recién llegada
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'in_progress', estimated_minutes: 15, cubicle: 'Lab-A', steps_done: 1 },
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'pending', estimated_minutes: 10, cubicle: 'RX-1', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 1 — Bien avanzado
  {
    studies: [
      { study_name: 'Ultrasonido Abdominal', area: 'Ultrasonido', status: 'completed', estimated_minutes: 20, cubicle: 'US-2', steps_done: 3, completed_at: ago(25) },
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'in_progress', estimated_minutes: 12, cubicle: 'Card-1', steps_done: 1 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 2 — 3 estudios, inicio
  {
    studies: [
      { study_name: 'Resonancia Magnética', area: 'Resonancia', status: 'in_progress', estimated_minutes: 40, cubicle: 'RM-1', steps_done: 0 },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'pending', estimated_minutes: 15, cubicle: 'Lab-B', steps_done: 0 },
      { study_name: 'Nutrición', area: 'Nutrición', status: 'pending', estimated_minutes: 30, cubicle: 'Nut-1', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 3 — URGENTE rojo
  {
    studies: [
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'in_progress', estimated_minutes: 12, cubicle: 'Card-2', steps_done: 2 },
      { study_name: 'Tomografía', area: 'Tomografía', status: 'pending', estimated_minutes: 30, cubicle: 'TC-1', steps_done: 0 },
    ],
    priority_color: 'red', penalty_count: 0,
    emergency: { code_name: 'Código Rojo', code_color: 'red', description: 'Dolor torácico severo, posible infarto', location: 'Cardiología' },
  },
  // 4 — Estudio único casi terminando
  {
    studies: [
      { study_name: 'Mastografía', area: 'Mastografía', status: 'in_progress', estimated_minutes: 15, cubicle: 'Mast-1', steps_done: 2 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 5 — 1 hecho, 2 pendientes
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-A', steps_done: 3, completed_at: ago(18) },
      { study_name: 'Densitometría', area: 'Densitometría', status: 'in_progress', estimated_minutes: 20, cubicle: 'Dens-1', steps_done: 1 },
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'pending', estimated_minutes: 15, cubicle: 'Oft-1', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 6 — 1 PENALIZACIÓN, amarillo
  {
    studies: [
      { study_name: 'Papanicolaou', area: 'Ginecología', status: 'in_progress', estimated_minutes: 15, cubicle: 'Gin-1', steps_done: 0 },
    ],
    priority_color: 'yellow', penalty_count: 1, penalty_until: future(8),
  },
  // 7 — 4 estudios, 2 hechos
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-B', steps_done: 3, completed_at: ago(40) },
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'completed', estimated_minutes: 10, cubicle: 'RX-2', steps_done: 3, completed_at: ago(25) },
      { study_name: 'Ultrasonido 4D', area: 'Ultrasonido', status: 'in_progress', estimated_minutes: 25, cubicle: 'US-3', steps_done: 1 },
      { study_name: 'Nutrición', area: 'Nutrición', status: 'pending', estimated_minutes: 30, cubicle: 'Nut-2', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 8 — Estudio único rápido
  {
    studies: [
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'in_progress', estimated_minutes: 15, cubicle: 'Oft-2', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 9 — Jornada larga, inicio
  {
    studies: [
      { study_name: 'Tomografía', area: 'Tomografía', status: 'in_progress', estimated_minutes: 30, cubicle: 'TC-2', steps_done: 1 },
      { study_name: 'Resonancia Magnética', area: 'Resonancia', status: 'pending', estimated_minutes: 40, cubicle: 'RM-2', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 10 — Casi terminando
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-A', steps_done: 3, completed_at: ago(50) },
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'completed', estimated_minutes: 12, cubicle: 'Card-1', steps_done: 3, completed_at: ago(30) },
      { study_name: 'Densitometría', area: 'Densitometría', status: 'in_progress', estimated_minutes: 20, cubicle: 'Dens-2', steps_done: 2 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 11 — 2 PENALIZACIONES, a punto de cancelar — rojo
  {
    studies: [
      { study_name: 'Ultrasonido Abdominal', area: 'Ultrasonido', status: 'in_progress', estimated_minutes: 20, cubicle: 'US-1', steps_done: 0 },
    ],
    priority_color: 'red', penalty_count: 2, penalty_until: future(4),
  },
  // 12 — Mitad del trayecto
  {
    studies: [
      { study_name: 'Mastografía', area: 'Mastografía', status: 'completed', estimated_minutes: 15, cubicle: 'Mast-1', steps_done: 3, completed_at: ago(20) },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'in_progress', estimated_minutes: 15, cubicle: 'Lab-C', steps_done: 1 },
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'pending', estimated_minutes: 15, cubicle: 'Oft-1', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 13 — URGENTE, único estudio
  {
    studies: [
      { study_name: 'Tomografía', area: 'Tomografía', status: 'in_progress', estimated_minutes: 30, cubicle: 'TC-1', steps_done: 1 },
    ],
    priority_color: 'red', penalty_count: 0,
  },
  // 14 — Amarillo, 3 estudios
  {
    studies: [
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'completed', estimated_minutes: 12, cubicle: 'Card-2', steps_done: 3, completed_at: ago(15) },
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'in_progress', estimated_minutes: 10, cubicle: 'RX-1', steps_done: 1 },
      { study_name: 'Densitometría', area: 'Densitometría', status: 'pending', estimated_minutes: 20, cubicle: 'Dens-1', steps_done: 0 },
    ],
    priority_color: 'yellow', penalty_count: 0,
  },
  // 15 — Nutrición único
  {
    studies: [
      { study_name: 'Nutrición', area: 'Nutrición', status: 'in_progress', estimated_minutes: 30, cubicle: 'Nut-1', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 16 — Ginecología + Análisis
  {
    studies: [
      { study_name: 'Papanicolaou', area: 'Ginecología', status: 'completed', estimated_minutes: 15, cubicle: 'Gin-2', steps_done: 3, completed_at: ago(22) },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'in_progress', estimated_minutes: 15, cubicle: 'Lab-D', steps_done: 1 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 17 — CÓDIGO MAGENTA — emergencia obstétrica
  {
    studies: [
      { study_name: 'Ultrasonido 4D', area: 'Ultrasonido', status: 'in_progress', estimated_minutes: 25, cubicle: 'US-4', steps_done: 0 },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'pending', estimated_minutes: 15, cubicle: 'Lab-E', steps_done: 0 },
    ],
    priority_color: 'red', penalty_count: 0,
    emergency: { code_name: 'Código Magenta', code_color: 'magenta', description: 'Emergencia obstétrica — hemorragia postparto', location: 'Ultrasonido' },
  },
  // 18 — Resonancia + Tomografía, 2 hechos
  {
    studies: [
      { study_name: 'Resonancia Magnética', area: 'Resonancia', status: 'completed', estimated_minutes: 40, cubicle: 'RM-1', steps_done: 3, completed_at: ago(45) },
      { study_name: 'Tomografía', area: 'Tomografía', status: 'completed', estimated_minutes: 30, cubicle: 'TC-2', steps_done: 3, completed_at: ago(10) },
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'in_progress', estimated_minutes: 12, cubicle: 'Card-3', steps_done: 2 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 19 — Recién llegado, verde prioritario
  {
    studies: [
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'in_progress', estimated_minutes: 10, cubicle: 'RX-3', steps_done: 0 },
    ],
    priority_color: 'green', penalty_count: 0,
  },
  // 20 — 3 estudios, primer estudio terminado, segundo iniciando
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-E', steps_done: 3, completed_at: ago(12) },
      { study_name: 'Tomografía', area: 'Tomografía', status: 'in_progress', estimated_minutes: 30, cubicle: 'TC-3', steps_done: 0 },
      { study_name: 'Nutrición', area: 'Nutrición', status: 'pending', estimated_minutes: 30, cubicle: 'Nut-4', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 21 — URGENTE rojo, 2 estudios iniciando
  {
    studies: [
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'in_progress', estimated_minutes: 12, cubicle: 'Card-4', steps_done: 1 },
      { study_name: 'Resonancia Magnética', area: 'Resonancia', status: 'pending', estimated_minutes: 40, cubicle: 'RM-3', steps_done: 0 },
    ],
    priority_color: 'red', penalty_count: 0,
    emergency: { code_name: 'Código Rojo', code_color: 'red', description: 'Arritmia severa detectada en ECG', location: 'Cardiología' },
  },
  // 22 — 4 estudios, todos iniciando
  {
    studies: [
      { study_name: 'Ultrasonido Abdominal', area: 'Ultrasonido', status: 'in_progress', estimated_minutes: 20, cubicle: 'US-5', steps_done: 0 },
      { study_name: 'Mastografía', area: 'Mastografía', status: 'pending', estimated_minutes: 15, cubicle: 'Mast-2', steps_done: 0 },
      { study_name: 'Densitometría', area: 'Densitometría', status: 'pending', estimated_minutes: 20, cubicle: 'Dens-3', steps_done: 0 },
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'pending', estimated_minutes: 15, cubicle: 'Oft-4', steps_done: 0 },
    ],
    priority_color: 'yellow', penalty_count: 0,
  },
  // 23 — Casi terminando, último estudio
  {
    studies: [
      { study_name: 'Papanicolaou', area: 'Ginecología', status: 'completed', estimated_minutes: 15, cubicle: 'Gin-3', steps_done: 3, completed_at: ago(30) },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-F', steps_done: 3, completed_at: ago(10) },
      { study_name: 'Radiografía de Tórax', area: 'Rayos X', status: 'in_progress', estimated_minutes: 10, cubicle: 'RX-4', steps_done: 2 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 24 — 1 PENALIZACIÓN activa, amarillo
  {
    studies: [
      { study_name: 'Densitometría', area: 'Densitometría', status: 'in_progress', estimated_minutes: 20, cubicle: 'Dens-4', steps_done: 0 },
      { study_name: 'Nutrición', area: 'Nutrición', status: 'pending', estimated_minutes: 30, cubicle: 'Nut-5', steps_done: 0 },
    ],
    priority_color: 'yellow', penalty_count: 1, penalty_until: future(12),
  },
  // 25 — Estudio único laboratorio iniciando
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'in_progress', estimated_minutes: 15, cubicle: 'Lab-G', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 26 — 2 PENALIZACIONES — rojo crítico
  {
    studies: [
      { study_name: 'Examen de Vista', area: 'Oftalmología', status: 'in_progress', estimated_minutes: 15, cubicle: 'Oft-5', steps_done: 1 },
    ],
    priority_color: 'red', penalty_count: 2, penalty_until: future(6),
  },
  // 27 — Largo, 3 estudios, avanzando
  {
    studies: [
      { study_name: 'Resonancia Magnética', area: 'Resonancia', status: 'completed', estimated_minutes: 40, cubicle: 'RM-4', steps_done: 3, completed_at: ago(55) },
      { study_name: 'Ultrasonido Abdominal', area: 'Ultrasonido', status: 'in_progress', estimated_minutes: 20, cubicle: 'US-6', steps_done: 1 },
      { study_name: 'Electrocardiograma', area: 'Cardiología', status: 'pending', estimated_minutes: 12, cubicle: 'Card-5', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
  },
  // 28 — URGENTE rojo, casi terminando
  {
    studies: [
      { study_name: 'Tomografía', area: 'Tomografía', status: 'completed', estimated_minutes: 30, cubicle: 'TC-4', steps_done: 3, completed_at: ago(8) },
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'in_progress', estimated_minutes: 15, cubicle: 'Lab-H', steps_done: 2 },
    ],
    priority_color: 'red', penalty_count: 0,
  },
  // 29 — Normal, 4 estudios extenso
  {
    studies: [
      { study_name: 'Análisis de Sangre', area: 'Laboratorio', status: 'completed', estimated_minutes: 15, cubicle: 'Lab-I', steps_done: 3, completed_at: ago(60) },
      { study_name: 'Mastografía', area: 'Mastografía', status: 'completed', estimated_minutes: 15, cubicle: 'Mast-3', steps_done: 3, completed_at: ago(40) },
      { study_name: 'Papanicolaou', area: 'Ginecología', status: 'in_progress', estimated_minutes: 15, cubicle: 'Gin-4', steps_done: 1 },
      { study_name: 'Nutrición', area: 'Nutrición', status: 'pending', estimated_minutes: 30, cubicle: 'Nut-6', steps_done: 0 },
    ],
    priority_color: 'auto', penalty_count: 0,
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
      const template = JOURNEY_TEMPLATES[i];

      // Create patient
      const patient = await base44.asServiceRole.entities.Patient.create({
        name: p.name,
        phone: p.phone,
        current_status: 'in_progress',
        qr_token: `demo-${Date.now()}-${i}`,
      });

      const totalEta = template.studies.reduce((sum, s) => sum + (s.estimated_minutes || 0), 0);

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

      if (template.penalty_until) journeyData.penalty_until = template.penalty_until;

      const journey = await base44.asServiceRole.entities.ClinicalJourney.create(journeyData);

      // Create emergency code if template has one
      if (template.emergency) {
        await base44.asServiceRole.entities.EmergencyCode.create({
          code_name: template.emergency.code_name,
          code_color: template.emergency.code_color,
          description: template.emergency.description,
          patient_id: patient.id,
          patient_name: p.name,
          patient_phone: p.phone,
          triggered_by: 'Sistema Demo',
          status: 'active',
          location: template.emergency.location,
        });
      }

      created.push({ patient: p.name, journeyId: journey.id, emergency: template.emergency?.code_name || null });
    }

    return Response.json({
      success: true,
      message: `${created.length} trayectorias demo creadas (con urgencias, códigos de emergencia y penalizaciones)`,
      created,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});