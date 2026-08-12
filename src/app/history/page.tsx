import { HistoryClient } from "@/components/history/HistoryClient";

export const metadata = {
  title: "History - Invoice Generator",
  description:
    "View recent invoices saved on this device or in your cloud account.",
};

export default function HistoryPage() {
  return <HistoryClient />;
}
