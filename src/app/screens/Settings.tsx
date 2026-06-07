import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "@/lib/api";
import { Sidebar, Topbar } from "./Dashboard";
import { Field, PasswordField, PrimaryButton, PasswordStrength, Alert, cn, passwordValidity } from "./_shared";
import { CheckCircle2, Download, AlertTriangle, Lock, ShieldAlert, Upload } from "lucide-react";

type Role = "owner" | "admin" | "member";
type Tab = "profile" | "password" | "company";

const DELETE_PHRASE = "DELETE MY ACCOUNT";

export default function Settings({ role = "owner" }: { role?: Role }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState({ fullName: "Priya Sharma", email: "priya@acmeevents.in", phone: "9876543210" });
  const [company, setCompany] = useState({ companyName: "Acme Events Pvt Ltd", city: "Gurgaon", whatsappNumber: "9988776655" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  const canEditCompany = role === "owner" || role === "admin";
  const canDelete = role === "owner";

  useEffect(() => {
    api.get("/users/me").then((res) => {
      const me = res.data.data;
      setProfile({ fullName: me.fullName, email: me.email, phone: me.phone });
      if (me.company) {
        setCompany({ companyName: me.company.name ?? "", city: me.company.city ?? "", whatsappNumber: me.company.whatsappNumber ?? "" });
      }
    }).catch(() => undefined);
  }, []);

  const saveProfile = async () => {
    const res = await api.patch("/users/me", { fullName: profile.fullName, phone: profile.phone });
    setProfile((p) => ({ ...p, fullName: res.data.data.fullName, phone: res.data.data.phone }));
  };

  const saveCompany = async () => {
    const form = new FormData();
    form.append("name", company.companyName);
    form.append("city", company.city);
    form.append("whatsappNumber", company.whatsappNumber);
    const res = await api.patch("/company", form);
    setCompany({ companyName: res.data.data.name, city: res.data.data.city, whatsappNumber: res.data.data.whatsappNumber });
  };

  const exportData = async () => {
    const res = await api.get("/users/me/export");
    const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "invitesheet-data-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteAccount = async () => {
    await api.delete("/users/me", { data: { confirmText: deleteText } });
    localStorage.removeItem("token");
    navigate("/login");
  };

  const items: { id: Tab; label: string; show: boolean }[] = [
    { id: "profile", label: "Profile", show: true },
    { id: "password", label: "Password", show: true },
    { id: "company", label: "Company", show: true },
  ];

  const submitPw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr(null); setPwSuccess(false);
    if (pw.next !== pw.confirm) { setPwErr("Passwords do not match"); return; }
    try {
      await api.patch("/users/me/password", pw);
      setPwSuccess(true);
      setPw({ current: "", next: "", confirm: "" });
    } catch (error: any) {
      setPwErr(error.response?.data?.error?.message ?? "Unable to update password.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar active="settings" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar role={role} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your profile, password, and company preferences.</p>
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex gap-1 overflow-x-auto">
                {items.filter(i => i.show).map(it => (
                  <button
                    key={it.id}
                    onClick={() => setTab(it.id)}
                    className={cn(
                      "px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap",
                      tab === it.id ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-700",
                    )}
                  >{it.label}</button>
                ))}
              </nav>
            </div>

            <div className="mt-6 space-y-5">
              {tab === "profile" && (
                <Section title="Your profile" description="This is how teammates and event collaborators see you.">
                  <Field label="Full Name" value={profile.fullName} onChange={(v) => setProfile(p => ({ ...p, fullName: v }))} hint="2–100 characters" />
                  <Field
                    label="Email"
                    value={profile.email}
                    readOnly
                    suffix={
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider ring-1 ring-emerald-100 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    }
                  />
                  <Field
                    label="Phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(v) => setProfile(p => ({ ...p, phone: v.replace(/[^0-9]/g, "").slice(0, 10) }))}
                    prefix="+91"
                  />
                  <div className="pt-2"><PrimaryButton full={false} onClick={saveProfile}>Save Changes</PrimaryButton></div>
                </Section>
              )}

              {tab === "password" && (
                <>
                  <Section title="Change password" description="Use a strong password unique to InviteSheet. You'll be logged out of other sessions.">
                    <form className="space-y-4" onSubmit={submitPw}>
                      {pwErr && <Alert kind="error">{pwErr}</Alert>}
                      {pwSuccess && <Alert kind="success">Password changed. Please log in again on all devices.</Alert>}
                      <PasswordField label="Current Password" value={pw.current} onChange={(v) => setPw(p => ({ ...p, current: v }))} autoComplete="current-password" />
                      <div>
                        <PasswordField label="New Password" value={pw.next} onChange={(v) => setPw(p => ({ ...p, next: v }))} autoComplete="new-password" />
                        <PasswordStrength value={pw.next} />
                      </div>
                      <PasswordField label="Confirm Password" value={pw.confirm} onChange={(v) => setPw(p => ({ ...p, confirm: v }))} autoComplete="new-password" />
                      <div className="pt-1">
                        <PrimaryButton type="submit" full={false} disabled={!pw.current || !passwordValidity(pw.next).valid || pw.next !== pw.confirm}>
                          Update Password
                        </PrimaryButton>
                      </div>
                    </form>
                  </Section>

                  <Section title="Export your data" description="Download a JSON archive of all your events, sheets, and guest data — required for GDPR/DPDP compliance.">
                    <div className="flex items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Download className="w-5 h-5" /></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Full data export</p>
                          <p className="text-xs text-gray-500">Ready in ~30 seconds, emailed to you.</p>
                        </div>
                      </div>
                      <PrimaryButton full={false} onClick={exportData}>Export Data</PrimaryButton>
                    </div>
                  </Section>

                  {canDelete && (
                    <Section title="Danger Zone" danger>
                      <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-4">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          Deleting your account permanently removes your company, every event, and all guest data. This action <strong>cannot be undone</strong>.
                        </p>
                      </div>
                      {!showDelete ? (
                        <button onClick={() => setShowDelete(true)} className="px-4 py-2.5 bg-white border border-red-300 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-50 transition-all">
                          Delete Account
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <Field
                            label={`Type "${DELETE_PHRASE}" to confirm`}
                            value={deleteText}
                            onChange={setDeleteText}
                            placeholder={DELETE_PHRASE}
                            error={deleteText && deleteText !== DELETE_PHRASE ? `Confirmation text did not match. Type exactly: ${DELETE_PHRASE}` : undefined}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setShowDelete(false); setDeleteText(""); }}
                              className="px-4 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={deleteText !== DELETE_PHRASE}
                              onClick={deleteAccount}
                              className="px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                              Permanently Delete Account
                            </button>
                          </div>
                        </div>
                      )}
                    </Section>
                  )}
                </>
              )}

              {tab === "company" && (
                <>
                  {!canEditCompany && (
                    <Alert kind="info">
                      <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Only owners and admins can edit company details. You're signed in as <strong className="capitalize">{role}</strong>.</div>
                    </Alert>
                  )}

                  <Section title="Company details" description="Shown on invitations and guest-facing communication.">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-100 border border-primary/30 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                        {company.companyName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Company Logo</p>
                        <button disabled={!canEditCompany} className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:text-gray-400 disabled:no-underline">
                          <Upload className="w-3 h-3" /> Upload logo
                        </button>
                      </div>
                    </div>

                    <Field label="Company Name" value={company.companyName} onChange={(v) => setCompany(c => ({ ...c, companyName: v }))} readOnly={!canEditCompany} hint="2–100 characters" />
                    <Field label="City" value={company.city} onChange={(v) => setCompany(c => ({ ...c, city: v }))} readOnly={!canEditCompany} placeholder="Mumbai" />
                    <Field
                      label="WhatsApp Number"
                      type="tel"
                      value={company.whatsappNumber}
                      onChange={(v) => setCompany(c => ({ ...c, whatsappNumber: v.replace(/[^0-9]/g, "").slice(0, 10) }))}
                      readOnly={!canEditCompany}
                      prefix="+91"
                    />
                    {canEditCompany && (
                      <div className="pt-2"><PrimaryButton full={false} onClick={saveCompany}>Save Changes</PrimaryButton></div>
                    )}
                  </Section>

                  <Section title="Plan & usage">
                    <div className="grid grid-cols-2 gap-3">
                      <Stat label="Current Plan" value="Free" tone="text-primary" badge="Upgrade" />
                      <Stat label="Events Used" value="2 / 2" tone="text-amber-600" />
                    </div>
                  </Section>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Section({ title, description, children, danger }: { title: string; description?: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={cn("bg-white border rounded-xl p-6", danger ? "border-red-200" : "border-gray-200")}>
      <div className="flex items-start gap-3">
        {danger && <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
        <div>
          <h3 className={cn("text-base font-bold", danger ? "text-red-700" : "text-gray-900")}>{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Stat({ label, value, tone, badge }: { label: string; value: string; tone: string; badge?: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className={cn("text-xl font-bold tabular-nums", tone)}>{value}</p>
        {badge && <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">{badge} →</button>}
      </div>
    </div>
  );
}
