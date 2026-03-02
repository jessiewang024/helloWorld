import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    return (
        <div style={{ padding: 24 }}>
            <h1>Protected</h1>
            <p>Logged in as: {user?.email}</p>
        </div>
    );
}