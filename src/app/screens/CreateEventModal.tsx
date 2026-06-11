import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X, Upload, Calendar, MapPin, ChevronDown, ArrowLeft, Lightbulb, FileSpreadsheet, Trash2, Check,
  ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import { Field, SecondaryButton, Checkbox, Alert, cn } from "./_shared";

export type EventType = "Wedding" | "Corporate" | "Social" | "Other";
export type EventStatus = "upcoming" | "active" | "past";

export interface EventItem {
  id: string;
  name: string;
  location: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  status: EventStatus;
  sheetCount: number;
  totalGuests: number;
  checkedIn: number;
  notComing: number;
  idsPending: number;
  defaultColumns?: string[];
}

type Step = "details" | "columns" | "success";

// Teal primary override per spec
const TEAL = "#0D9488";
const tealBtn = "bg-[#0D9488] hover:bg-[#0B7F75] text-white";

// Column rows (Name + Contact Number are locked / always on; Check-In is a hidden system column)
const LOCKED = ["Name", "Contact Number", "Check-In"] as const;

type ColumnRow = {
  key: string;
  label: string;
  options?: string[]; // present → expandable
  defaultChecked?: boolean;
};

const COLUMNS: ColumnRow[] = [
  { key: "pax", label: "No. of Pax", defaultChecked: true },
  { key: "kids", label: "No. of Kids" },
  { key: "arrival", label: "Arrival Date", defaultChecked: true },
  { key: "departure", label: "Departure Date", defaultChecked: true },
  { key: "room", label: "Room Number" },
  { key: "ids", label: "ID's", options: ["Aadhaar", "Passport", "Voter ID", "Driving Licence", "Other", "Pending"] },
  { key: "travel", label: "Travel Plan", options: ["By Car", "By Train", "By Flight", "By Bus", "Not Decided"] },
  { key: "status", label: "Guest Status", options: ["Confirmed", "Not Coming", "VIP", "Dont Call", "Wrong Number", "Pending"] },
  { key: "comments", label: "Comments" },
];

export default function CreateEventModal({ open, onClose, onCreate, editEvent, planLimitReached }: {
  open: boolean;
  onClose: () => void;
  onCreate: (ev: Omit<EventItem, "id" | "status" | "sheetCount" | "totalGuests" | "checkedIn" | "notComing" | "idsPending">) => void;
  editEvent?: EventItem | null;
  planLimitReached?: boolean;
}) {
  const [step, setStep] = useState<Step>("details");

  // Details state - initialize with editEvent if provided
  const [name, setName] = useState(editEvent?.name || "");
  const [eventType, setEventType] = useState<EventType>(editEvent?.eventType || "Wedding");
  const [startDate, setStartDate] = useState(editEvent?.startDate || "");
  const [endDate, setEndDate] = useState(editEvent?.endDate || "");
  const [location, setLocation] = useState(editEvent?.location || "");


  // Columns state
  const [cols, setCols] = useState<Record<string, boolean>>(
    Object.fromEntries(COLUMNS.map(c => [c.key, !!c.defaultChecked])),
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Reset form when editEvent changes or modal opens
  useEffect(() => {
    if (open) {
      setName(editEvent?.name || "");
      setEventType(editEvent?.eventType || "Wedding");
      setStartDate(editEvent?.startDate || "");
      setEndDate(editEvent?.endDate || "");
      setLocation(editEvent?.location || "");
      setStep("details");
      setCols(Object.fromEntries(COLUMNS.map(c => [c.key, !!c.defaultChecked])));
      setExpanded({});
    }
  }, [open, editEvent]);

  if (!open) return null;

  const reset = () => {
    setStep("details"); setName(""); setEventType("Wedding"); setStartDate(""); setEndDate(""); setLocation("");
    setCols(Object.fromEntries(COLUMNS.map(c => [c.key, !!c.defaultChecked]))); setExpanded({});
  };
  const close = () => { reset(); onClose(); };

  const parseDmy = (v: string) => { const [d, m, y] = v.split("/"); return y && m && d ? `${y}-${m}-${d}` : v; };
  const endDateError = startDate && endDate && parseDmy(endDate) < parseDmy(startDate) ? "End date cannot be before start date." : undefined;
  const detailsValid = name.length >= 2 && location.length >= 2 && startDate && endDate && !endDateError && (!planLimitReached || !!editEvent);

  const finalize = () => {
    setStep("success");
    // Map modal column keys to RSVP field names
    const KEY_TO_FIELD: Record<string, string> = {
      pax: "pax", kids: "kids", arrival: "arrival", departure: "departure",
      room: "roomNo", ids: "idType", travel: "travel", status: "status", comments: "comments",
    };
    const selectedColumns = Object.entries(cols)
      .filter(([, enabled]) => enabled)
      .map(([key]) => KEY_TO_FIELD[key] || key);
    console.log('[DEBUG] CreateEventModal finalize()', { selectedCols: Object.entries(cols).filter(([, v]) => v).map(([k]) => k), mappedDefaultColumns: selectedColumns });
    // Wait a bit before calling onCreate to show the success animation
    setTimeout(() => {
      onCreate({ name, location, eventType, startDate, endDate, defaultColumns: selectedColumns });
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={close}
    >
      {/* DETAILS — page-style card */}
      {step === "details" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-7 sm:p-9 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 min-h-[680px] max-h-[96vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between mb-1">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: TEAL }}>
              <Calendar className="w-5 h-5" />
            </div>
            <button onClick={close} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 tracking-tight mt-4">
            {editEvent ? "Edit Event" : "Create New Event"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {editEvent ? "Update the event details below." : "Fill in the event details to get started."}
          </p>

          <div className="mt-6 space-y-4">
            {planLimitReached && !editEvent && (
              <Alert kind="warning">You have reached the free plan limit of 2 events. Upgrade to Pro to create unlimited events.</Alert>
            )}

            <Field label={<>Event Name <span className="text-red-500">*</span></>} value={name} onChange={setName} placeholder="e.g., Sharma Wedding" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DatePickerField label={<>Start Date <span className="text-red-500">*</span></>} value={startDate} onChange={setStartDate} />
              <DatePickerField label={<>End Date <span className="text-red-500">*</span></>} value={endDate} onChange={setEndDate} error={endDateError} />
            </div>

            <SelectField
              label="Event Type"
              required
              value={eventType}
              onChange={(v) => setEventType(v as EventType)}
              options={["Wedding", "Corporate", "Social", "Other"]}
            />

            <Field
              label={<>Location <span className="text-red-500">*</span></>}
              value={location}
              onChange={setLocation}
              placeholder="e.g., The Grand Palace, Mumbai"
              prefix={<MapPin className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => editEvent ? finalize() : setStep("columns")}
              disabled={!detailsValid}
              className={cn(
                "px-4 py-3 text-sm font-bold rounded-lg shadow-sm transition-all",
                tealBtn,
                "disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none",
              )}
            >
              {editEvent ? "Save Changes" : "Continue"}
            </button>
            <button onClick={close} className="px-4 py-3 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}


      {/* COLUMNS */}
      {step === "columns" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 max-h-[90vh] flex flex-col"
        >
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setStep("details")} className="text-gray-400 hover:text-gray-700 p-1 -ml-1" aria-label="Back">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">Select Default Columns</h2>
            </div>
            <button onClick={close} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6">
            <p className="text-sm text-gray-500">Choose which columns to include in your guest list.</p>
            <p className="text-xs text-gray-400 mt-1">These columns will apply to Groom Side, Bride Side, and Friends sheets.</p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {/* Locked */}
            {LOCKED.map(label => (
              <div key={label} className="flex items-center gap-3 bg-[#0D9488]/5 border border-[#0D9488]/20 rounded-lg px-3.5 py-2.5">
                <span className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ backgroundColor: TEAL }}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
                <span className="text-sm font-semibold text-gray-900 flex-1">{label}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Required</span>
              </div>
            ))}

            {/* Optional */}
            {COLUMNS.map(col => {
              const checked = !!cols[col.key];
              const isOpen = !!expanded[col.key];
              return (
                <div key={col.key} className={cn("rounded-lg border transition-colors", checked ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200")}>
                  <div className="flex items-center gap-3 px-3.5 py-2.5">
                    <button
                      type="button"
                      onClick={() => setCols(p => ({ ...p, [col.key]: !checked }))}
                      className={cn(
                        "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-all",
                        checked ? "border-transparent" : "border-gray-300 bg-white hover:border-gray-400",
                      )}
                      style={checked ? { backgroundColor: TEAL } : undefined}
                      aria-label={`Toggle ${col.label}`}
                    >
                      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>
                    <span className="text-sm font-semibold text-gray-900 flex-1">{col.label}</span>
                    {col.options && (
                      <button
                        type="button"
                        onClick={() => setExpanded(p => ({ ...p, [col.key]: !isOpen }))}
                        className="text-gray-400 hover:text-gray-700 p-1 -mr-1"
                        aria-label={`Toggle ${col.label} options`}
                      >
                        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  {col.options && isOpen && (
                    <div className="px-3.5 pb-3 pt-1 border-t border-gray-200/70">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Default options</p>
                      <div className="flex flex-wrap gap-1.5">
                        {col.options.map(o => (
                          <span key={o} className="px-2 py-0.5 rounded bg-white border border-gray-200 text-[11px] font-semibold text-gray-700">{o}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2.5 mt-3">
              <Lightbulb className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-xs text-sky-800 leading-relaxed font-medium">
                You can add more custom columns later from the live event screen.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 p-4 grid grid-cols-2 gap-3 bg-gray-50/50 rounded-b-2xl">
            <button onClick={close} className="px-4 py-3 bg-white text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={finalize} className={cn("px-4 py-3 text-sm font-bold rounded-lg shadow-sm transition-all", tealBtn)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {step === "success" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-300" style={{ backgroundColor: TEAL }}>
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Event Created!</h2>
            <p className="text-sm text-gray-500">Setting up your RSVP sheet...</p>
          </div>
        </div>
      )}
    </div>
  );
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const POPOVER_H = 292; // estimated calendar height for flip calculation

function DatePickerField({ label, value, onChange, error }: {
  label: React.ReactNode; value: string; onChange: (v: string) => void; error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const parseDmy = (v: string): Date | null => {
    const parts = v.split("/");
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y || y < 1000) return null;
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (date: Date): string => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${d}/${m}/${date.getFullYear()}`;
  };

  const openPicker = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const flipUp = window.innerHeight - rect.bottom < POPOVER_H + 8;
    setPopoverStyle({
      position: "fixed",
      left: rect.left,
      width: 256,
      zIndex: 9999,
      ...(flipUp ? { bottom: window.innerHeight - rect.top + 6 } : { top: rect.bottom + 6 }),
    });
    const base = parseDmy(value) ?? (() => { const t = new Date(); t.setHours(0,0,0,0); return t; })();
    setViewDate(new Date(base.getFullYear(), base.getMonth(), 1));
    setOpen(true);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const selectedDate = parseDmy(value);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const popover = open ? createPortal(
    <div
      ref={popoverRef}
      style={popoverStyle}
      className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64"
    >
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-gray-900">{MONTH_NAMES[month]} {year}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
          <span key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDow }, (_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const isToday = date.getTime() === today.getTime();
          const isSelected = !!selectedDate && date.getTime() === selectedDate.getTime();
          return (
            <button
              key={day}
              type="button"
              onClick={() => { onChange(formatDate(date)); setOpen(false); }}
              className={cn(
                "w-8 h-8 mx-auto text-[13px] rounded-full flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-[#0D9488] text-white font-bold"
                  : isToday
                  ? "border border-[#0D9488] text-[#0D9488] font-semibold"
                  : "hover:bg-gray-100 text-gray-700",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div ref={containerRef} className="block">
      <span className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider">{label}</span>
      <div className={cn(
        "mt-1.5 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 transition-all",
        "focus-within:ring-2 focus-within:ring-[#0D9488]/20 focus-within:border-[#0D9488] focus-within:bg-white",
        error && "border-red-300 focus-within:ring-red-100 focus-within:border-red-400 bg-red-50/30",
      )}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="dd/mm/yyyy"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => open ? setOpen(false) : openPicker()}
          className="ml-2 text-gray-400 hover:text-[#0D9488] transition-colors shrink-0"
          aria-label="Open date picker"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>
      {error && (
        <span className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </span>
      )}
      {popover}
    </div>
  );
}

function SelectField({ label, required, value, onChange, options }: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider">
        {label} {required && <span className="text-red-500 normal-case">*</span>}
      </span>
      <div className="mt-1.5 relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-9 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] focus:bg-white transition-all"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </label>
  );
}
