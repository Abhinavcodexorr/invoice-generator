import type { InvoiceDocDocument } from "@/lib/models/InvoiceDoc";
import { defaultLabels } from "@/lib/defaults";
import type { DocumentLabels, InvoiceDocument, LineItem } from "@/lib/types";

function str(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  return String(value);
}

export function toInvoiceDocument(doc: InvoiceDocDocument): InvoiceDocument {
  const type = (doc.type as InvoiceDocument["type"]) || "invoice";
  const defaults = defaultLabels(type);
  const raw = (doc.labels || {}) as Partial<Record<keyof DocumentLabels, string | null>>;

  const labels = { ...defaults } as DocumentLabels;
  (Object.keys(defaults) as (keyof DocumentLabels)[]).forEach((key) => {
    labels[key] = str(raw[key], defaults[key]);
  });
  if (type === "invoice") labels.header = "INVOICE";

  const items: LineItem[] = (doc.items || []).map((item) => ({
    id: str(item.id, crypto.randomUUID()),
    name: str(item.name),
    quantity: Number(item.quantity || 0),
    unit_cost: Number(item.unit_cost || 0),
    description: str(item.description),
  }));

  return {
    id: String(doc._id),
    user_id: String(doc.userId),
    type,
    number: str(doc.number, "1"),
    currency: str(doc.currency, "USD"),
    theme: (doc.theme as InvoiceDocument["theme"]) || "classic",
    status: (doc.status as InvoiceDocument["status"]) || "draft",
    from_text: str(doc.from_text),
    to_text: str(doc.to_text),
    ship_to_text: str(doc.ship_to_text),
    date: str(doc.date),
    due_date: str(doc.due_date),
    payment_terms: str(doc.payment_terms),
    po_number: str(doc.po_number),
    labels,
    items,
    tax_mode: (doc.tax_mode as InvoiceDocument["tax_mode"]) || "percent",
    tax_value: Number(doc.tax_value || 0),
    discount_mode: (doc.discount_mode as InvoiceDocument["discount_mode"]) || "off",
    discount_value: Number(doc.discount_value || 0),
    shipping_mode: (doc.shipping_mode as InvoiceDocument["shipping_mode"]) || "off",
    shipping_value: Number(doc.shipping_value || 0),
    amount_paid: Number(doc.amount_paid || 0),
    notes: str(doc.notes),
    terms: str(doc.terms),
    logo_url: doc.logo_url ? String(doc.logo_url) : null,
    created_at: doc.createdAt?.toISOString(),
    updated_at: doc.updatedAt?.toISOString(),
    sent_at: doc.sent_at ? new Date(doc.sent_at).toISOString() : null,
  };
}

export function fromInvoicePayload(body: InvoiceDocument) {
  return {
    type: body.type,
    number: body.number,
    currency: body.currency,
    theme: body.theme,
    status: body.status,
    from_text: body.from_text,
    to_text: body.to_text,
    ship_to_text: body.ship_to_text,
    date: body.date,
    due_date: body.due_date,
    payment_terms: body.payment_terms,
    po_number: body.po_number,
    labels: {
      ...body.labels,
      header: body.type === "invoice" ? "INVOICE" : body.labels?.header,
    },
    items: body.items,
    tax_mode: body.tax_mode,
    tax_value: body.tax_value,
    discount_mode: body.discount_mode,
    discount_value: body.discount_value,
    shipping_mode: body.shipping_mode,
    shipping_value: body.shipping_value,
    amount_paid: body.amount_paid,
    notes: body.notes,
    terms: body.terms,
    logo_url: body.logo_url,
    sent_at: body.sent_at ? new Date(body.sent_at) : null,
  };
}
