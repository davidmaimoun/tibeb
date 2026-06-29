import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

// In dev you can send from Resend's shared sender without verifying a domain.
// In prod, set RESEND_FROM to an address on your verified domain.
const FROM = process.env.RESEND_FROM || "Tibeb <onboarding@resend.dev>";
const TO = process.env.NOTIFY_EMAIL;

export type NewBookingEmail = {
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  numPeople: number;
  tourType?: string | null;
  message?: string | null;
  startDate: Date;
  locale: string;
};

/** Notify the owner (you) by email when a new request comes in. Best-effort:
 *  never throws — a mail failure must not break the booking that was saved. */
export async function sendNewBookingEmail(b: NewBookingEmail): Promise<void> {
  if (!resend || !TO) {
    console.warn(
      "[mail] RESEND_API_KEY or NOTIFY_EMAIL not set — skipping email notification.",
    );
    return;
  }

  const date = b.startDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tour =
    b.tourType && b.tourType !== "general" ? b.tourType : "Demande générale";
  const subject = `Nouvelle demande — ${b.clientName} · ${b.numPeople} pers · ${date}`;
  const adminUrl = `${process.env.AUTH_URL || ""}/${b.locale}/admin`;

  const rows: [string, string][] = [
    ["Nom", b.clientName],
    ["Email", b.clientEmail],
    ["Téléphone", b.clientPhone || "—"],
    ["Voyageurs", String(b.numPeople)],
    ["Intéressé par", tour],
    ["Date de départ", date],
    ["Langue", b.locale],
    ["Message", b.message || "—"],
  ];

  const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;color:#241409">
    <h2 style="margin:0 0 2px">Nouvelle demande de voyage</h2>
    <p style="color:#7a6a58;margin:0 0 16px;font-size:13px">Tibeb · ${new Date().toLocaleString("fr-FR")}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      ${rows
        .map(
          ([k, v]) => `<tr>
        <td style="padding:8px 12px;background:#faf7f2;font-weight:600;width:140px;border:1px solid #eee;vertical-align:top">${k}</td>
        <td style="padding:8px 12px;border:1px solid #eee">${escapeHtml(v)}</td>
      </tr>`,
        )
        .join("")}
    </table>
    <p style="margin-top:18px">
      <a href="${adminUrl}" style="display:inline-block;background:#12a65a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:9999px;font-weight:600">Ouvrir l'admin →</a>
    </p>
  </div>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: TO,
      subject,
      html,
      replyTo: b.clientEmail, // reply goes straight to the client
    });
  } catch (e) {
    console.error("[mail] send failed:", e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Generic send — used to deliver client-facing template emails. */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn("[mail] RESEND_API_KEY not set — cannot send.");
    return { ok: false, error: "mail_not_configured" };
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo || TO || undefined,
    });
    return { ok: true };
  } catch (e) {
    console.error("[mail] send failed:", e);
    return { ok: false, error: "send_failed" };
  }
}