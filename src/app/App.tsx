import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import RsvpSheet from "./screens/RsvpSheet";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Otp from "./screens/Otp";
import ForgotPassword from "./screens/ForgotPassword";
import ResetPassword from "./screens/ResetPassword";
import Dashboard from "./screens/Dashboard";
import Settings from "./screens/Settings";
import Onboarding from "./screens/Onboarding";
import Landing from "./screens/Landing";

type ScreenId =
  | "rsvp" | "login" | "register" | "otp" | "forgot" | "reset"
  | "dashboard" | "settings" | "onboarding" | "landing";

const SCREENS: { id: ScreenId; label: string; group: string }[] = [
  { id: "landing", label: "Landing Page", group: "Marketing" },
  { id: "rsvp", label: "RSVP Sheet", group: "App" },
  { id: "dashboard", label: "Dashboard", group: "App" },
  { id: "settings", label: "Settings", group: "App" },
  { id: "onboarding", label: "Onboarding", group: "Flows" },
  { id: "login", label: "Login", group: "Auth" },
  { id: "register", label: "Register", group: "Auth" },
  { id: "otp", label: "OTP Verification", group: "Auth" },
  { id: "forgot", label: "Forgot Password", group: "Auth" },
  { id: "reset", label: "Reset Password", group: "Auth" },
];

function ScreenPicker({ current, onChange }: { current: ScreenId; onChange: (s: ScreenId) => void }) {
  const [open, setOpen] = useState(false);
  const currentLabel = SCREENS.find(s => s.id === current)?.label ?? "Screen";

  const grouped = SCREENS.reduce<Record<string, typeof SCREENS>>((acc, s) => {
    (acc[s.group] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="fixed bottom-4 right-4 z-[100] font-sans">
      <div className="relative">
        {open && (
          <div className="absolute bottom-full right-0 mb-2 w-60 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{group}</div>
                {items.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onChange(s.id); setOpen(false); }}
                    className={
                      "w-full text-left px-3 py-2 text-sm font-medium hover:bg-gray-50 " +
                      (s.id === current ? "text-primary bg-primary/5" : "text-gray-700")
                    }
                  >{s.label}</button>
                ))}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-[#0F172A] text-white text-xs font-semibold rounded-full shadow-lg hover:bg-[#1e293b] transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="uppercase tracking-widest text-[10px] text-gray-400">Screen</span>
          <span>{currentLabel}</span>
          <ChevronDown className={"w-3.5 h-3.5 transition-transform " + (open ? "rotate-180" : "")} />
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>("landing");
  const [currentEventType, setCurrentEventType] = useState<string>("Wedding");
  const [currentEventId, setCurrentEventId] = useState<string>("demo-event-123");
  const [currentEventName, setCurrentEventName] = useState<string>("Event");

  const nav = (s: string, eventType?: string, eventId?: string, eventName?: string) => {
    setScreen(s as ScreenId);
    if (eventType !== undefined) {
      setCurrentEventType(eventType);
    }
    if (eventId !== undefined) {
      setCurrentEventId(eventId);
    }
    if (eventName !== undefined) {
      setCurrentEventName(eventName);
    }
  };

  const render = () => {
    switch (screen) {
      case "rsvp": return <RsvpSheet onNav={nav} eventType={currentEventType} eventId={currentEventId} eventName={currentEventName} />;
      case "login": return <Login onNav={nav} />;
      case "register": return <Register onNav={nav} />;
      case "otp": return <Otp onNav={nav} />;
      case "forgot": return <ForgotPassword onNav={nav} />;
      case "reset": return <ResetPassword onNav={nav} />;
      case "dashboard": return <Dashboard onNav={nav} />;
      case "settings": return <Settings onNav={nav} />;
      case "onboarding": return <Onboarding onNav={nav} />;
      case "landing": return <Landing onNav={nav} />;
      default: return null;
    }
  };

  return (
    <>
      {render()}
      <ScreenPicker current={screen} onChange={setScreen} />
    </>
  );
}
