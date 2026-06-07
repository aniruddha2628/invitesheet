import { useState } from "react";
import { useNavigate } from "react-router";
import api from "@/lib/api";
import { AuthShell, OtpInput, PasswordField, PrimaryButton, PasswordStrength, Field, Alert, passwordValidity } from "./_shared";

export default function ResetPassword({ email: initialEmail = sessionStorage.getItem("resetEmail") || "priya@acmeevents.in" }: { email?: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const mismatch = cpw && cpw !== pw ? "Passwords do not match" : undefined;
  const pwOk = passwordValidity(pw).valid;
  const ready = code.length === 6 && pwOk && !mismatch && /^\S+@\S+\.\S+$/.test(email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { email, code, password: pw, confirmPassword: cpw });
      setDone(true);
    } catch (error: any) {
      setErr(error.response?.data?.error?.message ?? "Unable to reset password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reset password</h1>
      <p className="text-sm text-gray-500 mt-1">Enter the code we sent and choose a new password.</p>

      <form className="mt-6 space-y-5" onSubmit={submit}>
        {done && <Alert kind="success">Password reset successful. Please log in with your new password.</Alert>}
        {err && <Alert kind="error">{err}</Alert>}

        <Field label="Email" type="email" value={email} onChange={setEmail} readOnly />

        <div>
          <span className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider block mb-2">Verification Code</span>
          <OtpInput value={code} onChange={setCode} />
        </div>

        <div>
          <PasswordField label="New Password" value={pw} onChange={setPw} placeholder="At least 8 characters" autoComplete="new-password" />
          <PasswordStrength value={pw} />
        </div>

        <Field label="Confirm Password" type="password" value={cpw} onChange={setCpw} placeholder="Re-enter password" error={mismatch} autoComplete="new-password" />

        {done ? (
          <PrimaryButton onClick={() => navigate("/login")}>Go to login</PrimaryButton>
        ) : (
          <PrimaryButton type="submit" disabled={!ready || submitting}>{submitting ? "Resetting..." : "Reset Password"}</PrimaryButton>
        )}
      </form>
    </AuthShell>
  );
}
