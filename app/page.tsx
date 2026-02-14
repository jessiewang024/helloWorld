import Link from "next/link";

export default function HomePage() {
    return (
        <main
            style={{
                minHeight: "100vh",
                background:
                    "radial-gradient(1200px 700px at 20% 10%, rgba(185,217,235,0.18), transparent 55%)," +
                    "radial-gradient(900px 600px at 80% 20%, rgba(185,217,235,0.12), transparent 60%)," +
                    "#070D14",
                color: "rgba(255,255,255,0.92)",
                padding: "48px 28px",
            }}
        >
            <div style={{ maxWidth: 980, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div>
                        <h1 style={{ fontSize: 44, fontWeight: 850, margin: 0, letterSpacing: -0.6 }}>
                            Columbia Dorm Atlas
                        </h1>
                        <p style={{ marginTop: 10, opacity: 0.78, lineHeight: 1.6 }}>
                            Public mode (no sign-in). Data is fetched from your Supabase <code>dorms</code> table.
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
                style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(185,217,235,0.28)",
                    background: "rgba(185,217,235,0.08)",
                    color: "rgba(185,217,235,0.95)",
                    fontSize: 13,
                }}
            >
              Guest mode
            </span>
                    </div>
                </div>

                <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link
                        href="/viz"
                        style={{
                            textDecoration: "none",
                            padding: "12px 16px",
                            borderRadius: 999,
                            border: "1px solid rgba(185,217,235,0.28)",
                            background: "rgba(185,217,235,0.10)",
                            color: "rgba(255,255,255,0.92)",
                            fontWeight: 650,
                        }}
                    >
                        Open Atlas (/viz)
                    </Link>

                    <Link
                        href="/dorms"
                        style={{
                            textDecoration: "none",
                            padding: "12px 16px",
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: "rgba(255,255,255,0.06)",
                            color: "rgba(255,255,255,0.86)",
                            fontWeight: 600,
                        }}
                    >
                        View Table (/dorms)
                    </Link>
                </div>

                <div style={{ marginTop: 34, opacity: 0.6, fontSize: 13, lineHeight: 1.7 }}>
                    <div>Tip: If /dorms works but /viz shows “0 dorms”, your table might have RLS enabled.</div>
                    <div>In Supabase Table Editor, make sure dorms is readable by anon (or set it UNRESTRICTED).</div>
                </div>
            </div>
        </main>
    );
}
