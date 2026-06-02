import { NextRequest, NextResponse } from "next/server";
import { db, TABLES, PutCommand, ScanCommand, DeleteCommand } from "@/lib/dynamo";
import { v4 as uuidv4 } from "uuid";
import type { Person } from "@/lib/types";

export async function GET() {
  try {
    const result = await db.send(new ScanCommand({ TableName: TABLES.PEOPLE }));
    const people = (result.Items || []) as Person[];
    people.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return NextResponse.json(people);
  } catch (err) {
    console.error("GET /api/people error:", err);
    return NextResponse.json({ error: "Failed to fetch people" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, salary } = body;
    if (!name || !role || !salary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const person: Person = {
      id: uuidv4(),
      name: String(name).trim(),
      role: String(role).trim(),
      salary: Number(salary),
      createdAt: new Date().toISOString(),
    };
    await db.send(new PutCommand({ TableName: TABLES.PEOPLE, Item: person }));
    return NextResponse.json(person, { status: 201 });
  } catch (err) {
    console.error("POST /api/people error:", err);
    return NextResponse.json({ error: "Failed to create person" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await db.send(new DeleteCommand({ TableName: TABLES.PEOPLE, Key: { id } }));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/people error:", err);
    return NextResponse.json({ error: "Failed to delete person" }, { status: 500 });
  }
}
