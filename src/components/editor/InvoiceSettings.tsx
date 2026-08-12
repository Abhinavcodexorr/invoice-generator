"use client";

import { CURRENCIES, getCurrencySymbol, normalizeCurrency } from "@/lib/currencies";

interface InvoiceSettingsProps {
  open: boolean;
  onClose: () => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export function InvoiceSettings({
  open,
  onClose,
  currency,
  onCurrencyChange,
}: InvoiceSettingsProps) {
  if (!open) return null;

  const code = normalizeCurrency(currency);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="panel animate-pop w-full max-w-md p-5 shadow-[var(--shadow-lift)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="currency-settings-title"
      >
        <p
          id="currency-settings-title"
          className="font-display text-lg font-bold tracking-tight"
        >
          Currency
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Choose the currency for amounts on this invoice and PDF.
        </p>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Invoice currency</span>
          <select
            autoFocus
            value={code}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="field"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol}) — {c.name}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-3 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]">
          Selected: {code} ({getCurrencySymbol(code)})
        </p>

        <button type="button" onClick={onClose} className="btn btn-primary mt-4 w-full">
          Done
        </button>
      </div>
    </div>
  );
}
