import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";

const OTP_TTL = parseInt(process.env.OTP_TTL || "600", 10); // seconds
const SHOW_OTP = process.env.SHOW_OTP === "true";

globalThis.__otpStore = globalThis.__otpStore || new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

async function sendMail(to, subject, text, html) {
  
  // If SMTP env not configured, skip sending
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn("SMTP not configured — skipping actual email send");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const email = (body?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // generate and store OTP
    const otp = generateOtp();
    const expiresAt = Date.now() + OTP_TTL * 1000;
    globalThis.__otpStore.set(email, { otp, expiresAt });

    // attempt to send email (if configured)
    const subject = "Your password reset OTP";
    const text = `Your one-time code: ${otp}. It expires in ${Math.floor(OTP_TTL/60)} minutes.`;
    const html = `<p>Your one-time code: <strong>${otp}</strong></p><p>Expires in ${Math.floor(OTP_TTL/60)} minutes.</p>`;

    try {
      await sendMail(email, subject, text, html);
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
      // do not fail — still store OTP; caller can request resend
    }

    const payload = { message: "OTP sent" };
    if (SHOW_OTP) payload.otp = otp; // dev convenience

    return NextResponse.json(payload);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}