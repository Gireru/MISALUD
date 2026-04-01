import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EMERGENCY_CODES = {
  'Código Plata':    { color: '#9E9E9E', description: 'Paciente en emergencia médica' },
  'Código Azul':     { color: '#1565C0', description: 'Paciente en paro cardiorrespiratorio' },
  'Código Morado':   { color: '#6A1B9A', description: 'Balacera o tiroteo' },
  'Código Rosa':     { color: '#E91E8C', description: 'Robo o extravío de persona' },
  'Código Magenta':  { color: '#C2185B', description: 'Persona violenta, agresiva u hostil' },
  'Código Rojo':     { color: '#D32F2F', description: 'Conato de incendio' },
  'Código Naranja':  { color: '#E65100', description: 'Derrame de material o sustancia peligrosa' },
  'Código Amarillo': { color: '#F9A825', description: 'Inundación' },
  'Código Verde':    { color: '#2E7D32', description: 'Evacuación parcial o total' },
  'Código Negro':    { color: '#212121', description: 'Bomba o artefacto explosivo' },
  'Código Gris':     { color: '#616161', description: 'Asalto, robo o vandalismo' },
  'Código Blanco':   { color: '#BDBDBD', description: 'Abandono de persona' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { codeName, patientId, patientName, patientPhone, location } = await req.json();

    if (!codeName || !patientName) {
      return Response.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const codeInfo = EMERGENCY_CODES[codeName];
    if (!codeInfo) {
      return Response.json({ error: 'Código no válido' }, { status: 400 });
    }

    // Registrar el código en la base de datos
    const emergencyRecord = await base44.asServiceRole.entities.EmergencyCode.create({
      code_name: codeName,
      code_color: codeInfo.color,
      description: codeInfo.description,
      patient_id: patientId || '',
      patient_name: patientName,
      patient_phone: patientPhone || '',
      triggered_by: user.full_name || user.email,
      status: 'active',
      location: location || '',
    });

    // Notificar a todos los admins por email
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    const emailPromises = admins.map(admin =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `🚨 ALERTA: ${codeName} — ${patientName}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${codeInfo.color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🚨 ${codeName}</h1>
              <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">${codeInfo.description}</p>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
              <h2 style="color: #333; margin-top: 0;">Información del Paciente</h2>
              <p><strong>Paciente:</strong> ${patientName}</p>
              <p><strong>Teléfono:</strong> ${patientPhone || 'No disponible'}</p>
              ${location ? `<p><strong>Ubicación:</strong> ${location}</p>` : ''}
              <p><strong>Activado por:</strong> ${user.full_name || user.email}</p>
              <p><strong>Hora:</strong> ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;">
              <p style="color: #888; font-size: 12px;">SD-NEXUS — Sistema de Gestión Clínica</p>
            </div>
          </div>
        `
      }).catch(() => null)
    );

    await Promise.all(emailPromises);

    return Response.json({
      success: true,
      emergencyId: emergencyRecord.id,
      code: codeName,
      description: codeInfo.description,
      notified: admins.length,
    });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});