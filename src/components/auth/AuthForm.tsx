"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
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
  const [googleLoading, setGoogleLoading] = useState(false);

  const title = mode === "sign-in" ? "Sign In" : "Sign Up";

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: next });
    } catch {
      setError("Google sign-in failed. Check AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.");
      setGoogleLoading(false);
    }
  };

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
      <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {mode === "sign-in"
          ? "Access your invoice history and send documents."
          : "Create an account to save and send invoices."}
      </p>

      <button
        type="button"
        onClick={onGoogle}
        disabled={loading || googleLoading}
        className="btn mt-5 w-full !border ![border-color:var(--border)] !bg-[var(--background)] !py-3 !text-[var(--foreground)] hover:!bg-[var(--accent-soft)]"
      >
        {googleLoading ? (
          <>
            <Spinner size={16} /> Connecting…
          </>
        ) : (
          <>
            <GoogleMark />
            Continue with Google
          </>
        )}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        <span className="h-px flex-1 bg-[var(--border)]" />
        or email
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
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
        {message ? (
          <p className="text-sm text-[var(--accent)]">{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading || googleLoading}
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
            <Link
              href="/auth/sign-up"
              className="text-[var(--accent)] hover:underline"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="text-[var(--accent)] hover:underline"
            >
              Sign In
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
