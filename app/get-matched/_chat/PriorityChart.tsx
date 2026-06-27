"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

import type { PriorityReflection } from "@/lib/onboarding/types";

// A calm "what I'm hearing matters to you" reflection — the agent's live read, drawn so the
// person can see it and correct it. Not a score; a mirror. Teal-on-seafoam, gentle.
export function PriorityChart({ data }: { data: PriorityReflection }) {
  const rows = [...data.priorities].sort((a, b) => b.weight - a.weight).slice(0, 6);
  const height = Math.max(120, rows.length * 38 + 16);

  return (
    <div className="rounded-2xl border border-rule bg-white p-4">
      <p className="text-[13px] leading-[1.6] text-ink-soft">{data.note}</p>
      <div className="mt-3" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap={10}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#4a4a4a", fontSize: 12 }}
            />
            <Bar dataKey="weight" radius={[6, 6, 6, 6]} isAnimationActive>
              {rows.map((r, i) => (
                <Cell key={r.label} fill={i === 0 ? "#5f8f8b" : "#a8bfa3"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-[11px] text-ink-muted">Did I get that right? Tell me what to add or change.</p>
    </div>
  );
}
