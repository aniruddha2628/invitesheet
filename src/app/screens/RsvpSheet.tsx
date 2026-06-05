import React, { useState, useMemo, useCallback, useRef, useEffect, useImperativeHandle } from "react";
import { AgGridReact } from "ag-grid-react";
import { 
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  GridReadyEvent,
  RowClassParams,
  ICellRendererParams,
  CellValueChangedEvent,
  themeQuartz
} from "ag-grid-community";

const gridTheme = themeQuartz.withParams({
  columnBorder: { style: "solid", width: 1, color: "#e5e7eb" },
  headerColumnBorder: { style: "solid", width: 1, color: "#e5e7eb" },
});
// Remove theme CSS imports to use the new Theming API (defaults to Quartz in v33+)
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  Search,
  Plus,
  Download,
  Upload,
  LayoutGrid,
  User,
  MoreHorizontal,
  Bell,
  X,
  ChevronDown,
  Lock,
  AlertCircle,
  Pencil,
  FilePlus,
  Copy as CopyIcon,
  Trash2,
  EyeOff,
  Eye,
  Menu as MenuIcon,
  Scissors,
  Clipboard,
  ChevronRight,
  ArrowLeftToLine,
  ArrowRightToLine,
  Eraser,
  ListChecks,
  GripVertical,
  ChevronUp,
  XCircle,
  MessageSquare,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Logo } from "./_shared";

// --- Registry & Theme Setup ---
ModuleRegistry.registerModules([AllCommunityModule]);

// Sandbox injects data-fg-* attributes which AG Grid v33 rejects.
// Strip them before forwarding to AgGridReact.
const CleanGrid = React.forwardRef<AgGridReact, any>((props, ref) => {
  const cleaned: Record<string, unknown> = { ref };
  for (const key in props) {
    if (!key.startsWith("data-fg")) cleaned[key] = props[key];
  }
  // Use createElement to avoid the sandbox JSX transform re-injecting data-fg* attrs.
  return React.createElement(AgGridReact as any, cleaned);
});
CleanGrid.displayName = "CleanGrid";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type GuestStatus = "Confirmed" | "Not Coming" | "VIP" | "Dont Call" | "Wrong Number" | "Pending";
type IDType = "Aadhaar" | "Passport" | "Voter ID" | "Driving Licence" | "Other" | "Pending";
type TravelType = "By Train" | "By Flight" | "By Car" | "By Bus" | "Not Decided";

interface Guest {
  id: string;
  srNo: number;
  name: string;
  contact: string;
  checkIn: boolean;
  status: GuestStatus;
  idType: IDType;
  pax: number;
  roomNo: string;
  travel: TravelType;
  arrival: string;
  departure: string;
  comments: string;
}

interface Counter {
  id: string;
  label: string;
  count: number;
  color: string;
  filterKey?: keyof Guest | 'all';
  filterValue?: any;
}

// --- Mock Data ---
const makeBlankSheet = (prefix = "row"): Guest[] => Array.from({ length: 50 }, (_, i) => ({
  id: `${prefix}-${i}-${Math.random().toString(36).slice(2, 7)}`,
  srNo: i + 1,
  name: "",
  contact: "",
  checkIn: false,
  status: "" as GuestStatus,
  idType: "" as IDType,
  pax: null as unknown as number,
  roomNo: "",
  travel: "" as TravelType,
  arrival: "",
  departure: "",
  comments: "",
}));

const MOCK_GUESTS: Guest[] = Array.from({ length: 50 }, (_, i) => ({
  id: `g-${i}`,
  srNo: i + 1,
  name: "",
  contact: "",
  checkIn: false,
  status: "" as GuestStatus,
  idType: "" as IDType,
  pax: null as unknown as number,
  roomNo: "",
  travel: "" as TravelType,
  arrival: "",
  departure: "",
  comments: "",
}));

// --- Custom Components & Renderers ---

const CheckInRenderer = (params: ICellRendererParams) => {
  const [checked, setChecked] = useState(params.value);
  const isNotComing = params.data.status === "Not Coming";

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const performToggle = () => {
      const newValue = !checked;
      setChecked(newValue);
      params.setValue(newValue);
      toast.success(`${params.data.name} ${newValue ? 'checked in' : 'checked out'}`);
    };

    if (!checked && isNotComing) {
      if (confirm(`This guest is marked as Not Coming. Check in anyway?`)) {
        performToggle();
      }
    } else {
      performToggle();
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <button
        onClick={toggle}
        className={cn(
          "w-10 h-5 rounded-full transition-colors relative flex items-center px-1",
          checked ? "bg-primary" : "bg-gray-300"
        )}
      >
        <div className={cn(
          "w-3 h-3 bg-white rounded-full transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )} />
      </button>
    </div>
  );
};

// --- Main App Component ---

export default function RsvpSheet({
  onNav,
  eventType = "Wedding",
  eventId = "demo-event-123",
  eventName = "Event"
}: {
  onNav?: (s: string) => void;
  eventType?: string;
  eventId?: string;
  eventName?: string;
}) {
  // Determine initial sheets based on event type
  const getInitialSheets = (type: string): string[] => {
    const normalizedType = type.toLowerCase();
    if (normalizedType === "wedding") {
      return ["Groom Side", "Bride Side", "Friends"];
    }
    // Corporate, Social, Other, or any other type gets a single sheet
    return ["Sheet1"];
  };

  const INITIAL_RSVP_SHEETS = getInitialSheets(eventType);

  const rsvpColumns: ColumnMeta[] = useMemo(() => [
    { field: "srNo", headerName: "Sr No", width: 60, minWidth: 60, resizable: false, editable: false, pinned: "left", locked: true },
    { field: "name", headerName: "Guest Name", width: 200, minWidth: 200, pinned: "left", locked: true },
    { field: "contact", headerName: "Contact", width: 150, minWidth: 150, locked: true },
    { field: "checkIn", headerName: "Check In", width: 100, minWidth: 100, resizable: false, locked: true, type: "checkin" },
    { field: "status", headerName: "Status", width: 140, minWidth: 140, type: "status", options: ["Confirmed", "Not Coming", "VIP", "Dont Call", "Wrong Number", "Pending"] },
    { field: "idType", headerName: "ID Type", width: 130, minWidth: 130, type: "idType", options: ["Aadhaar", "Passport", "Voter ID", "Driving Licence", "Other", "Pending"] },
    { field: "pax", headerName: "Pax", width: 80, minWidth: 80, type: "number" },
    { field: "roomNo", headerName: "Room No.", width: 100, minWidth: 100, type: "text" },
    { field: "travel", headerName: "Travel", width: 130, minWidth: 130, type: "select", options: ["By Train", "By Flight", "By Car", "By Bus", "Not Decided"] },
    { field: "arrival", headerName: "Arrival", width: 130, minWidth: 130, type: "date" },
    { field: "departure", headerName: "Departure", width: 130, minWidth: 130, type: "date" },
    { field: "comments", headerName: "Comments", minWidth: 200, flex: 1, type: "text" },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  const customColumns: ColumnMeta[] = useMemo(() => [
    { field: "srNo", headerName: "Sr No", width: 60, minWidth: 60, resizable: false, editable: false, pinned: "left", locked: true },
    { field: "col1", headerName: "", width: 150, minWidth: 80, type: "text" },
    { field: "col2", headerName: "", width: 150, minWidth: 80, type: "text" },
    { field: "col3", headerName: "", width: 150, minWidth: 80, type: "text" },
    { field: "col4", headerName: "", width: 150, minWidth: 80, type: "text" },
    { field: "col5", headerName: "", width: 150, minWidth: 80, type: "text" },
    { field: "col6", headerName: "", width: 150, minWidth: 80, type: "text" },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);
  const [sheets, setSheets] = useState<Record<string, Guest[]>>(() => {
    const s: Record<string, Guest[]> = {};
    for (const n of INITIAL_RSVP_SHEETS) s[n] = makeBlankSheet(n.toLowerCase().replace(/\s/g, "-"));
    return s;
  });
  const [sheetOrder, setSheetOrder] = useState<string[]>([...INITIAL_RSVP_SHEETS]);
  const [sheetTypes, setSheetTypes] = useState<Record<string, "rsvp" | "custom">>(() => {
    const m: Record<string, "rsvp" | "custom"> = {};
    for (const n of INITIAL_RSVP_SHEETS) m[n] = "rsvp";
    return m;
  });
  const [currentTab, setCurrentTab] = useState(INITIAL_RSVP_SHEETS[0]);
  const [lastActiveSheetId, setLastActiveSheetId] = useState<string | null>(null);
  const [addSheetName, setAddSheetName] = useState<string | null>(null);
  const isRsvpSheet = (sheetTypes[currentTab] ?? "rsvp") === "rsvp";
  const rowData = sheets[currentTab] ?? [];
  const setRowData = useCallback((updater: Guest[] | ((prev: Guest[]) => Guest[])) => {
    setSheets(prev => {
      const current = prev[currentTab] ?? [];
      const next = typeof updater === "function" ? (updater as (p: Guest[]) => Guest[])(current) : updater;
      return { ...prev, [currentTab]: next };
    });
  }, [currentTab]);
  const openAddSheet = useCallback(() => {
    setAddSheetName("");
  }, []);
  const confirmAddSheet = useCallback(() => {
    const raw = (addSheetName ?? "").trim();
    if (!raw) { setAddSheetName(null); return; }
    setSheetOrder(prev => {
      let name = raw;
      let i = 2;
      while (prev.includes(name)) { name = `${raw} ${i}`; i++; }
      setSheets(s => ({ ...s, [name]: makeBlankSheet(name.toLowerCase().replace(/\s/g, "-")) }));
      setSheetTypes(t => ({ ...t, [name]: "custom" }));
      setAllColumns(c => ({ ...c, [name]: customColumns }));
      setCurrentTab(name);
      return [...prev, name];
    });
    setAddSheetName(null);
  }, [addSheetName, customColumns]);

  const [hiddenSheets, setHiddenSheets] = useState<string[]>([]);
  const [tabMenu, setTabMenu] = useState<{ x: number; y: number; tab: string } | null>(null);
  const [hiddenListOpen, setHiddenListOpen] = useState(false);
  const [renamingTab, setRenamingTab] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!tabMenu) return;
    const close = () => setTabMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTabMenu(null); };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("click", close); window.removeEventListener("contextmenu", close); window.removeEventListener("keydown", onKey); };
  }, [tabMenu]);

  const uniqueName = (base: string, existing: string[]) => {
    if (!existing.includes(base)) return base;
    let i = 2;
    while (existing.includes(`${base} ${i}`)) i++;
    return `${base} ${i}`;
  };

  const insertSheetAfter = (tab: string) => {
    setSheetOrder(prev => {
      const name = uniqueName("Sheet", prev);
      setSheets(s => ({ ...s, [name]: makeBlankSheet(name.toLowerCase().replace(/\s/g, "-")) }));
      setSheetTypes(t => ({ ...t, [name]: "custom" }));
      setAllColumns(c => ({ ...c, [name]: customColumns }));
      const idx = prev.indexOf(tab);
      const next = [...prev];
      next.splice(idx + 1, 0, name);
      setCurrentTab(name);
      return next;
    });
  };
  const duplicateSheet = (tab: string) => {
    setSheetOrder(prev => {
      const name = uniqueName(`Copy of ${tab}`, prev);
      setSheets(s => ({ ...s, [name]: makeBlankSheet(name.toLowerCase().replace(/\s/g, "-")) }));
      setSheetTypes(t => ({ ...t, [name]: t[tab] ?? "rsvp" }));
      setAllColumns(c => ({ ...c, [name]: c[tab] ?? (sheetTypes[tab] === "custom" ? customColumns : rsvpColumns) }));
      const idx = prev.indexOf(tab);
      const next = [...prev];
      next.splice(idx + 1, 0, name);
      setCurrentTab(name);
      return next;
    });
  };
  const deleteSheet = (tab: string) => {
    setSheetOrder(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.filter(t => t !== tab);
      setSheets(s => { const c = { ...s }; delete c[tab]; return c; });
      setSheetTypes(t => { const c = { ...t }; delete c[tab]; return c; });
      setAllColumns(c => { const n = { ...c }; delete n[tab]; return n; });
      setAllHiddenColumns(c => { const n = { ...c }; delete n[tab]; return n; });
      if (currentTab === tab) setCurrentTab(next[0]);
      return next;
    });
    setHiddenSheets(h => h.filter(t => t !== tab));
    setDeleteConfirm(null);
  };
  const hideSheet = (tab: string) => {
    setHiddenSheets(h => h.includes(tab) ? h : [...h, tab]);
    const visible = sheetOrder.filter(t => t !== tab && !hiddenSheets.includes(t));
    if (currentTab === tab && visible[0]) setCurrentTab(visible[0]);
  };
  const unhideSheet = (tab: string) => setHiddenSheets(h => h.filter(t => t !== tab));
  const startRename = (tab: string) => { setRenamingTab(tab); setRenameValue(tab); };
  const commitRename = () => {
    if (!renamingTab) return;
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === renamingTab || sheetOrder.includes(trimmed)) { setRenamingTab(null); return; }
    setSheetOrder(prev => prev.map(t => t === renamingTab ? trimmed : t));
    setSheets(prev => { const c: Record<string, Guest[]> = {}; for (const k in prev) c[k === renamingTab ? trimmed : k] = prev[k]; return c; });
    setSheetTypes(prev => { const c: Record<string, "rsvp" | "custom"> = {}; for (const k in prev) c[k === renamingTab ? trimmed : k] = prev[k]; return c; });
    setAllColumns(prev => { const c: Record<string, ColumnMeta[]> = {}; for (const k in prev) c[k === renamingTab ? trimmed : k] = prev[k]; return c; });
    setAllHiddenColumns(prev => { const c: Record<string, string[]> = {}; for (const k in prev) c[k === renamingTab ? trimmed : k] = prev[k]; return c; });
    setHiddenSheets(prev => prev.map(t => t === renamingTab ? trimmed : t));
    if (currentTab === renamingTab) setCurrentTab(trimmed);
    setRenamingTab(null);
  };
  const [viewMode, setViewMode] = useState<"guest" | "room">("guest");
  const [showTip, setShowTip] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showSmsResult, setShowSmsResult] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [smsRecipientType, setSmsRecipientType] = useState("all-sheets");
  const [smsResult, setSmsResult] = useState<{ sent: number; failed: number; skipped: number; failedNames: string[] } | null>(null);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [showIdBanner, setShowIdBanner] = useState(true);
  const [showCheckinBanner, setShowCheckinBanner] = useState(false);
  const gridRef = useRef<AgGridReact>(null);

  const filledRows = rowData.filter(g => (g.name && g.name.trim()) || (g.contact && g.contact.trim()));
  const totalGuests = filledRows.length;
  const guestsWithRoomNumber = filledRows.filter(g => g.roomNo && g.roomNo.trim() !== "");

  const counterRows = useMemo(() => {
    if (viewMode === "room") {
      const combined = Object.entries(sheets)
        .filter(([name]) => (sheetTypes[name] ?? "rsvp") === "rsvp")
        .flatMap(([, rows]) => rows);
      return combined.filter(g => (g.name && g.name.trim()) || (g.contact && g.contact.trim()));
    }
    return filledRows;
  }, [viewMode, sheets, sheetTypes, filledRows]);

  const counters: Counter[] = [
    { id: "all", label: "Total Guests", count: counterRows.length, color: "bg-gray-500", filterKey: 'all' },
    { id: "arrived", label: "Checked In", count: counterRows.filter(g => g.checkIn).length, color: "bg-green-500", filterKey: 'checkIn', filterValue: true },
    { id: "not-arrived", label: "Not Arrived", count: counterRows.filter(g => !g.checkIn && g.status !== 'Not Coming').length, color: "bg-gray-400", filterKey: 'checkIn', filterValue: false },
    { id: "not-coming", label: "Not Coming", count: counterRows.filter(g => g.status === 'Not Coming').length, color: "bg-red-500", filterKey: 'status', filterValue: 'Not Coming' },
    { id: "ids-pending", label: "IDs Pending", count: counterRows.filter(g => (!g.idType || g.idType === 'Pending') && g.status !== 'Not Coming').length, color: "bg-orange-500", filterKey: 'idType', filterValue: 'Pending' },
    { id: "ids-received", label: "IDs Received", count: counterRows.filter(g => g.idType && g.idType !== 'Pending').length, color: "bg-blue-500", filterKey: 'idType', filterValue: 'Aadhaar' },
    { id: "vip", label: "VIP", count: counterRows.filter(g => g.status === 'VIP').length, color: "bg-purple-500", filterKey: 'status', filterValue: 'VIP' },
  ];

  // --- Column meta state (drives colDefs) ---
  type ColumnMeta = {
    field: string;
    headerName: string;
    locked?: boolean;
    width?: number;
    minWidth?: number;
    flex?: number;
    resizable?: boolean;
    editable?: boolean;
    pinned?: "left" | "right";
    type?: "text" | "number" | "date" | "select" | "dropdown" | "checkin" | "status" | "idType";
    options?: string[];
    allowMultiple?: boolean;
  };


  const [allColumns, setAllColumns] = useState<Record<string, ColumnMeta[]>>(() => {
    const m: Record<string, ColumnMeta[]> = {};
    for (const n of INITIAL_RSVP_SHEETS) m[n] = rsvpColumns;
    return m;
  });
  const [allHiddenColumns, setAllHiddenColumns] = useState<Record<string, string[]>>({});

  const columns: ColumnMeta[] = allColumns[currentTab] ?? (isRsvpSheet ? rsvpColumns : customColumns);
  const hiddenColumns: string[] = allHiddenColumns[currentTab] ?? [];

  const setColumns = useCallback((updater: ColumnMeta[] | ((prev: ColumnMeta[]) => ColumnMeta[])) => {
    setAllColumns(prev => {
      const current = prev[currentTab] ?? (isRsvpSheet ? rsvpColumns : customColumns);
      const next = typeof updater === "function" ? (updater as (p: ColumnMeta[]) => ColumnMeta[])(current) : updater;
      return { ...prev, [currentTab]: next };
    });
  }, [currentTab, isRsvpSheet, rsvpColumns, customColumns]);

  const setHiddenColumns = useCallback((updater: string[] | ((prev: string[]) => string[])) => {
    setAllHiddenColumns(prev => {
      const current = prev[currentTab] ?? [];
      const next = typeof updater === "function" ? (updater as (p: string[]) => string[])(current) : updater;
      return { ...prev, [currentTab]: next };
    });
  }, [currentTab]);
  const [headerMenu, setHeaderMenu] = useState<{ x: number; y: number; field: string } | null>(null);
  const [pasteSpecialOpen, setPasteSpecialOpen] = useState(false);
  const [insertColModal, setInsertColModal] = useState<{ position: "left" | "right"; anchorField: string } | null>(null);
  const [deleteColConfirm, setDeleteColConfirm] = useState<string | null>(null);
  const [renameColModal, setRenameColModal] = useState<string | null>(null);
  const [dropdownModal, setDropdownModal] = useState<string | null>(null);

  // --- Row selection / row context menu state ---
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [lastSelectedRowId, setLastSelectedRowId] = useState<string | null>(null);
  const [hiddenRows, setHiddenRows] = useState<string[]>([]);
  const [rowMenu, setRowMenu] = useState<{ x: number; y: number; ids: string[] } | null>(null);
  const [rowPasteSpecialOpen, setRowPasteSpecialOpen] = useState(false);
  const rowClipboardRef = useRef<{ rows: Guest[]; mode: "copy" | "cut" } | null>(null);

  const visibleRowData = useMemo(
    () => rowData.filter(r => !hiddenRows.includes(r.id)),
    [rowData, hiddenRows]
  );

  const handleRowSelect = useCallback((id: string, mods: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }) => {
    const ids = visibleRowData.map(r => r.id);
    if (mods.shiftKey && lastSelectedRowId) {
      const a = ids.indexOf(lastSelectedRowId);
      const b = ids.indexOf(id);
      if (a >= 0 && b >= 0) {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        setSelectedRowIds(ids.slice(lo, hi + 1));
        return;
      }
    }
    if (mods.ctrlKey || mods.metaKey) {
      setSelectedRowIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      setLastSelectedRowId(id);
      return;
    }
    setSelectedRowIds([id]);
    setLastSelectedRowId(id);
  }, [visibleRowData, lastSelectedRowId]);

  const colDefs = useMemo<ColDef[]>(() => {
    const lockedFields = new Set(columns.filter(c => c.locked).map(c => c.field));
    const buildHeaderTemplate = (name: string, locked: boolean) =>
      locked
        ? `<div class="flex items-center gap-2"><span>${name}</span><i class="lucide-lock text-gray-400 w-3 h-3"></i></div>`
        : undefined;

    const defs: ColDef[] = columns
      .filter(c => !hiddenColumns.includes(c.field))
      .map<ColDef>(c => {
        const base: ColDef = {
          field: c.field,
          headerName: c.headerName,
          width: c.width,
          minWidth: c.minWidth,
          flex: c.flex,
          resizable: c.resizable !== false,
          editable: c.editable !== false && c.field !== "srNo" && c.type !== "checkin",
          pinned: c.pinned,
        };
        if (c.field === "srNo") {
          base.valueGetter = (p: any) => (p.node?.rowIndex ?? 0) + 1;
          base.cellStyle = (p: any) => ({
            backgroundColor: selectedRowIds.includes(p.data?.id) ? "#bfdbfe" : "#f9fafb",
            display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
            cursor: "pointer", userSelect: "none",
          });
        }
        if (lockedFields.has(c.field)) {
          base.headerComponentParams = { template: buildHeaderTemplate(c.headerName, true) };
        }
        switch (c.type) {
          case "checkin":
            base.cellRenderer = CheckInRenderer;
            break;
          case "status":
            base.cellEditor = "agSelectCellEditor";
            base.cellEditorParams = { values: c.options ?? [] };
            base.singleClickEdit = true;
            base.cellRenderer = (params: ICellRendererParams) => {
              if (!params.value) return null;
              const colors: Record<string, string> = {
                "Confirmed": "text-green-600 bg-green-50",
                "Not Coming": "text-red-600 bg-red-50",
                "VIP": "text-purple-600 bg-purple-50",
                "Pending": "text-orange-600 bg-orange-50"
              };
              return (
                <span className={cn("px-2 py-0.5 rounded text-[11px] font-bold uppercase", colors[params.value] || "text-gray-600 bg-gray-50")}>
                  {params.value}
                </span>
              );
            };
            break;
          case "idType":
            base.cellEditor = "agSelectCellEditor";
            base.cellEditorParams = { values: c.options ?? [] };
            base.singleClickEdit = true;
            base.cellRenderer = (params: ICellRendererParams) => {
              if (!params.value) return null;
              return (
                <span className={cn("px-2 py-0.5 rounded text-[11px] font-medium border border-gray-100", params.value === "Pending" ? "text-orange-500 bg-orange-50" : "text-blue-600 bg-blue-50")}>
                  {params.value}
                </span>
              );
            };
            break;
          case "select":
            base.cellEditor = "agSelectCellEditor";
            base.cellEditorParams = { values: c.options ?? [] };
            base.singleClickEdit = true;
            break;
          case "dropdown": {
            const opts = c.options ?? [];
            const allowMulti = c.allowMultiple ?? false;
            if (allowMulti) {
              base.cellEditor = MultiSelectCellEditor;
              base.cellEditorParams = { values: opts };
              base.cellEditorPopup = true;
            } else {
              base.cellEditor = "agSelectCellEditor";
              base.cellEditorParams = { values: opts };
            }
            base.singleClickEdit = true;
            base.cellRenderer = (params: ICellRendererParams) => {
              const v = params.value;
              if (!v && v !== 0) return null;
              const values = allowMulti
                ? String(v).split(",").map((s: string) => s.trim()).filter(Boolean)
                : [String(v)];
              const renderItem = (val: string, i: number) => {
                const isMismatch = !opts.includes(val);
                if (isMismatch) {
                  return (
                    <span key={i} className="inline-flex items-center text-orange-700 whitespace-nowrap">
                      <AlertCircle className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                      {val}
                    </span>
                  );
                }
                return <span key={i} className="whitespace-nowrap">{val}</span>;
              };
              if (!allowMulti) return renderItem(values[0], 0);
              return (
                <div className="flex items-center justify-center gap-2 w-full h-full overflow-hidden">
                  {values.map(renderItem)}
                </div>
              );
            };
            break;
          }
          case "number":
            base.cellEditor = "agNumberCellEditor";
            break;
          case "date":
            base.cellEditor = "agDateStringCellEditor";
            break;
        }
        return base;
      });

    if (defs.length <= 5) {
      return defs.map(({ width: _w, minWidth: _m, ...rest }) => ({ ...rest, flex: 1 }));
    }
    return defs;
  }, [columns, hiddenColumns, selectedRowIds]);

  const defaultColDef = useMemo<ColDef>(() => ({
    flex: 0,
    resizable: true,
    sortable: false,
    filter: false,
    suppressHeaderMenuButton: true,
    editable: true,
    cellStyle: { display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" },
    headerClass: "ag-header-cell-centered",
  }), []);

  // Row Styling
  const getRowStyle = (params: RowClassParams) => {
    if (selectedRowIds.includes(params.data?.id)) {
      return { background: "rgba(59, 130, 246, 0.12)", boxShadow: "inset 4px 0 0 0 #3b82f6" };
    }
    if (params.data.checkIn) {
      return { background: "rgba(22, 163, 74, 0.05)", boxShadow: "inset 4px 0 0 0 var(--color-primary, #16a34a)" };
    }
    if (params.data.status === "Not Coming") {
      return { background: "rgba(239, 68, 68, 0.05)", boxShadow: "inset 4px 0 0 0 #ef4444" };
    }
    if (params.data.status === "VIP") {
      return { background: "rgba(168, 85, 247, 0.05)", boxShadow: "inset 4px 0 0 0 #a855f7" };
    }
    return undefined;
  };

  const getRowClass = (_params: RowClassParams) => undefined;

  // Arrow key navigation handler
  const navigateToNextCell = useCallback((params: any) => {
    const { key, previousCellPosition, nextCellPosition, event } = params;

    // Only handle arrow keys when not editing
    if (!event || params.editing) {
      return nextCellPosition;
    }

    const keyCode = event.key;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(keyCode)) {
      return nextCellPosition;
    }

    const allColumns = gridRef.current?.api.getAllDisplayedColumns() || [];
    const currentRowIndex = previousCellPosition.rowIndex;
    const currentColIndex = allColumns.findIndex(col => col.getColId() === previousCellPosition.column.getColId());

    let targetRowIndex = currentRowIndex;
    let targetColIndex = currentColIndex;

    switch (keyCode) {
      case 'ArrowUp':
        targetRowIndex = Math.max(0, currentRowIndex - 1);
        break;
      case 'ArrowDown':
        const rowCount = gridRef.current?.api.getDisplayedRowCount() || 0;
        targetRowIndex = Math.min(rowCount - 1, currentRowIndex + 1);
        break;
      case 'ArrowLeft':
        targetColIndex = Math.max(0, currentColIndex - 1);
        break;
      case 'ArrowRight':
        targetColIndex = Math.min(allColumns.length - 1, currentColIndex + 1);
        break;
    }

    // If we haven't moved (edge case), return null to prevent navigation
    if (targetRowIndex === currentRowIndex && targetColIndex === currentColIndex) {
      return null;
    }

    // Return the new cell position
    return {
      rowIndex: targetRowIndex,
      column: allColumns[targetColIndex],
    };
  }, []);

  const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
    const updated = event.data as Guest;
    setRowData(prev => prev.map(r => r.id === updated.id ? { ...updated } : r));
  }, []);

  const toggleFilter = (filterId: string) => {
    if (filterId === 'all') {
      setActiveFilters([]);
      gridRef.current?.api.setFilterModel(null);
      return;
    }
    
    setActiveFilters(prev => 
      prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]
    );
    
    // In a real app, we'd apply AG Grid filters here
    toast.info(`Filtering by ${filterId}`);
  };

  // --- Column header right-click menu wiring ---
  const lockedFieldSet = useMemo(() => new Set(columns.filter(c => c.locked).map(c => c.field)), [columns]);

  useEffect(() => {
    if (viewMode !== "guest") return;
    const onCtx = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const headerCell = target?.closest('.ag-header-cell') as HTMLElement | null;
      if (!headerCell) return;
      const colId = headerCell.getAttribute('col-id') || headerCell.getAttribute('data-col-id');
      if (!colId) return;
      if (!columns.some(c => c.field === colId)) return;
      e.preventDefault();
      setHeaderMenu({ x: e.clientX, y: e.clientY, field: colId });
      setPasteSpecialOpen(false);
    };
    document.addEventListener('contextmenu', onCtx);
    return () => document.removeEventListener('contextmenu', onCtx);
  }, [columns, viewMode]);

  useEffect(() => {
    if (!headerMenu) return;
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-header-menu="true"]')) return;
      setHeaderMenu(null);
      setPasteSpecialOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setHeaderMenu(null); setPasteSpecialOpen(false); } };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", onKey); };
  }, [headerMenu]);

  // --- Clipboard helpers (Community edition lacks built-in clipboard) ---
  const getFocusedCell = () => {
    const api = gridRef.current?.api;
    if (!api) return null;
    const focused = api.getFocusedCell();
    if (!focused) return null;
    const row = api.getDisplayedRowAtIndex(focused.rowIndex);
    if (!row) return null;
    const field = focused.column.getColId();
    return { row, field, rowIndex: focused.rowIndex };
  };

  const copyFocused = useCallback(async () => {
    const f = getFocusedCell();
    if (!f) return;
    const v = f.row.data?.[f.field];
    try { await navigator.clipboard.writeText(v == null ? "" : String(v)); } catch {}
    toast.success("Copied");
  }, []);

  const cutFocused = useCallback(async () => {
    const f = getFocusedCell();
    if (!f) return;
    const v = f.row.data?.[f.field];
    try { await navigator.clipboard.writeText(v == null ? "" : String(v)); } catch {}
    setRowData(prev => prev.map(r => r.id === f.row.data.id ? { ...r, [f.field]: "" } : r));
    toast.success("Cut");
  }, [setRowData]);

  const pasteFocused = useCallback(async () => {
    const f = getFocusedCell();
    if (!f) return;
    let text = "";
    try { text = await navigator.clipboard.readText(); } catch { toast.error("Clipboard unavailable"); return; }
    setRowData(prev => prev.map(r => r.id === f.row.data.id ? { ...r, [f.field]: text } : r));
    toast.success("Pasted");
  }, [setRowData]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "c" || e.key === "C") { copyFocused(); }
      else if (e.key === "x" || e.key === "X") { cutFocused(); }
      else if (e.key === "v" || e.key === "V") { pasteFocused(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [copyFocused, cutFocused, pasteFocused]);

  // --- Row click (selection on srNo, deselect elsewhere) ---
  const onCellClicked = useCallback((e: any) => {
    const ne = e.event as MouseEvent;
    if (e.colDef?.field === "srNo") {
      handleRowSelect(e.data.id, { shiftKey: ne.shiftKey, ctrlKey: ne.ctrlKey, metaKey: ne.metaKey });
    } else if (selectedRowIds.length > 0) {
      setSelectedRowIds([]);
    }
  }, [handleRowSelect, selectedRowIds.length]);

  // --- Row context menu trigger ---
  const onCellContextMenu = useCallback((e: any) => {
    const ne = e.event as MouseEvent;
    ne.preventDefault();
    const id = e.data?.id;
    if (!id) return;
    let ids = selectedRowIds;
    if (!selectedRowIds.includes(id)) {
      ids = [id];
      setSelectedRowIds(ids);
      setLastSelectedRowId(id);
    }
    setRowPasteSpecialOpen(false);
    setRowMenu({ x: ne.clientX, y: ne.clientY, ids });
  }, [selectedRowIds]);

  // --- Column header double-click to rename ---
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = gridWrapperRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore clicks on or inside the resize handle
      if (target.closest(".ag-header-cell-resize")) return;
      const headerCell = target.closest(".ag-header-cell");
      if (!headerCell) return;
      const field = headerCell.getAttribute("col-id") ?? "";
      if (!field || field === "srNo") return;
      setColumns(prev => {
        const col = prev.find(c => c.field === field);
        if (!col || col.locked) return prev;
        setRenameColModal(field);
        return prev;
      });
    };
    el.addEventListener("dblclick", handler);
    return () => el.removeEventListener("dblclick", handler);
  }, [setColumns]);

  // Close row menu on outside click / escape
  useEffect(() => {
    if (!rowMenu) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-row-menu]")) return;
      setRowMenu(null);
      setRowPasteSpecialOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setRowMenu(null); setRowPasteSpecialOpen(false); } };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", onKey); };
  }, [rowMenu]);

  // --- Row operations ---
  const visibleFields = useMemo(
    () => columns.filter(c => !hiddenColumns.includes(c.field) && c.field !== "srNo").map(c => c.field),
    [columns, hiddenColumns]
  );

  const serializeRows = useCallback((rows: Guest[]) => rows.map(r =>
    visibleFields.map(f => {
      const v = (r as any)[f];
      if (v == null) return "";
      if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
      return String(v);
    }).join("\t")
  ).join("\n"), [visibleFields]);

  const copyRows = useCallback(async (ids: string[]) => {
    const rows = rowData.filter(r => ids.includes(r.id));
    rowClipboardRef.current = { rows: rows.map(r => ({ ...r })), mode: "copy" };
    try { await navigator.clipboard.writeText(serializeRows(rows)); } catch {}
    toast.success(`Copied ${rows.length} row${rows.length === 1 ? "" : "s"}`);
  }, [rowData, serializeRows]);

  const blankifyRow = (r: Guest): Guest => {
    const next: any = { ...r };
    for (const f of visibleFields) next[f] = typeof (r as any)[f] === "boolean" ? false : "";
    return next as Guest;
  };

  const cutRows = useCallback(async (ids: string[]) => {
    const rows = rowData.filter(r => ids.includes(r.id));
    rowClipboardRef.current = { rows: rows.map(r => ({ ...r })), mode: "cut" };
    try { await navigator.clipboard.writeText(serializeRows(rows)); } catch {}
    setRowData(prev => prev.map(r => ids.includes(r.id) ? blankifyRow(r) : r));
    toast.success(`Cut ${rows.length} row${rows.length === 1 ? "" : "s"}`);
  }, [rowData, serializeRows, setRowData, visibleFields]);

  const applyPaste = useCallback((targetIds: string[], mode: "all" | "values") => {
    const clip = rowClipboardRef.current;
    if (!clip || clip.rows.length === 0) { toast.error("Nothing to paste"); return; }
    setRowData(prev => prev.map(r => {
      const idx = targetIds.indexOf(r.id);
      if (idx < 0) return r;
      const src = clip.rows[idx % clip.rows.length];
      const next: any = { ...r };
      for (const f of visibleFields) next[f] = (src as any)[f];
      if (mode === "values" && typeof next.checkIn === "boolean") next.checkIn = r.checkIn;
      return next as Guest;
    }));
    toast.success("Pasted");
  }, [setRowData, visibleFields]);

  const insertRows = useCallback((anchorId: string, position: "above" | "below", count: number) => {
    const blank = (): Guest => ({
      id: Math.random().toString(36).slice(2),
      srNo: 0, name: "", contact: "", checkIn: false,
      status: "" as GuestStatus, idType: "" as IDType,
      pax: null as unknown as number,
      roomNo: "", travel: "" as TravelType, arrival: "", departure: "", comments: "",
    });
    setRowData(prev => {
      const idx = prev.findIndex(r => r.id === anchorId);
      if (idx < 0) return prev;
      const insertAt = position === "above" ? idx : idx + 1;
      const newRows = Array.from({ length: count }, blank);
      const next = [...prev.slice(0, insertAt), ...newRows, ...prev.slice(insertAt)];
      return next.map((r, i) => r.srNo === i + 1 ? r : { ...r, srNo: i + 1 });
    });
    toast.success(`Inserted ${count} row${count === 1 ? "" : "s"} ${position}`);
  }, [setRowData]);

  const deleteRows = useCallback((ids: string[]) => {
    setRowData(prev => prev.filter(r => !ids.includes(r.id)).map((r, i) => ({ ...r, srNo: i + 1 })));
    setSelectedRowIds([]);
    toast.success(`Deleted ${ids.length} row${ids.length === 1 ? "" : "s"}`);
  }, [setRowData]);

  const clearRows = useCallback((ids: string[]) => {
    setRowData(prev => prev.map(r => ids.includes(r.id) ? blankifyRow(r) : r));
    toast.success(`Cleared ${ids.length} row${ids.length === 1 ? "" : "s"}`);
  }, [setRowData, visibleFields]);

  const hideRows = useCallback((ids: string[]) => {
    setHiddenRows(prev => Array.from(new Set([...prev, ...ids])));
    setSelectedRowIds([]);
    toast.success(`Hidden ${ids.length} row${ids.length === 1 ? "" : "s"}`);
  }, []);

  const unhideAllRows = () => setHiddenRows([]);

  // --- Column operations ---
  const insertColumn = (anchorField: string, position: "left" | "right", name: string) => {
    setColumns(prev => {
      const idx = prev.findIndex(c => c.field === anchorField);
      if (idx < 0) return prev;
      const field = `custom_${Date.now()}`;
      const newCol: ColumnMeta = { field, headerName: name.trim() || "New Column", width: 140, minWidth: 120, type: "text" };
      const next = [...prev];
      next.splice(position === "left" ? idx : idx + 1, 0, newCol);
      return next;
    });
    toast.success(`Inserted "${name}"`);
  };

  const deleteColumn = (field: string) => {
    if (lockedFieldSet.has(field)) return;
    setColumns(prev => prev.filter(c => c.field !== field));
    setDeleteColConfirm(null);
    toast.success("Column deleted");
  };

  const clearColumn = (field: string) => {
    setRowData(prev => prev.map(r => ({ ...r, [field]: typeof (r as any)[field] === "boolean" ? false : "" })));
    toast.success("Column cleared");
  };

  const hideColumn = (field: string) => {
    if (lockedFieldSet.has(field)) return;
    setHiddenColumns(prev => prev.includes(field) ? prev : [...prev, field]);
    toast.success("Column hidden");
  };

  const unhideAllColumns = () => setHiddenColumns([]);

  const renameColumn = (field: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setColumns(prev => prev.map(c => c.field === field ? { ...c, headerName: trimmed } : c));
    setRenameColModal(null);
    toast.success("Renamed");
  };

  const convertToDropdown = (
    field: string,
    options: string[],
    allowMultiple: boolean
  ) => {
    setColumns(prev => prev.map(c =>
      c.field === field ? { ...c, type: "dropdown", options, allowMultiple } : c
    ));
    setDropdownModal(null);
    toast.success("Data validation applied");
  };

  const removeDropdown = (field: string) => {
    setColumns(prev => prev.map(c =>
      c.field === field
        ? { ...c, type: "text", options: undefined, allowMultiple: undefined }
        : c
    ));
    setDropdownModal(null);
    toast.success("Validation rule removed");
  };

  // --- Room View Components ---
  // Room View always aggregates across RSVP sheets (regardless of which sheet is active).
  const { rsvpAggregateRows, guestSheetMap, guestSheetLetterMap } = useMemo<{
    rsvpAggregateRows: Guest[];
    guestSheetMap: Record<string, string>;
    guestSheetLetterMap: Record<string, string>;
  }>(() => {
    const out: Guest[] = [];
    const sheetNameMap: Record<string, string> = {};
    const letterMap: Record<string, string> = {};
    for (const name of sheetOrder) {
      if ((sheetTypes[name] ?? "rsvp") !== "rsvp") continue;
      const letter = name.charAt(0).toUpperCase();
      const rows = sheets[name] ?? [];
      for (const g of rows) {
        if ((g.name && g.name.trim()) || (g.contact && g.contact.trim())) {
          out.push(g);
          sheetNameMap[g.id] = name;
          letterMap[g.id] = letter;
        }
      }
    }
    return { rsvpAggregateRows: out, guestSheetMap: sheetNameMap, guestSheetLetterMap: letterMap };
  }, [sheets, sheetOrder, sheetTypes]);
  const roomViewTotalGuests = rsvpAggregateRows.length;
  const roomViewGuestsWithRoom = rsvpAggregateRows.filter(g => g.roomNo && g.roomNo.trim() !== "");
  const rooms = useMemo(() => {
    const grouped: Record<string, Guest[]> = {};
    rsvpAggregateRows.forEach(g => {
      const rn = g.roomNo && g.roomNo.trim() ? g.roomNo.trim() : "Unassigned";
      if (!grouped[rn]) grouped[rn] = [];
      grouped[rn].push(g);
    });
    return grouped;
  }, [rsvpAggregateRows]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      if (prev === "guest") {
        setLastActiveSheetId(currentTab);
        return "room";
      }
      if (lastActiveSheetId && sheets[lastActiveSheetId]) {
        setCurrentTab(lastActiveSheetId);
      }
      return "guest";
    });
  }, [currentTab, lastActiveSheetId, sheets]);

  // SMS send handler
  const handleSendSms = async () => {
    setIsSendingSms(true);

    // Simulate SMS sending with a realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock result
    const totalRecipients = getRecipientCount();
    const result = {
      sent: Math.floor(totalRecipients * 0.95),
      failed: 8,
      skipped: 4,
      failedNames: ["Rahul Sharma", "Priya Joshi", "Anita Verma", "Raj Malhotra", "Deepa Singh", "Amit Kumar", "Neha Patel", "Vikram Rao"]
    };

    setSmsResult(result);
    setIsSendingSms(false);

    // Small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 100));

    setShowSmsModal(false);

    // Another small delay before showing result
    await new Promise(resolve => setTimeout(resolve, 150));

    setShowSmsResult(true);
    setSmsMessage("");
  };

  const getRecipientCount = () => {
    const counts: Record<string, number> = {
      "all-sheets": 487,
      "groom-side": 187,
      "bride-side": 156,
      "friends": 144,
      "selected-rows": selectedRowIds.length,
      "not-checked-in": 342,
      "ids-not-received": 215,
      "not-coming": 45,
      "vip-guests": 23,
    };
    return counts[smsRecipientType] || 0;
  };

  const getInvalidCount = () => {
    // Mock: ~2-3% invalid numbers
    return Math.floor(getRecipientCount() * 0.025);
  };

  const getValidCount = () => {
    return getRecipientCount() - getInvalidCount();
  };

  const getSmsCount = () => {
    const charCount = smsMessage.length;
    if (charCount === 0) return 0;
    if (charCount <= 160) return 1;
    return Math.ceil(charCount / 153);
  };

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get auth token (would typically come from auth context/localStorage)
      const authToken = localStorage.getItem("authToken") || "demo-token";

      const response = await fetch(`/api/events/${eventId}/export`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventName}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Export failed, please try again");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Zone 1 — Navbar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white z-50">
        <div className="flex items-center gap-6">
          <Logo onClick={() => onNav?.("dashboard")} />
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="text-base font-semibold text-gray-800">Ritika & Yash Wedding</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
            <LayoutGrid className={cn("w-4 h-4", viewMode === "guest" ? "text-primary" : "text-gray-400")} />
            <span className={cn("text-sm font-medium", viewMode === "guest" ? "text-gray-800" : "text-gray-400")}>Spreadsheet</span>
            <div className="relative group">
              <button
                role="switch"
                aria-checked={viewMode === "room"}
                onClick={toggleViewMode}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative flex items-center px-1",
                  viewMode === "room" ? "bg-primary" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "w-3 h-3 bg-white rounded-full transition-transform",
                  viewMode === "room" ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
              {roomViewTotalGuests === 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800" />
                  Add guests first to use Check-in view
                </div>
              )}
            </div>
            <span className={cn("text-sm font-medium", viewMode === "room" ? "text-gray-800" : "text-gray-400")}>Check-in</span>
            <LayoutGrid className={cn("w-4 h-4", viewMode === "room" ? "text-primary" : "text-gray-400")} />
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#4A5565] hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> {isExporting ? "Exporting..." : "Export"}
          </button>
          <button
            onClick={() => setShowSmsModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4" /> Send SMS
          </button>
          <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-100">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="avatar" />
            </div>
          </div>
        </div>
      </header>

      {/* Zone 2 — Counter Bar (Sticky) — only for RSVP sheets */}
      {isRsvpSheet && (
      <div className="sticky top-0 bg-white z-40 px-6 py-2.5 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search guests, rooms, mobile..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {counters.map(counter => (
            <button
              key={counter.id}
              onClick={() => toggleFilter(counter.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all whitespace-nowrap group",
                activeFilters.includes(counter.id) || (counter.id === 'all' && activeFilters.length === 0)
                  ? "bg-white border-primary shadow-sm ring-2 ring-primary/5"
                  : "bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", counter.color)} />
              <span className="text-[13px] font-medium text-gray-700">{counter.label}</span>
              <span className="text-xs font-bold text-gray-400 group-hover:text-primary">{counter.count}</span>
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Smart Banners */}
      {isRsvpSheet && showIdBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <span>💡</span>
            <span>215 guests haven't sent their ID proof yet</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSmsRecipientType("ids-not-received");
                setSmsMessage("Dear guest, please submit your ID proof for check-in. Reply with a photo of your Aadhaar/Passport. - Team");
                setShowSmsModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-primary border border-primary rounded-md hover:bg-primary/5 transition-colors"
            >
              Send ID Reminder SMS
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowIdBanner(false)}
              className="p-1 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isRsvpSheet && showCheckinBanner && !showIdBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <span>💡</span>
            <span>342 guests are not checked in yet</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSmsRecipientType("not-checked-in");
                setSmsMessage("Dear guest, you haven't checked in yet. Please visit the reception desk. Looking forward to seeing you! - Team");
                setShowSmsModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-primary border border-primary rounded-md hover:bg-primary/5 transition-colors"
            >
              Send Check-in Reminder SMS
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowCheckinBanner(false)}
              className="p-1 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Zone 3 — Tip Bar */}
      {showTip && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>💡 Tip: Press Enter to move down, Tab to move right. Start typing on any cell to enter data immediately.</span>
          </div>
          <button onClick={() => setShowTip(false)} className="text-emerald-400 hover:text-emerald-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {viewMode === "guest" ? (
          <div ref={gridWrapperRef} className="flex-1 w-full bg-white relative overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
            <CleanGrid
              theme={gridTheme}
              ref={gridRef}
              rowData={visibleRowData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              getRowStyle={getRowStyle}
              getRowClass={getRowClass}
              animateRows={true}
              headerHeight={44}
              rowHeight={30}
              onCellValueChanged={onCellValueChanged}
              onCellClicked={onCellClicked}
              onCellContextMenu={onCellContextMenu}
              getRowId={(params) => params.data.id}
              maintainColumnOrder={true}
              suppressColumnVirtualisation={false}
              enterNavigatesVertically={true}
              enterNavigatesVerticallyAfterEdit={true}
              suppressMovableColumns={false}
              enableCellTextSelection={true}
              overlayNoRowsTemplate="No guests yet — add your first guest or import a list"
              navigateToNextCell={navigateToNextCell}
            />
            {hiddenColumns.length > 0 && (
              <button
                onClick={unhideAllColumns}
                className="absolute top-2 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full shadow-sm text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
              >
                <EyeOff className="w-3 h-3" />
                {hiddenColumns.length} hidden — Show all
              </button>
            )}
            {hiddenRows.length > 0 && (
              <button
                onClick={unhideAllRows}
                className="absolute bottom-2 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full shadow-sm text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
              >
                <Eye className="w-3 h-3" />
                {hiddenRows.length} hidden row{hiddenRows.length === 1 ? "" : "s"} — Show all
              </button>
            )}
          </div>
        ) : roomViewTotalGuests === 0 ? (
          <div className="flex-1 w-full bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center max-w-xs">
              <span className="text-5xl text-gray-300">👥</span>
              <p className="text-lg font-semibold text-gray-700">No guests added yet</p>
              <p className="text-sm text-gray-400">Add guests in Spreadsheet view first to use Check-in view.</p>
              <button
                onClick={() => setViewMode("guest")}
                className="mt-1 flex items-center gap-2 px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-all shadow-sm"
              >
                → Switch to Spreadsheet
              </button>
            </div>
          </div>
        ) : roomViewGuestsWithRoom.length === 0 ? (
          <div className="flex-1 w-full bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center max-w-xs">
              <span className="text-5xl text-gray-300">🏨</span>
              <p className="text-lg font-semibold text-gray-700">No room numbers assigned</p>
              <p className="text-sm text-gray-400">Add room numbers to your guests in Spreadsheet view to see them here.</p>
              <button
                onClick={() => setViewMode("guest")}
                className="mt-1 flex items-center gap-2 px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-all shadow-sm"
              >
                → Go to Spreadsheet
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full bg-gray-50 overflow-y-auto scrollbar-hide p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(rooms).map(([roomNo, guests]) => {
                const totalPax = guests.reduce((sum, g) => sum + g.pax, 0);
                const checkedInCount = guests.filter(g => g.checkIn).length;
                const isFullyCheckedIn = checkedInCount === guests.length;
                const isPartiallyCheckedIn = checkedInCount > 0 && !isFullyCheckedIn;
                const idPending = guests.some(g => g.idType === 'Pending');

                return (
                  <div key={roomNo} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Room {roomNo}</h3>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{totalPax} Pax Total</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                          isFullyCheckedIn ? "bg-green-100 text-green-700" : 
                          isPartiallyCheckedIn ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                        )}>
                          {isFullyCheckedIn ? "✅ Fully Checked In" : isPartiallyCheckedIn ? "⚡ Partial" : "⏳ Not Arrived"}
                        </span>
                        {idPending && (
                          <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider">
                            ⚠️ ID Pending
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 p-4 space-y-3">
                      {guests.map(guest => (
                        <div key={guest.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                              guest.checkIn ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
                            )}>
                              {guestSheetLetterMap[guest.id] ?? (guest.name ?? "?").charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{guest.name}</p>
                              <p className="text-[11px] text-gray-400">{guest.contact}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {guest.status === 'Not Coming' ? (
                              <div title="Not Coming" className="text-red-500"><XCircle className="w-4 h-4 fill-red-500" /></div>
                            ) : (!guest.idType || guest.idType === 'Pending') ? (
                              <div title="ID Pending" className="text-orange-500"><AlertCircle className="w-4 h-4" /></div>
                            ) : (
                              <div title="ID Received" className="text-blue-500"><User className="w-4 h-4" /></div>
                            )}
                            <button
                              onClick={() => {
                                const sheetName = guestSheetMap[guest.id];
                                if (sheetName) {
                                  setSheets(prev => ({
                                    ...prev,
                                    [sheetName]: (prev[sheetName] ?? []).map(g =>
                                      g.id === guest.id ? { ...g, checkIn: !g.checkIn } : g
                                    )
                                  }));
                                }
                                toast.success(`${guest.name} ${!guest.checkIn ? 'checked in' : 'checked out'}`);
                              }}
                              className={cn(
                                "w-10 h-5 rounded-full relative flex items-center px-1 transition-colors",
                                guest.checkIn ? "bg-primary" : "bg-gray-200"
                              )}
                            >
                              <div className={cn(
                                "w-3 h-3 bg-white rounded-full transition-transform",
                                guest.checkIn ? "translate-x-5" : "translate-x-0"
                              )} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-gray-50/30 border-t border-gray-100">
                      <button
                        disabled={isFullyCheckedIn}
                        onClick={() => {
                          const guestsBySheet: Record<string, string[]> = {};
                          guests.forEach(g => {
                            const sheetName = guestSheetMap[g.id];
                            if (sheetName) {
                              if (!guestsBySheet[sheetName]) guestsBySheet[sheetName] = [];
                              guestsBySheet[sheetName].push(g.id);
                            }
                          });
                          setSheets(prev => {
                            const updated = { ...prev };
                            for (const [sheetName, guestIds] of Object.entries(guestsBySheet)) {
                              updated[sheetName] = (updated[sheetName] ?? []).map(g =>
                                guestIds.includes(g.id) ? { ...g, checkIn: true } : g
                              );
                            }
                            return updated;
                          });
                          toast.success(`Room ${roomNo} fully checked in`);
                        }}
                        className={cn(
                          "w-full py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm",
                          isFullyCheckedIn ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
                          isPartiallyCheckedIn ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-primary text-white hover:bg-primary/90"
                        )}
                      >
                        {isFullyCheckedIn ? "✅ All Checked In" : isPartiallyCheckedIn ? "Check In Remaining" : "Check In Room"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Zone 5 — Sheet Tabs & Status Bar */}
      {viewMode === "guest" && <footer className="bg-white border-t border-gray-200 flex flex-col">
        <div className="flex items-center h-9 bg-white border-b border-gray-200 px-1 gap-1">
          <button onClick={openAddSheet} title="Add Sheet" className="h-7 w-7 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600">
            <Plus className="w-4 h-4" />
          </button>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setHiddenListOpen(o => !o); }}
              title="All Sheets"
              className="h-7 w-7 flex items-center justify-center hover:bg-gray-100 rounded text-gray-600"
            >
              <MenuIcon className="w-4 h-4" />
            </button>
            {hiddenListOpen && (
              <>
                <div className="fixed inset-0 z-[80]" onClick={() => setHiddenListOpen(false)} />
                <div className="absolute bottom-full left-0 mb-1 w-60 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-[85]">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">All sheets</div>
                  {sheetOrder.map(t => {
                    const hidden = hiddenSheets.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => { if (hidden) unhideSheet(t); setCurrentTab(t); setHiddenListOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50"
                      >
                        {hidden ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
                        <span className={cn(hidden && "text-gray-400 italic")}>{t}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="h-5 w-px bg-gray-200 mx-1" />

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {sheetOrder.filter(t => !hiddenSheets.includes(t)).map(tab => {
              const active = currentTab === tab;
              return (
                <div
                  key={tab}
                  onClick={() => renamingTab !== tab && setCurrentTab(tab)}
                  onDoubleClick={() => startRename(tab)}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentTab(tab); setTabMenu(prev => prev?.tab === tab ? null : { x: e.clientX, y: e.clientY, tab }); }}
                  className={cn(
                    "group h-7 flex items-center rounded-t-md text-[13px] cursor-pointer select-none transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-700 font-bold shadow-[inset_0_-3px_0_0_var(--color-primary,#16a34a)]"
                      : "text-gray-600 hover:bg-gray-50 font-medium",
                  )}
                >
                  <span className="pl-3 pr-1 whitespace-nowrap inline-flex items-center gap-1.5">
                    {(sheetTypes[tab] ?? "rsvp") === "rsvp" && renamingTab !== tab && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden />
                    )}
                    {renamingTab === tab ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") setRenamingTab(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 px-1 text-[13px] bg-white border border-emerald-500 outline-none text-gray-900 w-28 rounded"
                      />
                    ) : tab}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setCurrentTab(tab); setTabMenu(prev => prev?.tab === tab ? null : { x: r.left, y: r.top, tab }); }}
                    className={cn(
                      "h-7 w-6 flex items-center justify-center mr-0.5 rounded-sm transition-opacity",
                      active ? "opacity-100 hover:bg-emerald-100" : "opacity-0 group-hover:opacity-100 hover:bg-gray-200",
                    )}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>

        <div className="bg-white px-4 h-8 flex items-center justify-between text-[11px] font-medium text-gray-500 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="uppercase tracking-widest text-primary font-bold">Ready</span>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <span>Sheet updated 2m ago</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#6A7282]">{filledRows.length} rows</span>
            <span>·</span>
            <span className="text-[#6A7282]">{filledRows.filter(g => g.checkIn).length} checked in</span>
            <div className="h-4 w-px bg-gray-200" />
            <span className="flex items-center gap-1"><Bell className="w-3 h-3" /> Notifications On</span>
          </div>
        </div>
      </footer>}

      {tabMenu && (
        <TabContextMenu x={tabMenu.x} y={tabMenu.y}>
        <div
          className="w-56 bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.18)] py-2 font-sans border border-gray-200"
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <TabMenuItem icon={<Trash2 className="w-4 h-4" />} label="Delete" disabled={sheetOrder.length <= 1} onClick={() => { setDeleteConfirm(tabMenu.tab); setTabMenu(null); }} />
          <TabMenuItem icon={<CopyIcon className="w-4 h-4" />} label="Duplicate" onClick={() => { duplicateSheet(tabMenu.tab); setTabMenu(null); }} />
          <TabMenuItem icon={<FilePlus className="w-4 h-4" />} label="Insert Sheet" onClick={() => { insertSheetAfter(tabMenu.tab); setTabMenu(null); }} />
          <TabMenuItem icon={<Pencil className="w-4 h-4" />} label="Rename" onClick={() => { startRename(tabMenu.tab); setTabMenu(null); }} />
          <div className="my-1 h-px bg-gray-100" />
          <TabMenuItem icon={<EyeOff className="w-4 h-4" />} label="Hide sheet" onClick={() => { hideSheet(tabMenu.tab); setTabMenu(null); }} />
        </div>
        </TabContextMenu>
      )}

      {headerMenu && (() => {
        const col = columns.find(c => c.field === headerMenu.field);
        if (!col) return null;
        const locked = !!col.locked;
        return (
          <TabContextMenu x={headerMenu.x} y={headerMenu.y}>
            <div
              data-header-menu="true"
              className="w-64 bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.18)] py-2 font-sans border border-gray-200 relative"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
            >
              <HeaderMenuItem icon={<Scissors className="w-4 h-4" />} label="Cut" shortcut="Ctrl+X" onClick={() => { cutFocused(); setHeaderMenu(null); }} />
              <HeaderMenuItem icon={<CopyIcon className="w-4 h-4" />} label="Copy" shortcut="Ctrl+C" onClick={() => { copyFocused(); setHeaderMenu(null); }} />
              <HeaderMenuItem icon={<Clipboard className="w-4 h-4" />} label="Paste" shortcut="Ctrl+V" onClick={() => { pasteFocused(); setHeaderMenu(null); }} />
              <div
                className="relative"
                onMouseEnter={() => setPasteSpecialOpen(true)}
                onMouseLeave={() => setPasteSpecialOpen(false)}
              >
                <HeaderMenuItem
                  icon={<Clipboard className="w-4 h-4" />}
                  label="Paste Special"
                  trailing={<ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                  onClick={() => setPasteSpecialOpen(o => !o)}
                />
                {pasteSpecialOpen && (
                  <div className="absolute left-full top-0 ml-1 w-44 bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.18)] py-2 border border-gray-200">
                    <HeaderMenuItem label="Values only" onClick={() => { pasteFocused(); setHeaderMenu(null); }} />
                    <HeaderMenuItem label="Format only" onClick={() => { toast.info("Format-only paste"); setHeaderMenu(null); }} />
                  </div>
                )}
              </div>
              <div className="my-1 h-px bg-gray-100" />
              <HeaderMenuItem icon={<ArrowLeftToLine className="w-4 h-4" />} label="Insert column to left" onClick={() => { setInsertColModal({ position: "left", anchorField: headerMenu.field }); setHeaderMenu(null); }} />
              <HeaderMenuItem icon={<ArrowRightToLine className="w-4 h-4" />} label="Insert column to right" onClick={() => { setInsertColModal({ position: "right", anchorField: headerMenu.field }); setHeaderMenu(null); }} />
              <HeaderMenuItem icon={<Trash2 className="w-4 h-4" />} label="Delete column" disabled={locked} onClick={() => { setDeleteColConfirm(headerMenu.field); setHeaderMenu(null); }} />
              <HeaderMenuItem icon={<Eraser className="w-4 h-4" />} label="Clear column" onClick={() => { clearColumn(headerMenu.field); setHeaderMenu(null); }} />
              <HeaderMenuItem icon={<EyeOff className="w-4 h-4" />} label="Hide column" disabled={locked} onClick={() => { hideColumn(headerMenu.field); setHeaderMenu(null); }} />
              <div className="my-1 h-px bg-gray-100" />
              <HeaderMenuItem icon={<ListChecks className="w-4 h-4" />} label="Add Dropdown to column" disabled={locked} onClick={() => { setDropdownModal(headerMenu.field); setHeaderMenu(null); }} />
              <HeaderMenuItem icon={<Pencil className="w-4 h-4" />} label="Rename column" disabled={locked} onClick={() => { setRenameColModal(headerMenu.field); setHeaderMenu(null); }} />
            </div>
          </TabContextMenu>
        );
      })()}

      {rowMenu && (() => {
        const ids = rowMenu.ids;
        const anchorId = ids[0];
        const n = ids.length;
        const close = () => { setRowMenu(null); setRowPasteSpecialOpen(false); };
        return (
          <TabContextMenu x={rowMenu.x} y={rowMenu.y}>
            <div
              data-row-menu="true"
              className="w-64 bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.18)] py-2 font-sans border border-gray-200 relative"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
            >
              <HeaderMenuItem icon={<Scissors className="w-4 h-4" />} label="Cut" shortcut="Ctrl+X" onClick={() => { cutRows(ids); close(); }} />
              <HeaderMenuItem icon={<CopyIcon className="w-4 h-4" />} label="Copy" shortcut="Ctrl+C" onClick={() => { copyRows(ids); close(); }} />
              <HeaderMenuItem icon={<Clipboard className="w-4 h-4" />} label="Paste" shortcut="Ctrl+V" onClick={() => { applyPaste(ids, "all"); close(); }} />
              <div
                className="relative"
                onMouseEnter={() => setRowPasteSpecialOpen(true)}
                onMouseLeave={() => setRowPasteSpecialOpen(false)}
              >
                <HeaderMenuItem
                  icon={<Clipboard className="w-4 h-4" />}
                  label="Paste special"
                  trailing={<ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                  onClick={() => setRowPasteSpecialOpen(o => !o)}
                />
                {rowPasteSpecialOpen && (
                  <div className="absolute left-full top-0 ml-1 w-48 bg-white rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.18)] py-2 border border-gray-200">
                    <HeaderMenuItem label="Values only" onClick={() => { applyPaste(ids, "values"); close(); }} />
                    <HeaderMenuItem label="Format only" onClick={() => { toast.info("Format-only paste"); close(); }} />
                  </div>
                )}
              </div>
              <div className="my-1 h-px bg-gray-100" />
              <HeaderMenuItem icon={<Plus className="w-4 h-4" />} label={`Insert ${n} row${n === 1 ? "" : "s"} above`} onClick={() => { insertRows(anchorId, "above", n); close(); }} />
              <HeaderMenuItem icon={<Plus className="w-4 h-4" />} label={`Insert ${n} row${n === 1 ? "" : "s"} below`} onClick={() => { insertRows(ids[ids.length - 1], "below", n); close(); }} />
              <HeaderMenuItem icon={<Trash2 className="w-4 h-4" />} label={n === 1 ? "Delete row" : `Delete ${n} rows`} onClick={() => { deleteRows(ids); close(); }} />
              <HeaderMenuItem icon={<Eraser className="w-4 h-4" />} label={n === 1 ? "Clear row" : `Clear ${n} rows`} onClick={() => { clearRows(ids); close(); }} />
              <HeaderMenuItem icon={<EyeOff className="w-4 h-4" />} label={n === 1 ? "Hide row" : `Hide ${n} rows`} onClick={() => { hideRows(ids); close(); }} />
            </div>
          </TabContextMenu>
        );
      })()}

      {insertColModal && (
        <InsertColumnModal
          position={insertColModal.position}
          onCancel={() => setInsertColModal(null)}
          onSave={(name) => { insertColumn(insertColModal.anchorField, insertColModal.position, name); setInsertColModal(null); }}
        />
      )}

      {deleteColConfirm && (() => {
        const col = columns.find(c => c.field === deleteColConfirm);
        return (
          <div className="fixed inset-0 z-[130] bg-black/40 flex items-center justify-center p-4" onClick={() => setDeleteColConfirm(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">Delete column "{col?.headerName}"?</h3>
                  <p className="text-sm text-gray-500 mt-1">All values in this column will be removed. This cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setDeleteColConfirm(null)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={() => deleteColumn(deleteColConfirm)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        );
      })()}

      {renameColModal && (() => {
        const col = columns.find(c => c.field === renameColModal);
        if (!col) return null;
        return (
          <RenameColumnModal
            current={col.headerName}
            onCancel={() => setRenameColModal(null)}
            onSave={(name) => renameColumn(renameColModal, name)}
          />
        );
      })()}

      {dropdownModal && (() => {
        const col = columns.find(c => c.field === dropdownModal);
        if (!col) return null;
        const visibleCols = columns.filter(c => !hiddenColumns.includes(c.field));
        const colIdx = visibleCols.findIndex(c => c.field === dropdownModal);
        const colLetter = colIdx >= 0 ? String.fromCharCode(65 + colIdx) : "A";
        const rangeStr = `${currentTab}!${colLetter}1:${colLetter}1000`;
        const existing = Array.from(new Set(
          rowData.map(r => (r as any)[col.field]).filter(v => v != null && v !== "").map(String)
        ));
        return (
          <DataValidationPanel
            columnName={col.headerName}
            rangeStr={rangeStr}
            existingValues={existing}
            initialOptions={col.options ?? []}
            initialAllowMultiple={col.allowMultiple ?? false}
            onClose={() => setDropdownModal(null)}
            onSave={(opts, allowMultiple) => convertToDropdown(dropdownModal, opts, allowMultiple)}
            onRemove={() => removeDropdown(dropdownModal)}
          />
        );
      })()}

      {deleteConfirm && (
        <div className="fixed inset-0 z-[130] bg-black/40 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">Delete sheet "{deleteConfirm}"?</h3>
                <p className="text-sm text-gray-500 mt-1">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => deleteSheet(deleteConfirm)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {addSheetName !== null && (
        <div className="fixed inset-0 z-[130] bg-black/40 flex items-center justify-center p-4" onClick={() => setAddSheetName(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900">New sheet</h3>
            <p className="text-sm text-gray-500 mt-1">Give your new sheet a name.</p>
            <input
              autoFocus
              value={addSheetName}
              onChange={(e) => setAddSheetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAddSheet();
                if (e.key === "Escape") setAddSheetName(null);
              }}
              placeholder="Sheet name"
              className="mt-4 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setAddSheetName(null)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={confirmAddSheet}
                disabled={!addSheetName.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Send Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/40 animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Send SMS</h2>
              </div>
              <button
                onClick={() => setShowSmsModal(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Send To */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Send To</label>
              <div className="border border-gray-200 rounded-lg p-4 max-h-[280px] overflow-y-auto scrollbar-hide space-y-4">
                {/* By Sheet */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-2">By Sheet</div>
                  <div className="space-y-2">
                    {[
                      { id: "all-sheets", label: "All Sheets", count: 487 },
                      { id: "groom-side", label: "Groom Side", count: 187 },
                      { id: "bride-side", label: "Bride Side", count: 156 },
                      { id: "friends", label: "Friends", count: 144 },
                    ].map((option) => (
                      <label key={option.id} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                            smsRecipientType === option.id
                              ? "border-primary bg-primary"
                              : "border-gray-300 group-hover:border-gray-400"
                          )}>
                            {smsRecipientType === option.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <input
                            type="radio"
                            name="recipient"
                            value={option.id}
                            checked={smsRecipientType === option.id}
                            onChange={(e) => setSmsRecipientType(e.target.value)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        </div>
                        <span className="text-sm text-[#99A1AF]">{option.count} contacts</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100" />

                {/* By Status */}
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-2">By Status</div>
                  <div className="space-y-2">
                    {[
                      { id: "selected-rows", label: "Selected Rows", count: selectedRowIds.length },
                      { id: "not-checked-in", label: "Not Checked In", count: 342 },
                      { id: "ids-not-received", label: "IDs Not Received", count: 215 },
                      { id: "not-coming", label: "Not Coming", count: 45 },
                      { id: "vip-guests", label: "VIP Guests", count: 23 },
                    ].map((option) => (
                      <label key={option.id} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                            smsRecipientType === option.id
                              ? "border-primary bg-primary"
                              : "border-gray-300 group-hover:border-gray-400"
                          )}>
                            {smsRecipientType === option.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <input
                            type="radio"
                            name="recipient"
                            value={option.id}
                            checked={smsRecipientType === option.id}
                            onChange={(e) => setSmsRecipientType(e.target.value)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        </div>
                        <span className="text-sm text-[#99A1AF]">{option.count} contacts</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Message */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Message</label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full h-[120px] px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-[#99A1AF]">Characters: {smsMessage.length} / 160</span>
                <span className="text-sm text-[#6A7282]">{getSmsCount()} SMS per recipient</span>
              </div>
              {smsMessage.length > 160 && (
                <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Message exceeds 160 characters — will count as {getSmsCount()} SMS</span>
                </div>
              )}
            </div>

            {/* Section 3: Summary */}
            <div className="mb-6 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Summary</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Recipients:</span>
                  <span className="font-semibold text-gray-800">{getRecipientCount()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Invalid / Missing numbers:</span>
                  <span className="font-semibold text-gray-800">{getInvalidCount()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SMS will actually send:</span>
                  <span className="font-semibold text-primary">{getValidCount()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSmsModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSms}
                disabled={!smsMessage.trim() || isSendingSms}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingSms ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send SMS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Result Modal */}
      {showSmsResult && smsResult && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/40 animate-in fade-in duration-150">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">SMS Send Complete!</h2>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm text-gray-600">Sent:</span>
                </div>
                <span className="text-sm font-semibold text-primary">{smsResult.sent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">Failed:</span>
                </div>
                <span className="text-sm font-semibold text-red-600">{smsResult.failed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Skipped:</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{smsResult.skipped}</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">(no number assigned)</p>
            </div>

            {/* Failed Recipients */}
            {smsResult.failed > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Failed recipients:</p>
                <div className="border border-gray-200 rounded-lg p-3 max-h-[120px] overflow-y-auto scrollbar-hide bg-gray-50">
                  <ul className="space-y-1">
                    {smsResult.failedNames.map((name, idx) => (
                      <li key={idx} className="text-sm text-gray-600">• {name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                setShowSmsResult(false);
                setSmsResult(null);
              }}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TabContextMenu({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; visibility: "hidden" | "visible" }>({ left: x, top: y, visibility: "hidden" });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    let top = y;
    let left = x;
    if (y + rect.height + margin > window.innerHeight) top = Math.max(margin, y - rect.height);
    if (x + rect.width + margin > window.innerWidth) left = Math.max(margin, window.innerWidth - rect.width - margin);
    setPos({ left, top, visibility: "visible" });
  }, [x, y]);
  return (
    <div ref={ref} className="fixed z-[120]" style={{ left: pos.left, top: pos.top, visibility: pos.visibility }}>
      {children}
    </div>
  );
}

function HeaderMenuItem({ icon, label, onClick, disabled, shortcut, trailing }: { icon?: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean; shortcut?: string; trailing?: React.ReactNode }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2 text-[13px] text-left transition-colors",
        disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50",
      )}
    >
      <span className={cn("w-4 flex justify-center", disabled ? "text-gray-300" : "text-gray-500")}>{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && <span className={cn("text-[11px]", disabled ? "text-gray-300" : "text-gray-400")}>{shortcut}</span>}
      {trailing}
    </button>
  );
}

function InsertColumnModal({ position, onCancel, onSave }: { position: "left" | "right"; onCancel: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 z-[130] bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900">Insert column to {position}</h3>
        <p className="text-sm text-gray-500 mt-1">Give the new column a name.</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name); }}
          placeholder="Column name"
          className="mt-4 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => name.trim() && onSave(name)} disabled={!name.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40">Insert</button>
        </div>
      </div>
    </div>
  );
}

function RenameColumnModal({ current, onCancel, onSave }: { current: string; onCancel: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(current);
  return (
    <div className="fixed inset-0 z-[130] bg-black/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900">Rename column</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSave(name); }}
          className="mt-4 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => name.trim() && onSave(name)} disabled={!name.trim()} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>
  );
}

// --- Multi-select cell editor for AG Grid Community ---
const MultiSelectCellEditor = React.forwardRef((props: any, ref: any) => {
  const allOptions: string[] = props.values ?? props.colDef?.cellEditorParams?.values ?? [];
  const [selected, setSelected] = useState<string[]>(() => {
    const v = props.value;
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return String(v).split(",").map((s: string) => s.trim()).filter(Boolean);
  });

  useImperativeHandle(ref, () => ({
    getValue: () => selected.join(", "),
    isPopup: () => true,
    getPopupPosition: () => "under",
  }));

  const toggle = (opt: string) => setSelected(s => s.includes(opt) ? s.filter(x => x !== opt) : [...s, opt]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[180px] z-[200]">
      {allOptions.map(opt => {
        const checked = selected.includes(opt);
        return (
          <label key={opt} className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt)}
              className="accent-primary w-3.5 h-3.5 shrink-0"
            />
            <span className="text-[13px] text-gray-800">{opt}</span>
          </label>
        );
      })}
      <div className="border-t border-gray-100 px-3 py-1.5 mt-0.5">
        <button
          onClick={() => props.stopEditing?.()}
          className="text-[12px] text-primary font-semibold hover:text-primary/80"
        >
          Done
        </button>
      </div>
    </div>
  );
});
MultiSelectCellEditor.displayName = "MultiSelectCellEditor";

// --- Data Validation Rules Panel (Google Sheets style) ---
interface DataValidationPanelProps {
  columnName: string;
  rangeStr: string;
  existingValues: string[];
  initialOptions: string[];
  initialAllowMultiple: boolean;
  onClose: () => void;
  onSave: (opts: string[], allowMultiple: boolean) => void;
  onRemove: () => void;
}

function DataValidationPanel({
  columnName,
  rangeStr,
  existingValues,
  initialOptions,
  initialAllowMultiple,
  onClose,
  onSave,
  onRemove,
}: DataValidationPanelProps) {
  type OptionRow = { id: string; label: string };
  const [options, setOptions] = useState<OptionRow[]>(() => {
    if (initialOptions.length > 0) {
      return initialOptions.map(o => ({ id: Math.random().toString(36).slice(2), label: o }));
    }
    return [
      { id: "1", label: "Option 1" },
      { id: "2", label: "Option 2" },
    ];
  });
  const [allowMultiple, setAllowMultiple] = useState(initialAllowMultiple);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragItem = useRef<string | null>(null);

  const addOption = () => {
    setOptions(o => [...o, { id: Math.random().toString(36).slice(2), label: "" }]);
  };

  const removeOption = (id: string) => setOptions(o => o.filter(x => x.id !== id));

  const updateLabel = (id: string, label: string) => setOptions(o => o.map(x => x.id === id ? { ...x, label } : x));

  const handleDragStart = (id: string) => { dragItem.current = id; };
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOver(id); };
  const handleDrop = (targetId: string) => {
    const fromId = dragItem.current;
    if (!fromId || fromId === targetId) { setDragOver(null); return; }
    setOptions(prev => {
      const from = prev.findIndex(o => o.id === fromId);
      const to = prev.findIndex(o => o.id === targetId);
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragItem.current = null;
    setDragOver(null);
  };

  const handleSave = () => {
    const opts = options.filter(o => o.label.trim()).map(o => o.label.trim());
    onSave(opts, allowMultiple);
  };

  const suggestedToAdd = existingValues.filter(v => !options.some(o => o.label === v));

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[120] bg-black/20" onClick={onClose} />
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-[130] w-[340px] bg-white shadow-2xl flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">Data validation rules</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-5">

          {/* Apply to range */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Apply to range</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
              <span className="flex-1 text-[13px] text-gray-800 font-mono">{rangeStr}</span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
            </div>
          </div>

          {/* Criteria */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Criteria</label>
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white cursor-default">
              <span className="flex-1 text-[13px] text-gray-800">Drop-down</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Options list */}
          <div className="space-y-1.5">
            {options.map(opt => {
              return (
                <div
                  key={opt.id}
                  draggable
                  onDragStart={() => handleDragStart(opt.id)}
                  onDragOver={(e) => handleDragOver(e, opt.id)}
                  onDrop={() => handleDrop(opt.id)}
                  onDragEnd={() => setDragOver(null)}
                  className={cn(
                    "flex items-center gap-2 rounded-md transition-colors",
                    dragOver === opt.id && "bg-gray-50 ring-1 ring-primary/30"
                  )}
                >
                  {/* Drag handle */}
                  <button className="text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0">
                    <GripVertical className="w-4 h-4" />
                  </button>

                  {/* Label input */}
                  <input
                    value={opt.label}
                    onChange={(e) => updateLabel(opt.id, e.target.value)}
                    placeholder="Option label"
                    className="flex-1 min-w-0 px-2 py-1.5 text-[13px] text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary bg-white"
                  />

                  {/* Delete */}
                  <button
                    onClick={() => removeOption(opt.id)}
                    className="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Suggested from existing values */}
            {suggestedToAdd.length > 0 && (
              <div className="pt-1">
                <p className="text-[11px] text-gray-400 mb-1.5">Suggested from existing values:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedToAdd.map(v => (
                    <button
                      key={v}
                      onClick={() => setOptions(o => [...o, { id: Math.random().toString(36).slice(2), label: v }])}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-[12px] text-gray-500 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus className="w-3 h-3" /> {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add another item */}
            <button
              onClick={addOption}
              className="mt-1 w-full flex items-center justify-center gap-1.5 px-4 py-2 border border-primary text-primary text-[13px] font-medium rounded-md hover:bg-primary/5 transition-colors"
            >
              Add another item
            </button>
          </div>

          {/* Allow multiple selections */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setAllowMultiple(v => !v)}
              className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                allowMultiple ? "bg-primary border-primary" : "border-gray-400 bg-white"
              )}
            >
              {allowMultiple && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-[13px] text-gray-700">Allow multiple selections</span>
          </label>

          {/* Advanced options */}
          <div>
            <button
              onClick={() => setAdvancedOpen(v => !v)}
              className="flex items-center gap-1.5 text-[13px] text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Advanced options
              {advancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {advancedOpen && (
              <div className="mt-3 space-y-3 pl-1">
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">If data is invalid</p>
                  <div className="space-y-1.5">
                    {["Show a warning", "Reject the input"].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
                        <input type="radio" name="invalid" className="accent-primary" defaultChecked={opt === "Show a warning"} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                    <input type="checkbox" className="accent-primary" />
                    Show dropdown arrow in cell
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-4 flex items-center justify-between">
          <button
            onClick={onRemove}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Remove rule
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

function TabMenuItem({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2 text-[13px] text-left transition-colors",
        disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50",
      )}
    >
      <span className={cn(disabled ? "text-gray-300" : "text-gray-500")}>{icon}</span>
      {label}
    </button>
  );
}
