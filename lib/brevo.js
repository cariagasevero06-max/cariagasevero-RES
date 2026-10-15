import nodemailer from 'nodemailer';
import https from 'https';

// Configure the transporter using Brevo SMTP details, forcing IPv4 (family: 4)
// to prevent dynamic IPv6 address rejection (525 5.7.1 Unauthorized IP address)
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.BREVO_SMTP_USER || 'bdd3ae001@smtp-brevo.com',
    pass: process.env.BREVO_SMTP_PASSWORD || process.env.BREVO_SMTP_KEY,
  },
});

/**
 * Fallback dispatcher using Brevo v3 HTTPS REST API forced to IPv4
 */
function sendEmailViaBrevoApi({ apiKey, sender, toEmail, subject, textContent, htmlContent }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender,
      to: [{ email: toEmail }],
      subject,
      textContent,
      htmlContent: htmlContent || `<p>${textContent}</p>`,
    });

    const req = https.request(
      {
        hostname: 'api.brevo.com',
        port: 443,
        path: '/v3/smtp/email',
        method: 'POST',
        family: 4, // Force IPv4
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, data: parsed });
            } else {
              resolve({
                success: false,
                error: parsed.message || 'Brevo API rejected the email request',
                details: parsed,
              });
            }
          } catch {
            resolve({
              success: false,
              error: data || `Brevo API HTTP status ${res.statusCode}`,
            });
          }
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

export async function sendEmailWithBrevo(toEmail, subject, textContent, htmlContent) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'cariagasevero06@gmail.com';
  const senderName = (process.env.BREVO_SENDER_NAME || 'WESLEYAN UNIVERSITY-PHILIPPINES').replace(/^"|"$/g, '');

  // 1. Try Brevo SMTP via Nodemailer (forced IPv4)
  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: toEmail,
      subject: subject,
      text: textContent,
      html: htmlContent || `<b>${textContent}</b>`,
    });

    console.log('Email sent successfully via Brevo SMTP: %s', info.messageId);
    return { success: true, data: info };
  } catch (smtpError) {
    console.warn('Brevo SMTP failed (%s), attempting Brevo API fallback (IPv4)...', smtpError?.message);

    // 2. Resilient Fallback: Brevo v3 HTTPS REST API (forced IPv4)
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      try {
        const apiResult = await sendEmailViaBrevoApi({
          apiKey,
          sender: { name: senderName, email: senderEmail },
          toEmail,
          subject,
          textContent,
          htmlContent,
        });

        if (apiResult.success) {
          console.log('Email sent successfully via Brevo API fallback (IPv4):', apiResult.data);
          return { success: true, data: apiResult.data };
        } else {
          console.error('Brevo API fallback returned error:', apiResult.error);
          return apiResult;
        }
      } catch (apiError) {
        console.error('Brevo API fallback network error:', apiError);
      }
    }

    const isIpError =
      smtpError?.message?.includes('525') ||
      smtpError?.message?.toLowerCase().includes('unauthorized ip');

    const errorMsg = isIpError
      ? 'Brevo Error: Unauthorized IP address. Please authorize your IP at https://app.brevo.com/security/authorised_ips'
      : (smtpError?.message || 'Failed to send email via Brevo');

    return {
      success: false,
      error: errorMsg,
    };
  }
}