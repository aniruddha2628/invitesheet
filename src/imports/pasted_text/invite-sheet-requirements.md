Cursor ke liye Requirements (English):

Project: InviteSheet — RSVP Sheet Screen (Frontend)
Reference: The Lovable prototype shows the correct visual direction. Now build the real implementation with proper behaviour.

What to REMOVE from Lovable's version:

Row checkboxes — remove completely
Bold, Italic, Underline, text formatting toolbar — remove completely
These are not needed for RSVP management


Layout (Top to Bottom):
Zone 1 — Navbar:

InviteSheet logo (left)
Event name (center) — "Ritika & Yash Wedding"
Right side: Data Entry button, Check-in Mode button, Export button, + Add Column button
User avatar (far right)

Zone 2 — Counter Bar (sticky, never scrolls away):

Left: Search box — placeholder "Search guests, rooms, mobile..."
Right: 7 counters in horizontal bar:

Total Guests (dark gray dot) — click removes all filters
Checked In (green dot)
Not Arrived (gray dot)
Not Coming (red dot)
IDs Pending (yellow/orange dot)
IDs Received (blue dot)
VIP (purple dot)


Each counter: colored dot + label + live number
Click any counter → filters grid instantly
Active counter gets highlighted border
Multiple counters clickable = AND filter
Filter chip appears below counter bar showing active filters with ✕ to remove
Escape key → clears all filters
Counter updates within 300ms of any data change
Counter updates must NOT cause full grid re-render

Zone 3 — Tip Bar:

Single line: "💡 Tip: Press Enter to move down, Tab to move right. Start typing on any cell to enter data immediately."
Dismissible (✕ button)

Zone 4 — AG Grid (The Spreadsheet):
Columns (in order):

Sr No — row number, not editable, auto-increment
Guest Name — pinned left, always visible, locked (cannot rename or delete), text
Contact — locked, text
Check In — locked, custom toggle renderer (green = ON, gray = OFF)
Status — dropdown: Confirmed, Not Coming, VIP, Dont Call, Wrong Number, Pending
ID Type — dropdown: Aadhaar, Passport, Voter ID, Driving Licence, Other, Pending
Pax — number
Room No. — text
Travel — dropdown: By Train, By Flight, By Car, By Bus, Not Decided
Arrival — date picker
Departure — date picker
Comments — text

Cell behaviour (Excel-like):

Single click → selects cell (green border outline)
Start typing immediately → overwrites cell content (no double-click needed to start)
Double-click or F2 → Edit mode (cursor placed inside existing text)
Arrow keys → move between cells (when in Ready mode)
Tab → move right
Enter → confirm and move one cell down
Escape → cancel edit, revert to original value
Status bar bottom-left shows: "Ready" / "Input" / "Edit"

Dropdown cells:

Single click on Status or ID Type → dropdown opens immediately
Select option → cell updates → dropdown closes → move to next cell

Check-in toggle:

Click toggle → flips ON/OFF
If guest Status is "Not Coming" and toggle clicked → show inline warning modal: "This guest is marked as Not Coming. Check in anyway?" with Cancel and Confirm buttons
Green row highlight when isCheckedIn = true
Red/pink row highlight when Status = "Not Coming"
Purple row highlight when Status = "VIP"

Column behaviour:

All columns resizable by dragging header edge
Guest Name and Contact — minimum width enforced, cannot go below
Double-click column header edge → auto-fit to widest content
Locked columns (Guest Name, Contact, Check In) — show lock icon in header, cannot be renamed or deleted

Right-click context menu on cell:

Insert row above
Insert row below
Delete row
Clear cell

Right-click context menu on column header:

Rename column (only for non-locked columns)
Delete column (only for non-locked columns)
Hide column
Auto-fit width

Paste behaviour:

Ctrl+V on selected cell → paste clipboard content
Copy multiple rows from Excel → Ctrl+V in InviteSheet → rows automatically created

Virtual rendering:

Only render visible rows — not all rows simultaneously
Supports 1000+ guests without performance issues

Zone 5 — Sheet Tabs (bottom):

Excel-style tabs
Active tab: white background, raised appearance
Inactive tabs: gray background
Tab shows colored dot if tabColor is set
Click → switch sheet
Double-click tab → rename inline (press Enter to confirm, Escape to cancel)
Drag tab → reorder sheets
Right-click tab → context menu: Rename, Delete, Change Color
"+" button → add new sheet
Navigation arrows ◀ ▶ on left when tabs overflow

Status bar (bottom):

Left: "Ready" / "Input" / "Edit" mode indicator
Right: "200 rows · 12 guests"


View Toggle — Guest View vs Room View:
Guest View = the AG Grid described above (default)
Room View = replaces grid with room cards:

Cards grouped by roomNumber
Default sort: Not Arrived first → Partially Checked In → Fully Checked In
Each room card contains:

Header: Room number (bold, large) + total pax + status badge

✅ Fully Checked In — green badge
⚡ Partially Checked In — yellow badge
⏳ Not Arrived — gray badge
⚠️ ID Pending — orange badge (shown alongside check-in status)


Per-guest row: Guest Name, Mobile, ID Status icon, individual check-in toggle
Footer button:

All unchecked → "Check In Room" (green primary button)
Partially checked → "Check In Remaining" (yellow/orange button)
All checked → "✅ All Checked In" (grayed out, disabled)




"No Room Assigned" card at bottom for guests without room number
Search in Room View: by room number OR guest name OR mobile number
Confirmation modal when "Check In Room" clicked: "Check in all X guests in Room 301?"
Warning modal if any guest in room is "Not Coming": "Guest [name] is marked Not Coming. Check in anyway?"
Same counter bar visible in Room View
Room View optimised for tablet (hotel reception use case) — large tap targets (min 44px)


Toolbar (above grid, below tip bar):

"+ Add Guest" → adds empty row at bottom
"Import" → file picker (.xlsx, .xls, .csv)
"Export" → downloads .xlsx file
"+ Add Column" → modal: column name + type selector + dropdown options if type = dropdown


Real-time (Socket.io):

Connect on entering RSVP sheet
Emit client:join_sheet { sheetId } on mount
Listen server:row_updated → update that cell in grid (skip own edits using sourceSocketId)
Listen server:row_added → append row
Listen server:row_deleted → remove row
Listen server:checkin_updated → update toggle + row highlight
Listen server:counters_updated → update counter bar numbers only (no grid re-render)
Listen server:presence_joined / server:presence_left → show avatar stack in navbar
On socket disconnect → show "Reconnecting..." banner
On reconnect → refetch guests and counters


API Integration:

Base URL: http://localhost:4000
All requests: Authorization: Bearer {accessToken}
withCredentials: true (for refresh cookie)
On 401 TOKEN_EXPIRED → call POST /api/v1/auth/refresh → retry original request
GET /api/v1/sheets/:sheetId/guests — load guests
GET /api/v1/sheets/:sheetId/columns — load column definitions
GET /api/v1/sheets/:sheetId/guests/counters — load counter values
PATCH /api/v1/sheets/:sheetId/guests/:guestId — cell edit save
PATCH /api/v1/sheets/:sheetId/guests/:guestId/checkin — toggle check-in
POST /api/v1/sheets/:sheetId/guests — add guest
POST /api/v1/sheets/:sheetId/guests/import — import file
GET /api/v1/sheets/:sheetId/export — export Excel
POST /api/v1/sheets/:sheetId/columns — add column
PATCH /api/v1/events/:eventId/sheets/reorder — reorder tabs
PATCH /api/v1/events/:eventId/sheets/:sheetId — rename tab


UI Style:

AG Grid theme: ag-theme-alpine with green accent (#16a34a) overrides
Font: Inter
Tailwind CSS for everything outside grid
Toast notifications: guest added, check-in updated, import complete, errors
Loading skeletons while data fetches
Empty state: "No guests yet — add your first guest or import a list"