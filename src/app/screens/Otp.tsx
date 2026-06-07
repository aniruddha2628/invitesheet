import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "@/lib/api";
import { AuthShell, OtpInput, PrimaryButton, LinkText, Alert } from "./_shared";
import { Mail } from "lucide-react";

export default function Otp({ email = sessionStorage.getItem("pendingEmail") || "priya@acmeevents.in" }: { email?: string }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(30);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>("OTP sent to your email. Please verify to complete registration.");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, code });
      localStorage.setItem("token", res.data.data.accessToken);
      navigate("/onboarding");
    } catch (error: any) {
      setErr(error.response?.data?.error?.message ?? "Unable to verify OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) { setErr("Please wait 30 seconds before requesting another OTP."); return; }
    setErr(null);
    try {
      await api.post("/auth/resend-otp", { email });
      setInfo("A new OTP has been sent to your email.");
      setCooldown(30);
    } catch (error: any) {
      setErr(error.response?.data?.error?.message ?? "Unable to resend OTP. Please try again.");
    }
  };

  return (
    <AuthShell>
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Mail className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verify your email</h1>
      <p className="text-sm text-gray-500 mt-1">
        Enter the 6-digit code sent to <span className="font-semibold text-gray-800">{email}</span>
      </p>

      <form className="mt-6 space-y-5" onSubmit={submit}>
        {info && !err && <Alert kind="success">{info}</Alert>}
        {err && <Alert kind="error">{err}</Alert>}

        <OtpInput value={code} onChange={setCode} />

        <PrimaryButton type="submit" disabled={code.length !== 6 || submitting}>{submitting ? "Verifying..." : "Verify"}</PrimaryButton>
      </form>

      <div className="flex items-center justify-between mt-5 text-sm">
        <button
          type="button"
          disabled={cooldown > 0}
          onClick={resend}
          className="font-semibold text-primary disabled:text-gray-400 hover:underline disabled:no-underline disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </button>
        <LinkText onClick={() => navigate("/register")} className="text-gray-500 hover:text-gray-700">Change email</LinkText>
      </div>
    </AuthShell>
  );
}
