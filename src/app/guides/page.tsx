import Link from "next/link";
import { SitePage } from "@/components/layout/SitePage";

export const metadata = {
  title: "Invoicing Guides - Invoice Generator",
  description: "Simple guides for writing clear professional invoices.",
};

const guides = [
  {
    title: "What every invoice needs",
    body: "Your business details, client details, invoice number, date, line items with rates, tax if needed, and a clear balance due. Keep payment terms short and visible.",
  },
  {
    title: "Write cleaner line items",
    body: "Name the work plainly, add a short description only when it helps, and keep quantity × rate honest. Clients pay faster when they understand the bill at a glance.",
  },
  {
    title: "Tax, discount, shipping",
    body: "Turn on only what applies. Percent tax is common for services; flat shipping works for physical delivery. Show the math so the PDF stays trustworthy.",
  },
  {
    title: "Send and keep records",
    body: "Download the PDF for your books, then Save Draft or Save & Send. History keeps recent work — sign in if you want cloud backups across devices.",
  },
];

export default function GuidesPage() {
  return (
    <SitePage>
      <div className="animate-fade">
        <p className="page-kicker">Resources</p>
        <h1 className="page-title">Invoicing Guides</h1>
        <p className="page-lead">
          Practical tips so your PDF looks sharp and gets paid.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {guides.map((guide, index) => (
          <article key={guide.title} className="panel animate-rise p-4 sm:p-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              Guide {index + 1}
            </p>
            <h2 className="mt-1 font-display text-lg font-bold tracking-tight">
              {guide.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {guide.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/" className="btn btn-primary">
          Start a new invoice
        </Link>
      </div>
    </SitePage>
  );
}
