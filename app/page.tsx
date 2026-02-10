"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Dorm = {
  id: number;
  university_id: number | null;
  short_name: string | null;
  full_name: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function DormsPage() {
  const [rows, setRows] = useState<Dorm[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");

      const { data, error } = await supabase
          .from("dorms")
          .select("id, university_id, short_name, full_name, created_at, updated_at")
          .order("id", { ascending: true })
          .limit(50);

      if (error) {
        setErr(error.message);
        setRows([]);
      } else {
        setRows((data ?? []) as Dorm[]);
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
      <main style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Dorms</h1>
        <p style={{ color: "#555", marginBottom: 16 }}>
          Fetching rows from an existing Supabase table: <code>dorms</code>
        </p>

        {loading && <div>Loading...</div>}

        {!loading && err && (
            <div style={{ border: "1px solid #f5c2c7", background: "#f8d7da", padding: 12 }}>
              <b>Error:</b> {err}
              <div style={{ marginTop: 8, color: "#6c757d" }}>
                常见原因：RLS/Policy 不允许 anon 读取，或 env 没配置成功。
              </div>
            </div>
        )}

        {!loading && !err && rows.length === 0 && (
            <div style={{ border: "1px solid #eee", padding: 12 }}>No rows found.</div>
        )}

        {!loading && !err && rows.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr>
                  {["id", "university_id", "short_name", "full_name", "created_at", "updated_at"].map((k) => (
                      <th key={k} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #ddd" }}>
                        {k}
                      </th>
                  ))}
                </tr>
                </thead>
                <tbody>
                {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>{r.id}</td>
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>{String(r.university_id)}</td>
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>{r.short_name}</td>
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>{r.full_name}</td>
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>{r.created_at}</td>
                      <td style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>{r.updated_at}</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </main>
  );
}
