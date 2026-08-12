import { pdf } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { InvoicePdfDocument } from "@/components/pdf/InvoicePdfDocument";
import { auth } from "@/lib/auth";
import { assertCanSendEmail, recordEmailSent } from "@/lib/billing";
import { canRemoveBranding } from "@/lib/plans";
import { connectMongo } from "@/lib/mongodb";
import { InvoiceDoc } from "@/lib/models/InvoiceDoc";
import { fromInvoicePayload, toInvoiceDocument } from "@/lib/mongo-map";
import type { InvoiceDocument } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Sign in required to send" },
        { status: 401 },
      );
    }

    const sendGate = await assertCanSendEmail(session.user.id);
    if (!sendGate.ok) {
      return NextResponse.json(
        { error: sendGate.error, code: "PLAN_LIMIT", plan: sendGate.plan },
        { status: 402 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      return NextResponse.json(
        {
          error:
            "Email is not configured. Set RESEND_API_KEY and EMAIL_FROM in .env.local",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      to: string;
      subject: string;
      message: string;
      documentId?: string;
      document: InvoiceDocument;
    };

    if (!body.to || !body.document) {
      return NextResponse.json(
        { error: "Missing recipient or document" },
        { status: 400 },
      );
    }

    await connectMongo();
    const payload = {
      ...fromInvoicePayload({
        ...body.document,
        status: "sent",
        sent_at: new Date().toISOString(),
      }),
      status: "sent",
      sent_at: new Date(),
    };

    let saved;
    const id = body.documentId || body.document.id;
    if (id) {
      saved = await InvoiceDoc.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        { $set: payload },
        { new: true },
      );
    } else {
      saved = await InvoiceDoc.create({
        userId: session.user.id,
        ...payload,
      });
    }

    if (!saved) {
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
    }

    const invoice = toInvoiceDocument(saved);
    const blob = await pdf(
      <InvoicePdfDocument
        doc={invoice}
        showBranding={!canRemoveBranding(sendGate.plan)}
      />,
    ).toBlob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const filename = `${invoice.labels.header.replace(/\s+/g, "_").toLowerCase()}_${invoice.number || "1"}.pdf`;

    const resend = new Resend(apiKey);
    const { error: sendError } = await resend.emails.send({
      from,
      to: body.to,
      subject: body.subject || `${invoice.labels.header} ${invoice.number}`,
      text: body.message || "Please find your document attached.",
      attachments: [{ filename, content: buffer }],
    });

    if (sendError) {
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    await recordEmailSent(session.user.id);

    return NextResponse.json({ ok: true, document: invoice });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send" },
      { status: 500 },
    );
  }
}
