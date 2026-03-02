"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(function () {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
      setChecking(false);
    }
    checkUser();
  }, []);

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserEmail(null);
  }

  if (checking) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Login</h1>

      {userEmail && (
        <div>
          <p style={{ marginBottom: 12 }}>
            You are logged in as <strong>{userEmail}</strong>
          </p>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}

      {!userEmail && (
        <div>
          <p style={{ color: "var(--muted)", marginBottom: 12 }}>
            Sign in with your Google account to vote on captions and upload images.
          </p>
          <button onClick={signIn}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
}
