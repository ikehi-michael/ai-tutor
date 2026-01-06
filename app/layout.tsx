import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

export const metadata: Metadata = {
  title: "The Stem Studio - AI Tutor for WAEC, NECO & JAMB",
  description: "Your AI-powered STEM study companion for Nigerian exams. Get instant explanations, solve past questions, create personalized study plans, and ace your WAEC, NECO & JAMB exams.",
  keywords: ["WAEC", "JAMB", "NECO", "AI tutor", "Nigerian education", "exam preparation", "study help", "STEM", "Science", "Mathematics"],
  authors: [{ name: "The Stem Studio" }],
  openGraph: {
    title: "The Stem Studio - AI Tutor for WAEC, NECO & JAMB",
    description: "Your AI-powered STEM study companion for Nigerian exams",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
