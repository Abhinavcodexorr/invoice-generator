import { nanoid } from "nanoid";
import { DOCUMENT_TYPE_META, type DocumentLabels, type DocumentType, type InvoiceDocument } from "./types";

export function defaultLabels(type: DocumentType = "invoice"): DocumentLabels {
  return {
    header: DOCUMENT_TYPE_META[type].header,
    to_title: "Bill To",
    ship_to_title: "Ship To",
    invoice_number_title: "#",
    date_title: "Date",
    payment_terms_title: "Payment Terms",
    due_date_title: "Due Date",
    purchase_order_title: "PO Number",
    item_header: "Item",
    quantity_header: "Quantity",
    unit_cost_header: "Rate",
    amount_header: "Amount",
    subtotal_title: "Subtotal",
    discounts_title: "Discount",
    tax_title: "Tax",
    shipping_title: "Shipping",
    total_title: "Total",
    amount_paid_title: "Amount Paid",
    balance_title: "Balance Due",
    notes_title: "Notes",
    terms_title: "Terms",
  };
}

export function createEmptyLineItem() {
  return {
    id: nanoid(8),
    name: "",
    quantity: 1,
    unit_cost: 0,
    description: "",
  };
}

export function createEmptyDocument(
  type: DocumentType = "invoice",
): InvoiceDocument {
  const today = new Date().toISOString().slice(0, 10);
  return {
    type,
    number: "1",
    currency: "USD",
    theme: "classic",
    status: "draft",
    from_text: "",
    to_text: "",
    ship_to_text: "",
    date: today,
    due_date: "",
    payment_terms: "",
    po_number: "",
    labels: defaultLabels(type),
    items: [createEmptyLineItem()],
    tax_mode: "percent",
    tax_value: 0,
    discount_mode: "off",
    discount_value: 0,
    shipping_mode: "off",
    shipping_value: 0,
    amount_paid: 0,
    notes: "",
    terms: "",
    logo_url: null,
    logo_data_url: null,
  };
}

export function isDocumentType(value: string | null | undefined): value is DocumentType {
  return (
    value === "invoice" ||
    value === "quote" ||
    value === "estimate" ||
    value === "receipt" ||
    value === "credit_note" ||
    value === "purchase_order" ||
    value === "proforma"
  );
}
