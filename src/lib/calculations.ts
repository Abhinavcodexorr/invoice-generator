import type { ChargeMode, InvoiceDocument, LineItem, Totals } from "./types";

export function lineAmount(item: LineItem): number {
  const qty = Number.isFinite(item.quantity) ? item.quantity : 0;
  const rate = Number.isFinite(item.unit_cost) ? item.unit_cost : 0;
  return roundMoney(qty * rate);
}

export function computeCharge(
  base: number,
  mode: ChargeMode,
  value: number,
): number {
  if (mode === "off" || !Number.isFinite(value) || value <= 0) return 0;
  if (mode === "percent") return roundMoney((base * value) / 100);
  return roundMoney(value);
}

export function calculateTotals(doc: InvoiceDocument): Totals {
  const subtotal = roundMoney(
    doc.items.reduce((sum, item) => sum + lineAmount(item), 0),
  );
  const discount = computeCharge(
    subtotal,
    doc.discount_mode,
    doc.discount_value,
  );
  const afterDiscount = roundMoney(Math.max(0, subtotal - discount));
  const tax = computeCharge(afterDiscount, doc.tax_mode, doc.tax_value);
  const shipping = computeCharge(
    afterDiscount,
    doc.shipping_mode === "percent" ? "flat" : doc.shipping_mode,
    doc.shipping_value,
  );
  const total = roundMoney(afterDiscount + tax + shipping);
  const amountPaid = roundMoney(
    Number.isFinite(doc.amount_paid) ? Math.max(0, doc.amount_paid) : 0,
  );
  const balanceDue = roundMoney(Math.max(0, total - amountPaid));

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total,
    amountPaid,
    balanceDue,
  };
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
