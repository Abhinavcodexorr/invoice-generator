import Link from "next/link";
import { SitePage } from "@/components/layout/SitePage";

export const metadata = {
  title: "Help - Invoice Generator",
  description: "Help for creating invoices and downloading PDFs.",
};

const faqs = [
  {
    q: "How do I download a PDF?",
    a: "Fill in your invoice details, then click Download PDF · Free. No login is required — downloads stay free forever.",
  },
  {
    q: "Where are my invoices saved?",
    a: "Guests keep drafts in this browser’s History. A free account syncs up to 25 cloud invoices. Pro unlocks unlimited cloud history.",
  },
  {
    q: "Can I email an invoice?",
    a: "Email send is a Pro feature. Sign in, upgrade on Pricing, then use Save & Send. Delivery uses Resend when configured on the server.",
  },
  {
    q: "What’s included in Free vs Pro?",
    a: "Free: create invoices and download PDFs with no login. Pro: unlimited cloud sync, client email, and PDFs without app branding. See Pricing for Business.",
  },
  {
    q: "How do I change currency?",
    a: "In the editor sidebar, open Currency and pick the code you need. Totals and the PDF update automatically.",
  },
  {
    q: "I cleared my browser data — where did History go?",
    a: "Guest History is stored locally on your device. Clearing site data removes it. Sign up for cloud History to keep a backup.",
  },
];

export default function HelpPage() {
  return (
    <SitePage>
      <div className="animate-fade">
        <p className="page-kicker">Support</p>
        <h1 className="page-title">Help</h1>
        <p className="page-lead">
          Quick answers for creating invoices and downloading PDFs.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {faqs.map((item) => (
          <section key={item.q} className="panel animate-rise p-4 sm:p-5">
            <h2 className="font-display text-base font-bold tracking-tight sm:text-lg">
              {item.q}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {item.a}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Create Invoice
        </Link>
        <Link href="/history" className="btn btn-ghost">
          Open History
        </Link>
      </div>
    </SitePage>
  );
}
