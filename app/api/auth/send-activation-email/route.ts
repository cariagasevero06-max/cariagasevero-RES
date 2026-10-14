import { NextResponse } from 'next/server';
import { sendEmailWithBrevo } from '@/lib/brevo';

export async function POST(request: Request) {
  try {
    const { email, employeeId, fullName, otp, code } = await request.json();
    const verificationCode = otp || code;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    if (!verificationCode) {
      return NextResponse.json({ success: false, error: 'Verification code is required' }, { status: 400 });
    }

    const recipientName = fullName || 'ISTOREYA Employee';
    const subject = `Your ISTOREYA Employee Activation Code: ${verificationCode}`;
    const textContent = `Hello ${recipientName},\n\nYour 6-digit ISTOREYA employee activation verification code is: ${verificationCode}\n\nThis code is valid for 10 minutes.\n\nBest regards,\nISTOREYA Operations`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #FAF7F2; padding: 30px; color: #2C2523;">
        <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 16px; border: 1px solid #E8E0D5; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h1 style="font-size: 20px; color: #2C2523; margin-bottom: 8px; font-weight: bold;">ISTOREYA</h1>
          <h2 style="font-size: 16px; color: #B85032; margin-top: 0;">Employee Account Verification</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4B413C;">Hello <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4B413C;">
            ${employeeId ? `You are activating employee access for ID <strong>${employeeId}</strong>.` : 'You are activating your employee portal access.'}
            Please use the 6-digit verification code below:
          </p>
          <div style="background: #F5F4E7; border: 2px dashed #B85032; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-size: 11px; text-transform: uppercase; color: #8C7E77; letter-spacing: 2px; display: block; margin-bottom: 6px;">Your 6-Digit Verification Code</span>
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #2C2523; letter-spacing: 8px;">${verificationCode}</span>
          </div>
          <p style="font-size: 12px; color: #8C7E77; text-align: center;">This code is valid for 10 minutes. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #EAE3D6; margin: 24px 0;" />
          <p style="font-size: 11px; color: #A89D96; text-align: center; margin: 0;">
            Severo EMS &copy; ISTOREYA Operations • Dispatched via Brevo API
          </p>
        </div>
      </div>
    `;

    const result = await sendEmailWithBrevo(email, subject, textContent, htmlContent);

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Verification code dispatched to ${email} via Brevo API`
        : result.error,
      otp: verificationCode,
      details: {
        brevoSent: result.success,
        brevoMessage: result.success ? 'Sent via Brevo API' : result.error,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
