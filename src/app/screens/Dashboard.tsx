import { useMemo, useState } from "react";
import {
  Home, Calendar, Settings as SettingsIcon, LogOut, Plus, MapPin, MoreHorizontal,
  CalendarDays, Users, FileSpreadsheet, MessageSquare, Sparkles, Crown, ArrowRight, X,
} from "lucide-react";
import { Logo, cn, Alert } from "./_shared";
import CreateEventModal, { EventItem } from "./CreateEventModal";

type Role = "owner" | "admin" | "member";

const DEFAULT_EVENTS: EventItem[] = [
  { id: "1", name: "Ritika & Yash Wedding", location: "ITC Grand Bharat, Gurgaon", eventType: "Wedding", startDate: "2026-12-12", endDate: "2026-12-15", status: "upcoming", sheetCount: 4, totalGuests: 487, checkedIn: 0, notComing: 12, idsPending: 38 },
  { id: "2", name: "Acme Annual Offsite", location: "Taj Aravali, Udaipur", eventType: "Corporate", startDate: "2026-11-02", endDate: "2026-11-05", status: "active", sheetCount: 3, totalGuests: 142, checkedIn: 87, notComing: 4, idsPending: 6 },
  { id: "3", name: "Mehta Sangeet Night", location: "The Leela Palace, Jaipur", eventType: "Social", startDate: "2026-10-28", endDate: "2026-10-28", status: "past", sheetCount: 2, totalGuests: 210, checkedIn: 196, notComing: 14, idsPending: 0 },
];

const TYPE_DOT: Record<EventItem["eventType"], string> = {
  Wedding: "bg-pink-500", Corporate: "bg-blue-500", Social: "bg-purple-500", Other: "bg-gray-400",
};
const TYPE_TONE: Record<EventItem["eventType"], string> = {
  Wedding: "bg-pink-50 text-pink-700", Corporate: "bg-blue-50 text-blue-700", Social: "bg-purple-50 text-purple-700", Other: "bg-gray-100 text-gray-600",
};
const STATUS_TONE: Record<EventItem["status"], string> = {
  upcoming: "bg-amber-50 text-amber-700 ring-amber-100",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  past: "bg-gray-100 text-gray-500 ring-gray-200",
};
const STATUS_LABEL: Record<EventItem["status"], string> = {
  upcoming: "Upcoming", active: "Active", past: "Past",
};

const FILTERS = ["all", "active", "upcoming", "past"] as const;
type Filter = typeof FILTERS[number];

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export function Sidebar({ active, onNav }: { active: "dashboard" | "settings"; onNav?: (s: string) => void }) {
  const items: { id: "dashboard" | "settings"; label: string; icon: React.ComponentType<{ className?: string }>; target: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: Home, target: "dashboard" },
    { id: "settings", label: "Settings", icon: SettingsIcon, target: "settings" },
  ];
  return (
    <aside className="hidden md:flex flex-col w-60 bg-[#0F172A] text-slate-300 shrink-0">
      <div className="h-14 flex items-center px-5 border-b border-white/5">
        <Logo inverted onClick={() => onNav?.("dashboard")} />
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ id, label, icon: Icon, target }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNav?.(target)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
                isActive ? "bg-white/10 text-white shadow-[inset_2px_0_0_0_var(--color-primary)]" : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/5 space-y-1">
        <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 mb-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Crown className="w-3 h-3 text-amber-400" /> Free Plan
          </div>
          <p className="text-xs text-slate-300 mt-1">2 of 2 events used</p>
          <button className="mt-2 w-full text-xs font-semibold text-primary hover:underline text-left">Upgrade to Pro →</button>
        </div>
        <button onClick={() => onNav?.("login")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}

export function Topbar({ company = "Acme Events Pvt Ltd", user = "Priya Sharma", role = "owner", onNav }: { company?: string; user?: string; role?: Role; onNav?: (s: string) => void }) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="md:hidden"><Logo onClick={() => onNav?.("dashboard")} /></div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-semibold text-gray-800">{user}</span>
          <span className="text-[11px] text-[#6A7282]">{company} · <span className="capitalize text-primary font-semibold">{role}</span></span>
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=priya" alt="avatar" />
        </div>
      </div>
    </header>
  );
}

function StatCard({ label, value, hint, icon: Icon, tone }: { label: string; value: number; hint?: string; icon: React.ComponentType<{ className?: string }>; tone: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums">{value.toLocaleString("en-IN")}</p>
          {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", tone)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function EventCard({ ev, onOpen, onEdit, onDelete }: { ev: EventItem; onOpen?: () => void; onEdit?: () => void; onDelete?: () => void }) {
  const [menu, setMenu] = useState(false);
  const sameDay = ev.startDate === ev.endDate;
  return (
    <div className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all relative cursor-pointer flex flex-col" onClick={onOpen}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", TYPE_DOT[ev.eventType])} />
          <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", TYPE_TONE[ev.eventType])}>{ev.eventType}</span>
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setMenu(m => !m)} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                <button onClick={() => { setMenu(false); onEdit?.(); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Edit</button>
                <button onClick={() => { setMenu(false); onDelete?.(); }} className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="mt-3 font-bold text-lg text-gray-900 leading-tight">{ev.name}</h3>
      <p className="text-xs text-[#6A7282] mt-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {ev.location}</p>

      <p className="text-xs text-gray-600 mt-3 flex items-center gap-1.5 font-medium">
        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
        {sameDay ? fmtDate(ev.startDate) : `${fmtDate(ev.startDate)} → ${fmtDate(ev.endDate)}`}
      </p>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1"><FileSpreadsheet className="w-3.5 h-3.5 text-gray-400" /> <span className="font-semibold">{ev.sheetCount}</span> sheets</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" /> <span className="font-semibold">{ev.totalGuests}</span> guests</span>
        </div>
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset", STATUS_TONE[ev.status])}>{STATUS_LABEL[ev.status]}</span>
      </div>
    </div>
  );
}

export default function Dashboard({ onNav }: { onNav?: (s: string) => void }) {
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [showSetup, setShowSetup] = useState(true);
  const [modalPlanState, setModalPlanState] = useState(false);

  const eventsUsed = events.length;
  const planLimitReached = eventsUsed >= 2;

  const filtered = useMemo(() => filter === "all" ? events : events.filter(e => e.status === filter), [events, filter]);

  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === "active").length,
    totalGuestsManaged: events.reduce((s, e) => s + e.totalGuests, 0),
    whatsappMessagesSent: 1247,
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar active="dashboard" onNav={onNav} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onNav={onNav} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Complete Setup banner — shown if onboarding skipped */}
            {showSetup && (
              <div className="bg-gradient-to-r from-primary/5 via-emerald-50 to-white border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Finish setting up InviteSheet</p>
                  <p className="text-xs text-gray-600 mt-0.5">Complete your company profile and create your first event to get the most out of InviteSheet.</p>
                </div>
                <button onClick={() => onNav?.("onboarding")} className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 shadow-sm shrink-0">
                  Complete Setup <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setShowSetup(false)} className="text-gray-400 hover:text-gray-700 p-1 shrink-0"><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Plan limit alert */}
            {planLimitReached && (
              <Alert kind="warning">
                You have reached the free plan limit of 2 events. <button className="underline font-bold hover:no-underline">Upgrade to Pro</button> to create unlimited events.
              </Alert>
            )}

            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Events</h1>
                <p className="text-sm text-gray-500 mt-1">Plan, track, and run every event from one place.</p>
              </div>
              <button
                onClick={() => { setModalPlanState(planLimitReached); setShowModal(true); }}
                disabled={planLimitReached}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Plus className="w-4 h-4" /> Create Event
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Events" value={stats.totalEvents} hint="Across all time" icon={Calendar} tone="bg-primary/10 text-primary" />
              <StatCard label="Active Events" value={stats.activeEvents} hint="Happening now" icon={Sparkles} tone="bg-amber-100 text-amber-600" />
              <StatCard label="Guests Managed" value={stats.totalGuestsManaged} hint="All events combined" icon={Users} tone="bg-blue-100 text-blue-600" />
              <StatCard label="WhatsApp Sent" value={stats.whatsappMessagesSent} hint="Last 30 days" icon={MessageSquare} tone="bg-emerald-100 text-emerald-600" />
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 border-b border-gray-200">
              {FILTERS.map(f => {
                const count = f === "all" ? events.length : events.filter(e => e.status === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px capitalize flex items-center gap-1.5",
                      filter === f ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-700",
                    )}
                  >
                    {f}
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums", filter === f ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500")}>{count}</span>
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No events here yet</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  {events.length === 0 ? "Create your first event to start building guest sheets and tracking check-ins." : `You have no ${filter} events. Try a different filter.`}
                </p>
                {events.length === 0 && (
                  <button onClick={() => { setModalPlanState(planLimitReached); setShowModal(true); }} className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm">
                    <Plus className="w-4 h-4" /> Create your first event
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(ev => (
                  <EventCard
                    key={ev.id}
                    ev={ev}
                    onOpen={() => onNav?.("rsvp", ev.eventType, ev.id, ev.name)}
                    onEdit={() => { setEditingEvent(ev); setShowModal(true); }}
                    onDelete={() => setEvents(es => es.filter(e => e.id !== ev.id))}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateEventModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingEvent(null); }}
        onCreate={(ev) => {
          if (editingEvent) {
            // Update existing event
            setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...ev } : e));
          } else {
            // Create new event
            setEvents(prev => [{ ...ev, id: String(Date.now()), status: "upcoming", sheetCount: 1, totalGuests: 0, checkedIn: 0, notComing: 0, idsPending: 0 }, ...prev]);
          }
          setShowModal(false);
          setEditingEvent(null);
        }}
        editEvent={editingEvent}
        planLimitReached={modalPlanState}
      />
    </div>
  );
}
