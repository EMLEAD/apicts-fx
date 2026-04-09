import "./globals.css";

export const metadata = {
  title: {
    default: "APICTS Forex Academy - Professional Forex Trading Education in Nigeria",
    template: "%s | APICTS Forex Academy"
  },
  description: "Learn professional forex trading with APICTS Forex Academy. Get expert mentorship, live trading sessions, signals, and comprehensive training. Join 10,000+ successful traders in Nigeria.",
  keywords: [
    "forex trading Nigeria", 
    "forex academy Nigeria", 
    "forex training Lagos", 
    "forex signals Nigeria", 
    "forex mentorship Nigeria",
    "learn forex trading Nigeria", 
    "forex education Nigeria", 
    "trading academy Lagos",
    "forex broker Nigeria",
    "forex trading course Nigeria",
    "best forex academy Nigeria",
    "forex trading school Lagos",
    "forex mentor Nigeria",
    "forex classes Nigeria",
    "online forex training Nigeria",
    "forex trading platform Nigeria",
    "forex trading tips Nigeria",
    "Nigerian forex traders",
    "forex investment Nigeria",
    "currency trading Nigeria",
    "forex market Nigeria",
    "forex trading strategies Nigeria",
    "professional forex training Lagos",
    "APICTS forex academy",
    "forex live sessions Nigeria",
    "forex community Nigeria"
  ],
  authors: [{ name: "APICTS Forex Academy" }],
  creator: "APICTS Forex Academy",
  publisher: "APICTS Forex Academy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://apictsforex.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "APICTS Forex Academy - Professional Forex Trading Education",
    description: "Learn professional forex trading with expert mentorship, live sessions, and comprehensive training. Join 10,000+ successful traders.",
    url: 'https://apictsforex.com',
    siteName: 'APICTS Forex Academy',
    images: [
      {
        url: '/images/apicts-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'APICTS Forex Academy',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APICTS Forex Academy - Professional Forex Trading Education',
    description: 'Learn professional forex trading with expert mentorship and comprehensive training.',
    images: ['/images/apicts-logo.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "ND7gkGw6-n-cVQjeoFeAHv9_vN0R-5s5T6jzn_MbR-w"
  },
  category: 'education',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
