import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanencemobility.com"),
  title: {
    default: "Permanence Mobility | Excellence Is Eternal",
    template: "%s | Permanence Mobility",
  },
  description:
    "Premium weekly vehicles for approved gig workers, plus a managed platform for qualified fleet partners.",
  openGraph: {
    title: "Permanence Mobility",
    description: "Weekly vehicles for gig work. Excellence Is Eternal.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1792,
        height: 921,
        alt: "Permanence Mobility — Excellence Is Eternal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Permanence Mobility",
    description: "Weekly vehicles for gig work. Excellence Is Eternal.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
