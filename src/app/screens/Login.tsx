import { useState } from "react";
import { AuthShell, Field, PasswordField, PrimaryButton, LinkText, Alert } from "./_shared";

export default function Login({ onNav }: { onNav?: (s: string) => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submitting = false;
  const isValid = /\S+@\S+\.\S+/.test(email) && pw.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    // Demo: any creds → dashboard. Wire to POST /auth/login.
    if (email === "locked@example.com") {
      setErr("Account locked after too many failed attempts. Try again in 15 minutes.");
      return;
    }
    if (email === "unverified@example.com") {
      setErr("Please verify your email before logging in.");
      return;
    }
    onNav?.("dashboard");
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
      <p className="text-sm text-gray-500 mt-1">Sign in to manage your events.</p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        {err && <Alert kind="error">{err}</Alert>}

        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" autoComplete="email" />
        <PasswordField label="Password" value={pw} onChange={setPw} placeholder="Your password" autoComplete="current-password" />

        <div className="flex justify-end">
          <LinkText onClick={() => onNav?.("forgot")}>Forgot password?</LinkText>
        </div>

        <PrimaryButton type="submit" disabled={!isValid || submitting}>
          {submitting ? "Signing in…" : "Sign In"}
        </PrimaryButton>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Don't have an account? <LinkText onClick={() => onNav?.("register")}>Create account</LinkText>
      </p>
    </AuthShell>
  );
}
