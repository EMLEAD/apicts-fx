"use client";

import { useEffect, useState } from "react";

export default function ReferralWidget({ apiEndpoint = "src/lib/db/models" }) {
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchReferral = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(apiEndpoint, { credentials: "include" });
        const data = await res.json();
        const code = data?.referralCode || data?.code || data?.referral || "";
        if (!mounted) return;
        if (!res.ok) {
          setError(data?.message || "Unable to fetch referral code");
        } else {
          setReferral(code);
        }
      } catch (err) {
        if (mounted) setError("Network error while fetching referral");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReferral();
    return () => { mounted = false; };
  }, [apiEndpoint]);

  const getBaseUrl = () => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_SITE_URL || "";
  };

  const referralLink = referral ? `${getBaseUrl()}/register?ref=${encodeURIComponent(referral)}` : "";

  const copyText = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  if (loading) return <div className="py-4 text-sm text-gray-500">Loading referral...</div>;
  if (error) return <div className="py-4 text-sm text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 max-w-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Your referral code</p>
          <p className="mt-2 font-mono font-semibold text-lg text-gray-900">{referral || "—"}</p>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => copyText(referral, "code")}
            className="bg-gray-100 hover:bg-gray-200 text-sm px-3 py-2 rounded-md ml-2"
          >
            {copied === "code" ? "Copied" : "Copy code"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">Referral link</p>
        <div className="mt-2 flex gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
          />
          <button
            type="button"
            onClick={() => copyText(referralLink, "link")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {copied === "link" ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Share this link to invite others and earn rewards.</p>
      </div>
    </div>
  );
}