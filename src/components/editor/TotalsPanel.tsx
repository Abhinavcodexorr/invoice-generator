"use client";

import { calculateTotals } from "@/lib/calculations";
import {
  formatMoney,
  getCurrencySymbol,
  normalizeCurrency,
} from "@/lib/currencies";
import type { ChargeMode, DocumentLabels, InvoiceDocument } from "@/lib/types";
import { EditableLabel } from "./EditableLabel";

interface TotalsPanelProps {
  doc: InvoiceDocument;
  onChange: (patch: Partial<InvoiceDocument>) => void;
  onLabelChange: (key: keyof DocumentLabels, value: string) => void;
}

function ModeToggle({
  mode,
  onChange,
  allowPercent = true,
  flatSymbol = "$",
}: {
  mode: ChargeMode;
  onChange: (mode: ChargeMode) => void;
  allowPercent?: boolean;
  flatSymbol?: string;
}) {
  return (
    <button
      type="button"
      title="Toggle percent / flat / off"
      onClick={() => {
        if (mode === "percent") onChange("flat");
        else if (mode === "flat") onChange("off");
        else onChange(allowPercent ? "percent" : "flat");
      }}
      className="ml-1 rounded-lg border border-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      {mode === "percent" ? "%" : mode === "flat" ? flatSymbol : "off"}
    </button>
  );
}

export function TotalsPanel({ doc, onChange, onLabelChange }: TotalsPanelProps) {
  const totals = calculateTotals(doc);
  const currency = normalizeCurrency(doc.currency);
  const money = (n: number) => formatMoney(n, currency);
  const flatSymbol = getCurrencySymbol(currency);

  return (
    <div className="mt-2 ml-auto w-full max-w-sm space-y-3 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_85%,transparent)] p-5 text-sm shadow-[0_12px_30px_rgba(11,22,35,0.05)]">
      <div className="flex items-center justify-between">
        <EditableLabel
          value={doc.labels.subtotal_title}
          onChange={(v) => onLabelChange("subtotal_title", v)}
        />
        <span className="tabular-nums">{money(totals.subtotal)}</span>
      </div>

      {doc.discount_mode === "off" ? (
        <button
          type="button"
          onClick={() => onChange({ discount_mode: "percent", discount_value: 0 })}
          className="text-[var(--accent)] hover:underline"
        >
          + {doc.labels.discounts_title}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            <EditableLabel
              value={doc.labels.discounts_title}
              onChange={(v) => onLabelChange("discounts_title", v)}
            />
            <ModeToggle
              mode={doc.discount_mode}
              flatSymbol={flatSymbol}
              onChange={(discount_mode) => onChange({ discount_mode })}
            />
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              step="any"
              value={doc.discount_value}
              onChange={(e) =>
                onChange({ discount_value: Number(e.target.value) })
              }
              className="field !w-20 !rounded-lg !px-2 !py-1 text-right"
            />
            <button
              type="button"
              onClick={() => onChange({ discount_mode: "off", discount_value: 0 })}
              className="text-[var(--muted)] hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {doc.tax_mode === "off" ? (
        <button
          type="button"
          onClick={() => onChange({ tax_mode: "percent", tax_value: 0 })}
          className="block font-semibold text-[var(--accent)] hover:underline"
        >
          + {doc.labels.tax_title}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            <EditableLabel
              value={doc.labels.tax_title}
              onChange={(v) => onLabelChange("tax_title", v)}
            />
            <ModeToggle
              mode={doc.tax_mode}
              flatSymbol={flatSymbol}
              onChange={(tax_mode) => onChange({ tax_mode })}
            />
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              step="any"
              value={doc.tax_value}
              onChange={(e) => onChange({ tax_value: Number(e.target.value) })}
              className="field !w-20 !rounded-lg !px-2 !py-1 text-right"
            />
            <button
              type="button"
              onClick={() => onChange({ tax_mode: "off", tax_value: 0 })}
              className="text-[var(--muted)] hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {doc.shipping_mode === "off" ? (
        <button
          type="button"
          onClick={() => onChange({ shipping_mode: "flat", shipping_value: 0 })}
          className="block font-semibold text-[var(--accent)] hover:underline"
        >
          + {doc.labels.shipping_title}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            <EditableLabel
              value={doc.labels.shipping_title}
              onChange={(v) => onLabelChange("shipping_title", v)}
            />
            <ModeToggle
              mode={doc.shipping_mode}
              allowPercent={false}
              flatSymbol={flatSymbol}
              onChange={(shipping_mode) => onChange({ shipping_mode })}
            />
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              step="any"
              value={doc.shipping_value}
              onChange={(e) =>
                onChange({ shipping_value: Number(e.target.value) })
              }
              className="field !w-20 !rounded-lg !px-2 !py-1 text-right"
            />
            <button
              type="button"
              onClick={() =>
                onChange({ shipping_mode: "off", shipping_value: 0 })
              }
              className="text-[var(--muted)] hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 font-semibold">
        <EditableLabel
          value={doc.labels.total_title}
          onChange={(v) => onLabelChange("total_title", v)}
          className="font-semibold text-[var(--foreground)]"
        />
        <span className="tabular-nums">{money(totals.total)}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <EditableLabel
          value={doc.labels.amount_paid_title}
          onChange={(v) => onLabelChange("amount_paid_title", v)}
        />
        <input
          type="number"
          min={0}
          step="any"
          value={doc.amount_paid}
          onChange={(e) => onChange({ amount_paid: Number(e.target.value) })}
          className="field !w-28 !rounded-lg !px-2 !py-1 text-right"
        />
      </div>

      <div className="flex items-center justify-between border-t-2 border-[var(--accent)] pt-3 text-base font-bold">
        <EditableLabel
          value={doc.labels.balance_title}
          onChange={(v) => onLabelChange("balance_title", v)}
          className="font-bold text-[var(--foreground)]"
        />
        <span className="tabular-nums text-[var(--accent)]">
          {money(totals.balanceDue)}
        </span>
      </div>
    </div>
  );
}
