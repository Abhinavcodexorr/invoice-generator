import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertCanCreateCloudInvoice } from "@/lib/billing";
import { connectMongo } from "@/lib/mongodb";
import { InvoiceDoc } from "@/lib/models/InvoiceDoc";
import { fromInvoicePayload, toInvoiceDocument } from "@/lib/mongo-map";
import type { InvoiceDocument } from "@/lib/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const docs = await InvoiceDoc.find({ userId: session.user.id }).sort({
      updatedAt: -1,
    });

    return NextResponse.json(docs.map(toInvoiceDocument));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gate = await assertCanCreateCloudInvoice(session.user.id);
    if (!gate.ok) {
      return NextResponse.json(
        { error: gate.error, code: "PLAN_LIMIT", plan: gate.plan },
        { status: 402 },
      );
    }

    const body = (await request.json()) as InvoiceDocument;
    await connectMongo();
    const created = await InvoiceDoc.create({
      userId: session.user.id,
      ...fromInvoicePayload(body),
    });

    return NextResponse.json(toInvoiceDocument(created), { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
