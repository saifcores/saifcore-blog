"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const configError = searchParams.get("error") === "not-configured";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Login failed.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-bold tracking-[0.2em] text-[var(--text-muted)] uppercase">
          SAIFCORE Blog
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Manage MDX articles, drafts, and bilingual content.
        </p>

        {configError && (
          <p className="mt-4 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100/95">
            Set <code className="font-mono">ADMIN_PASSWORD</code> in{" "}
            <code className="font-mono">.env.local</code> and restart the dev
            server.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--focus-ring)]"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || configError}
            className="btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
