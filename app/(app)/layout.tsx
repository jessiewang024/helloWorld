import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="navbar">
        <Link href="/" className="brand">The Humor Project</Link>
        <Link href="/captions">Captions</Link>
        <Link href="/upload">Upload</Link>
        <Link href="/dorms">Dorms</Link>
      </nav>
      {children}
    </>
  );
}
