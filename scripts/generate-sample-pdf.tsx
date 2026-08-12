import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "../src/components/pdf/InvoicePdfDocument";
import { createEmptyDocument, createEmptyLineItem } from "../src/lib/defaults";

async function main() {
  const logoPath = join(process.cwd(), "public", "logo.png");
  const logoBytes = readFileSync(logoPath);
  const isJpeg = logoBytes[0] === 0xff && logoBytes[1] === 0xd8;
  const mime = isJpeg ? "image/jpeg" : "image/png";
  const logoDataUrl = `data:${mime};base64,${logoBytes.toString("base64")}`;

  const doc = createEmptyDocument("invoice");
  doc.number = "1042";
  doc.currency = "USD";
  doc.logo_data_url = logoDataUrl;
  doc.from_text =
    "Acme Studio\n123 Market Street\nSan Francisco, CA 94103\nhello@acme.studio";
  doc.to_text = "Globex Corp\n500 Innovation Way\nAustin, TX 78701";
  doc.ship_to_text = "Globex Warehouse\n88 Dock Road\nAustin, TX 78702";
  doc.date = "2026-08-12";
  doc.due_date = "2026-08-26";
  doc.payment_terms = "Net 14";
  doc.po_number = "PO-7781";
  doc.notes = "Thanks for your business — payment details are in the terms.";
  doc.terms = "Please pay within 14 days. Late fees may apply after the due date.";
  doc.tax_mode = "percent";
  doc.tax_value = 8.5;

  const item1 = createEmptyLineItem();
  item1.name = "Website redesign";
  item1.description = "Brand system and marketing site";
  item1.quantity = 1;
  item1.unit_cost = 2400;

  const item2 = createEmptyLineItem();
  item2.name = "Hosting setup";
  item2.description = "Staging + production environments";
  item2.quantity = 3;
  item2.unit_cost = 75;

  doc.items = [item1, item2];

  const blob = await pdf(
    <InvoicePdfDocument doc={doc} showBranding />,
  ).toBlob();
  const buffer = Buffer.from(await blob.arrayBuffer());

  const outDir = join(process.cwd(), "public", "samples");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "preview-invoice.pdf");
  writeFileSync(outPath, buffer);
  console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
