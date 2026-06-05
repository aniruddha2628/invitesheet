import { useState } from "react";
import { AuthShell, Field, PrimaryButton, Alert } from "./_shared";
import { KeyRound, ArrowLeft } from "lucide-react";

export default function ForgotPassword({ onNav }: { onNav?: (s: string) => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const valid = /^\S+@\S+\.\S+$/.test(email);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <AuthShell>
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <KeyRound className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Forgot password?</h1>
      <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send a 6-digit reset code.</p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        {sent && (
          <Alert kind="success">If this email is registered, a password reset OTP has been sent.</Alert>
        )}

        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" autoComplete="email" />

        {sent ? (
          <PrimaryButton onClick={() => onNav?.("reset")}>Enter reset code</PrimaryButton>
        ) : (
          <PrimaryButton type="submit" disabled={!valid}>Send Reset Code</PrimaryButton>
        )}
      </form>

      <div className="flex justify-center mt-6">
        <button type="button" onClick={() => onNav?.("login")} className="text-sm font-semibold text-gray-500 hover:text-gray-700 inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </button>
      </div>
    </AuthShell>
  );
}
