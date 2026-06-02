"use client";

import { useState, useEffect } from "react";
import type { Person, Meeting } from "@/lib/types";
import OrgTab from "@/components/OrgTab";
import MeetingTab from "@/components/MeetingTab";
import HistoryTab from "@/components/HistoryTab";
import AnalyticsTab from "@/components/AnalyticsTab";

type Tab = "org" | "meeting" | "history" | "analytics";

export default function Home() {
  const [tab, setTab] = useState<Tab>("org");
  const [people, setPeople] = useState<Person[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  useEffect(() => {
    fetch("/api/people")
      .then((r) => r.json())
      .then((data) => { setPeople(Array.isArray(data) ? data : []); setLoadingPeople(false); })
      .catch(() => setLoadingPeople(false));
    fetch("/api/meetings")
      .then((r) => r.json())
      .then((data) => { setMeetings(Array.isArray(data) ? data : []); setLoadingMeetings(false); })
      .catch(() => setLoadingMeetings(false));
  }, []);

  const addPerson = async (name: string, role: string, salary: number) => {
    const res = await fetch("/api/people", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, salary }),
    });
    if (res.ok) { const p = await res.json(); setPeople((prev) => [...prev, p]); }
  };

  const deletePerson = async (id: string) => {
    const res = await fetch(`/api/people?id=${id}`, { method: "DELETE" });
    if (res.ok) setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const saveMeeting = async (meeting: Omit<Meeting, "id" | "endedAt">) => {
    const res = await fetch("/api/meetings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meeting),
    });
    if (res.ok) { const saved = await res.json(); setMeetings((prev) => [saved, ...prev]); }
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "org", label: "Team" },
    { id: "meeting", label: "Meeting" },
    { id: "history", label: "History" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", padding: "48px 24px 80px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: "var(--accent)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 20,
            }}>💸</div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600,
              letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1,
            }}>
              MeetingTax
            </h1>
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", paddingLeft: 50 }}>
            Every meeting has a price. Now you can see it.
          </p>
        </div>

        <div style={{
          display: "inline-flex", gap: 4, marginBottom: 12,
          background: "var(--surface)", padding: 4,
          borderRadius: "var(--radius)", border: "1px solid var(--border2)",
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 20px", border: "none",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 500,
                cursor: "pointer", transition: "all 0.15s",
                background: tab === t.id ? "var(--accent)" : "transparent",
                color: tab === t.id ? "white" : "var(--muted)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border2)",
          borderRadius: "var(--radius)",
          padding: 32,
          minHeight: 500,
        }}>
          {tab === "org" && <OrgTab people={people} loading={loadingPeople} onAdd={addPerson} onDelete={deletePerson} />}
          {tab === "meeting" && <MeetingTab people={people} onSave={saveMeeting} />}
          {tab === "history" && <HistoryTab meetings={meetings} loading={loadingMeetings} onDelete={deleteMeeting} />}
          {tab === "analytics" && <AnalyticsTab meetings={meetings} people={people} />}
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--hint)", marginTop: 24, letterSpacing: "0.06em" }}>
          NEXT.JS · AWS DYNAMODB · CLAUDE AI · VERCEL
        </p>
      </div>
    </main>
  );
}