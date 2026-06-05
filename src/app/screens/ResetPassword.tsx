import { useState } from "react";
import { AuthShell, OtpInput, PasswordField, PrimaryButton, PasswordStrength, Field, Alert, passwordValidity } from "./_shared";

export default function ResetPassword({ onNav, email: initialEmail = "priya@acmeevents.in" }: { onNav?: (s: string) => void; email?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [done, setDone] = useState(false);
  const mismatch = cpw && cpw !== pw ? "Passwords do not match" : undefined;
  const pwOk = passwordValidity(pw).valid;
  const ready = code.length === 6 && pwOk && !mismatch && /^\S+@\S+\.\S+$/.test(email);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reset password</h1>
      <p className="text-sm text-gray-500 mt-1">Enter the code we sent and choose a new password.</p>

      <form className="mt-6 space-y-5" onSubmit={submit}>
        {done && <Alert kind="success">Password reset successful. Please log in with your new password.</Alert>}

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
          <PrimaryButton onClick={() => onNav?.("login")}>Go to login</PrimaryButton>
        ) : (
          <PrimaryButton type="submit" disabled={!ready}>Reset Password</PrimaryButton>
        )}
      </form>
    </AuthShell>
  );
}
