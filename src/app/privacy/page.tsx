import { SitePage } from "@/components/layout/SitePage";

export const metadata = {
  title: "Privacy Policy - Invoice Generator",
};

export default function PrivacyPage() {
  return (
    <SitePage>
      <p className="page-kicker">Legal</p>
      <h1 className="page-title">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          Guest mode keeps invoice drafts and History in your browser’s local
          storage on this device. Clearing browser data removes that History.
        </p>
        <p>
          When you sign up, we store your email, hashed password, and the
          invoices you choose to save so you can reopen them later. We use this
          data only to run the product (auth, History, and optional email send).
        </p>
        <p>
          PDF files are generated in your browser for download. If you use Save
          &amp; Send, invoice content is processed to deliver the email.
        </p>
        <p>
          We do not sell your personal information. Contact us through the Help
          page if you want an account deleted.
        </p>
      </div>
    </SitePage>
  );
}
