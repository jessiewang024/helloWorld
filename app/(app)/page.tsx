import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container" style={{ textAlign: "center", marginTop: 60 }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>Welcome to The Humor Project</h1>
      <p style={{ color: "var(--muted)", marginBottom: 32, fontSize: 18 }}>
        Upload images, generate funny captions, and vote on your favorites.
      </p>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/captions" style={{ textDecoration: "none" }}>
          <div className="card" style={{ width: 200, textAlign: "center", padding: 24 }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Captions</p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Browse &amp; vote</p>
          </div>
        </Link>
        <Link href="/upload" style={{ textDecoration: "none" }}>
          <div className="card" style={{ width: 200, textAlign: "center", padding: 24 }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Upload</p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Add new images</p>
          </div>
        </Link>
        <Link href="/dorms" style={{ textDecoration: "none" }}>
          <div className="card" style={{ width: 200, textAlign: "center", padding: 24 }}>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Dorms</p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>View dorm data</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
