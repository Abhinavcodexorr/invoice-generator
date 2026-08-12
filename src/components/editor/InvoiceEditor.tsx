"use client";

import { pdf } from "@react-pdf/renderer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { InvoicePdfDocument } from "@/components/pdf/InvoicePdfDocument";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { calculateTotals } from "@/lib/calculations";
import {
  CURRENCIES,
  formatMoney,
  normalizeCurrency,
} from "@/lib/currencies";
import { canRemoveBranding, canSendEmail } from "@/lib/plans";
import { createEmptyDocument, defaultLabels } from "@/lib/defaults";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  upsertLocalHistory,
} from "@/lib/local-store";
import type { DocumentLabels, InvoiceDocument } from "@/lib/types";
import { EditableLabel } from "./EditableLabel";
import { InvoiceSettings } from "./InvoiceSettings";
import { LineItems } from "./LineItems";
import { SaveSendModal } from "./SaveSendModal";
import { TotalsPanel } from "./TotalsPanel";

interface InvoiceEditorProps {
  initialDocument?: InvoiceDocument | null;
}

function asInvoice(doc: InvoiceDocument): InvoiceDocument {
  return {
    ...doc,
    type: "invoice",
    currency: normalizeCurrency(doc.currency),
    labels: {
      ...defaultLabels("invoice"),
      ...doc.labels,
      header: "INVOICE",
    },
  };
}

export function InvoiceEditor({ initialDocument = null }: InvoiceEditorProps) {
  const router = useRouter();
  const { user, plan, signOut } = useAuth();
  const proSend = canSendEmail(plan);

  const [doc, setDoc] = useState<InvoiceDocument>(() => {
    if (initialDocument) return asInvoice(initialDocument);
    return createEmptyDocument("invoice");
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [busy, setBusy] = useState<"download" | "save" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(Boolean(initialDocument));
  const [balancePulse, setBalancePulse] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const skipDraftSaveRef = useRef(false);

  useEffect(() => {
    if (initialDocument) {
      setDoc(asInvoice(initialDocument));
      setHydrated(true);
      return;
    }
    const draft = loadDraft();
    if (draft) setDoc(asInvoice(draft));
    setHydrated(true);
  }, [initialDocument]);

  useEffect(() => {
    if (!hydrated || initialDocument?.id) return;
    if (skipDraftSaveRef.current) {
      skipDraftSaveRef.current = false;
      return;
    }
    const t = window.setTimeout(() => saveDraft(doc), 400);
    return () => window.clearTimeout(t);
  }, [doc, hydrated, initialDocument?.id]);

  const totals = calculateTotals(doc);

  useEffect(() => {
    setBalancePulse(true);
    const t = window.setTimeout(() => setBalancePulse(false), 240);
    return () => window.clearTimeout(t);
  }, [totals.balanceDue]);

  const patch = useCallback((partial: Partial<InvoiceDocument>) => {
    setDoc((prev) => ({
      ...prev,
      ...partial,
      ...(partial.currency
        ? { currency: normalizeCurrency(partial.currency) }
        : {}),
    }));
  }, []);

  const currency = normalizeCurrency(doc.currency);

  const onLabelChange = useCallback(
    (key: keyof DocumentLabels, value: string) => {
      setDoc((prev) => ({
        ...prev,
        labels: { ...prev.labels, [key]: value },
      }));
    },
    [],
  );

  const themeClass = useMemo(
    () => (doc.theme === "slate" ? "theme-slate" : "theme-classic"),
    [doc.theme],
  );

  const handleLogo = (file: File | null) => {
    if (!file) {
      patch({ logo_url: null, logo_data_url: null });
      if (logoInputRef.current) logoInputRef.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      patch({ logo_data_url: String(reader.result), logo_url: null });
    };
    reader.readAsDataURL(file);
  };

  const resetForm = useCallback(() => {
    skipDraftSaveRef.current = true;
    clearDraft();
    setDoc(createEmptyDocument("invoice"));
    if (logoInputRef.current) logoInputRef.current.value = "";
  }, []);

  const downloadPdf = async () => {
    // Always free — no login required.
    setBusy("download");
    setStatus(null);
    try {
      const pdfDoc = asInvoice(doc);
      const blob = await pdf(
        <InvoicePdfDocument
          doc={pdfDoc}
          showBranding={!canRemoveBranding(plan)}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${pdfDoc.number || "1"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      resetForm();
      setStatus("PDF downloaded — form cleared for the next invoice");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setBusy(null);
    }
  };

  const saveDocument = async (markSent = false): Promise<InvoiceDocument> => {
    const payload: InvoiceDocument = {
      ...asInvoice(doc),
      status: markSent ? "sent" : doc.status,
      sent_at: markSent ? new Date().toISOString() : doc.sent_at,
    };

    if (!user) {
      const saved = upsertLocalHistory(payload);
      setDoc(saved);
      clearDraft();
      return saved;
    }

    const res = await fetch(
      payload.id ? `/api/documents/${payload.id}` : "/api/documents",
      {
        method: payload.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.code === "PLAN_LIMIT") {
        throw new Error(`${data.error} Open Pricing to upgrade.`);
      }
      throw new Error(data.error || "Failed to save document");
    }
    const saved = (await res.json()) as InvoiceDocument;
    setDoc(saved);
    clearDraft();
    return saved;
  };

  const handleSaveOnly = async () => {
    setBusy("save");
    setStatus(null);
    try {
      const saved = await saveDocument(false);
      setStatus(user ? "Saved to cloud" : "Saved on this device");
      if (saved.id && !doc.id) router.replace(`/d/${saved.id}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(null);
    }
  };

  const handleSend = async (payload: {
    to: string;
    subject: string;
    message: string;
  }) => {
    if (!user) {
      router.push(
        `/auth/sign-in?next=${encodeURIComponent(window.location.pathname)}`,
      );
      throw new Error("Sign in required to send");
    }
    if (!proSend) {
      router.push("/pricing");
      throw new Error("Email sending needs Pro — open Pricing to upgrade");
    }

    const saved = await saveDocument(false);
    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: saved.id,
        document: saved,
        ...payload,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (data.code === "PLAN_LIMIT") {
        router.push("/pricing");
      }
      throw new Error(data.error || "Failed to send");
    }
    setStatus(`Sent to ${payload.to} — form cleared for the next invoice`);
    resetForm();
  };

  const logoSrc = doc.logo_data_url || doc.logo_url;

  return (
    <div className={`page-shell flex min-h-screen flex-col text-[var(--foreground)] ${themeClass}`}>
      <AppHeader userEmail={user?.email} onSignOut={signOut} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-7">
        <section className="studio-hero animate-fade">
          <div className="studio-hero__glow" aria-hidden />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="page-kicker">Free PDF downloads</p>
              <h1 className="studio-brand">
                <span className="studio-brand__ink">Invoice</span>
                <span>Generator</span>
              </h1>
              <p className="page-lead">
                Build a sharp bill and download the PDF free — no login. Pro adds
                cloud sync and email send.
              </p>
              <div className="studio-actions">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("invoice-editor")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className="btn btn-ghost !px-4 !py-2.5"
                >
                  Edit invoice
                </button>
              </div>
            </div>
            {status ? (
              <p className="status-toast rounded-2xl bg-[var(--accent-ink)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
                {status}
              </p>
            ) : null}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
          <div className="invoice-stage">
            <div className="invoice-stage__ghost" aria-hidden />
            <section id="invoice-editor" className="invoice-sheet animate-rise">
            <div className="invoice-sheet__accent" />

            <div className="p-5 sm:p-9">
              {/* Header: from left / INVOICE + number right — never overlapping */}
              <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="space-y-3">
                  <label
                    className={`logo-drop group ${logoSrc ? "has-logo" : ""}`}
                  >
                    {logoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoSrc}
                        alt="Logo"
                        className="max-h-16 max-w-32 object-contain"
                      />
                    ) : (
                      <>
                        <span className="logo-drop__icon" aria-hidden>
                          +
                        </span>
                        <span>Add logo / image</span>
                      </>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleLogo(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {logoSrc ? (
                    <div className="logo-actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        Change logo
                      </button>
                      <button
                        type="button"
                        className="btn btn-remove-logo"
                        onClick={() => handleLogo(null)}
                      >
                        Remove logo
                      </button>
                    </div>
                  ) : null}
                  <div>
                    <span className="invoice-label">From</span>
                    <textarea
                      value={doc.from_text}
                      onChange={(e) => patch({ from_text: e.target.value })}
                      placeholder="Who is this from?"
                      rows={4}
                      className="field max-w-md text-sm"
                    />
                  </div>
                </div>

                <div className="invoice-heading-block">
                  <h2 className="invoice-title">INVOICE</h2>
                  <div className="invoice-number-row flex items-center justify-end gap-2">
                    <span className="text-sm font-semibold text-[var(--muted)]">
                      #
                    </span>
                    <input
                      value={doc.number}
                      onChange={(e) => patch({ number: e.target.value })}
                      className="field !w-full !max-w-[200px] !py-2 text-right text-sm font-semibold"
                      placeholder="1"
                      aria-label="Invoice number"
                    />
                  </div>
                </div>
              </div>

              {/* Parties + meta */}
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <EditableLabel
                      value={doc.labels.to_title}
                      onChange={(v) => onLabelChange("to_title", v)}
                      className="invoice-label !mb-1 !w-auto !border-0"
                    />
                    <textarea
                      value={doc.to_text}
                      onChange={(e) => patch({ to_text: e.target.value })}
                      placeholder="Who is this to?"
                      rows={3}
                      className="field text-sm"
                    />
                  </div>
                  <div>
                    <EditableLabel
                      value={doc.labels.ship_to_title}
                      onChange={(v) => onLabelChange("ship_to_title", v)}
                      className="invoice-label !mb-1 !w-auto !border-0"
                    />
                    <textarea
                      value={doc.ship_to_text}
                      onChange={(e) => patch({ ship_to_text: e.target.value })}
                      placeholder="(optional)"
                      rows={3}
                      className="field text-sm"
                    />
                  </div>
                </div>

                <div className="invoice-meta space-y-3 text-sm">
                  {(
                    [
                      ["date_title", "date", "date"],
                      ["payment_terms_title", "payment_terms", "text"],
                      ["due_date_title", "due_date", "date"],
                      ["purchase_order_title", "po_number", "text"],
                    ] as const
                  ).map(([labelKey, field, inputType]) => (
                    <div
                      key={field}
                      className="grid grid-cols-[120px_1fr] items-center gap-2"
                    >
                      <EditableLabel
                        value={doc.labels[labelKey]}
                        onChange={(v) => onLabelChange(labelKey, v)}
                        className="invoice-label !mb-0"
                      />
                      <input
                        type={inputType}
                        value={doc[field]}
                        onChange={(e) => patch({ [field]: e.target.value })}
                        className="field !rounded-xl !py-2"
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <span className="invoice-label !mb-0">Currency</span>
                    <select
                      value={currency}
                      onChange={(e) => patch({ currency: e.target.value })}
                      className="field !rounded-xl !py-2"
                      aria-label="Invoice currency"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <LineItems
                items={doc.items}
                labels={doc.labels}
                currency={currency}
                onChange={(items) => patch({ items })}
                onLabelChange={onLabelChange}
              />

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <EditableLabel
                      value={doc.labels.notes_title}
                      onChange={(v) => onLabelChange("notes_title", v)}
                      className="invoice-label !mb-1 !w-auto !border-0"
                    />
                    <textarea
                      value={doc.notes}
                      onChange={(e) => patch({ notes: e.target.value })}
                      placeholder="Notes - any relevant information not already covered"
                      rows={3}
                      className="field text-sm"
                    />
                  </div>
                  <div>
                    <EditableLabel
                      value={doc.labels.terms_title}
                      onChange={(v) => onLabelChange("terms_title", v)}
                      className="invoice-label !mb-1 !w-auto !border-0"
                    />
                    <textarea
                      value={doc.terms}
                      onChange={(e) => patch({ terms: e.target.value })}
                      placeholder="Terms and conditions - late fees, payment methods, delivery schedule"
                      rows={3}
                      className="field text-sm"
                    />
                  </div>
                </div>
                <TotalsPanel
                  doc={doc}
                  onChange={patch}
                  onLabelChange={onLabelChange}
                />
              </div>
            </div>
          </section>
          </div>

          <aside className="action-rail animate-pop stagger lg:sticky lg:top-24 lg:self-start">
            <div className="balance-card">
              <p className="label">Balance Due · {currency}</p>
              <p
                className={`amount max-w-full break-words tabular-nums ${
                  balancePulse ? "is-updating" : ""
                }`}
              >
                {formatMoney(totals.balanceDue, currency)}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-white/55">
                {user
                  ? `Plan: ${plan.toUpperCase()} — cloud sync ${proSend ? "+ email" : "(upgrade for email)"}.`
                  : "Guest mode: free PDF + local drafts. No login needed."}
              </p>
            </div>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={busy === "download"}
              className="btn btn-primary w-full !py-3"
            >
              {busy === "download" ? (
                <>
                  <Spinner size={16} /> Preparing…
                </>
              ) : (
                "Download PDF · Free"
              )}
            </button>
            <button
              type="button"
              onClick={handleSaveOnly}
              disabled={busy === "save"}
              className="btn btn-secondary w-full"
            >
              {busy === "save" ? (
                <>
                  <Spinner size={16} /> Saving…
                </>
              ) : (
                "Save Draft"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  router.push("/auth/sign-in?next=/");
                  return;
                }
                if (!proSend) {
                  router.push("/pricing");
                  setStatus("Email send is Pro — open Pricing to upgrade");
                  return;
                }
                if (!doc.from_text.trim() || !doc.to_text.trim()) {
                  setStatus("Fill in From and Bill To before sending");
                  return;
                }
                setSendOpen(true);
              }}
              className="btn btn-ghost w-full"
            >
              {proSend ? "Save & Send" : "Save & Send · Pro"}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="btn btn-ghost w-full text-[var(--muted)]"
            >
              Currency · {currency}
            </button>
            <a
              href="/pricing"
              className="text-center text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
            >
              View plans
            </a>
          </aside>
        </div>
      </main>

      <InvoiceSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currency={currency}
        onCurrencyChange={(next) => patch({ currency: next })}
      />

      <SaveSendModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSend={handleSend}
      />

      <AppFooter />
    </div>
  );
}
