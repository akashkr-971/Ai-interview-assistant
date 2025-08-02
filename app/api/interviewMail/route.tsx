import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, link } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
        tls: {
            rejectUnauthorized: false, // Allow self-signed certificates
        },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      bcc: process.env.SMTP_USER, // send a copy to yourself
      subject: 'Interview Meeting Link',
      html: `
        <p>Hello,</p>
        <p>Your interview has been scheduled. Join using the link below:</p>
        <a href="${link}">${link}</a>
        <p>Best regards,<br />Team RolePrep</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('[Mail Error]', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
