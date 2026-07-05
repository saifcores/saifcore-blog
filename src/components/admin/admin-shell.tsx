"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export function AdminShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-bold tracking-[0.16em] text-[var(--text-primary)] uppercase"
            >
              SAIFCORE CMS
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <Link
                href="/admin"
                className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent-text)]"
              >
                Articles
              </Link>
              <Link
                href="/admin/posts/new"
                className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent-text)]"
              >
                New article
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
            >
              View site ↗
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
