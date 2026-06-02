"use client";

import { useState, useEffect, useRef } from "react";
import type { Person, Meeting } from "@/lib/types";

const COLORS = [
  { bg: "rgba(124,106,247,0.15)", text: "#9B8FFF" },
  { bg: "rgba(76,175,114,0.15)", text: "#4CAF72" },
  { bg: "rgba(255,92,92,0.15)", text: "#FF7070" },
  { bg: "rgba(240,165,0,0.15)", text: "#F0A500" },
  { bg: "rgba(100,180,255,0.15)", text: "#64B4FF" },
  { bg: "rgba(255,130,180,0.15)", text: "#FF82B4" },
];

function initials(name: string) { return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2); }
function colorFor(id: string) { let h = 0; for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length]; }
function fmtTime(s: number) { const m = Math.floor(s / 60), sc = s % 60; return `${String(m).padStart(2, "0")}:${String(sc).padStart(2, "0")}`; }
function fmtCost(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

interface Props { people: Person[]; onSave: (m: Omit<Meeting, "id" | "endedAt">) => Promise<void>; }

export default function MeetingTab({ people, onSave }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [meetingName, setMeetingName] = useState("Weekly Standup");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cost, setCost] = useState(0);
  const [saving, setSaving] = useState(false);
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const costPerSec = Array.from(selected).reduce((sum, id) => {
    const p = people.find((x) => x.id === id);
    return sum + (p ? p.salary / 2080 / 3600 : 0);
  }, 0);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const s = (Date.now() - startRef.current!) / 1000;
        setElapsed(Math.floor(s)); setCost(costPerSec * s);
      }, 500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, costPerSec]);

  const toggle = (id: string) => {
    if (running) return;
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleStart = () => {
    if (!selected.size) return;
    startRef.current = Date.now(); setElapsed(0); setCost(0); setRunning(true);
  };

  const handleStop = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false); setSaving(true);
    await onSave({
      name: meetingName || "Untitled",
      cost, duration: elapsed,
      attendeeIds: Array.from(selected),
      attendeeNames: Array.from(selected).map((id) => people.find((p) => p.id === id)?.name || ""),
      startedAt: new Date(Date.now() - elapsed * 1000).toISOString(),
    });
    setSaving(false); setSelected(new Set()); setElapsed(0); setCost(0);
  };

  const attendees = people.filter((p) => selected.has(p.id));
  const costColor = cost < 50 ? "var(--green)" : cost < 200 ? "var(--amber)" : "var(--danger)";

  return (
    <div>
      {/* Attendee picker */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Select Attendees</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          {running ? "Locked while meeting is running" : "Click to add or remove from this meeting"}
        </p>
        {people.length === 0 ? (
          <div style={{ color: "var(--hint)", fontSize: 14, padding: "24px 0", textAlign: "center" }}>
            Add team members in the Team tab first.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {people.map((p) => {
              const c = colorFor(p.id);
              const sel = selected.has(p.id);
              return (
                <div key={p.id} onClick={() => toggle(p.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                  borderRadius: 40, cursor: running ? "default" : "pointer",
                  border: `1px solid ${sel ? "var(--accent)" : "var(--border2)"}`,
                  background: sel ? "var(--accent-bg)" : "var(--surface2)",
                  transition: "all 0.15s", opacity: running && !sel ? 0.4 : 1,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, background: c.bg, color: c.text,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700,
                  }}>{initials(p.name)}</div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: sel ? "var(--accent2)" : "var(--text)" }}>{p.name}</span>
                  {sel && <span style={{ fontSize: 11, color: "var(--accent2)" }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Meeting room */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: running ? "var(--danger)" : "var(--hint)" }} className={running ? "pulse" : ""} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: running ? "var(--danger)" : "var(--hint)" }}>
              {running ? "LIVE" : saving ? "SAVING…" : "STANDBY"}
            </span>
          </div>
          {running && <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)" }}>{fmtTime(elapsed)}</span>}
        </div>

        {/* Cost display */}
        <div style={{ padding: "40px 24px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--hint)", marginBottom: 12 }}>Total Cost</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 64, fontWeight: 500, lineHeight: 1, color: costColor, transition: "color 0.4s", letterSpacing: "-0.02em" }}>
            {fmtCost(cost)}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 10, fontFamily: "var(--font-mono)" }}>
            {fmtCost(costPerSec * 60)} per minute
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          {[
            { label: "Duration", value: fmtTime(elapsed) },
            { label: "Attendees", value: String(selected.size) },
            { label: "Per person", value: selected.size ? fmtCost(cost / selected.size) : "$0.00" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "16px 20px", borderRight: i < 2 ? "1px solid var(--border)" : "none", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--hint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text)" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Attendee chips */}
        {attendees.length > 0 && (
          <div style={{ padding: "12px 20px", display: "flex", flexWrap: "wrap", gap: 6, borderBottom: "1px solid var(--border)" }}>
            {attendees.map((p) => {
              const c = colorFor(p.id);
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 6px", borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border2)", fontSize: 12, fontWeight: 500 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: c.bg, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700 }}>{initials(p.name)}</div>
                  {p.name}
                </div>
              );
            })}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, padding: "16px 20px", alignItems: "center" }}>
          <input
            value={meetingName} onChange={(e) => setMeetingName(e.target.value)} disabled={running}
            placeholder="Meeting name…"
            style={{ flex: 1, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "var(--font-display)" }}
          />
          {!running ? (
            <button onClick={handleStart} disabled={!selected.size} style={{
              padding: "10px 24px", background: selected.size ? "var(--accent)" : "var(--surface3)",
              color: selected.size ? "white" : "var(--hint)", border: "none",
              borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500,
              cursor: selected.size ? "pointer" : "not-allowed", whiteSpace: "nowrap",
            }}>▶ Start</button>
          ) : (
            <button onClick={handleStop} style={{
              padding: "10px 24px", background: "var(--danger)", color: "white", border: "none",
              borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
            }}>⏹ End</button>
          )}
        </div>
      </div>
    </div>
  );
}