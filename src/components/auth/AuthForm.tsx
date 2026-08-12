"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = mode === "sign-in" ? "Sign In" : "Sign Up";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "sign-up") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Sign up failed");
        setMessage("Account created. Signing you in…");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(
          mode === "sign-up"
            ? "Account created but sign-in failed. Try signing in."
            : "Invalid email or password",
        );
      }

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel animate-pop mx-auto w-full max-w-md p-6 sm:p-7">
      <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
        Invoice Generator
      </p>
      <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {mode === "sign-in"
          ? "Access your MongoDB invoice history and send documents."
          : "Create an account stored in MongoDB to save and send invoices."}
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted)]">Password</span>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full !py-3"
        >
          {loading ? (
            <>
              <Spinner size={16} /> Please wait…
            </>
          ) : (
            title
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        {mode === "sign-in" ? (
          <>
            No account?{" "}
            <Link href="/auth/sign-up" className="text-[var(--accent)] hover:underline">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-[var(--accent)] hover:underline">
              Sign In
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
