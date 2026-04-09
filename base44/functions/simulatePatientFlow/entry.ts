import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Accept optional `steps` param — how many steps to advance per journey (default 1)
    let steps = 1;
    try {
      const body = await req.json();
      if (body?.steps && typeof body.steps === 'number') steps = Math.min(body.steps, 9);
    } catch (_) { /* no body — use default */ }

    const journeys = await base44.asServiceRole.entities.ClinicalJourney.filter({ status: 'active' });

    let updated = 0;

    for (const journey of journeys) {
      let studies = [...(journey.studies || [])];
      let changed = false;

      // Advance `steps` times for this journey
      for (let tick = 0; tick < steps; tick++) {
        const inProgressIdx = studies.findIndex(s => s.status === 'in_progress');

        if (inProgressIdx === -1) {
          // No in_progress — find first pending and start it
          const pendingIdx = studies.findIndex(s => s.status === 'pending');
          if (pendingIdx !== -1) {
            studies[pendingIdx] = { ...studies[pendingIdx], status: 'in_progress', steps_done: 0 };
            changed = true;
          } else {
            break; // nothing left to advance
          }
        } else {
          const study = studies[inProgressIdx];
          const totalSteps = 3;
          const currentSteps = study.steps_done || 0;

          if (currentSteps < totalSteps - 1) {
            studies[inProgressIdx] = { ...study, steps_done: currentSteps + 1 };
            changed = true;
          } else {
            // Complete this study
            studies[inProgressIdx] = {
              ...study,
              status: 'completed',
              steps_done: totalSteps,
              completed_at: new Date().toISOString(),
            };

            // Start next pending
            const nextPendingIdx = studies.findIndex(s => s.status === 'pending');
            if (nextPendingIdx !== -1) {
              studies[nextPendingIdx] = { ...studies[nextPendingIdx], status: 'in_progress', steps_done: 0 };
            }
            changed = true;
          }
        }
      }

      if (changed) {
        const allDone = studies.every(s => s.status === 'completed');
        await base44.asServiceRole.entities.ClinicalJourney.update(journey.id, {
          studies,
          status: allDone ? 'completed' : 'active',
        });
        if (allDone) {
          await base44.asServiceRole.entities.Patient.update(journey.patient_id, {
            current_status: 'completed',
          });
        }
        updated++;
      }
    }

    return Response.json({ ok: true, updated, total: journeys.length, steps });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});