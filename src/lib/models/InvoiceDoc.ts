import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const LineItemSchema = new Schema(
  {
    id: String,
    name: String,
    quantity: Number,
    unit_cost: Number,
    description: String,
  },
  { _id: false },
);

const LabelsSchema = new Schema(
  {
    header: String,
    to_title: String,
    ship_to_title: String,
    invoice_number_title: String,
    date_title: String,
    payment_terms_title: String,
    due_date_title: String,
    purchase_order_title: String,
    item_header: String,
    quantity_header: String,
    unit_cost_header: String,
    amount_header: String,
    subtotal_title: String,
    discounts_title: String,
    tax_title: String,
    shipping_title: String,
    total_title: String,
    amount_paid_title: String,
    balance_title: String,
    notes_title: String,
    terms_title: String,
  },
  { _id: false },
);

const InvoiceDocSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, default: "invoice" },
    number: { type: String, default: "1" },
    currency: { type: String, default: "USD" },
    theme: { type: String, default: "classic" },
    status: { type: String, default: "draft" },
    from_text: { type: String, default: "" },
    to_text: { type: String, default: "" },
    ship_to_text: { type: String, default: "" },
    date: { type: String, default: "" },
    due_date: { type: String, default: "" },
    payment_terms: { type: String, default: "" },
    po_number: { type: String, default: "" },
    labels: { type: LabelsSchema, default: () => ({}) },
    items: { type: [LineItemSchema], default: [] },
    tax_mode: { type: String, default: "percent" },
    tax_value: { type: Number, default: 0 },
    discount_mode: { type: String, default: "off" },
    discount_value: { type: Number, default: 0 },
    shipping_mode: { type: String, default: "off" },
    shipping_value: { type: Number, default: 0 },
    amount_paid: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    terms: { type: String, default: "" },
    logo_url: { type: String, default: null },
    sent_at: { type: Date, default: null },
  },
  { timestamps: true },
);

export type InvoiceDocDocument = InferSchemaType<typeof InvoiceDocSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const InvoiceDoc: Model<InvoiceDocDocument> =
  mongoose.models.InvoiceDoc ||
  mongoose.model<InvoiceDocDocument>("InvoiceDoc", InvoiceDocSchema);
