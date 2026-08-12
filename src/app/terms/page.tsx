import { SitePage } from "@/components/layout/SitePage";

export const metadata = {
  title: "Terms of Service - Invoice Generator",
};

export default function TermsPage() {
  return (
    <SitePage>
      <p className="page-kicker">Legal</p>
      <h1 className="page-title">Terms of Service</h1>
      <div className="prose-ish mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          Invoice Generator is provided as a free tool to create invoice PDFs and
          optionally save history when you create an account.
        </p>
        <p>
          You are responsible for the accuracy of invoice content you generate,
          including amounts, taxes, and client information. This app does not
          provide legal, tax, or accounting advice.
        </p>
        <p>
          Guest drafts are stored in your browser. Signed-in documents are stored
          in our database for your account. Do not upload sensitive secrets or
          credentials into invoice fields.
        </p>
        <p>
          We may update these terms as the product evolves. Continued use means
          you accept the current version on this page.
        </p>
      </div>
    </SitePage>
  );
}
