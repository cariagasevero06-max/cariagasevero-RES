import nodemailer from 'nodemailer';

// Configure the transporter using your Brevo SMTP details
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER || 'bdd3ae001@smtp-brevo.com',
    pass: process.env.BREVO_SMTP_PASSWORD || process.env.BREVO_SMTP_KEY,
  },
});

export async function sendEmailWithBrevo(toEmail, subject, textContent, htmlContent) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'cariagasevero06@gmail.com';
  const senderName = (process.env.BREVO_SENDER_NAME || 'ISTOREYA').replace(/^"|"$/g, '');

  // 1. Try Brevo SMTP via Nodemailer
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
    console.warn('Brevo SMTP failed (%s), attempting Brevo API fallback...', smtpError.message);

    // 2. Resilient Fallback: Brevo v3 HTTPS REST API (bypasses port 587 IP block)
    if (process.env.BREVO_API_KEY) {
      try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: toEmail }],
            subject: subject,
            textContent: textContent,
            htmlContent: htmlContent || `<p>${textContent}</p>`,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          console.log('Email sent successfully via Brevo API fallback:', data);
          return { success: true, data };
        } else {
          console.error('Brevo API fallback returned error:', data);
        }
      } catch (apiError) {
        console.error('Brevo API fallback network error:', apiError);
      }
    }

    return {
      success: false,
      error: smtpError.message || 'Failed to send email via Brevo SMTP',
    };
  }
}