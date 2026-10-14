import { NextResponse } from 'next/server';
import { sendEmailWithBrevo } from '@/lib/brevo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, employeeId, fullName } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Recipient email is required' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ success: false, error: 'Verification code is required' }, { status: 400 });
    }

    const employeeGreeting = fullName || 'ISTOREYA Team Member';
    const subject = `Your ISTOREYA Employee Activation Code: ${code}`;
    const textContent = `Hello ${employeeGreeting},\n\nYour 6-digit ISTOREYA employee activation verification code is: ${code}\n\nThis verification code is valid for 10 minutes. If you did not request this verification, please notify your manager or HR administrator immediately.\n\nBest regards,\nISTOREYA Operations`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAF7F2; padding: 32px 16px; color: #2C2523;">
        <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E8E0D5; padding: 32px; box-shadow: 0 4px 16px rgba(44, 37, 35, 0.06);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #2C2523; margin: 0 0 6px 0;">ISTOREYA</h1>
            <p style="font-size: 12px; color: #B85032; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; margin: 0;">Employee Operations Portal</p>
          </div>

          <h2 style="font-size: 16px; color: #2C2523; margin-top: 0; margin-bottom: 12px;">Account Activation Code</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4B413C; margin: 0 0 12px 0;">
            Hello <strong>${employeeGreeting}</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #4B413C; margin: 0 0 20px 0;">
            ${employeeId ? `You are completing activation for Employee ID <strong>${employeeId}</strong>. ` : ''}
            Please use the 6-digit verification code below to verify your personal email and activate your employee portal access:
          </p>

          <div style="background-color: #F5F4E7; border: 2px dashed #B85032; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 11px; text-transform: uppercase; color: #8C7E77; letter-spacing: 2px; font-weight: 600; display: block; margin-bottom: 8px;">Your 6-Digit Verification Code</span>
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; color: #2C2523; letter-spacing: 10px; display: inline-block;">${code}</span>
          </div>

          <p style="font-size: 12px; color: #8C7E77; text-align: center; margin: 0 0 24px 0;">
            This OTP code is valid for <strong>10 minutes</strong>. For security, never share this code with anyone.
          </p>

          <hr style="border: none; border-top: 1px solid #EAE3D6; margin: 24px 0;" />
          <p style="font-size: 11px; color: #A89D96; text-align: center; margin: 0;">
            ISTOREYA Enterprise Management System • Powered by Brevo API
          </p>
        </div>
      </div>
    `;

    const result = await sendEmailWithBrevo(email, subject, textContent, htmlContent);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to dispatch email via Brevo SMTP',
          details: (result as any)?.details || null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code successfully sent to ${email}`,
      data: result.data || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred while sending the email',
      },
      { status: 500 }
    );
  }
}
