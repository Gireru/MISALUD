import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  // Allow all origins for public access
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { message, patientName } = await req.json();

    if (!message) {
      return Response.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Eres un asistente clínico amigable de SD-NEXUS${patientName ? ` atendiendo a ${patientName}` : ''}. Responde en español, de forma breve y empática. Pregunta del paciente: "${message}"`,
    });

    return Response.json({ reply: res });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});