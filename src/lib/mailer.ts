import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  if (!host) {
    transporter = null;
    return transporter;
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT ?? 587);

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  return transporter;
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}): Promise<void> {
  if (to.length === 0) {
    return;
  }

  const client = getTransporter();
  if (!client) {
    console.warn(
      "SMTP nesukonfigūruotas (SMTP_HOST nenustatytas) — laiškas nesiųstas:",
      subject,
    );
    return;
  }

  try {
    await client.sendMail({
      from: process.env.SMTP_FROM || "openmap.lt <noreply@openmap.lt>",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Klaida siunčiant el. laišką:", error);
  }
}
