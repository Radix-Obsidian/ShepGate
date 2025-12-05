import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShepGate - The Safe Front Door for AI Tools",
  description: "AI governance gateway with policy control, approval workflows, and audit logging. Control what your AI agents can do.",
  keywords: ["AI", "governance", "MCP", "Claude", "security", "approval workflow"],
  authors: [{ name: "Golden Sheep AI" }],
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "ShepGate - The Safe Front Door for AI Tools",
    description: "AI governance gateway with policy control, approval workflows, and audit logging.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
