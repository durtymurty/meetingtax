import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Meeting, Person } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function fmtTime(s: number) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meetings, people }: { meetings: Meeting[]; people: Person[] } = body;

    if (!meetings?.length) {
      return NextResponse.json({ error: "No meeting data provided" }, { status: 400 });
    }

    const totalSpent = meetings.reduce((s, m) => s + m.cost, 0);
    const avgCost = totalSpent / meetings.length;
    const totalTime = meetings.reduce((s, m) => s + m.duration, 0);

    const meetingSummary = meetings
      .slice(0, 20)
      .map(
        (m) =>
          `- "${m.name}": ${fmt(m.cost)}, duration ${fmtTime(m.duration)}, ${m.attendeeNames.length} attendees (${m.attendeeNames.join(", ")})`
      )
      .join("\n");

    const teamSummary = people
      .map((p) => `- ${p.name} (${p.role}): $${p.salary.toLocaleString()}/yr`)
      .join("\n");

    const prompt = `You are a sharp, direct business efficiency analyst. Analyze this company's meeting data and give them actionable insights.

TEAM:
${teamSummary || "No team data provided"}

MEETING DATA (${meetings.length} meetings):
Total spent: ${fmt(totalSpent)}
Average cost per meeting: ${fmt(avgCost)}
Total time in meetings: ${fmtTime(totalTime)}

Recent meetings:
${meetingSummary}

Give a punchy analysis with:
1. The biggest money-wasting patterns you see
2. Which specific meeting(s) they should eliminate or restructure
3. What their ideal meeting cadence should look like
4. One surprising insight from the data

Be direct, specific, and a little brutal. Use dollar amounts throughout. Keep it under 250 words. No bullet point soup — write in short punchy paragraphs.`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    return NextResponse.json({ analysis: text });
  } catch (err) {
    console.error("POST /api/analyze error:", err);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
