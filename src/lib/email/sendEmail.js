import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const TEMPLATE_PATH = path.join(process.cwd(), "src", "views", "emails", "otp.html");

function renderTemplate(replacements = {}) {
  let tpl = fs.readFileSync(TEMPLATE_PATH, "utf8");
  // simple placeholder replacement: {{KEY}}
  Object.entries(replacements).forEach(([k, v]) => {
    const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
    tpl = tpl.replace(re, String(v ?? ""));
  });
  return tpl;
}

function plainTextFallback({ OTP, companyName, siteUrl, supportEmail }) {
  return [
    `${companyName} — One-time code`,
    "",
    `Your code: ${OTP}`,
    "",
    `If you didn't request this, contact support: ${supportEmail}`,
    "",
    `Open: ${siteUrl}`
  ].join("\n");
}

export async function sendOtpEmail({ to, otp, userName = "", meta = {} }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const replacements = {
    OTP: otp,
    userName: userName || "there",
    companyName: process.env.SITE_NAME || "APICTS-FX",
    companyInitials: process.env.SITE_INITIALS || "AF",
    siteUrl: process.env.SITE_URL || "https://apicts-fx.com",
    supportEmail: process.env.CONTACT_EMAIL || process.env.SMTP_USER || "support@apicts-fx.com",
    actionUrl: meta.actionUrl || process.env.SITE_URL || "",
    otpTtlMinutes: Math.round((parseInt(process.env.OTP_TTL || "600", 10) || 600) / 60),
    ip: meta.ip || "Unknown",
    device: meta.device || "Unknown",
    time: meta.time || new Date().toISOString(),
    companyTagline: process.env.SITE_TAGLINE || "Forex Exchange & Academy",
    companyAddress: process.env.COMPANY_ADDRESS || "—",
    year: new Date().getFullYear()
  };

  const html = renderTemplate(replacements);
  const text = plainTextFallback({ OTP: otp, companyName: replacements.companyName, siteUrl: replacements.siteUrl, supportEmail: replacements.supportEmail });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `${replacements.companyName} — Your one-time code`,
    text,
    html,
  });

  return info;
}

export default sendOtpEmail;