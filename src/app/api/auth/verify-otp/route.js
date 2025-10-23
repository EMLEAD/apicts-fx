import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const TOKEN_TTL = process.env.OTP_TOKEN_TTL || "15m"; // JWT expiry
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

globalThis.__otpStore = globalThis.__otpStore || new Map();

export async function POST(req) {
  try {
    const body = await req.json();
    const email = (body?.email || "").trim().toLowerCase();
    const otp = (body?.otp || "").trim();

    if (!email || !otp) {
      return NextResponse.json({ error: "Missing email or otp" }, { status: 400 });
    }

    const record = globalThis.__otpStore.get(email);
    if (!record) {
      return NextResponse.json({ error: "No record for this email" }, { status: 400 });
    }

    if (Date.now() > record.expiresAt) {
      globalThis.__otpStore.delete(email);
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (record.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // OTP valid — create a short-lived token to allow password reset
    if (!JWT_SECRET) {
      return NextResponse.json({ error: "Server not configured: JWT_SECRET missing" }, { status: 500 });
    }

    const token = jwt.sign({ email, purpose: "forgot_password" }, JWT_SECRET, { expiresIn: TOKEN_TTL });

    // remove used OTP
    globalThis.__otpStore.delete(email);

    return NextResponse.json({ message: "OTP verified", token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}