import { ApiError } from '@messagingme/sdk';
import { messagingme } from '../lib/messagingme';
import { saveReminder, tomorrowsAppointments, type Appointment } from '../lib/calendar';

// The template appointment_reminder (language en) has two variables, the first name then the time, and two quick
// reply buttons: Confirm and Reschedule.
function sendReminder(appointment: Appointment) {
  return messagingme.POST('/v1/sends', {
    body: {
      target: { template: { name: 'appointment_reminder', language: 'en' } },
      recipients: [{ phone: appointment.phone, variables: { firstName: appointment.firstName, time: appointment.time } }],
      params: [
        { position: 1, source: { type: 'variable', key: 'firstName' } },
        { position: 2, source: { type: 'variable', key: 'time' } },
      ],
    },
    // Run twice the same evening, the job does not send twice; a moved appointment gets a new key.
    idempotencyKey: `reminder-${appointment.id}-${encodeURIComponent(appointment.time)}`,
  });
}

// Run once a day, the evening before (a cron of your host). One failed reminder never stops the others.
export async function dayBeforeReminders(): Promise<void> {
  for (const appointment of await tomorrowsAppointments()) {
    try {
      let send;
      try {
        send = await sendReminder(appointment);
      } catch (e) {
        // Too many calls in the minute: wait what the API says (60 s at most), then try once more.
        if (!(e instanceof ApiError) || e.code !== 'rate_limited') throw e;
        await new Promise((r) => setTimeout(r, Math.min(e.retryAfter ?? 60, 60) * 1000));
        send = await sendReminder(appointment);
      }
      // A refused recipient (STOP, no number, plan limit) is not an error: it is listed in skipped.
      if (send.skippedTotal > 0) console.warn(`reminder ${appointment.id} not sent: ${send.skipped[0]?.reason}`);
      else await saveReminder(appointment, send.sendId);
    } catch (e) {
      // The quota of the day is reached: nothing more goes out before tomorrow, stop here.
      if (e instanceof ApiError && e.code === 'quota_exceeded') { console.error('daily quota reached', e); return; }
      console.error(`reminder ${appointment.id} failed`, e);
    }
  }
}
