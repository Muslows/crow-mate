type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function fromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || "Crow-mate <noreply@ow-manager.local>";
}

async function sendWithResend(input: SendEmailInput, apiKey: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend ${response.status}: ${body.slice(0, 400)}`);
  }
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    await sendWithResend(input, resendKey);
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Aucun fournisseur email configuré (RESEND_API_KEY).");
  }

  console.info("[email:dev]", {
    to: input.to,
    subject: input.subject,
    text: input.text,
  });
}

export function authEmailHtml(opts: {
  title: string;
  body: string;
  href: string;
  cta: string;
}): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0b0813;color:#f4f4f5;font-family:Inter,system-ui,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#14101c;border:1px solid #2a2438;border-radius:16px;padding:28px;">
            <tr><td style="font-size:13px;color:#f99e1a;font-weight:700;">Crow-mate</td></tr>
            <tr><td style="padding-top:12px;font-size:22px;font-weight:600;">${opts.title}</td></tr>
            <tr><td style="padding-top:12px;font-size:15px;line-height:1.55;color:#a1a1aa;">${opts.body}</td></tr>
            <tr>
              <td style="padding-top:24px;">
                <a href="${opts.href}" style="display:inline-block;background:#f99e1a;color:#1a1208;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px;">${opts.cta}</a>
              </td>
            </tr>
            <tr><td style="padding-top:20px;font-size:12px;color:#71717a;">Si tu n’es pas à l’origine de cette demande, ignore cet email.</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
