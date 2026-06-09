import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import api from "@/lib/api";
import { Logo, Field, PrimaryButton, SecondaryButton, Alert, cn } from "./_shared";
import { ClipboardList, Users, MessageSquare, Building2, ArrowRight, Image as ImageIcon, X } from "lucide-react";

type Step = 0 | 1;
const TOTAL = 2;

export default function Onboarding({ companyName = sessionStorage.getItem("pendingCompany") || "Acme Events Pvt Ltd" }: { companyName?: string }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [company, setCompany] = useState({ name: companyName, city: "", whatsapp: "", logoUrl: "" as string });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const skip = () => navigate("/dashboard");
  const finish = async () => {
    setSaving(true);
    setErr(null);
    try {
      const form = new FormData();
      form.append("name", company.name);
      form.append("city", company.city);
      form.append("whatsapp", company.whatsapp);
      if (logoFile) form.append("logo", logoFile);
      await api.post("/auth/onboarding", form);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      setErr(error.response?.data?.error?.message ?? "Unable to complete setup. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50/40 via-white to-gray-50 font-sans flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest tabular-nums">Step {step + 1} of {TOTAL}</span>
          <button onClick={skip} className="text-xs font-semibold text-gray-400 hover:text-gray-700 inline-flex items-center gap-1">
            <X className="w-3 h-3" /> Skip for now
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-xl">
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {[0, 1].map(i => (
              <div key={i} className={cn(
                "h-1.5 rounded-full transition-all",
                i < step ? "w-8 bg-primary" : i === step ? "w-12 bg-primary" : "w-8 bg-gray-200",
              )} />
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] p-7 sm:p-9">
            {step === 0 && (
              <div className="text-center">
                <Logo size="lg" />
                <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight mt-6 leading-tight">
                  Welcome to InviteSheet, <span className="text-primary">{company.name}</span>! 👋
                </h2>
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
                  Let's get your company set up so you can run your next event without breaking a sweat.
                </p>

                <div className="grid grid-cols-3 gap-3 mt-7">
                  {[
                    { icon: ClipboardList, label: "Create event", emoji: "📋" },
                    { icon: Users, label: "Manage guests", emoji: "👥" },
                    { icon: MessageSquare, label: "WhatsApp invitations", emoji: "💬" },
                  ].map(({ icon: Icon, label, emoji }) => (
                    <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-gray-800">{emoji} {label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <PrimaryButton onClick={() => setStep(1)}>Let's Go <ArrowRight className="w-4 h-4 inline -mt-0.5 ml-1" /></PrimaryButton>
                </div>
                <button onClick={skip} className="mt-3 text-xs font-semibold text-gray-400 hover:text-gray-700">Skip for now</button>
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Set up your company</h2>
                <p className="text-sm text-gray-500 mt-1">This appears on your invitations and WhatsApp messages.</p>

                <div className="mt-6 space-y-4">
                  {err && <Alert kind="error">{err}</Alert>}
                  {success && <Alert kind="success">Setup completed successfully.</Alert>}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => logoRef.current?.click()}
                      className="w-16 h-16 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 flex items-center justify-center text-gray-400 hover:text-primary transition-all shrink-0 overflow-hidden"
                    >
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt="logo" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6" />
                      )}
                    </button>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Company logo</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Optional · PNG or JPG up to 2 MB</p>
                      {company.logoUrl && (
                        <button onClick={() => setCompany(c => ({ ...c, logoUrl: "" }))} className="text-[11px] font-semibold text-red-600 hover:underline mt-1">Remove</button>
                      )}
                    </div>
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLogoFile(file);
                          setCompany(c => ({ ...c, logoUrl: URL.createObjectURL(file) }));
                        }
                      }}
                    />
                  </div>

                  <Field label="Company Name" value={company.name} onChange={(v) => setCompany(c => ({ ...c, name: v }))} />
                  <Field label="City" value={company.city} onChange={(v) => setCompany(c => ({ ...c, city: v }))} placeholder="Mumbai" />
                  <Field
                    label="WhatsApp Business Number"
                    type="tel"
                    value={company.whatsapp}
                    onChange={(v) => setCompany(c => ({ ...c, whatsapp: v.replace(/[^0-9]/g, "").slice(0, 10) }))}
                    prefix="+91"
                    placeholder="98765 43210"
                  />
                  <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5">
                    <span className="text-base leading-none mt-0.5">💬</span>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      This number will be used to send WhatsApp invitations to your guests directly from InviteSheet — in just one click.
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex gap-2">
                  <SecondaryButton onClick={skip}>Skip for now</SecondaryButton>
                  <PrimaryButton onClick={finish} disabled={saving || !company.name || !company.city || !/^[6-9]\d{9}$/.test(company.whatsapp)}>
                    {saving ? "Saving..." : "Finish Setup"} <ArrowRight className="w-4 h-4 inline -mt-0.5 ml-1" />
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
