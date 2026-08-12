"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InvoiceEditor } from "@/components/editor/InvoiceEditor";
import { PageLoader } from "@/components/ui/PageLoader";
import { getLocalHistoryItem } from "@/lib/local-store";
import type { InvoiceDocument } from "@/lib/types";

export function DocumentLoader() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const local = searchParams.get("local") === "1";
  const [doc, setDoc] = useState<InvoiceDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id;
    if (!id) return;

    if (local) {
      const found = getLocalHistoryItem(id);
      setDoc(found);
      setError(found ? null : "Local document not found");
      setLoading(false);
      return;
    }

    fetch(`/api/documents/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const found = getLocalHistoryItem(id);
          if (found) {
            setDoc(found);
            return;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Document not found");
        }
        setDoc((await res.json()) as InvoiceDocument);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setLoading(false));
  }, [params.id, local]);

  if (loading) {
    return <PageLoader label="Loading invoice…" />;
  }

  if (error || !doc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--page)]">
        <p className="text-red-600">{error || "Not found"}</p>
        <a href="/" className="text-[var(--accent)] hover:underline">
          Back to editor
        </a>
      </div>
    );
  }

  return <InvoiceEditor initialDocument={doc} />;
}
