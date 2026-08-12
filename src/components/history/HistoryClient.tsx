"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney } from "@/lib/currencies";
import { calculateTotals } from "@/lib/calculations";
import {
  deleteLocalHistory,
  loadLocalHistory,
  upsertLocalHistory,
} from "@/lib/local-store";
import type { InvoiceDocument } from "@/lib/types";

export function HistoryClient() {
  const { user, signOut, loading } = useAuth();
  const userId = user?.id ?? null;
  const [docs, setDocs] = useState<InvoiceDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  const refresh = async () => {
    setError(null);
    if (userId) {
      const res = await fetch("/api/documents");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to load history");
        return;
      }
      setDocs((await res.json()) as InvoiceDocument[]);
      return;
    }
    setDocs(loadLocalHistory());
  };

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    void (async () => {
      try {
        setError(null);
        if (userId) {
          const res = await fetch("/api/documents");
          if (cancelled) return;
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Failed to load history");
            return;
          }
          setDocs((await res.json()) as InvoiceDocument[]);
        } else {
          setDocs(loadLocalHistory());
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, loading]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((doc) => {
      const hay = [
        doc.number,
        doc.to_text,
        doc.from_text,
        doc.po_number,
        formatMoney(calculateTotals(doc).balanceDue, doc.currency),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [docs, query]);

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      if (user) {
        const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Delete failed");
        }
      } else {
        deleteLocalHistory(id);
      }
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const duplicate = async (doc: InvoiceDocument) => {
    setBusyId(doc.id ?? "dup");
    try {
      const copy: InvoiceDocument = {
        ...doc,
        type: "invoice",
        id: undefined,
        number: String(Number(doc.number || "1") + 1 || "1"),
        status: "draft",
        sent_at: null,
        created_at: undefined,
        updated_at: undefined,
      };

      if (user) {
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(copy),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Duplicate failed");
        }
      } else {
        upsertLocalHistory({ ...copy, id: crypto.randomUUID() });
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Duplicate failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-shell flex min-h-screen flex-col text-[var(--foreground)]">
      <AppHeader userEmail={user?.email} onSignOut={signOut} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-fade">
          <div>
            <p className="page-kicker">Your archive</p>
            <h1 className="page-title">History</h1>
            <p className="page-lead">
              {user
                ? "Your invoices are saved to the cloud with your account. Open any row to edit, download a PDF again, or send it."
                : "We automatically keep invoices you save recently on this device. Useful when you need a quick edit — sign in for cloud History on every device."}
            </p>
          </div>
          <Link href="/" className="btn btn-primary">
            New Invoice
          </Link>
        </div>

        {!user ? (
          <div className="mb-6 animate-rise rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_55%,var(--surface))] px-4 py-4 sm:px-5">
            <p className="font-display text-base font-bold">Cloud History</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Sign in to securely save invoices and open them from any device.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/auth/sign-up" className="btn btn-primary !py-2">
                Sign Up free
              </Link>
              <Link href="/pricing" className="btn btn-ghost !py-2">
                See Pro plans
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mb-4">
          <label className="sr-only" htmlFor="history-search">
            Search invoices
          </label>
          <input
            id="history-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoices…"
            className="field max-w-md"
          />
        </div>

        {error ? (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {!ready || loading ? (
          <div className="panel space-y-3 p-5" role="status" aria-live="polite">
            <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted)]">
              <Spinner size={16} />
              Loading history…
            </div>
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-[92%]" />
            <div className="skeleton h-10 w-[96%]" />
            <div className="skeleton h-10 w-[88%]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel animate-rise border-dashed px-6 py-14 text-center">
            <p className="font-display text-lg font-bold">
              {docs.length === 0 ? "No invoices found." : "No matches."}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              {docs.length === 0
                ? "Create an invoice, then click Save Draft or Download PDF. Saved invoices show up here."
                : "Try a different search term."}
            </p>
            {docs.length === 0 ? (
              <Link href="/" className="btn btn-primary mt-5">
                New Invoice
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="panel animate-rise overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[color-mix(in_oklab,var(--accent-ink)_92%,transparent)] text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice #</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const totals = calculateTotals(doc);
                  const href = doc.id
                    ? user
                      ? `/d/${doc.id}`
                      : `/d/${doc.id}?local=1`
                    : "/";
                  return (
                    <tr
                      key={doc.id}
                      className="border-t border-[var(--border)] transition-colors hover:bg-[color-mix(in_oklab,var(--accent-soft)_35%,transparent)]"
                    >
                      <td className="px-4 py-3 font-semibold">{doc.number || "—"}</td>
                      <td className="max-w-[220px] truncate px-4 py-3">
                        {doc.to_text?.split("\n")[0] || "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatMoney(totals.balanceDue, doc.currency)}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {doc.updated_at
                          ? new Date(doc.updated_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={href}
                            className="text-[var(--accent)] hover:underline"
                          >
                            Open
                          </Link>
                          <button
                            type="button"
                            disabled={busyId === doc.id}
                            onClick={() => duplicate(doc)}
                            className="text-[var(--muted)] hover:text-[var(--foreground)]"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            disabled={busyId === doc.id}
                            onClick={() => doc.id && remove(doc.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!user ? (
          <p className="mt-5 text-xs leading-relaxed text-[var(--muted)]">
            These invoices are stored on your device only. Clearing browser data
            erases them. Keep a PDF copy of each invoice, or use Sign Up for cloud
            History.
          </p>
        ) : null}
      </main>

      <AppFooter />
    </div>
  );
}
