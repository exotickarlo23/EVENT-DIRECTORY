import "server-only";

/**
 * E-mail adapter. Bez konfiguracije (EMAIL_PROVIDER=console ili prazno)
 * poruke se samo logiraju — stranica nikad ne pada zbog e-maila.
 * Za produkciju: EMAIL_PROVIDER=resend + RESEND_API_KEY + EMAIL_FROM.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? "console";
  try {
    if (provider === "resend" && process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "Feštko <onboarding@resend.dev>",
          to: [message.to],
          subject: message.subject,
          text: message.text,
        }),
      });
      if (!res.ok) {
        console.error("[email] Resend greška:", res.status, await res.text());
      }
      return;
    }
    console.info(`[email:console] → ${message.to} | ${message.subject}\n${message.text}`);
  } catch (err) {
    console.error("[email] slanje nije uspjelo:", err);
  }
}

export async function notifyAdmin(subject: string, text: string): Promise<void> {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) {
    console.info(`[email:admin-notify skip] ${subject}`);
    return;
  }
  await sendEmail({ to, subject, text });
}
