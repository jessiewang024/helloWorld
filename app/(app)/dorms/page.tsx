import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DormsPage() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 直接用 Supabase REST（anon key），不依赖你 server.ts / cookies / 登录
    const res = await fetch(`${url}/rest/v1/dorms?select=*`, {
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
    });

    const dorms: any[] = res.ok ? await res.json() : [];

    return (
        <main style={{ padding: 24, fontFamily: "system-ui" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ margin: 0 }}>Dorms</h1>
                <Link href="/viz">Go to /viz</Link>
            </div>

            {!res.ok && (
                <p style={{ color: "crimson" }}>
                    Failed to load dorms. Check RLS / anon access / env vars on Vercel.
                </p>
            )}

            <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 12 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr>
                        {["id", "university_id", "short_name", "full_name", "created_at", "updated_at"].map((k) => (
                            <th key={k} style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eee" }}>
                                {k}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {dorms.map((d) => (
                        <tr key={d.id}>
                            <td style={{ padding: 12, borderBottom: "1px solid #f3f3f3" }}>{d.id}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #f3f3f3" }}>{d.university_id}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #f3f3f3" }}>{d.short_name}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #f3f3f3" }}>{d.full_name}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #f3f3f3" }}>{d.created_at}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #f3f3f3" }}>{d.updated_at}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <p style={{ marginTop: 16, color: "#666" }}>
                Rows: {dorms.length} (table: <code>dorms</code>)
            </p>
        </main>
    );
}
