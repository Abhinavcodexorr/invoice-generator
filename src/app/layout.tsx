import type { Metadata } from "next";
import { Figtree, Outfit } from "next/font/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { RouteProgress } from "@/components/ui/RouteProgress";
import "./globals.css";

const bodyFont = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const displayFont = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Invoice Generator",
  description:
    "Create professional invoices and download PDFs free — no login. Upgrade to Pro for cloud history and email sending.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className={`${bodyFont.className} flex min-h-full flex-col`}>
        <SessionProvider>
          <ThemeProvider>
            <RouteProgress />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
