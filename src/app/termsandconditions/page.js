import  Navbar  from '@/Components/NavBar'
import Footer from "@/Components/Footer";
import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <main className="max-w-5xl mx-auto mt-10 px-6 py-20">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-sm text-gray-700">Last updated: October 17, 2025</p>
        </header>

        <section className="space-y-6 text-base leading-relaxed text-gray-900">
          <p>
            Welcome to Apicts‑FX and Apicts Academy. These Terms & Conditions (&quot;Terms&quot;) govern your use of our exchange services,
            academy content, website and any related services (together, the &quot;Services&quot;). By accessing or using our Services you
            agree to be bound by these Terms.
          </p>

          <h2 className="text-xl font-semibold pt-4">1. About Our Services</h2>
          <p>
            Apicts‑FX provides currency exchange services (fiat, e‑currency and cryptocurrency) and Apicts Academy provides
            educational content, courses and mentorship.Our Services require registration, identity verification and
            acceptance of additional rules for specific products.
          </p>

          <h2 className="text-xl font-semibold pt-4">2. Registration, KYC & Account Security</h2>
          <p>
            You must provide accurate information and complete identity verification (KYC) where requested. You are responsible
            for safeguarding your account credentials. Notify support immediately of any unauthorized access.
          </p>

          <h2 className="text-xl font-semibold pt-4">3. Payments, Fees & Taxes</h2>
          <p>
            Transaction fees, exchange spreads and other charges may apply. Fees are disclosed on relevant pages and may change
            from time to time. You are responsible for any taxes or duties arising from your use of the Services.
          </p>

          <h2 className="text-xl font-semibold pt-4">4. Risks & No Financial Advice</h2>
          <p>
            Trading currencies and cryptocurrencies involves significant risk. Educational content is for informational purposes
            only and does not constitute financial, tax or legal advice. You should seek independent advice before acting on
            any information provided through our Services.
          </p>

          <h2 className="text-xl font-semibold pt-4">5. Content & Intellectual Property</h2>
          <p>
            All content provided by Apicts‑FX and Apicts Academy (text, images, video, courses, trademarks) is owned or licensed
            and protected by intellectual property laws. You may not reproduce or redistribute our content without prior written
            consent.
          </p>

          <h2 className="text-xl font-semibold pt-4">6. User Conduct</h2>
          <p>
            You must not use the Services for unlawful activities, fraud, money‑laundering or to breach any applicable laws.
            We may suspend or terminate accounts that violate these Terms or pose a risk to other users or to the platform.
          </p>

          <h2 className="text-xl font-semibold pt-4">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Apicts‑FX and its affiliates are not liable for indirect, incidental,
            consequential or punitive damages arising from your use of the Services. Our total liability for direct damages is
            limited as further described in our full legal policy.
          </p>

          <h2 className="text-xl font-semibold pt-4">8. Privacy</h2>
          <p>
            Our Privacy Policy explains how we collect, use and protect personal information. By using the Services you consent
            to processing of your data as described in the Privacy Policy.
          </p>

          <h2 className="text-xl font-semibold pt-4">9. Changes to Terms</h2>
          <p>
            We may modify these Terms. Material changes will be notified by email or posted on the website. Continued use after
            changes constitutes acceptance.
          </p>

          <h2 className="text-xl font-semibold pt-4">10. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction in which Apicts‑FX is registered. Disputes will be handled
            as set out in our legal notices and may require arbitration or local court proceedings where applicable.
          </p>

          <h2 className="text-xl font-semibold pt-4">11. Contact</h2>
          <p>
            For questions about these Terms or to report abuse, contact us:
            <br />
            Email: <Link href="mailto:support@apicts.com" className="text-blue-700">support@apicts.com</Link>
            <br />
            Phone: <span className="text-gray-900">+234 813 939 9978</span>
            <br />
            Address: Km 18, Topaz Plaza, New Road, Lekki Ajah, Lagos, Nigeria
          </p>

          <p className="text-sm text-gray-600">
            If you need the full legal agreement in PDF form, please <Link href="/contact" className="text-blue-700 underline">contact support</Link>.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}