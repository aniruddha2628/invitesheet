import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export { cn };

export function Logo({ size = "md", inverted = false, onClick }: { size?: "md" | "lg"; inverted?: boolean; onClick?: () => void }) {
  const sq = size === "lg" ? "w-10 h-10 text-lg" : "w-8 h-8";
  const tx = size === "lg" ? "text-xl" : "text-lg";
  const content = (
    <>
      <div className={cn("bg-primary rounded-lg flex items-center justify-center text-white font-bold italic", sq)}>S</div>
      <span className={cn("font-bold tracking-tight", tx, inverted ? "text-white" : "text-gray-900")}>InviteSheet</span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {content}
    </div>
  );
}

export function Field({
  label, type = "text", value, onChange, placeholder, readOnly, suffix, prefix, error, hint, autoComplete,
}: {
  label: React.ReactNode; type?: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; readOnly?: boolean; suffix?: React.ReactNode; prefix?: React.ReactNode;
  error?: string; hint?: string; autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider">{label}</span>
      <div className={cn(
        "mt-1.5 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 transition-all",
        "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary focus-within:bg-white",
        readOnly && "bg-gray-100 text-gray-500",
        error && "border-red-300 focus-within:ring-red-100 focus-within:border-red-400 bg-red-50/30",
      )}>
        {prefix && <span className="text-sm text-gray-500 mr-2 font-medium shrink-0">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
        />
        {suffix}
      </div>
      {error ? (
        <span className="text-[11px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-gray-500 mt-1 block">{hint}</span>
      ) : null}
    </label>
  );
}

export function PasswordField({ label, value, onChange, placeholder, error, autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      autoComplete={autoComplete}
      suffix={
        <button type="button" onClick={() => setShow(s => !s)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}

export function PrimaryButton({ children, onClick, type = "button", disabled, full = true, className }: {
  children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; full?: boolean; className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm",
        "disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none",
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, full = true, className, type = "button" }: {
  children: React.ReactNode; onClick?: () => void; full?: boolean; className?: string; type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all",
        full && "w-full",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkText({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("text-sm font-semibold text-primary hover:underline", className)}>{children}</button>
  );
}

// Password strength: ≥8 chars, 1 uppercase, 1 number, 1 special char.
// PRD specifies labels: Weak / Medium / Strong.
export function passwordValidity(v: string) {
  const checks = {
    len: v.length >= 8,
    upper: /[A-Z]/.test(v),
    num: /[0-9]/.test(v),
    special: /[^A-Za-z0-9]/.test(v),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const valid = score === 4;
  const tier: "" | "weak" | "medium" | "strong" =
    !v ? "" : score <= 2 ? "weak" : score === 3 ? "medium" : "strong";
  return { checks, score, valid, tier };
}

export function PasswordStrength({ value }: { value: string }) {
  const { tier, score } = passwordValidity(value);
  const labelMap = { weak: "Weak", medium: "Medium", strong: "Strong", "": "" } as const;
  const toneMap = {
    weak: { bar: "bg-red-400", text: "text-red-600" },
    medium: { bar: "bg-amber-400", text: "text-amber-700" },
    strong: { bar: "bg-emerald-500", text: "text-emerald-700" },
    "": { bar: "bg-gray-200", text: "text-gray-500" },
  } as const;
  const t = toneMap[tier];
  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i < score ? t.bar : "bg-gray-200")} />
        ))}
      </div>
      <p className={cn("text-[11px] mt-1.5 font-medium", t.text)}>
        {value ? `${labelMap[tier]} — use 8+ chars, 1 uppercase, 1 number, 1 symbol` : "Use 8+ chars, 1 uppercase, 1 number, 1 symbol"}
      </p>
    </div>
  );
}

export function OtpInput({ value, onChange, length = 6, autoFocus = true }: { value: string; onChange: (v: string) => void; length?: number; autoFocus?: boolean }) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          inputMode="numeric"
          autoFocus={autoFocus && i === 0}
          maxLength={1}
          onChange={(e) => {
            const ch = e.target.value.replace(/[^0-9]/g, "").slice(-1);
            const arr = digits.slice();
            arr[i] = ch;
            onChange(arr.join(""));
            if (ch && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, length);
            if (pasted) {
              e.preventDefault();
              onChange(pasted.padEnd(value.length, "").slice(0, length));
              refs.current[Math.min(pasted.length, length - 1)]?.focus();
            }
          }}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
        />
      ))}
    </div>
  );
}

export function Checkbox({ checked, onChange, label, locked }: {
  checked: boolean; onChange?: (v: boolean) => void; label: React.ReactNode; locked?: boolean;
}) {
  return (
    <label className={cn("flex items-start gap-2.5 cursor-pointer select-none group", locked && "cursor-not-allowed opacity-90")}>
      <span className={cn(
        "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
        checked ? "bg-primary border-primary" : "bg-white border-gray-300 group-hover:border-gray-400",
        locked && "bg-primary/60 border-primary/60",
      )}>
        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only"
      />
      <span className="text-sm text-gray-700 leading-snug">{label}</span>
    </label>
  );
}

export function Alert({ kind, children }: { kind: "error" | "info" | "success" | "warning"; children: React.ReactNode }) {
  const tones = {
    error: "bg-red-50 text-red-700 border-red-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
  } as const;
  return (
    <div className={cn("flex items-start gap-2 text-sm font-medium border rounded-lg px-3 py-2.5", tones[kind])}>
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50/40 via-white to-gray-50 flex items-center justify-center px-4 py-10 font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] p-7 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// Split layout for Register — navy branding panel + form
export function SplitAuthShell({ children, brand }: { children: React.ReactNode; brand: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex font-sans bg-white">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col w-[44%] xl:w-2/5 bg-[#0F172A] text-white relative overflow-hidden p-10 xl:p-14">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative z-10 flex flex-col h-full">
          <Logo size="lg" inverted />
          <div className="my-auto py-12">{brand}</div>
        </div>
      </div>
      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-8 bg-gradient-to-br from-emerald-50/30 via-white to-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6"><Logo size="lg" /></div>
          {children}
        </div>
      </div>
    </div>
  );
}
