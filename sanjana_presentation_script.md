# 🎤 InviteSheet — Sanjana's Presentation Script
### (Frontend Developer | First Person | Easy English)

---

## 📌 HOW TO USE THIS SCRIPT

- **Read everything in first person** — as if YOU (Sanjana) are speaking.
- The script is divided into sections you can present one by one.
- The Q&A section at the end covers all possible examiner questions with full answers.
- **Tip:** Read it 2–3 times tonight. You don't need to memorize word-for-word, just understand the flow.

---

---

# PART 1 — INTRODUCTION (Say this first)

> *"Good morning / Good afternoon, everyone."*

My name is **Sanjana Ramesh Patil**, and I am the **frontend developer** for our project called **InviteSheet**.

My teammate **Aniruddha Kedar** handled the backend — the server, database, and APIs. I was responsible for everything the user sees and interacts with — all the screens, the design, the buttons, the forms, and the overall user experience.

Let me walk you through our project from the beginning.

---

---

# PART 2 — PROBLEM STATEMENT

> *"Let me start by explaining the problem we are solving."*

Imagine a big Indian wedding — 1,000 to 5,000 guests. Maybe a 3-day event with multiple venues. There are hundreds of guests, hotel room allocations, VIP guests, guests from the bride's side and groom's side, check-ins at the gate, and so much more.

**Right now, most event management companies in India manage all of this using:**
- Excel/Google Sheets — which get messy, crash, and don't update in real time
- WhatsApp groups — where important updates get lost
- Paper lists at the gate — which cause delays and confusion

**The real problems are:**
1. When one staff member updates the Excel file, another person doesn't see the change immediately — they are working on old data
2. If the internet is slow, Google Sheets lags with thousands of rows
3. There is no proper check-in system — staff at the gate don't know who has arrived
4. No way to track VIP guests separately
5. No easy way to send bulk SMS or WhatsApp invitations

So basically — **managing a large Indian event is chaotic**, and there was no professional tool built specifically for this.

---

---

# PART 3 — OUR SOLUTION

> *"This is where InviteSheet comes in."*

**InviteSheet** is a **B2B SaaS (Software as a Service) platform** built specifically for **Indian event management companies and agencies**.

Think of it like a **professional-grade, real-time spreadsheet + check-in system + communication tool** — all in one place.

**With InviteSheet, an event management company can:**
- Create events (weddings, corporate events, social events)
- Build guest sheets that look and work like Excel — but smarter
- Multiple team members can work on the same sheet simultaneously, and changes sync in real-time with zero delay
- Check-in guests at the gate with a single tap on mobile
- Track VIP guests, ID submissions, room allocations
- Send bulk SMS notifications to guests
- Manage multiple events from one dashboard

It is built specifically for India — it handles 10,000+ rows without lagging, works on 4G networks at event venues, and supports Indian phone numbers and Indian ID types like Aadhaar, Passport, Voter ID.

---

---

# PART 4 — MY ROLE (Frontend)

> *"Now let me tell you about my specific contribution — the frontend."*

I built the **entire frontend** of InviteSheet from scratch. The frontend is what you see in the browser — every screen, every button, every animation, every form.

My job was to:
1. Design the user interface (UI) — how the app looks
2. Build the user experience (UX) — how the app feels to use
3. Connect the frontend to Aniruddha's backend APIs — so real data flows through the app
4. Make the app responsive — it should work on desktop and mobile
5. Handle all the complex spreadsheet behavior in the browser

---

---

# PART 5 — TECH STACK (Frontend)

> *"Let me talk about the technologies I used."*

| Technology | What it is | Why I used it |
|---|---|---|
| **React 18** | JavaScript UI library | Lets me build reusable components, very fast rendering |
| **TypeScript** | Typed JavaScript | Catches errors before they happen, makes code reliable |
| **Vite** | Build tool / dev server | Extremely fast — starts and builds the app in seconds |
| **React Router v7** | Client-side routing | Handles navigation between pages without page reload |
| **Tailwind CSS v4** | CSS utility framework | Lets me style components very quickly with pre-built classes |
| **AG Grid Community** | Spreadsheet grid | Powers the guest spreadsheet — handles 10,000+ rows efficiently |
| **Motion (Framer Motion)** | Animation library | Smooth animations on the landing page and UI elements |
| **Radix UI** | Headless UI components | Accessible components like dropdowns, dialogs, context menus |
| **React Hook Form** | Form management | Handles form validation and state efficiently |
| **Axios** | HTTP client | Makes API calls to the backend |
| **Sonner** | Toast notifications | Shows success/error messages after actions |
| **Lucide React** | Icon library | All the icons used throughout the app |
| **canvas-confetti** | Confetti animation | Fun confetti effect on certain success actions |

---

---

# PART 6 — HOW I BUILT THE FRONTEND (Screen by Screen)

> *"Now let me walk you through each screen I built and what it does."*

---

## 🌐 Screen 1: Landing Page (`/`)

The first thing a visitor sees when they go to our website.

**What it contains:**
- **Navigation bar** at the top — with logo, links to Features/Pricing sections, and Login/Register buttons
- **Hero section** — a big headline: *"Tame the 5,000-Guest Check-In Chaos"*, with a live mockup of the spreadsheet to show what the product looks like
- **Animated scrolling marquee** — shows features like "10,000+ Guest Capacity", "Zero-Latency Sync", "Mobile Gate Check-In" in a rolling strip
- **Bento Features section** — cards showing key features: real-time sync, live counters, mobile check-in, VIP tracking — each with visual mini-demonstrations
- **Scale Section** — explains how InviteSheet handles Indian-scale events (2000+ guest weddings)
- **Pricing Section** — two plans: Free (₹0, 2 events) and Agency Pro (₹1,999/month, unlimited)
- **Footer** — with links and copyright

**Technical highlights:**
- I used the **Motion library** for scroll animations — elements fade in and slide up as you scroll
- The animated cursors in the real-time sync card show two users editing at the same time
- The pricing section is fully responsive

---

## 🔐 Screen 2: Register Page (`/register`)

Where new users sign up.

**What it contains:**
- Split-screen layout — left side shows features/testimonials, right side has the form
- Fields: Company Name, Full Name, Email, Phone, Password, Confirm Password
- **Live password strength meter** — shows if password is weak, medium, or strong as you type
- Real-time validation — if you type a wrong email or phone, it shows an error immediately
- Terms of Service checkbox — must be checked before submitting
- On submit, calls the backend to create the account and redirects to OTP verification

---

## 📱 Screen 3: OTP Verification (`/otp`)

After registering, the user gets a One-Time Password on their email.

**What it contains:**
- An OTP input field (I used the `input-otp` library)
- Countdown timer to resend OTP
- On correct OTP, the user is logged in and redirected to Onboarding

---

## 🔑 Screen 4: Login Page (`/login`)

For existing users to sign in.

**What it contains:**
- Email and Password fields
- "Forgot Password?" link
- On submit, calls the backend, gets a JWT token, saves it in localStorage, and redirects to the Dashboard

---

## 🔄 Screen 5: Forgot Password & Reset Password (`/forgot-password`, `/reset-password`)

For users who forget their password.
- User enters email → backend sends reset link → user clicks link → enters new password

---

## 🏢 Screen 6: Onboarding (`/onboarding`)

A 2-step welcome flow after first login.

**What it contains:**
- **Step 1** — Welcome screen showing three features (Create Event, Manage Guests, WhatsApp Invitations)
- **Step 2** — Company setup form: Company Name, City, WhatsApp Business Number, and optional logo upload

This is important because the company name and WhatsApp number are used when sending bulk messages to guests.

---

## 📊 Screen 7: Dashboard (`/dashboard`)

The main home screen after login.

**What it contains:**
- **Sidebar** — navigation with Dashboard and Settings links, shows current plan (Free/Pro) and events used count
- **Top bar** — shows user's name, company name, and role
- **Stats cards** — Total Events, Active Events, Guests Managed, Messages Sent — all live from the backend
- **Filter tabs** — filter events by All / Active / Upcoming / Past
- **Event cards** — each event shows its name, location, date, number of sheets, and total guests. Each card has edit and delete options
- **Create Event button** — opens a modal to create a new event
- **Setup banner** — if the user hasn't completed onboarding, a banner asks them to finish

**Technical highlights:**
- When the page loads, I make 3 parallel API calls simultaneously (events, user info, stats) using `Promise.all()` so the page loads fast
- The loading state shows animated skeleton cards (pulsing placeholders)
- If the user is on the Free plan and hits 2 events, the "Create Event" button is automatically disabled and a warning appears

---

## ➕ Create Event Modal (popup from Dashboard)

When you click "Create Event", a modal (popup) slides in.

**What it contains:**
- Event Name, Event Type (Wedding/Corporate/Social/Other), Location, Start Date, End Date
- Column selector — user chooses which columns the guest sheet should have (PAX, Arrival, Departure, ID Type, Travel, Status)

For **Wedding** type events, the system automatically creates 3 sheets: Groom Side, Bride Side, Friends.
For other event types, it creates one sheet: Sheet1.

---

## 📋 Screen 8: RSVP Sheet / Guest Sheet (`/events/:eventId/rsvp`)

**This is the most complex and important screen I built.** It is the core of InviteSheet.

> *"Think of this screen as a supercharged Excel spreadsheet inside the browser."*

**What it contains:**

### Sheet Tabs
- Multiple tabs at the bottom, like Excel sheets (e.g., Groom Side | Bride Side | Friends)
- Right-click on a tab to: Rename, Duplicate, Insert Sheet After, Hide, or Delete
- Drag tabs to reorder them
- Hidden sheets can be shown again from a dropdown

### The Spreadsheet Grid (AG Grid)
- Powered by **AG Grid Community**, which handles thousands of rows without any performance issues
- Columns: Sr. No., Guest Name, Contact, Check-In, Status, ID Type, PAX, Room No., Travel, Arrival, Departure, Comments
- You can click any cell to edit it — just like Excel
- **Check-In column** has a toggle button — when you tap it, the guest is marked as checked in, and a toast notification appears
- **Status column** is a dropdown: Confirmed, Not Coming, VIP, Don't Call, Wrong Number, Pending — each shows a colored badge
- **ID Type column** is a dropdown: Aadhaar, Passport, Voter ID, Driving Licence, Other, Pending
- All data is **auto-saved to the backend** 800ms after any change (debounced sync)

### Counter Bar
- At the top: Total Guests | Checked In | Not Arrived | Not Coming | IDs Pending | IDs Received | VIP
- Clicking a counter filters the grid to show only those guests

### Toolbar Features
- **Search bar** — search guests by name or contact
- **Add Row** — adds a new blank row
- **Import Excel** — upload an Excel file and import guests
- **Export Excel** — download the guest list as an Excel file
- **SMS button** — opens a modal to send bulk SMS to guests
- **View toggle** — switch between Guest View and Room Allocation View

### Right-Click Context Menus
- **On a column header** — options to rename column, hide column, insert column left/right, delete column, add dropdown options
- **On a row** — options to copy row, cut row, paste, hide row, delete row

### Custom Columns
- Users can add their own columns with custom headers and dropdown options — making the sheet fully flexible for any type of event

### SMS Modal
- Choose recipients: All Sheets / Current Sheet / Only Checked In / Only Not Arrived
- Type a custom message
- Preview shows how many people will receive the SMS
- On send, the backend sends SMS via Fast2SMS API

### Room View
- Switches the grid to show guests grouped by their room numbers, combining data from all sheets

---

## ⚙️ Screen 9: Settings (`/dashboard/settings`)

For managing account settings.

**Tabs:**
1. **Profile** — Edit full name, phone (email is read-only, shows "Verified" badge)
2. **Password** — Change password with live strength meter, export data (JSON download for GDPR compliance), and account deletion with confirmation phrase
3. **Company** — Edit company name, city, WhatsApp number, upload company logo (PNG/JPG up to 2MB), view plan and usage stats

---

## 🔒 Private Routes

I implemented a **PrivateRoute component** that protects certain pages. If a user is not logged in (no JWT token in localStorage), they are automatically redirected to the Login page. Protected pages include: Dashboard, Settings, RSVP Sheet, Onboarding.

---

---

# PART 7 — KEY FEATURES SUMMARY

> *"Let me summarize the main features of the frontend."*

1. ✅ **Complete Authentication Flow** — Register → OTP Verify → Login → Forgot/Reset Password
2. ✅ **Beautiful Landing Page** with animations and pricing
3. ✅ **Onboarding Flow** — company setup after first login
4. ✅ **Dashboard** with real-time stats and event management
5. ✅ **Powerful Spreadsheet** — AG Grid with 10,000+ row support
6. ✅ **One-tap Check-In** with toggle and live counter updates
7. ✅ **VIP & Status Tracking** with color-coded badges
8. ✅ **ID Type Tracking** — Aadhaar, Passport, etc.
9. ✅ **Excel Import & Export**
10. ✅ **Bulk SMS Modal** with recipient filtering
11. ✅ **Multi-sheet support** (like Excel tabs) with rename, duplicate, hide, delete
12. ✅ **Custom Columns** — add your own columns with dropdown options
13. ✅ **Real-time auto-save** — all changes sync to backend automatically
14. ✅ **Room Allocation View** — see guests by room number
15. ✅ **Settings page** with profile, password, company management
16. ✅ **Responsive design** — works on mobile and desktop
17. ✅ **Private Routes** — protected pages for logged-in users only
18. ✅ **Free vs Pro plan** — plan limits enforced on the frontend

---

---

# PART 8 — Q&A SECTION
## (Possible Examiner Questions + My Answers)

---

### 🔴 BASIC PROJECT QUESTIONS

---

**Q1: What is InviteSheet? Explain in simple words.**

> "InviteSheet is a web-based SaaS product for Indian event management companies. It replaces the messy combination of Excel, WhatsApp, and paper lists that event planners currently use. It gives them a real-time, multi-user guest management system with check-in, VIP tracking, SMS, and Excel import/export — all in one place."

---

**Q2: Who is the target user of InviteSheet?**

> "Our target users are B2B — meaning business to business. We are targeting Indian event management agencies and wedding planning companies. These companies manage events for their clients — weddings, corporate events, social parties. They need a professional tool to manage hundreds or thousands of guests efficiently."

---

**Q3: What problem does InviteSheet solve?**

> "Event management companies in India currently use Excel sheets shared over WhatsApp or email. The problems are: data doesn't sync in real time, crashes with too many rows, no proper check-in system, no way to track VIPs, and no bulk communication. InviteSheet solves all of these in one professional platform."

---

**Q4: Is this a SaaS product? What does SaaS mean?**

> "Yes, InviteSheet is a SaaS — Software as a Service. This means the software is hosted on the internet and users access it through a browser, like how they use Gmail or Google Docs. Users pay a subscription to use it. They don't need to download or install anything. Our pricing has a Free plan (₹0, 2 events) and an Agency Pro plan (₹1,999/month, unlimited events)."

---

### 🟠 FRONTEND TECHNOLOGY QUESTIONS

---

**Q5: What is React? Why did you use it?**

> "React is a JavaScript library developed by Facebook (Meta) for building user interfaces. I used it because it allows me to break the UI into small, reusable components — for example, the EventCard component, the StatCard component, the Sidebar — and reuse them throughout the app. React also has a virtual DOM, which makes re-rendering very fast. When the guest count changes, React only updates that specific part of the page, not the whole page."

---

**Q6: What is TypeScript? Why not plain JavaScript?**

> "TypeScript is a superset of JavaScript that adds static type checking. For example, if I define that a guest object must have a 'name' field of type string, TypeScript will show an error immediately if I accidentally pass a number instead. This catches bugs before the code even runs. For a large project like ours with many components and API calls, TypeScript made the code much more reliable and easier to maintain."

---

**Q7: What is Vite? Why did you use it instead of Create React App?**

> "Vite is a modern build tool that is much faster than Create React App. When I save a file during development, Vite uses Hot Module Replacement — which means only the changed module updates in the browser, not the whole page. This makes development very fast. Vite also builds the production bundle much faster than older tools."

---

**Q8: What is AG Grid? Why did you use it for the spreadsheet?**

> "AG Grid is a powerful data grid library that is specifically designed to handle large amounts of data in the browser. Building a spreadsheet from scratch with thousands of rows would be very slow because the browser would need to render thousands of HTML elements. AG Grid uses a technique called virtual scrolling — it only renders the rows that are currently visible on screen, so even 10,000 rows load instantly. It also supports features like column resizing, sorting, custom cell renderers, and editable cells — which would take months to build from scratch."

---

**Q9: What is Tailwind CSS?**

> "Tailwind CSS is a utility-first CSS framework. Instead of writing custom CSS classes, I add pre-built utility classes directly in the HTML — like 'bg-green-500' for a green background, or 'flex items-center gap-3' for a flex layout. This lets me build and style components very quickly without switching between HTML and CSS files. Our project uses Tailwind CSS version 4."

---

**Q10: What is React Router?**

> "React Router is a library that handles navigation in a React app. Since React apps are Single Page Applications (SPAs), there is only one HTML file. React Router manages which component to show based on the URL. For example, when the URL is '/dashboard', it shows the Dashboard component; when it's '/login', it shows the Login component — all without reloading the page."

---

**Q11: What is Axios?**

> "Axios is an HTTP client library that I use to make API calls from the frontend to the backend. When a user logs in, I use Axios to send the email and password to the backend's `/auth/login` endpoint. The backend returns a JWT token, which I store in localStorage and attach to all future requests. Axios makes it easy to add headers, handle errors, and intercept requests."

---

**Q12: What is a JWT token? How do you use it?**

> "JWT stands for JSON Web Token. When a user logs in, the backend generates a token — a long string — and sends it to the frontend. I store this in localStorage. For every API call that requires authentication (like loading the dashboard), I attach this token in the request header. The backend checks this token to verify the user's identity. On logout, I delete the token from localStorage."

---

### 🟡 FRONTEND ARCHITECTURE QUESTIONS

---

**Q13: Explain the folder structure of your frontend.**

> "My frontend has a clear folder structure inside the `src` folder:
> - `app/screens/` — contains all the page components: Landing, Login, Register, OTP, ForgotPassword, ResetPassword, Onboarding, Dashboard, RsvpSheet, Settings
> - `app/components/` — contains reusable components like PrivateRoute and UI elements
> - `lib/` — utility functions, the API client setup
> - `styles/` — the global CSS file
> - `main.tsx` — the entry point where I define all the routes
> This separation makes the code organized and easy to maintain."

---

**Q14: What is a Private Route? How did you implement it?**

> "A Private Route is a wrapper component that checks whether the user is logged in before showing a page. In my `PrivateRoute` component, I check if there is a JWT token in localStorage. If yes, I render the child component (the protected page). If no, I redirect the user to the Login page. This way, pages like Dashboard, Settings, and the RSVP Sheet cannot be accessed without logging in."

---

**Q15: How does real-time data sync work in the RSVP sheet?**

> "When a user edits a cell in the spreadsheet — for example, changes a guest's status from 'Pending' to 'Confirmed' — that change is stored in the component's state in React. I use a technique called 'debouncing' — I wait 800 milliseconds after the last change, then send a bulk update to the backend API. This prevents too many API calls. The backend stores the updated data in MongoDB. If another team member refreshes their page, they see the latest data. For true real-time sync, the backend can be extended with WebSockets."

---

**Q16: How does Excel Import work?**

> "When the user clicks 'Import Excel' and selects a file, I read the file in the browser using the FileReader API or a library like SheetJS. I parse the Excel rows and columns into JavaScript objects that match our Guest data structure, then add them to the grid's state. The data is then synced to the backend. This lets users upload their existing guest lists directly from Excel without re-typing."

---

**Q17: How does Excel Export work?**

> "When the user clicks 'Export', I read the current data from the AG Grid and convert it to an Excel-compatible format using a library. I create a downloadable file in the browser using a Blob object and trigger an automatic download. The user gets a clean Excel file with all their guest data."

---

**Q18: What is a SPA (Single Page Application)?**

> "A Single Page Application is a web app that loads one HTML page and dynamically updates the content using JavaScript, without reloading the page. InviteSheet is an SPA built with React. When you navigate from the Dashboard to Settings, the browser doesn't reload — React Router swaps the components, giving a smooth, fast experience like a native app."

---

**Q19: How did you handle form validation?**

> "I used React Hook Form for managing form state and validation. For example, in the Register page, I validate: email format using a regex pattern, phone must be a valid 10-digit Indian number starting with 6-9, password must meet strength requirements (minimum 8 characters, uppercase, number, special character), and passwords must match. These validations run as the user types, showing real-time error messages. The submit button stays disabled until all validations pass."

---

**Q20: How did you implement the password strength meter?**

> "I built a custom PasswordStrength component. As the user types, I check the password against multiple rules: length ≥ 8, has uppercase letter, has a number, has a special character. Based on how many rules pass, I show a progress bar that changes color — red for weak, orange for medium, green for strong. This gives the user instant visual feedback."

---

### 🟢 DESIGN & UX QUESTIONS

---

**Q21: How did you design the UI? Did you use Figma?**

> "Yes, the design was initially created in Figma — in fact, the README mentions that the project started from a Figma design called 'Distinctive frontend interface design'. I then implemented that design using React and Tailwind CSS, making improvements and adjustments as I built the actual working components. I chose a dark theme for the landing page and a clean light theme for the dashboard — this is a common pattern in professional SaaS tools."

---

**Q22: Is the application mobile responsive?**

> "Yes. I used Tailwind CSS's responsive utility classes (like sm:, md:, lg: prefixes) to make the UI adapt to different screen sizes. The navigation bar on mobile shows only the logo; on desktop it shows all links. The dashboard's stats change from a 2-column to 4-column layout on larger screens. The RSVP sheet is especially optimized for mobile — the check-in toggle is designed to be easy to tap with a finger at the venue gate."

---

**Q23: What animations did you use and why?**

> "I used the Motion library (Framer Motion) for animations. On the landing page, the hero text fades in and slides up when the page loads. The rows in the hero mockup table animate in one by one with a slight delay, creating a staggered effect. The scrolling marquee at the bottom loops continuously. I also used hover animations on the feature cards — they gently scale up and reveal a background gradient on hover. These animations make the landing page feel premium and modern, which is important for a B2B SaaS product that needs to impress potential clients."

---

**Q24: Why did you choose a dark theme for the landing page?**

> "Dark themes are associated with premium, professional, and modern products — think of tools like Vercel, Linear, or GitHub. Since InviteSheet is targeting professional event agencies, we wanted the landing page to make a strong first impression. The dark theme with green accent colors (our brand color) creates a sleek, trustworthy look. The dashboard itself uses a light theme for practical reasons — when working with data all day, a light theme is easier on the eyes."

---

### 🔵 TECHNICAL DEEP DIVE QUESTIONS

---

**Q25: How does AG Grid handle 10,000 rows without slowing down?**

> "AG Grid uses a technique called 'Row Virtualization' or 'Virtual Scrolling'. Instead of rendering all 10,000 rows in the DOM at once, it only renders the rows that are currently visible in the viewport — typically 20–30 rows. As you scroll down, it removes the rows that go out of view from the DOM and adds the new rows coming into view. This means the browser is always only handling ~30 DOM elements regardless of how much data there is, keeping performance smooth."

---

**Q26: What is the difference between `useState` and `useMemo` in React?**

> "`useState` is used to store data that can change — like the list of events, the current tab, loading state. When state changes, React re-renders the component. `useMemo` is used to compute a value that depends on other values, but you don't want it to recompute on every render — only when its dependencies change. For example, in the RSVP sheet, I use `useMemo` to filter the displayed rows based on active filters and search query. Without `useMemo`, this filtering would run on every render, which would be slow with thousands of rows."

---

**Q27: What is `useCallback` and why did you use it?**

> "`useCallback` is similar to `useMemo` but for functions. It memoizes a function so that it's not recreated on every render. I used it for functions like `setRowData` and `filledForSync` in the RSVP sheet. If these functions were recreated on every render, they would cause child components that receive them as props to unnecessarily re-render, which would hurt performance."

---

**Q28: How do you prevent unnecessary API calls when saving data?**

> "I use a technique called debouncing. In the RSVP sheet, every time the user changes any cell, I start a timer for 800 milliseconds. If the user makes another change within those 800ms, I reset the timer. Only when 800ms have passed without any new changes do I send the API call. This means if someone quickly types a guest's name character by character, instead of sending 10 API calls (one per character), I only send 1 API call after they stop typing. I use `setTimeout` and `clearTimeout` inside a `useEffect` to implement this."

---

**Q29: How does the check-in flow work technically?**

> "In the RSVP sheet, each guest row has a Check-In column. I built a custom `CheckInRenderer` component for AG Grid's cell renderer. This component renders a toggle button. When the user clicks the toggle, it: first checks if the guest is marked as 'Not Coming' — if yes, shows a confirmation dialog. If the user confirms or the guest is in any other status, it updates the `checkIn` boolean to `true` (or `false` for unchecking), and shows a toast notification like 'Priya Sharma checked in'. The state update triggers the debounced sync to the backend."

---

**Q30: What is the `PrivateRoute` component and how does it work?**

> "The PrivateRoute component is a wrapper that I place around protected routes in the router configuration. Inside it, I check `localStorage.getItem('token')`. If a token exists, it means the user is logged in, so I render the `children` — the actual page component. If no token exists, I use React Router's `Navigate` component to redirect the user to '/login'. This ensures that even if someone directly types '/dashboard' in the URL, they will be redirected to the login page if they're not authenticated."

---

**Q31: How did you handle API errors on the frontend?**

> "I handle API errors at multiple levels. For each API call, I wrap it in a try-catch block. If an error occurs, I extract the error message from the backend's response using `error.response?.data?.error?.message`. If that's not available (for example, if the server is completely down and there's no response), I use a default fallback message like 'Unable to load data. Please try again.' I then set this error message in the component's state and display it using an Alert component. For form submissions, the error appears near the form. For page-level errors, it appears as a banner."

---

### 🟣 CONCEPTUAL / EXAMINER TRICK QUESTIONS

---

**Q32: What is the difference between Frontend and Backend? What did you do vs what did Aniruddha do?**

> "The frontend is everything the user sees in the browser — the UI, the forms, the animations, the spreadsheet grid. I built all of this using React and TypeScript. The backend is the server-side logic — the database, the APIs, the authentication, the email sending, the SMS gateway. Aniruddha built the backend using Node.js, Express, and MongoDB. The two communicate through REST APIs — my frontend sends HTTP requests (GET, POST, PATCH, DELETE) and the backend processes them and returns JSON data."

---

**Q33: What is REST API?**

> "REST API stands for Representational State Transfer. It is a way for the frontend and backend to communicate over HTTP. The frontend sends requests with standard HTTP methods: GET to read data, POST to create data, PATCH to update data, DELETE to remove data. The backend processes these requests and sends back JSON responses. For example, when I want to load all events on the dashboard, I send a GET request to `/api/events`, and the backend returns a JSON array of event objects."

---

**Q34: What is JSON?**

> "JSON stands for JavaScript Object Notation. It is a lightweight data format used to exchange data between the frontend and backend. It looks like JavaScript objects — with key-value pairs, arrays, and nested objects. For example, a guest object in JSON might look like: `{ 'name': 'Priya Sharma', 'contact': '9876543210', 'checkIn': true, 'status': 'Confirmed' }`. Both the frontend and backend understand JSON, so they use it as their common language."

---

**Q35: Why did you choose React over plain HTML/JavaScript?**

> "Plain HTML/JavaScript becomes very difficult to manage as the app grows. If I had built InviteSheet with plain JavaScript, I would have to manually update the DOM every time data changes — for example, when a guest is checked in, I'd have to find the specific row, find the toggle element, change its class, update the counter at the top, show a toast notification — all manually. With React, I just update the state variable (`checkIn: true`) and React automatically updates all the parts of the UI that depend on that state. This is called 'declarative' programming — I describe what the UI should look like, React figures out how to make it happen."

---

**Q36: What is component-based architecture?**

> "Component-based architecture means breaking the UI into small, reusable, self-contained pieces called components. For example, in InviteSheet, I have: a `StatCard` component (used 4 times on the dashboard), an `EventCard` component (used for each event in the list), a `Sidebar` component (shared between Dashboard and Settings pages), a `Topbar` component (also shared), a `Logo` component (used everywhere). Instead of writing the same code multiple times, I write it once as a component and reuse it wherever needed. This makes the code clean, maintainable, and easy to update."

---

**Q37: How do you handle the case when the API is slow or fails to load?**

> "I implement loading states and error states. When an API call starts, I set `loading = true` and show skeleton placeholder elements — empty gray boxes that pulse, indicating something is loading. If the API call succeeds, I set `loading = false` and render the real data. If it fails, I set `error = 'Something went wrong'` and show an error alert with the message. On the dashboard, during loading, you see 4 pulsing gray boxes instead of the real stat cards. This gives the user clear feedback instead of showing a blank screen."

---

**Q38: What is the difference between `localStorage` and `sessionStorage`?**

> "Both are browser storage mechanisms. `localStorage` stores data permanently — it persists even after the browser is closed. I use it to store the JWT token because users should stay logged in even if they close and reopen the browser. `sessionStorage` stores data only for the current browser session — it's deleted when the tab is closed. I use it to temporarily store the user's email between the Register page and the OTP page, so the OTP page knows which email to show."

---

**Q39: What security measures did you implement on the frontend?**

> "On the frontend, I implemented several security measures: 
> 1. JWT token stored in localStorage and sent with every API request — the backend validates it.
> 2. Private Route protection — unauthenticated users cannot access protected pages.
> 3. Form validation — prevents invalid or malicious data from being submitted.
> 4. Account deletion requires typing 'DELETE MY ACCOUNT' exactly — prevents accidental deletions.
> 5. Password strength enforcement — users cannot create weak passwords.
> 6. XSS protection is handled by React itself — React escapes all dynamic values by default, preventing script injection."

---

**Q40: Can multiple users work on the same sheet at the same time?**

> "Yes, this is one of InviteSheet's key features. Multiple team members — for example, staff at the gate, the hospitality team, and the manager — can all have the sheet open simultaneously. Each person's changes are saved to the backend database. When one person updates a guest's check-in status, if the other person refreshes, they see the latest data. For truly instant live sync without refreshing, a WebSocket connection could be added — that would be a future enhancement."

---

**Q41: What would you improve if you had more time?**

> "If I had more time, I would add: 
> 1. WebSocket-based real-time sync so changes appear instantly on all users' screens without refreshing.
> 2. A mobile app using React Native — using the same business logic.
> 3. Drag-and-drop row reordering in the spreadsheet.
> 4. More chart visualizations on the dashboard — like a check-in progress pie chart.
> 5. Offline support — using Service Workers so the app works even without internet.
> 6. Dark mode for the dashboard."

---

**Q42: What was the most challenging part of building the frontend?**

> "The most challenging part was building the RSVP Sheet — the spreadsheet component. It needed to behave exactly like Excel: editable cells, custom renderers for toggle buttons and color-coded badges, right-click context menus on rows and columns, column hiding and renaming, custom columns with dropdown options, multi-sheet tabs with rename/duplicate/delete, and all of this while maintaining smooth performance with large datasets. Integrating AG Grid and customizing it to match our design, while also syncing all changes to the backend, was the most complex technical work I did."

---

**Q43: How is your project different from just using Google Sheets?**

> "Google Sheets is a general-purpose tool. InviteSheet is purpose-built for event management. The differences are: 
> 1. InviteSheet has built-in columns specifically for events — check-in toggle, ID type, VIP status — Google Sheets has none of these.
> 2. InviteSheet has a dedicated check-in mode optimized for mobile at the venue gate.
> 3. InviteSheet automatically creates Groom Side / Bride Side / Friends sheets for weddings.
> 4. InviteSheet has built-in bulk SMS functionality.
> 5. InviteSheet has a landing page with pricing — it's a product you can sell to event companies.
> 6. InviteSheet has a proper login system with company management, roles, and plans."

---

---

# CLOSING STATEMENT

> *"Thank you for listening to my presentation."*

To summarize, I built the entire **frontend of InviteSheet** — a professional B2B SaaS platform for Indian event management companies.

I used **React 18, TypeScript, Vite, Tailwind CSS, AG Grid, Motion, and Radix UI** to build 9 screens and dozens of components.

The most important screen is the **RSVP Sheet** — a feature-rich spreadsheet that handles thousands of guests, supports real-time check-in, VIP tracking, bulk SMS, Excel import/export, multi-sheet management, and custom columns.

Our frontend is connected to **Aniruddha's backend** through REST APIs, and together we built a complete, production-ready SaaS product.

I am happy to answer any questions.

---

*— Script prepared for Sanjana Ramesh Patil | InviteSheet Project | Final Presentation*
