import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { User } from "@/lib/db/models";

const OTP_TTL = parseInt(process.env.OTP_TTL || "600", 10); // seconds
const SHOW_OTP = process.env.SHOW_OTP === "true";

globalThis.__otpStore = globalThis.__otpStore || new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

async function sendMail(to, subject, text, html) {
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

    // Validate required fields & format
    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
    }

    // Verify user exists in DB before creating OTP
    let user;
    try {
      if (!User || typeof User.findOne !== "function") {
        console.error("User model not available or has no findOne method.");
        return NextResponse.json({ success: false, message: "Server error: user lookup unavailable" }, { status: 500 });
      }

      user = await User.findOne({ where: { email } });
    } catch (dbErr) {
      console.error("Database lookup failed:", dbErr);
      return NextResponse.json({ success: false, message: "Server error: user lookup failed" }, { status: 500 });
    }

    if (!user) {
      // Do not leak which emails exist in production if you want; adjust status/message accordingly.
      return NextResponse.json({ success: false, message: "Email not registered" }, { status: 404 });
    }

    if (user.isActive === false) {
      return NextResponse.json({
        success: false,
        message: "Account is inactive. Please contact support.",
      }, { status: 403 });
    }

    // generate and store OTP
    const otp = generateOtp();
    const expiresAt = Date.now() + OTP_TTL * 1000;
    globalThis.__otpStore.set(email, { otp, expiresAt, userId: user.id });

    // prepare email
    const subject = "Your password reset OTP";
    const text = `Your one-time code: ${otp}. It expires in ${Math.floor(OTP_TTL / 60)} minutes.`;
    const html = `<p>Your one-time code: <strong>${otp}</strong></p><p>Expires in ${Math.floor(OTP_TTL / 60)} minutes.</p>`;

    // send email (best-effort)
    let mailError = null;
    try {
      await sendMail(email, subject, text, html);
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
      mailError = mailErr;
    }

    const payload = { success: true, message: "OTP sent" };
    if (SHOW_OTP) payload.otp = otp; // dev convenience
    if (mailError && !SHOW_OTP) {
      // indicate email send problem but still return success so frontend can instruct user
      payload.note = "OTP stored but sending failed. Contact support or try again.";
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}