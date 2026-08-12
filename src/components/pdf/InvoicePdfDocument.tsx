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

/** Classic invoice-generator.com palette */
const ink = "#333333";
const titleGray = "#777777";
const muted = "#888888";
const line = "#DDDDDD";
const headerBg = "#333333";

function formatPdfDate(value: string): string {
  if (!value) return "";
  // Keep human-entered values; pretty-print ISO YYYY-MM-DD.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return value;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 52,
    paddingLeft: 40,
    paddingRight: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: ink,
    backgroundColor: "#FFFFFF",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  leftCol: {
    width: "52%",
    paddingRight: 16,
    alignItems: "flex-start",
  },
  rightCol: { width: "45%", alignItems: "flex-end" },
  logo: {
    width: 72,
    height: 72,
    objectFit: "cover",
    alignSelf: "flex-start",
    marginLeft: 0,
    marginBottom: 12,
  },
  fromText: {
    fontSize: 10,
    color: ink,
    lineHeight: 1.45,
  },
  title: {
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    color: titleGray,
    letterSpacing: 0.5,
    textAlign: "right",
    marginBottom: 8,
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  hash: {
    fontSize: 12,
    color: muted,
    marginRight: 6,
  },
  number: {
    fontSize: 12,
    color: ink,
  },
  midRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
    alignItems: "flex-start",
  },
  parties: {
    flexDirection: "row",
    width: "58%",
  },
  partyCol: { width: "48%", paddingRight: 14 },
  metaCol: { width: "38%" },
  sectionLabel: {
    fontSize: 9,
    color: muted,
    marginBottom: 5,
  },
  body: {
    fontSize: 10,
    color: ink,
    lineHeight: 1.45,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  metaLabel: {
    fontSize: 9,
    color: muted,
    width: "48%",
    textAlign: "right",
    paddingRight: 10,
  },
  metaValue: {
    fontSize: 10,
    color: ink,
    width: "52%",
    textAlign: "left",
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: headerBg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  th: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: line,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  colItem: { width: "50%" },
  colQty: { width: "16%", textAlign: "right" },
  colRate: { width: "17%", textAlign: "right" },
  colAmt: { width: "17%", textAlign: "right" },
  itemName: { fontSize: 10, color: ink },
  itemDesc: { fontSize: 8.5, color: muted, marginTop: 3, lineHeight: 1.35 },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  notesWrap: { width: "48%", paddingRight: 16 },
  totalsWrap: { width: "44%" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  totalLabel: { fontSize: 10, color: muted, textAlign: "right", width: "55%" },
  totalValue: { fontSize: 10, color: ink, textAlign: "right", width: "45%" },
  totalStrongRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
    marginTop: 2,
  },
  totalStrong: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: ink,
  },
  balanceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: headerBg,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 6,
    borderRadius: 2,
  },
  balanceText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  noteBlock: { marginBottom: 14 },
  footer: {
    position: "absolute",
    left: 40,
    right: 48,
    bottom: 26,
    borderTopWidth: 1,
    borderTopColor: line,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: muted },
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
  const labels = doc.labels;
  const hasShip = Boolean(doc.ship_to_text?.trim());

  const metaRows = [
    { label: labels.date_title, value: formatPdfDate(doc.date) },
    {
      label: labels.payment_terms_title,
      value: doc.payment_terms,
    },
    {
      label: labels.due_date_title,
      value: formatPdfDate(doc.due_date),
    },
    {
      label: labels.purchase_order_title,
      value: doc.po_number,
    },
  ].filter((row) => Boolean(row.value?.trim()));

  return (
    <Document title={`Invoice ${doc.number || "1"}`} author="Invoice Generator">
      <Page size="A4" style={styles.page}>
        {/* Header: logo / from  —  INVOICE / # */}
        <View style={styles.topRow}>
          <View style={styles.leftCol}>
            {logo ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logo} style={styles.logo} />
            ) : null}
            <Text style={styles.fromText}>{doc.from_text || " "}</Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={styles.title}>{labels.header || "INVOICE"}</Text>
            <View style={styles.numberRow}>
              <Text style={styles.hash}>
                {labels.invoice_number_title || "#"}
              </Text>
              <Text style={styles.number}>{doc.number || "1"}</Text>
            </View>
          </View>
        </View>

        {/* Bill To / Ship To + meta */}
        <View style={styles.midRow}>
          <View style={styles.parties}>
            <View style={[styles.partyCol, !hasShip ? { width: "100%" } : {}]}>
              <Text style={styles.sectionLabel}>{labels.to_title}</Text>
              <Text style={styles.body}>{doc.to_text || " "}</Text>
            </View>
            {hasShip ? (
              <View style={styles.partyCol}>
                <Text style={styles.sectionLabel}>{labels.ship_to_title}</Text>
                <Text style={styles.body}>{doc.ship_to_text}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaCol}>
            {metaRows.map((row) => (
              <View key={row.label} style={styles.metaRow}>
                <Text style={styles.metaLabel}>{row.label}</Text>
                <Text style={styles.metaValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Line items */}
        <View style={styles.tableHead}>
          <Text style={[styles.th, styles.colItem]}>{labels.item_header}</Text>
          <Text style={[styles.th, styles.colQty]}>
            {labels.quantity_header}
          </Text>
          <Text style={[styles.th, styles.colRate]}>
            {labels.unit_cost_header}
          </Text>
          <Text style={[styles.th, styles.colAmt]}>
            {labels.amount_header}
          </Text>
        </View>

        {doc.items.map((item) => (
          <View key={item.id} style={styles.tr} wrap={false}>
            <View style={styles.colItem}>
              <Text style={styles.itemName}>{item.name || " "}</Text>
              {item.description ? (
                <Text style={styles.itemDesc}>{item.description}</Text>
              ) : null}
            </View>
            <Text style={[styles.body, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.body, styles.colRate]}>
              {money(item.unit_cost)}
            </Text>
            <Text style={[styles.body, styles.colAmt]}>
              {money(lineAmount(item))}
            </Text>
          </View>
        ))}

        {/* Notes / Terms + totals */}
        <View style={styles.bottom}>
          <View style={styles.notesWrap}>
            {doc.notes ? (
              <View style={styles.noteBlock}>
                <Text style={styles.sectionLabel}>{labels.notes_title}</Text>
                <Text style={styles.body}>{doc.notes}</Text>
              </View>
            ) : null}
            {doc.terms ? (
              <View style={styles.noteBlock}>
                <Text style={styles.sectionLabel}>{labels.terms_title}</Text>
                <Text style={styles.body}>{doc.terms}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.totalsWrap}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{labels.subtotal_title}</Text>
              <Text style={styles.totalValue}>{money(totals.subtotal)}</Text>
            </View>
            {doc.discount_mode !== "off" ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {labels.discounts_title}
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
                  {labels.tax_title}
                  {doc.tax_mode === "percent" ? ` (${doc.tax_value}%)` : ""}
                </Text>
                <Text style={styles.totalValue}>{money(totals.tax)}</Text>
              </View>
            ) : null}
            {doc.shipping_mode !== "off" ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{labels.shipping_title}</Text>
                <Text style={styles.totalValue}>{money(totals.shipping)}</Text>
              </View>
            ) : null}
            <View style={styles.totalStrongRow}>
              <Text style={[styles.totalStrong, { width: "55%", textAlign: "right" }]}>
                {labels.total_title}
              </Text>
              <Text style={[styles.totalStrong, { width: "45%", textAlign: "right" }]}>
                {money(totals.total)}
              </Text>
            </View>
            {totals.amountPaid > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {labels.amount_paid_title}
                </Text>
                <Text style={styles.totalValue}>
                  {money(totals.amountPaid)}
                </Text>
              </View>
            ) : null}
            <View style={styles.balanceBox}>
              <Text style={styles.balanceText}>{labels.balance_title}</Text>
              <Text style={styles.balanceText}>{money(totals.balanceDue)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {showBranding
              ? "Made with Invoice Generator"
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
