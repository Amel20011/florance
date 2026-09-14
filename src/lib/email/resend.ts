import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey.trim());
  }
  return resendClient;
}

export interface SendOtpEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

const DEFAULT_RESEND_SENDER = 'Florance Digital <onboarding@resend.dev>';

const UNVERIFIABLE_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.id',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'aol.com',
  'mail.com',
  'zoho.com',
  'protonmail.com',
  'proton.me',
];

function sanitizeSenderEmail(rawFrom?: string): string {
  if (!rawFrom || rawFrom.trim().length === 0) {
    return DEFAULT_RESEND_SENDER;
  }

  const trimmed = rawFrom.trim();

  // Extract email address within angle brackets if present: "Name <email@domain.com>"
  const match = trimmed.match(/<([^>]+)>/) || [null, trimmed];
  const emailOnly = (match[1] || trimmed).trim().toLowerCase();

  const domain = emailOnly.split('@')[1];
  if (domain && UNVERIFIABLE_DOMAINS.includes(domain)) {
    console.warn(
      `[Resend Config Notice] '${trimmed}' uses a public webmail domain (${domain}) which cannot be verified on Resend. Falling back to default: '${DEFAULT_RESEND_SENDER}'.`
    );
    return DEFAULT_RESEND_SENDER;
  }

  return trimmed;
}

/**
 * Sends a 6-digit OTP email using Resend with automatic fallback
 */
export async function sendOtpEmail(
  toEmail: string,
  otpCode: string,
  appName = 'Florance Digital'
): Promise<SendOtpEmailResult> {
  const resend = getResendClient();
  const configuredFrom =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    DEFAULT_RESEND_SENDER;

  const primaryFrom = sanitizeSenderEmail(configuredFrom);

  if (!resend) {
    console.error(
      '[Resend Mailer] RESEND_API_KEY is not configured in environment variables.'
    );
    return {
      success: false,
      error: 'Konfigurasi RESEND_API_KEY belum tersedia di server.',
    };
  }

  const subject = `Kode OTP Login — ${appName}`;
  const textContent = `Kode verifikasi login Anda: ${otpCode}\n\nKode ini berlaku selama 5 menit.\nJika Anda tidak meminta kode ini, abaikan email ini.`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 28px 16px 28px; text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background-color: #2563eb; color: #ffffff; border-radius: 12px; font-weight: 800; font-size: 22px; text-align: center;">
                F
              </div>
              <h1 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 16px 0 6px 0; letter-spacing: -0.5px;">
                Kode Verifikasi Masuk
              </h1>
              <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
                Gunakan kode 6 digit berikut untuk menyelesaikan proses masuk akun <strong>${appName}</strong> Anda.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td style="padding: 8px 28px 20px 28px; text-align: center;">
              <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 20px 16px; margin: 12px 0;">
                <div style="color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
                  Kode OTP Anda
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8;">
                  ${otpCode}
                </div>
              </div>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 12px 14px;">
                <p style="color: #1e40af; font-size: 12px; margin: 0; line-height: 1.5;">
                  ⏱️ <strong>Masa Berlaku:</strong> Kode ini hanya berlaku selama <strong>5 menit</strong> dan hanya dapat digunakan 1 (satu) kali.
                </p>
              </div>
              <p style="color: #94a3b8; font-size: 11px; margin: 16px 0 0 0; line-height: 1.5; text-align: center;">
                Demi keamanan akun Anda, jangan berikan kode ini kepada siapa pun termasuk pihak staf. Jika Anda tidak merasa meminta kode ini, abaikan email ini.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px 28px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} ${appName}. Sistem Autentikasi Terenkripsi.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Attempt 1: Send with primaryFrom
  try {
    let response = await resend.emails.send({
      from: primaryFrom,
      to: [toEmail],
      subject,
      text: textContent,
      html: htmlContent,
    });

    // If failed due to unverified domain error and primaryFrom was not default, retry with default
    if (
      response.error &&
      primaryFrom !== DEFAULT_RESEND_SENDER &&
      (response.error.message?.toLowerCase().includes('domain') ||
        response.error.name === 'validation_error')
    ) {
      console.warn(
        `[Resend Sender Fallback] Primary sender '${primaryFrom}' failed domain validation. Retrying with default sender '${DEFAULT_RESEND_SENDER}'...`
      );
      response = await resend.emails.send({
        from: DEFAULT_RESEND_SENDER,
        to: [toEmail],
        subject,
        text: textContent,
        html: htmlContent,
      });
    }

    if (response.error) {
      console.error('[Resend Error Response]:', response.error.message || response.error);
      return {
        success: false,
        error: response.error.message || 'Gagal mengirim email verifikasi.',
      };
    }

    console.log(
      `[Resend Success] OTP successfully delivered to ${toEmail} via ${primaryFrom} (Email ID: ${response.data?.id})`
    );
    return {
      success: true,
      id: response.data?.id,
    };
  } catch (err: any) {
    console.error('[Resend Exception Error]:', err?.message || err);

    // Fallback retry with default sender if exception occurred with custom sender
    if (primaryFrom !== DEFAULT_RESEND_SENDER) {
      try {
        console.warn(`[Resend Exception Fallback] Retrying with '${DEFAULT_RESEND_SENDER}'...`);
        const retryResponse = await resend.emails.send({
          from: DEFAULT_RESEND_SENDER,
          to: [toEmail],
          subject,
          text: textContent,
          html: htmlContent,
        });

        if (!retryResponse.error && retryResponse.data?.id) {
          console.log(
            `[Resend Success on Fallback] OTP delivered to ${toEmail} (Email ID: ${retryResponse.data.id})`
          );
          return {
            success: true,
            id: retryResponse.data.id,
          };
        }
      } catch (retryErr: any) {
        console.error('[Resend Retry Exception]:', retryErr?.message || retryErr);
      }
    }

    return {
      success: false,
      error: 'Terjadi kegagalan saat menghubungi server pengiriman email.',
    };
  }
}
