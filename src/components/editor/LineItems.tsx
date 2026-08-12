"use client";

import { lineAmount } from "@/lib/calculations";
import { formatMoney } from "@/lib/currencies";
import { createEmptyLineItem } from "@/lib/defaults";
import type { DocumentLabels, LineItem } from "@/lib/types";
import { EditableLabel } from "./EditableLabel";

interface LineItemsProps {
  items: LineItem[];
  labels: DocumentLabels;
  currency: string;
  onChange: (items: LineItem[]) => void;
  onLabelChange: (key: keyof DocumentLabels, value: string) => void;
}

export function LineItems({
  items,
  labels,
  currency,
  onChange,
  onLabelChange,
}: LineItemsProps) {
  const updateItem = (id: string, patch: Partial<LineItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      onChange([createEmptyLineItem()]);
      return;
    }
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="mt-8 overflow-x-auto">
      <div className="min-w-[560px]">
        <div className="line-table-head grid grid-cols-[1fr_88px_110px_110px_36px] gap-2 rounded-t-2xl px-3 py-3 text-sm text-white">
          <EditableLabel
            value={labels.item_header}
            onChange={(v) => onLabelChange("item_header", v)}
            className="text-white/90 hover:border-white/40 focus:border-white"
          />
          <EditableLabel
            value={labels.quantity_header}
            onChange={(v) => onLabelChange("quantity_header", v)}
            className="text-right text-white/90 hover:border-white/40 focus:border-white"
          />
          <EditableLabel
            value={labels.unit_cost_header}
            onChange={(v) => onLabelChange("unit_cost_header", v)}
            className="text-right text-white/90 hover:border-white/40 focus:border-white"
          />
          <EditableLabel
            value={labels.amount_header}
            onChange={(v) => onLabelChange("amount_header", v)}
            className="text-right text-white/90 hover:border-white/40 focus:border-white"
          />
          <span />
        </div>

        <div className="divide-y divide-[var(--border)] rounded-b-2xl border border-t-0 border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_65%,transparent)]">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_88px_110px_110px_36px] items-start gap-2 px-3 py-3 transition-colors hover:bg-[var(--accent-soft)]"
            >
              <div>
                <input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder="Description of item/service..."
                  className="w-full rounded-lg border border-transparent bg-transparent px-1 py-1 focus:border-[var(--accent)] focus:outline-none"
                />
                <input
                  value={item.description ?? ""}
                  onChange={(e) =>
                    updateItem(item.id, { description: e.target.value })
                  }
                  placeholder="Additional details (optional)"
                  className="mt-1 w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xs text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <input
                type="number"
                min={0}
                step="any"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(item.id, { quantity: Number(e.target.value) })
                }
                className="field no-spinner !rounded-xl !px-2 !py-1.5 text-right"
              />
              <input
                type="number"
                min={0}
                step="any"
                value={item.unit_cost}
                onChange={(e) =>
                  updateItem(item.id, { unit_cost: Number(e.target.value) })
                }
                className="field no-spinner !rounded-xl !px-2 !py-1.5 text-right"
              />
              <div className="px-1 py-1 text-right font-semibold tabular-nums">
                {formatMoney(lineAmount(item), currency)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="mt-1 text-lg leading-none text-[var(--muted)] transition-colors hover:text-red-600"
                aria-label="Remove line item"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange([...items, createEmptyLineItem()])}
        className="mt-4 inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-soft)]"
      >
        + Line Item
      </button>
    </div>
  );
}
