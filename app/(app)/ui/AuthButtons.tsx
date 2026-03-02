"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthButtons({ userEmail }: { userEmail: string | null }) {
    const supabase = createSupabaseBrowserClient();

    async function signIn() {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    }

    async function signOut() {
        await supabase.auth.signOut();
        window.location.href = "/";
    }

    if (!userEmail) {
        return (
            <button
                onClick={signIn}
                style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "#002B5C",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                }}
            >
                Sign in with Google
            </button>
        );
    }

    return (
        <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: 14 }}>{userEmail}</span>
            <button
                onClick={signOut}
                style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "white",
                    cursor: "pointer",
                }}
            >
                Sign out
            </button>
        </div>
    );
}