import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Testing seam: allow unit tests to inject a fake client.
export function __setResendClientForTests(client: Resend | null) {
  resendClient = client;
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "noreply@historian.archit.xyz";

  await getResendClient().emails.send({
    from: `Historian <${fromEmail}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 40px; text-align: center; margin-bottom: 30px;">
            <span style="font-size: 48px;">🕵️</span>
            <h1 style="color: #fff; margin: 16px 0 0; font-size: 28px;">Historian</h1>
          </div>
          
          <div style="background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 24px;">Reset your password</h2>
            
            <p style="color: #666; margin: 0 0 24px;">
              You requested to reset your password. Click the button below to create a new password.
            </p>
            
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
            
            <p style="color: #999; font-size: 14px; margin: 24px 0 0;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 24px; color: #999; font-size: 14px;">
            <p style="margin: 0;">Historian - Your browsing history, organized</p>
          </div>
        </body>
      </html>
    `,
  });
}
