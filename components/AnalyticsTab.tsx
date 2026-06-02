"use client";
import { useState, useEffect, useRef } from "react";
import type { Meeting, Person } from "@/lib/types";

function fmtCost(n: number) { if (n >= 1000) return "$" + (n/1000).toFixed(1)+"k"; return "$" + n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function fmtTime(s: number) { const m = Math.floor(s/60), sc = s%60; return `${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`; }

export default function AnalyticsTab({ meetings, people }: { meetings: Meeting[]; people: Person[] }) {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<unknown>(null);

  const total = meetings.reduce((s, m) => s + m.cost, 0);
  const avg = meetings.length ? total / meetings.length : 0;
  const longest = meetings.length ? Math.max(...meetings.map((m) => m.duration)) : 0;
  const mostExp = meetings.length ? meetings.reduce((a, b) => a.cost > b.cost ? a : b) : null;

  useEffect(() => {
    if (!chartRef.current || !meetings.length) return;
    const loadChart = async () => {
      // @ts-expect-error - global
      if (!window.Chart) {
        await new Promise<void>((res) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
          s.onload = () => res();
          document.head.appendChild(s);
        });
      }
      // @ts-expect-error - global
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      const data = [...meetings].reverse().slice(-10);
      // @ts-expect-error - global
      chartInstanceRef.current = new window.Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: data.map((m) => m.name.length > 12 ? m.name.slice(0,12)+"…" : m.name),
          datasets: [{
            data: data.map((m) => Math.round(m.cost*100)/100),
            backgroundColor: data.map((m) => m.cost < 50 ? "rgba(76,175,114,0.7)" : m.cost < 200 ? "rgba(240,165,0,0.7)" : "rgba(255,92,92,0.7)"),
            borderRadius: 6, borderSkipped: false,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: {raw: number}) => "Cost: $" + ctx.raw.toFixed(2) }, backgroundColor: "#1C1C1C", titleColor: "#999", bodyColor: "#F0F0F0", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1 },
          },
          scales: {
            y: { ticks: { callback: (v: number) => "$"+v, font: { size: 11 }, color: "#555" }, grid: { color: "rgba(255,255,255,0.04)" }, border: { color: "rgba(255,255,255,0.08)" } },
            x: { ticks: { font: { size: 11 }, maxRotation: 30, color: "#555" }, grid: { display: false }, border: { color: "rgba(255,255,255,0.08)" } },
          },
        },
      });
    };
    loadChart();
    return () => {
      // @ts-expect-error - global
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [meetings]);

  const getAnalysis = async () => {
    if (!meetings.length) return;
    setLoading(true); setError(""); setAnalysis("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetings, people }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch { setError("Analysis failed. Check your Anthropic API key."); }
    setLoading(false);
  };

  if (!meetings.length) return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--hint)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 4 }}>No data yet</p>
      <p style={{ fontSize: 13 }}>Record some meetings to see analytics</p>
    </div>
  );

  const stats = [
    { label: "Total Spent", value: fmtCost(total), color: "var(--danger)", bg: "var(--danger-bg)" },
    { label: "Avg / Meeting", value: fmtCost(avg), color: "var(--amber)", bg: "var(--amber-bg)" },
    { label: "Meetings", value: String(meetings.length), color: "var(--text)", bg: "var(--surface2)" },
    { label: "Longest", value: fmtTime(longest), color: "var(--accent2)", bg: "var(--accent-bg)" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Analytics</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: s.bg, border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "var(--font-mono)", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {mostExp && meetings.length >= 2 && (
        <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div>
            <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600, marginBottom: 2 }}>Most expensive meeting</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              &quot;{mostExp.name}&quot; — <span style={{ color: "var(--danger)", fontFamily: "var(--font-mono)" }}>{fmtCost(mostExp.cost)}</span> ({((mostExp.cost/total)*100).toFixed(0)}% of total spend)
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: "var(--hint)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Cost Per Meeting</div>
        <div style={{ position: "relative", width: "100%", height: 200 }}>
          <canvas ref={chartRef} role="img" aria-label="Meeting cost chart">Meeting costs</canvas>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>AI Analysis</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Claude reviews your meeting patterns</div>
          </div>
          <button onClick={getAnalysis} disabled={loading} style={{
            padding: "9px 18px", background: loading ? "var(--surface3)" : "var(--accent)",
            color: loading ? "var(--muted)" : "white", border: "none",
            borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500,
            cursor: loading ? "wait" : "pointer", transition: "all 0.15s",
          }}>
            {loading ? "Analyzing…" : "✦ Analyze"}
          </button>
        </div>

        {error && (
          <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 12 }}>{error}</div>
        )}

        {loading && (
          <div style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Analyzing your meeting patterns…</div>
          </div>
        )}

        {analysis && (
          <div className="fade-in" style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>✦</span>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent2)" }}>Claude's Analysis</span>
            </div>
            <div style={{ padding: "20px" }}>
              {analysis.split("\n\n").map((para, i) => {
                const isHeader = para.startsWith("#") || (para.startsWith("**") && para.endsWith("**"));
                const clean = para.replace(/^#+\s*/, "").replace(/\*\*/g, "");
                if (isHeader) return <p key={i} style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 8, marginTop: i > 0 ? 16 : 0 }}>{clean}</p>;
                return <p key={i} style={{ fontSize: 14, lineHeight: 1.75, color: "var(--muted)", marginBottom: 12 }}>{clean}</p>;
              })}
            </div>
          </div>
        )}

        {!analysis && !loading && (
          <div style={{ background: "var(--surface2)", border: "1px dashed var(--border2)", borderRadius: "var(--radius-sm)", padding: "24px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--hint)" }}>Click Analyze to get AI insights on your meeting costs</p>
          </div>
        )}
      </div>
    </div>
  );
}