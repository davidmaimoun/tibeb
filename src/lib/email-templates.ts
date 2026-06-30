// Client-facing email templates. Pure functions (no server-only imports) so the
// admin can render a live PREVIEW in the browser and the server can SEND the
// exact same HTML via Resend. Each template renders a chosen Trip.

import { type Trip, priceFor, usd } from "@/features/content/trip";

const GREEN = "#12a65a";
const YELLOW = "#f7c600";
const RED = "#e11d22";
const INK = "#241409";

function shell(inner: string): string {
  return `
  <div style="background:#f7f3ec;padding:24px 0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:${INK}">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eee">
      <div style="height:6px;background:linear-gradient(90deg,${GREEN} 0 33%,${YELLOW} 33% 66%,${RED} 66% 100%)"></div>
      <div style="padding:28px 32px 8px">
        <div style="font-size:26px;font-weight:800;letter-spacing:-0.5px">Tibeb <span style="color:${GREEN}">ጥበብ</span></div>
        <div style="font-size:13px;color:#8a7a66;margin-top:2px">Private guided journeys across Ethiopia</div>
      </div>
      <div style="padding:8px 32px 28px;font-size:15px;line-height:1.6">
        ${inner}
      </div>
      <div style="padding:16px 32px;border-top:1px solid #f0eadf;font-size:12px;color:#9a8a76">
        Tibeb — Ethiopia &nbsp;·&nbsp; powered by
        <a href="https://sudosu.dev" style="color:${GREEN};text-decoration:none;font-weight:600">sudosu.dev</a>
      </div>
    </div>
  </div>`;
}

function tripBlock(trip: Trip): string {
  return `
    <h3 style="margin:18px 0 6px">${esc(trip.title)}</h3>
    <p style="color:#6b5d4c;margin:0 0 6px">${esc(trip.blurb)}</p>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 4px">
      ${trip.days
        .map(
          (d) => `<tr>
        <td style="padding:6px 10px 6px 0;vertical-align:top;white-space:nowrap;color:${GREEN};font-weight:700;font-size:13px">Day ${d.d}</td>
        <td style="padding:6px 0">
          <div style="font-weight:600">${esc(d.t)}</div>
          <div style="color:#6b5d4c;font-size:13px">${esc(d.x)}</div>
        </td>
      </tr>`,
        )
        .join("")}
    </table>
    <details style="margin-top:8px"><summary style="cursor:pointer;color:${GREEN};font-weight:600">What's included / not included</summary>
      <p style="margin:8px 0 2px;font-weight:600">Included</p>
      <ul style="margin:0;padding-left:18px;color:#6b5d4c;font-size:13px">${trip.includes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <p style="margin:8px 0 2px;font-weight:600">Not included</p>
      <ul style="margin:0;padding-left:18px;color:#6b5d4c;font-size:13px">${trip.excludes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </details>`;
}

function pricingHtml(trip: Trip, people: number): string {
  const q = priceFor(trip, people);
  return `
  <div style="margin-top:18px;border:1px solid #eee;border-radius:12px;overflow:hidden">
    <div style="background:#faf7f2;padding:12px 16px;font-weight:700">Your price — ${q.people} travellers</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 16px;color:#6b5d4c">Per person</td><td style="padding:8px 16px;text-align:right">${usd(q.perPerson)}</td></tr>
      <tr><td style="padding:8px 16px;color:#6b5d4c;border-top:1px solid #f0eadf">Total (${q.people} × ${usd(q.perPerson)})</td><td style="padding:8px 16px;text-align:right;border-top:1px solid #f0eadf;font-weight:700">${usd(q.total)}</td></tr>
      <tr><td style="padding:8px 16px;color:${GREEN};border-top:1px solid #f0eadf;font-weight:700">Deposit now (${q.depositPct}%)</td><td style="padding:8px 16px;text-align:right;border-top:1px solid #f0eadf;color:${GREEN};font-weight:800">${usd(q.deposit)}</td></tr>
      <tr><td style="padding:8px 16px;color:#6b5d4c;border-top:1px solid #f0eadf">Balance on arrival (cash)</td><td style="padding:8px 16px;text-align:right;border-top:1px solid #f0eadf">${usd(q.balance)}</td></tr>
    </table>
  </div>
  <p style="font-size:13px;color:#6b5d4c;margin-top:10px">
    To secure your dates, please pay the <b>${q.depositPct}% deposit (${usd(q.deposit)})</b> now via the secure link below.
    The remaining <b>${usd(q.balance)}</b> is paid <b>in cash on arrival</b> — this covers local guides, community fees and on-the-ground activities throughout the trip.
  </p>`;
}

function normalizeUrl(link: string): string {
  const t = link.trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function payButton(link: string): string {
  if (!link) return "";
  const url = normalizeUrl(link);
  return `
  <div style="text-align:center;margin:18px 0 6px">
    <a href="${escapeAttr(url)}" style="display:inline-block;background:${GREEN};color:#fff;text-decoration:none;padding:14px 28px;border-radius:9999px;font-weight:700;font-size:15px">Pay the deposit securely →</a>
  </div>`;
}

export type ConfirmInput = {
  clientName: string;
  numPeople: number;
  dateStr: string;
  paymentLink: string;
  trip: Trip;
};

/** Guide IS available → confirm, show trip + price, deposit link, 30/70 terms. */
export function confirmAvailableEmail(i: ConfirmInput): {
  subject: string;
  html: string;
} {
  const subject = `Your Ethiopia trip is confirmed — secure it with the deposit`;
  const html = shell(`
    <p>Dear ${esc(i.clientName)},</p>
    <p>Wonderful news — your guide is <b>available for ${esc(i.dateStr)}</b>, and we'd be delighted to take you on the journey below.</p>
    ${tripBlock(i.trip)}
    ${pricingHtml(i.trip, i.numPeople)}
    ${payButton(i.paymentLink)}
    <p style="margin-top:16px">Once your deposit is received, we'll confirm everything and share the final details. Reply to this email with any question.</p>
    <p>Warm regards,<br/>The Tibeb team</p>
  `);
  return { subject, html };
}

export type ProposeInput = {
  clientName: string;
  dateStr: string;
  alternativeDates: string;
  note?: string;
  trip: Trip;
};

/** Guide NOT available → explain trip, propose new dates. */
export function proposeDatesEmail(i: ProposeInput): {
  subject: string;
  html: string;
} {
  const subject = `About your Ethiopia trip — a few alternative dates`;
  const html = shell(`
    <p>Dear ${esc(i.clientName)},</p>
    <p>Thank you so much for your request. Unfortunately your guide is <b>not available on ${esc(i.dateStr)}</b> — but we'd love to make this trip happen for you on another date.</p>
    ${tripBlock(i.trip)}
    <div style="margin-top:16px;background:#faf7f2;border-radius:12px;padding:14px 16px">
      <div style="font-weight:700;margin-bottom:4px">Proposed alternative dates</div>
      <div style="color:#6b5d4c">${esc(i.alternativeDates)}</div>
    </div>
    ${i.note ? `<p style="margin-top:12px">${esc(i.note)}</p>` : ""}
    <p style="margin-top:14px">Just reply with the option that suits you best and we'll get everything ready. We hope to welcome you very soon.</p>
    <p>Warm regards,<br/>The Tibeb team</p>
  `);
  return { subject, html };
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(s: string): string {
  return esc(s).replace(/"/g, "&quot;");
}

/* -------------------------------------------------------------------------
   Plain-text versions — ready to paste/send over WhatsApp.
------------------------------------------------------------------------- */

function itineraryText(trip: Trip): string {
  return trip.days.map((d) => `Day ${d.d}: ${d.t}`).join("\n");
}

function pricingText(trip: Trip, people: number): string {
  const q = priceFor(trip, people);
  return [
    `Price (${q.people} travellers):`,
    `• Per person: ${usd(q.perPerson)}`,
    `• Total: ${usd(q.total)}`,
    `• Deposit now (${q.depositPct}%): ${usd(q.deposit)}`,
    `• Balance on arrival, cash: ${usd(q.balance)}`,
  ].join("\n");
}

export function confirmAvailableText(i: ConfirmInput): string {
  return [
    `*Tibeb ጥበብ — ${i.trip.title}*`,
    "",
    `Hi ${i.clientName},`,
    `Great news — your guide is available for ${i.dateStr}. Here is the journey:`,
    "",
    itineraryText(i.trip),
    "",
    pricingText(i.trip, i.numPeople),
    "",
    i.paymentLink
      ? `To secure your dates, pay the ${priceFor(i.trip, i.numPeople).depositPct}% deposit here:\n${normalizeUrl(i.paymentLink)}`
      : "I'll send you the secure deposit link to confirm.",
    `The remaining balance is paid in cash on arrival (it covers local guides, fees and on-site activities).`,
    "",
    `Reply here with any question.`,
    `— Tibeb · powered by sudosu.dev`,
  ].join("\n");
}

export function proposeDatesText(i: ProposeInput): string {
  const lines = [
    `*Tibeb ጥበብ — ${i.trip.title}*`,
    "",
    `Hi ${i.clientName},`,
    `Thank you for your request. Unfortunately the guide isn't available on ${i.dateStr}, but we'd love to host you on another date.`,
    "",
    `Proposed alternative dates: ${i.alternativeDates}`,
  ];
  if (i.note) lines.push("", i.note);
  lines.push(
    "",
    `The journey:`,
    itineraryText(i.trip),
    "",
    `Reply with the option that suits you and we'll get everything ready.`,
    `— Tibeb · powered by sudosu.dev`,
  );
  return lines.join("\n");
}