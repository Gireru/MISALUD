import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Accept optional `steps` param — how many journeys to advance per call (default: all, 1 step each)
    let steps = 1;
    try {
      const body = await req.json();
      if (body?.steps && typeof body.steps === 'number') steps = Math.min(body.steps, 5);
    } catch (_) { /* no body */ }

    const journeys = await base44.asServiceRole.entities.ClinicalJourney.filter({ status: 'active' });

    let updated = 0;

    for (const journey of journeys) {
      let studies = [...(journey.studies || [])];
      let changed = false;

      // Advance exactly ONE logical step per journey per call.
      // Each call to this function with steps=N just repeats this for N journeys (not N steps per journey).
      // This prevents bulk-completing all studies in one shot.
      const inProgressIdx = studies.findIndex(s => s.status === 'in_progress');

      if (inProgressIdx === -1) {
        // No study in progress — activate the first pending one
        const pendingIdx = studies.findIndex(s => s.status === 'pending');
        if (pendingIdx !== -1) {
          studies[pendingIdx] = { ...studies[pendingIdx], status: 'in_progress', steps_done: 0 };
          changed = true;
        }
      } else {
        const study = studies[inProgressIdx];
        const totalSteps = 3;
        const currentSteps = study.steps_done || 0;

        if (currentSteps < totalSteps - 1) {
          // Advance one step within the current study
          studies[inProgressIdx] = { ...study, steps_done: currentSteps + 1 };
          changed = true;
        } else {
          // Complete this study — do NOT start the next one in the same tick
          // The next tick will find no in_progress and activate the next pending
          studies[inProgressIdx] = {
            ...study,
            status: 'completed',
            steps_done: totalSteps,
            completed_at: new Date().toISOString(),
          };
          changed = true;
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