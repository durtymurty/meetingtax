import { NextRequest, NextResponse } from "next/server";
import { db, TABLES, PutCommand, ScanCommand, DeleteCommand } from "@/lib/dynamo";
import { v4 as uuidv4 } from "uuid";
import type { Meeting } from "@/lib/types";

export async function GET() {
  try {
    const result = await db.send(new ScanCommand({ TableName: TABLES.MEETINGS }));
    const meetings = (result.Items || []) as Meeting[];
    meetings.sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());
    return NextResponse.json(meetings);
  } catch (err) {
    console.error("GET /api/meetings error:", err);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, cost, duration, attendeeIds, attendeeNames, startedAt } = body;
    if (!name || cost === undefined || !duration || !attendeeIds) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const meeting: Meeting = {
      id: uuidv4(),
      name: String(name).trim(),
      cost: Number(cost),
      duration: Number(duration),
      attendeeIds: attendeeIds as string[],
      attendeeNames: (attendeeNames || []) as string[],
      startedAt: startedAt || new Date().toISOString(),
      endedAt: new Date().toISOString(),
    };
    await db.send(new PutCommand({ TableName: TABLES.MEETINGS, Item: meeting }));
    return NextResponse.json(meeting, { status: 201 });
  } catch (err) {
    console.error("POST /api/meetings error:", err);
    return NextResponse.json({ error: "Failed to save meeting" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.send(new DeleteCommand({ TableName: TABLES.MEETINGS, Key: { id } }));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/meetings error:", err);
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
}