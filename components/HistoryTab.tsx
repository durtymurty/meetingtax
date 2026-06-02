"use client";
import { useState } from "react";
import type { Meeting } from "@/lib/types";

function fmtTime(s: number) { const m = Math.floor(s/60), sc = s%60; return `${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`; }
function fmtCost(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function costColor(n: number) { return n < 50 ? "var(--green)" : n < 200 ? "var(--amber)" : "var(--danger)"; }
function costBg(n: number) { return n < 50 ? "var(--green-bg)" : n < 200 ? "var(--amber-bg)" : "var(--danger-bg)"; }

export default function HistoryTab({ meetings, loading, onDelete }: { meetings: Meeting[]; loading: boolean; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/meetings?id=${id}`, { method: "DELETE" });
    onDelete(id);
    setDeleting(null);
  };

  if (loading) return <div style={{ color: "var(--hint)", textAlign: "center", padding: "48px 0" }}>Loading…</div>;

  if (!meetings.length) return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--hint)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 4 }}>No meetings yet</p>
      <p style={{ fontSize: 13 }}>Start a meeting to see it here</p>
    </div>
  );

  const total = meetings.reduce((s, m) => s + m.cost, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>Meeting History</h2>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>{meetings.length} meetings recorded</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--hint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Total spent</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600, color: "var(--danger)" }}>{fmtCost(total)}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {meetings.map((m) => (
          <div key={m.id} className="fade-in" style={{
            display: "grid", gridTemplateColumns: "1fr auto auto",
            gap: 12, alignItems: "center", padding: "16px 20px",
            background: "var(--surface2)", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            opacity: deleting === m.id ? 0.4 : 1, transition: "opacity 0.15s",
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span>{m.attendeeNames.length ? m.attendeeNames.join(", ") : "No attendees"}</span>
                <span style={{ color: "var(--hint)" }}>·</span>
                <span>{fmtTime(m.duration)}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--hint)", marginTop: 4 }}>{new Date(m.endedAt).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-block", padding: "6px 12px", borderRadius: "var(--radius-xs)", background: costBg(m.cost) }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color: costColor(m.cost) }}>{fmtCost(m.cost)}</div>
              </div>
              <div style={{ fontSize: 11, color: "var(--hint)", marginTop: 4 }}>
                {fmtCost(m.attendeeNames.length ? m.cost / m.attendeeNames.length : m.cost)} / person
              </div>
            </div>
            <button
              onClick={() => handleDelete(m.id)}
              disabled={deleting === m.id}
              aria-label="Delete meeting"
              style={{
                width: 32, height: 32, borderRadius: "var(--radius-xs)",
                background: "none", border: "1px solid var(--border2)",
                color: "var(--hint)", cursor: "pointer", fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0,
              }}
            >🗑</button>
          </div>
        ))}
      </div>
    </div>
  );
}