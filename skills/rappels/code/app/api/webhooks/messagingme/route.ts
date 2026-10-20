import { verifyWebhook, WebhookVerificationError } from '@messagingme/sdk';
import { messagingme } from '../../../../lib/messagingme';
import { freeSlots, lastReminder, markConfirmed, move } from '../../../../lib/calendar';

// Subscribed to message.received (the Confirm button, ticked by default) and agent.action (the AI agent’s two
// actions, Reschedule request and Slot choice), unchecked by default on a webhook address: tick it.
export async function POST(req: Request) {
  // The RAW body: the signature covers its bytes.
  const body = await req.text();
  let event;
  try {
    event = await verifyWebhook({ secret: process.env.MESSAGINGME_WEBHOOK_SECRET!, headers: req.headers, body });
  } catch (e) {
    if (e instanceof WebhookVerificationError) return new Response(null, { status: 401 });
    throw e;
  }
  if (event.type !== 'message.received' && event.type !== 'agent.action') return new Response(null, { status: 204 });
  const contact = event.data.contact;
  // A button reply carries its label only, not the message it answers: tie it to the last reminder of the number.
  const appointment = contact?.phone ? await lastReminder(contact.phone) : null;
  if (!contact || !appointment) return new Response(null, { status: 204 });
  if (event.type === 'message.received' && event.data.button === 'Confirm') await markConfirmed(appointment);
  if (event.type === 'agent.action') {
    const { action, fields } = event.data;
    let text: string | null = null;
    if (action.name === 'Reschedule request') text = await freeSlots(appointment, 3);
    if (action.name === 'Slot choice' && fields.slot !== undefined) text = await move(appointment, String(fields.slot));
    if (text) await messagingme.POST('/v1/messages/whatsapp', { body: { contactId: contact.id, text } });
  }
  // The webhook waits 10 s for this answer, then retries the same event (same event.id): keep the work above
  // short, and your calendar functions safe to run twice.
  return new Response(null, { status: 204 });
}
