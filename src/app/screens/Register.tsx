import { useState } from "react";
import { useNavigate } from "react-router";
import api from "@/lib/api";
import { SplitAuthShell, Field, PasswordField, PrimaryButton, LinkText, PasswordStrength, Checkbox, Alert, passwordValidity } from "./_shared";
import { Users, MessageSquare, FileSpreadsheet, Quote } from "lucide-react";

const PHONE_RE = /^[6-9]\d{9}$/;

export default function Register() {
  const navigate = useNavigate();
  const [f, setF] = useState({ companyName: "", fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [terms, setTerms] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF(p => ({ ...p, [k]: v }));

  const errors = {
    companyName: f.companyName && (f.companyName.length < 2 || f.companyName.length > 100) ? "Must be 2–100 characters" : undefined,
    fullName: f.fullName && (f.fullName.length < 2 || f.fullName.length > 100) ? "Must be 2–100 characters" : undefined,
    email: f.email && !/^\S+@\S+\.\S+$/.test(f.email) ? "Enter a valid email" : undefined,
    phone: f.phone && !PHONE_RE.test(f.phone) ? "Enter a valid 10-digit Indian mobile number" : undefined,
    confirmPassword: f.confirmPassword && f.confirmPassword !== f.password ? "Passwords do not match" : undefined,
  };
  const pwOk = passwordValidity(f.password).valid;
  const allFilled = f.companyName && f.fullName && f.email && f.phone && f.password && f.confirmPassword;
  const isValid = allFilled && !Object.values(errors).some(Boolean) && pwOk && terms;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErr(null);
    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        companyName: f.companyName,
        fullName: f.fullName,
        email: f.email,
        phone: f.phone,
        password: f.password,
      });
      sessionStorage.setItem("pendingEmail", f.email);
      sessionStorage.setItem("pendingCompany", f.companyName);
      navigate("/otp");
    } catch (error: any) {
      setServerErr(error.response?.data?.error?.message ?? "Unable to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SplitAuthShell
      brand={
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl xl:text-4xl font-bold leading-[1.15] tracking-tight">
              Manage every guest,<br />every event — effortlessly.
            </h2>
            <p className="text-slate-400 text-sm mt-4 max-w-md leading-relaxed">
              From RSVP sheets to room planning and live check-in, InviteSheet keeps your team on the same page through every event.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              { icon: FileSpreadsheet, t: "Spreadsheet-fast guest lists", d: "Edit like Excel, with smart columns built in." },
              { icon: Users, t: "Live check-in & room planning", d: "Track arrivals and seat assignments in real-time." },
              { icon: MessageSquare, t: "WhatsApp invitations at scale", d: "Send personalised invites in one click." },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{t}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{d}</p>
                </div>
              </li>
            ))}
          </ul>
          <figure className="border-l-2 border-primary pl-4 max-w-md">
            <Quote className="w-4 h-4 text-primary mb-2" />
            <blockquote className="text-sm text-slate-300 italic leading-relaxed">
              "We managed 487 wedding guests across 4 days without a single missed check-in. The team finally stopped fighting over Google Sheets."
            </blockquote>
            <figcaption className="text-xs text-slate-500 mt-2 not-italic">— Priya Sharma, Acme Events</figcaption>
          </figure>
        </div>
      }
    >
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
      <p className="text-sm text-gray-500 mt-1">14-day free trial · no credit card required.</p>

      <form className="mt-6 space-y-4" onSubmit={submit}>
        {serverErr && <Alert kind="error">{serverErr}</Alert>}

        <Field label="Company Name" value={f.companyName} onChange={set("companyName")} placeholder="Acme Events Pvt Ltd" error={errors.companyName} />
        <Field label="Full Name" value={f.fullName} onChange={set("fullName")} placeholder="Priya Sharma" autoComplete="name" error={errors.fullName} />
        <Field label="Email" type="email" value={f.email} onChange={set("email")} placeholder="you@company.com" autoComplete="email" error={errors.email} />
        <Field
          label="Phone"
          type="tel"
          value={f.phone}
          onChange={(v) => set("phone")(v.replace(/[^0-9]/g, "").slice(0, 10))}
          placeholder="98765 43210"
          prefix="+91"
          autoComplete="tel-national"
          error={errors.phone}
        />
        <div>
          <PasswordField label="Password" value={f.password} onChange={set("password")} placeholder="At least 8 characters" autoComplete="new-password" />
          <PasswordStrength value={f.password} />
        </div>
        <Field
          label="Confirm Password"
          type="password"
          value={f.confirmPassword}
          onChange={set("confirmPassword")}
          placeholder="Re-enter password"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />

        <Checkbox
          checked={terms}
          onChange={setTerms}
          label={
            <span>
              I agree to the <LinkText className="text-sm">Terms of Service</LinkText> and <LinkText className="text-sm">Privacy Policy</LinkText>.
            </span>
          }
        />

        <PrimaryButton type="submit" disabled={!isValid || submitting}>{submitting ? "Creating..." : "Create Account"}</PrimaryButton>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account? <LinkText onClick={() => navigate("/login")}>Sign In</LinkText>
      </p>
    </SplitAuthShell>
  );
}
