import { SitePage } from "@/components/layout/SitePage";
import { PricingCards } from "@/components/billing/PricingCards";

export const metadata = {
  title: "Pricing - Invoice Generator",
  description:
    "Free unlimited PDF downloads. Upgrade for cloud sync and email sending.",
};

export default function PricingPage() {
  return (
    <SitePage wide>
      <div className="mx-auto max-w-3xl text-center animate-fade">
        <p className="page-kicker justify-center">Simple pricing</p>
        <h1 className="page-title">Free to download. Pro when you scale.</h1>
        <p className="page-lead mx-auto">
          Anyone can create and download professional invoice PDFs with zero
          signup. Pay only when you need cloud history and client email.
        </p>
      </div>

      <div className="mt-10">
        <PricingCards />
      </div>
    </SitePage>
  );
}
