import { supabase } from "@/lib/supabaseClient";

export default async function ListPage() {
    const { data, error } = await supabase
        .from("profiles")
        .select("*");

    if (error) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Error</h1>
                <pre>{error.message}</pre>
            </main>
        );
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Profiles</h1>
            <p>Total rows: {data?.length}</p>

            <pre style={{ background: "#f5f5f5", padding: 16 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
        </main>
    );
}
