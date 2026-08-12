"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { calculateTotals, lineAmount } from "@/lib/calculations";
import { formatMoneyPdf, normalizeCurrency } from "@/lib/currencies";
import type { InvoiceDocument } from "@/lib/types";

Font.registerHyphenationCallback((word) => [word]);

const ink = "#0A0A0A";
const muted = "#6B6B6B";
const line = "#E5E5E5";
const soft = "#F7F7F7";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: ink,
    backgroundColor: "#FFFFFF",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 36,
  },
  leftCol: { width: "55%", paddingRight: 24 },
  rightCol: { width: "42%", alignItems: "flex-end" },
  logo: {
    width: 120,
    maxHeight: 56,
    objectFit: "contain",
    marginBottom: 14,
  },
  fromText: {
    fontSize: 10,
    color: "#334155",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: ink,
    letterSpacing: 2,
    textAlign: "right",
    marginBottom: 16,
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  hash: {
    fontSize: 12,
    color: muted,
  },
  number: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: ink,
  },
  midRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  billCol: { width: "48%" },
  metaCol: { width: "46%" },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: muted,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  body: {
    fontSize: 10,
    color: ink,
    lineHeight: 1.5,
  },
  metaBox: {
    borderWidth: 1,
    borderColor: line,
    backgroundColor: soft,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaLabel: { fontSize: 9, color: muted, width: "45%" },
  metaValue: { fontSize: 9, color: ink, width: "55%", textAlign: "right" },
  tableHead: {
    flexDirection: "row",
    backgroundColor: ink,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  th: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: line,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  trAlt: { backgroundColor: soft },
  colItem: { width: "48%" },
  colQty: { width: "14%", textAlign: "right" },
  colRate: { width: "19%", textAlign: "right" },
  colAmt: { width: "19%", textAlign: "right" },
  itemName: { fontSize: 10, color: ink },
  itemDesc: { fontSize: 8, color: muted, marginTop: 3 },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },
  notesWrap: { width: "48%", paddingRight: 12 },
  totalsWrap: { width: "44%" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalLabel: { fontSize: 10, color: muted },
  totalValue: { fontSize: 10, color: ink },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: line,
    marginTop: 4,
    paddingTop: 8,
    marginBottom: 6,
  },
  balanceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: ink,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  balanceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  noteBlock: { marginBottom: 14 },
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 28,
    borderTopWidth: 1,
    borderTopColor: line,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: "#94A3B8" },
});

export function InvoicePdfDocument({
  doc,
  showBranding = false,
}: {
  doc: InvoiceDocument;
  showBranding?: boolean;
}) {
  const totals = calculateTotals(doc);
  const currency = normalizeCurrency(doc.currency);
  const money = (n: number) => formatMoneyPdf(n, currency);
  const logo = doc.logo_data_url || doc.logo_url;

  return (
    <Document title={`Invoice ${doc.number || "1"}`} author="Invoice Generator">
      <Page size="A4" style={styles.page}>
        <View style={styles.topRow}>
          <View style={styles.leftCol}>
            {logo ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logo} style={styles.logo} />
            ) : null}
            <Text style={styles.fromText}>{doc.from_text || " "}</Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={styles.title}>INVOICE</Text>
            <View style={styles.numberRow}>
              <Text style={styles.hash}>#</Text>
              <Text style={styles.number}>{doc.number || "1"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.midRow}>
          <View style={styles.billCol}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.body}>{doc.to_text || " "}</Text>
            {doc.ship_to_text ? (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.sectionLabel}>Ship To</Text>
                <Text style={styles.body}>{doc.ship_to_text}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaCol}>
            <View style={styles.metaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{doc.date || "—"}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Currency</Text>
                <Text style={styles.metaValue}>{currency}</Text>
              </View>
              {doc.payment_terms ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Payment Terms</Text>
                  <Text style={styles.metaValue}>{doc.payment_terms}</Text>
                </View>
              ) : null}
              {doc.due_date ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Due Date</Text>
                  <Text style={styles.metaValue}>{doc.due_date}</Text>
                </View>
              ) : null}
              {doc.po_number ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>PO Number</Text>
                  <Text style={styles.metaValue}>{doc.po_number}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.colItem]}>Item</Text>
          <Text style={[styles.th, styles.colQty]}>Qty</Text>
          <Text style={[styles.th, styles.colRate]}>Rate</Text>
          <Text style={[styles.th, styles.colAmt]}>Amount</Text>
        </View>

        {doc.items.map((item, index) => (
          <View
            key={item.id}
            style={[styles.tr, index % 2 === 1 ? styles.trAlt : {}]}
            wrap={false}
          >
            <View style={styles.colItem}>
              <Text style={styles.itemName}>{item.name || " "}</Text>
              {item.description ? (
                <Text style={styles.itemDesc}>{item.description}</Text>
              ) : null}
            </View>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colRate}>{money(item.unit_cost)}</Text>
            <Text style={styles.colAmt}>{money(lineAmount(item))}</Text>
          </View>
        ))}

        <View style={styles.bottom}>
          <View style={styles.notesWrap}>
            {doc.notes ? (
              <View style={styles.noteBlock}>
                <Text style={styles.sectionLabel}>Notes</Text>
                <Text style={styles.body}>{doc.notes}</Text>
              </View>
            ) : null}
            {doc.terms ? (
              <View style={styles.noteBlock}>
                <Text style={styles.sectionLabel}>Terms</Text>
                <Text style={styles.body}>{doc.terms}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{money(totals.subtotal)}</Text>
            </View>
            {doc.discount_mode !== "off" ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Discount
                  {doc.discount_mode === "percent"
                    ? ` (${doc.discount_value}%)`
                    : ""}
                </Text>
                <Text style={styles.totalValue}>-{money(totals.discount)}</Text>
              </View>
            ) : null}
            {doc.tax_mode !== "off" ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Tax
                  {doc.tax_mode === "percent" ? ` (${doc.tax_value}%)` : ""}
                </Text>
                <Text style={styles.totalValue}>{money(totals.tax)}</Text>
              </View>
            ) : null}
            {doc.shipping_mode !== "off" ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalValue}>{money(totals.shipping)}</Text>
              </View>
            ) : null}
            <View style={styles.totalLine}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>
                Total
              </Text>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>
                {money(totals.total)}
              </Text>
            </View>
            {totals.amountPaid > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Amount Paid</Text>
                <Text style={styles.totalValue}>{money(totals.amountPaid)}</Text>
              </View>
            ) : null}
            <View style={styles.balanceBox}>
              <Text style={styles.balanceText}>Balance Due</Text>
              <Text style={styles.balanceText}>{money(totals.balanceDue)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {showBranding
              ? "Made with Invoice Generator — invoicegenerator.app"
              : "Thank you for your business"}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
