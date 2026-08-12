import { NextResponse } from "next/server";

/** Logo uploads stay client-side (data URL). MongoDB stores logo_url if provided. */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Upload logo in the editor (stored as data URL / URL on the document in MongoDB).",
    },
    { status: 400 },
  );
}
