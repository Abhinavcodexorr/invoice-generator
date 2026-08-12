import { Suspense } from "react";
import { DocumentLoader } from "./DocumentLoader";

export default function DocumentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--page)] text-[var(--muted)]">
          Loading document…
        </div>
      }
    >
      <DocumentLoader />
    </Suspense>
  );
}
