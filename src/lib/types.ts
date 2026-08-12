export type DocumentType =
  | "invoice"
  | "quote"
  | "estimate"
  | "receipt"
  | "credit_note"
  | "purchase_order"
  | "proforma";

export type ChargeMode = "percent" | "flat" | "off";
export type ThemeName = "classic" | "slate";
export type DocumentStatus = "draft" | "sent";

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  description?: string;
}

export interface DocumentLabels {
  header: string;
  to_title: string;
  ship_to_title: string;
  invoice_number_title: string;
  date_title: string;
  payment_terms_title: string;
  due_date_title: string;
  purchase_order_title: string;
  item_header: string;
  quantity_header: string;
  unit_cost_header: string;
  amount_header: string;
  subtotal_title: string;
  discounts_title: string;
  tax_title: string;
  shipping_title: string;
  total_title: string;
  amount_paid_title: string;
  balance_title: string;
  notes_title: string;
  terms_title: string;
}

export interface InvoiceDocument {
  id?: string;
  user_id?: string | null;
  type: DocumentType;
  number: string;
  currency: string;
  theme: ThemeName;
  status: DocumentStatus;
  from_text: string;
  to_text: string;
  ship_to_text: string;
  date: string;
  due_date: string;
  payment_terms: string;
  po_number: string;
  labels: DocumentLabels;
  items: LineItem[];
  tax_mode: ChargeMode;
  tax_value: number;
  discount_mode: ChargeMode;
  discount_value: number;
  shipping_mode: ChargeMode;
  shipping_value: number;
  amount_paid: number;
  notes: string;
  terms: string;
  logo_url: string | null;
  logo_data_url?: string | null;
  created_at?: string;
  updated_at?: string;
  sent_at?: string | null;
}

export interface Profile {
  id: string;
  email: string | null;
  business_name: string | null;
  business_address: string | null;
  logo_url: string | null;
  default_currency: string;
  theme: ThemeName;
  created_at?: string;
}

export interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
}

export const DOCUMENT_TYPE_META: Record<
  DocumentType,
  { label: string; header: string; path: string }
> = {
  invoice: { label: "Invoice", header: "INVOICE", path: "/" },
  quote: { label: "Quote", header: "QUOTE", path: "/?type=quote" },
  estimate: { label: "Estimate", header: "ESTIMATE", path: "/?type=estimate" },
  receipt: { label: "Receipt", header: "RECEIPT", path: "/?type=receipt" },
  credit_note: {
    label: "Credit Note",
    header: "CREDIT NOTE",
    path: "/?type=credit_note",
  },
  purchase_order: {
    label: "Purchase Order",
    header: "PURCHASE ORDER",
    path: "/?type=purchase_order",
  },
  proforma: {
    label: "Proforma Invoice",
    header: "PROFORMA INVOICE",
    path: "/?type=proforma",
  },
};
