import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectMongo } from "@/lib/mongodb";
import { InvoiceDoc } from "@/lib/models/InvoiceDoc";
import { fromInvoicePayload, toInvoiceDocument } from "@/lib/mongo-map";
import type { InvoiceDocument } from "@/lib/types";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const doc = await InvoiceDoc.findOne({ _id: id, userId: session.user.id });
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(toInvoiceDocument(doc));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as InvoiceDocument;
    await connectMongo();
    const doc = await InvoiceDoc.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: fromInvoicePayload(body) },
      { new: true },
    );

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(toInvoiceDocument(doc));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();
    const result = await InvoiceDoc.deleteOne({
      _id: id,
      userId: session.user.id,
    });

    if (!result.deletedCount) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
