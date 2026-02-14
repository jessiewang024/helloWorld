"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Dorm = {
    id: number;
    university_id: number | null;
    short_name: string | null;
    full_name: string | null;
};

const COLUMBIA_BLUE = "#B9D9EB";

function hash01(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    const u = h >>> 0;
    return (u % 100000) / 100000;
}

function clamp01(x: number) {
    return Math.max(0, Math.min(1, x));
}

export default function VizClient() {
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const [rows, setRows] = useState<Dorm[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [hover, setHover] = useState<{
        px: number;
        py: number;
        dorm: Dorm;
    } | null>(null);

    const boxRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            setErr(null);

            const { data, error } = await supabase
                .from("dorms")
                .select("id, university_id, short_name, full_name")
                .order("id", { ascending: true });

            if (!alive) return;

            if (error) {
                setErr(error.message);
                setRows([]);
            } else {
                setRows((data ?? []) as Dorm[]);
            }
            setLoading(false);
        })();

        return () => {
            alive = false;
        };
    }, [supabase]);

    const points = useMemo(() => {
        return rows.map((d) => {
            const key = `${d.id}|${d.short_name ?? ""}|${d.full_name ?? ""}`;
            const a = hash01("a:" + key);
            const b = hash01("b:" + key);

            // diagonal-ish layout
            const x = clamp01(0.10 + 0.80 * a);
            const y = clamp01(0.15 + 0.72 * (0.58 * b + 0.42 * (1 - a)));

            const r = 6 + Math.round(10 * hash01("r:" + key));
            return { dorm: d, x, y, r };
        });
    }, [rows]);

    const onMove = (e: React.MouseEvent) => {
        if (!boxRef.current) return;
        const rect = boxRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const W = rect.width;
        const H = rect.height;

        let best: { px: number; py: number; dorm: Dorm } | null = null;
        let bestDist = Infinity;

        for (const p of points) {
            const px = p.x * W;
            const py = p.y * H;
            const dx = mx - px;
            const dy = my - py;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const threshold = p.r + 14;
            if (dist < threshold && dist < bestDist) {
                bestDist = dist;
                best = { px, py, dorm: p.dorm };
            }
        }
        setHover(best);
    };

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: "28px 20px",
                color: "rgba(255,255,255,0.92)",
                background:
                    "radial-gradient(1100px 650px at 20% 10%, rgba(185,217,235,0.18), transparent 55%)," +
                    "radial-gradient(900px 600px at 80% 20%, rgba(185,217,235,0.12), transparent 60%)," +
                    "#070D14",
            }}
        >
            <div style={{ maxWidth: 1180, margin: "0 auto" }}>
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        flexWrap: "wrap",
                        marginBottom: 18,
                    }}
                >
                    <div>
                        <div style={{ fontSize: 28, fontWeight: 850, letterSpacing: -0.4 }}>
                            Columbia Dorm Atlas
                        </div>
                        <div style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>
                            Public mode (no sign-in). Points are derived from your <code>dorms</code> rows (no DB
                            changes).
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Link
                            href="/"
                            style={{
                                textDecoration: "none",
                                padding: "10px 14px",
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.14)",
                                background: "rgba(255,255,255,0.06)",
                                color: "rgba(255,255,255,0.86)",
                                fontWeight: 650,
                            }}
                        >
                            Home
                        </Link>

                        <span
                            style={{
                                padding: "10px 14px",
                                borderRadius: 999,
                                border: "1px solid rgba(185,217,235,0.28)",
                                background: "rgba(185,217,235,0.10)",
                                color: "rgba(255,255,255,0.90)",
                                fontWeight: 650,
                            }}
                        >
              guest@columbia.edu
            </span>

                        <span
                            style={{
                                padding: "10px 14px",
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(255,255,255,0.04)",
                                color: "rgba(255,255,255,0.55)",
                                fontWeight: 650,
                            }}
                            title="Public mode: Sign-in disabled"
                        >
              Public
            </span>
                    </div>
                </div>

                {/* Chart box */}
                <div
                    ref={boxRef}
                    onMouseMove={onMove}
                    onMouseLeave={() => setHover(null)}
                    style={{
                        position: "relative",
                        height: "74vh",
                        minHeight: 520,
                        borderRadius: 20,
                        overflow: "hidden",
                        border: "1px solid rgba(185,217,235,0.16)",
                        background:
                            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px) 0 0 / 46px 46px," +
                            "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px) 0 0 / 46px 46px," +
                            "radial-gradient(900px 500px at 25% 30%, rgba(185,217,235,0.10), transparent 60%)," +
                            "radial-gradient(700px 520px at 80% 60%, rgba(185,217,235,0.08), transparent 62%)," +
                            "rgba(0,0,0,0.25)",
                        boxShadow:
                            "0 30px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.03)",
                    }}
                >
                    {loading && (
                        <div style={{ position: "absolute", top: 16, left: 16, opacity: 0.75, fontSize: 13 }}>
                            Loading dorms…
                        </div>
                    )}

                    {err && (
                        <div
                            style={{
                                position: "absolute",
                                top: 16,
                                left: 16,
                                right: 16,
                                padding: 12,
                                borderRadius: 12,
                                border: "1px solid rgba(255,80,80,0.35)",
                                background: "rgba(255,80,80,0.10)",
                                color: "rgba(255,200,200,0.95)",
                                fontSize: 13,
                            }}
                        >
                            Supabase error: {err}
                            <div style={{ opacity: 0.75, marginTop: 6 }}>
                                If dorms has RLS, anon can’t read it. Make dorms readable or UNRESTRICTED.
                            </div>
                        </div>
                    )}

                    {/* Points */}
                    {points.map((p) => (
                        <div
                            key={p.dorm.id}
                            style={{
                                position: "absolute",
                                left: `${p.x * 100}%`,
                                top: `${p.y * 100}%`,
                                transform: "translate(-50%, -50%)",
                                width: p.r * 2,
                                height: p.r * 2,
                                borderRadius: 999,
                                background: "rgba(185,217,235,0.90)",
                                boxShadow:
                                    "0 0 0 2px rgba(185,217,235,0.12), 0 0 18px rgba(185,217,235,0.35), 0 0 44px rgba(185,217,235,0.18)",
                                opacity: 0.92,
                            }}
                        />
                    ))}

                    {/* Tooltip */}
                    {hover && (
                        <div
                            style={{
                                position: "absolute",
                                left: hover.px + 18,
                                top: hover.py + 18,
                                width: 320,
                                maxWidth: "calc(100% - 24px)",
                                padding: 14,
                                borderRadius: 14,
                                border: "1px solid rgba(185,217,235,0.18)",
                                background: "rgba(7, 13, 20, 0.82)",
                                backdropFilter: "blur(10px)",
                                boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
                            }}
                        >
                            <div style={{ fontWeight: 850, letterSpacing: -0.2 }}>
                                {hover.dorm.short_name ?? "(no short_name)"}
                            </div>
                            <div style={{ marginTop: 6, opacity: 0.78, fontSize: 13, lineHeight: 1.4 }}>
                                {hover.dorm.full_name ?? "(no full_name)"}
                            </div>
                            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                    style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(185,217,235,0.18)",
                        background: "rgba(185,217,235,0.08)",
                        color: "rgba(185,217,235,0.95)",
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                >
                  id: {hover.dorm.id}
                </span>
                                <span
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        background: "rgba(255,255,255,0.05)",
                                        color: "rgba(255,255,255,0.70)",
                                        fontSize: 12,
                                        fontWeight: 700,
                                    }}
                                >
                  rows: {rows.length}
                </span>
                            </div>
                        </div>
                    )}

                    {/* Bottom pill */}
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            bottom: 18,
                            transform: "translateX(-50%)",
                            padding: "10px 14px",
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.62)",
                            fontSize: 13,
                        }}
                    >
                        Hover over points • {rows.length} dorms • color: Columbia Blue ({COLUMBIA_BLUE})
                    </div>
                </div>

                {/* Footer note */}
                <div style={{ marginTop: 12, opacity: 0.55, fontSize: 12 }}>
                    If this shows 0 dorms, check Supabase permissions for the <code>dorms</code> table.
                </div>
            </div>
        </main>
    );
}
