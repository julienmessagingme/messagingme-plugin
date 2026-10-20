// What this case needs from your calendar: Claude Code wires these functions to your own database.
export interface Appointment {
  id: string;
  phone: string; // E.164: +33612345678
  firstName: string;
  time: string; // as the patient reads it: '10:30 AM'
}

const todo = (what: string): never => { throw new Error(`lib/calendar.ts: ${what} is not connected yet`); };

/** Tomorrow's appointments: the ones to remind tonight. */
export async function tomorrowsAppointments(): Promise<Appointment[]> { return todo('tomorrowsAppointments'); }
/** Remembers the reminder sent to this number: a button reply does not say which message it answers. */
export async function saveReminder(appointment: Appointment, sendId: string): Promise<void> { return todo('saveReminder'); }
/** The last reminder sent to this number, or null. */
export async function lastReminder(phone: string): Promise<Appointment | null> { return todo('lastReminder'); }
export async function markConfirmed(appointment: Appointment): Promise<void> { return todo('markConfirmed'); }
/** A few free slots, written as the WhatsApp message that offers them. */
export async function freeSlots(appointment: Appointment, count: number): Promise<string> { return todo('freeSlots'); }
/**
 * Moves the appointment to the chosen slot and returns the confirmation. `slot` is the AI agent’s reading of the
 * customer’s words: match it against the slots offered and move only to one still free. Otherwise answer with
 * other free slots and a link to book: a second Slot choice the same day does not reach your app.
 */
export async function move(appointment: Appointment, slot: string): Promise<string> { return todo('move'); }
