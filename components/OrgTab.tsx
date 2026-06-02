"use client";

import { useState } from "react";
import type { Person } from "@/lib/types";

const COLORS = [
  { bg: "rgba(124,106,247,0.15)", text: "#9B8FFF" },
  { bg: "rgba(76,175,114,0.15)", text: "#4CAF72" },
  { bg: "rgba(255,92,92,0.15)", text: "#FF7070" },
  { bg: "rgba(240,165,0,0.15)", text: "#F0A500" },
  { bg: "rgba(100,180,255,0.15)", text: "#64B4FF" },
  { bg: "rgba(255,130,180,0.15)", text: "#FF82B4" },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
function hourlyRate(salary: number) { return (salary / 2080).toFixed(2); }

interface Props {
  people: Person[]; loading: boolean;
  onAdd: (n: string, r: string, s: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 14px", background: "var(--surface2)",
  border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)",
  color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "var(--font-display)",
  transition: "border-color 0.15s",
};

export default function OrgTab({ people, loading, onAdd, onDelete }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");

  const handleAdd = async () => {
    if (!name.trim() || !role.trim() || !salary) { setErr("Fill in all fields"); return; }
    const s = parseFloat(salary);
    if (isNaN(s) || s <= 0) { setErr("Enter a valid salary"); return; }
    setErr(""); setAdding(true);
    await onAdd(name.trim(), role.trim(), s);
    setName(""); setRole(""); setSalary(""); setAdding(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Team Members</h2>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>{people.length} {people.length === 1 ? "person" : "people"} tracked</p>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--hint)", fontSize: 14, padding: "40px 0", textAlign: "center" }}>Loading…</div>
      ) : people.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--hint)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👤</div>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>No team members yet</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Add your first person below</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 32 }}>
          {people.map((p) => {
            const c = colorFor(p.id);
            return (
              <div key={p.id} className="fade-in" style={{
                background: "var(--surface2)", border: "1px solid var(--border2)",
                borderRadius: "var(--radius-sm)", padding: 16, position: "relative",
              }}>
                <button onClick={() => onDelete(p.id)} aria-label={`Remove ${p.name}`} style={{
                  position: "absolute", top: 10, right: 10, background: "none", border: "none",
                  color: "var(--hint)", cursor: "pointer", fontSize: 16, lineHeight: 1,
                  width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 4,
                }}>×</button>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: c.bg, color: c.text,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, marginBottom: 10,
                }}>{initials(p.name)}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, paddingRight: 20, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.role}</div>
                <div style={{ fontSize: 12, color: "var(--accent2)", fontFamily: "var(--font-mono)" }}>${hourlyRate(p.salary)}/hr</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 500, color: "var(--hint)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>Add Member</h3>
        {err && (
          <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius-xs)", padding: "8px 12px", fontSize: 13, color: "var(--danger)", marginBottom: 12 }}>{err}</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Name</label>
            <input style={inp} placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Role</label>
            <input style={inp} placeholder="Engineering Lead" value={role} onChange={(e) => setRole(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 6 }}>Annual Salary ($)</label>
            <input style={inp} type="number" placeholder="120000" value={salary} onChange={(e) => setSalary(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          </div>
          <button onClick={handleAdd} disabled={adding} style={{
            height: 42, padding: "0 20px", background: "var(--accent)", color: "white",
            border: "none", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500,
            cursor: adding ? "not-allowed" : "pointer", opacity: adding ? 0.6 : 1,
            whiteSpace: "nowrap", marginTop: 22,
          }}>
            {adding ? "Adding…" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}