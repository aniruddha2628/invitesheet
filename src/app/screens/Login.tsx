import { useState } from "react";
import { useNavigate } from "react-router";
import api from "@/lib/api";
import { AuthShell, Field, PasswordField, PrimaryButton, LinkText, Alert } from "./_shared";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isValid = /\S+@\S+\.\S+/.test(email) && pw.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await api.post("/auth/login", { email, password: pw });
      localStorage.setItem("token", res.data.data.accessToken);
      navigate(res.data.data.user?.onboardingComplete ? "/dashboard" : "/onboarding");
    } catch (error: any) {
      setErr(error.response?.data?.error?.message ?? "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
          <LinkText onClick={() => navigate("/forgot-password")}>Forgot password?</LinkText>
        </div>

        <PrimaryButton type="submit" disabled={!isValid || submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </PrimaryButton>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Don't have an account? <LinkText onClick={() => navigate("/register")}>Create account</LinkText>
      </p>
    </AuthShell>
  );
}
