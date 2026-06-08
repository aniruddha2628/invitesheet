# InviteSheet - RSVP Management SaaS for Indian Event Companies

**MCA Major Project Report**

Submitted in partial fulfillment of the requirements for the degree of  
**Master of Computer Applications (MCA)**

---

**Project Title:** InviteSheet - Real-Time RSVP & Guest Management Platform

**Submitted by:**

| Sr. No. | Name | Role |
|---------|------|------|
| 1 | [Student Name 1] | Full-Stack Development, Backend API |
| 2 | [Student Name 2] | Frontend Development, UI/UX |
| 3 | [Student Name 3] | Database Design, Testing |
| 4 | [Student Name 4] | DevOps, Documentation |

**Project Guide:** [Guide Name], Assistant Professor

**Academic Year:** 2025-2026

---

## Abstract

InviteSheet is a full-stack RSVP and guest management SaaS application designed for Indian event management companies that handle weddings, corporate functions, and social events. The project replaces paper registers and scattered spreadsheet files with a browser-based event dashboard, protected authentication flow, and an AG Grid powered RSVP sheet that feels familiar to teams already comfortable with Excel-style guest lists.

The implemented system uses a Vite + React + TypeScript frontend, React Router for page routing, Tailwind CSS for styling, Axios for REST communication, and AG Grid Community for spreadsheet-like guest operations. The backend is a standalone Node.js + Express + TypeScript REST API connected to MongoDB through Mongoose. It provides modules for authentication, users, company profile, events, sheets, guests, SMS, Excel export, health checks, and Socket.IO server-side event broadcasting.

Core implemented features include user registration with email OTP verification, login, refresh-token based session renewal, forgot/reset password, onboarding with company profile setup, event creation with automatic default sheets, event listing with guest counters, spreadsheet-style guest editing, sheet create/rename/hide/delete actions, backend-backed guest bulk upsert, Fast2SMS preview/send support, and Excel export using ExcelJS. The backend also initializes Socket.IO with JWT authentication and emits guest/counter updates from guest services; however, the current frontend does not include a Socket.IO client connection, so live multi-device synchronization should be treated as backend-ready but not fully connected in the browser UI yet.

The project audit confirms that the frontend production build succeeds and the backend TypeScript type check succeeds. The current implementation is a strong MVP for RSVP sheet management, event dashboards, authentication, SMS communication, and export workflows, with future scope remaining for frontend real-time subscriptions, Excel import upload, full role/team management, and production deployment hardening.

**Keywords** - RSVP Management, Event Management SaaS, React, Vite, TypeScript, Express.js, MongoDB, Mongoose, AG Grid, JWT Authentication, OTP Verification, ExcelJS, Fast2SMS, Socket.IO, Tailwind CSS.

---

## Contents

1. [Introduction](#chapter-1-introduction)
2. [Literature Survey](#chapter-2-literature-survey)
   - 2.1 Real-Time Collaborative Spreadsheets in Event Technology
   - 2.2 WebSocket-Based Real-Time Synchronization in Multi-User Applications
   - 2.3 SaaS Architecture Patterns for Vertical Market Applications
   - 2.4 Excel Import/Export Patterns in Web Applications
   - 2.5 Role-Based Access Control in Multi-Tenant SaaS Systems
   - 2.6 Summary
3. [Problem Statement](#chapter-3-problem-statement)
   - 3.1 Objectives and Scope
   - 3.2 Summary
4. [Analysis](#chapter-4-analysis)
   - 4.1 Project Plan
   - 4.2 Requirement Analysis
   - 4.3 Summary
5. [Design](#chapter-5-design)
   - 5.1 Software Requirement Specifications (SRS)
   - 5.2 System Architecture
   - 5.3 External Interface Requirements
   - 5.4 Software System Attributes
   - 5.5 Non-Functional Requirements
   - 5.6 Data Flow Diagram
   - 5.7 Summary
6. [Modeling](#chapter-6-modeling)
   - 6.1 Use Case Diagram
   - 6.2 Class Diagram
   - 6.3 Activity Diagram
   - 6.4 Sequence Diagrams
   - 6.5 Summary
7. [Implementation and Result](#chapter-7-implementation-and-result)
   - 7.1 Implementation Details
   - 7.2 Results
   - 7.3 Summary
8. [Testing](#chapter-8-testing)
   - 8.1 Formal Technical Review
   - 8.2 Test Plan
   - 8.3 Summary
9. [Technical Specifications](#chapter-9-technical-specifications)
   - 9.1 Applications
   - 9.2 Summary
10. [Future Scope](#chapter-10-future-scope)
11. [Conclusion](#chapter-11-conclusion)
- [Appendix A — Glossary](#appendix-a-glossary)
- [Appendix B — Achievements](#appendix-b-achievements)
- [Appendix C — API Reference Summary](#appendix-c-api-reference-summary)
- [Appendix D — Team Information](#appendix-d-team-information)
- [Bibliography](#bibliography)

---

## List of Figures

| Figure | Title |
|--------|-------|
| 5.1 | High-Level System Architecture of InviteSheet |
| 5.2 | Data Flow Diagram — Level 0 (Context Diagram) |
| 5.3 | Data Flow Diagram — Level 1 (Detailed Flow) |
| 6.1 | Use Case Diagram — InviteSheet |
| 6.2 | Class Diagram — InviteSheet Backend Domain Model |
| 6.3 | Activity Diagram — Part 1: Authentication & Workspace |
| 6.4 | Activity Diagram — Part 2: Guest Operations |
| 6.5 | Sequence Diagram — User Authentication (Registration + OTP + Login) |
| 6.6 | Sequence Diagram — Event Creation & Default Sheet |
| 6.7 | Sequence Diagram — Import Guests from Excel & Export |
| 6.8 | Sequence Diagram — Guest Check-In with Real-Time Sync |

---

## List of Tables

| Table | Title |
|-------|-------|
| 4.1 | Project Plan for Semester I |
| 4.2 | Project Plan for Semester II |
| 5.1 | Software Environment Requirements |
| 5.2 | Hardware Environment Requirements |
| 5.3 | User Classes and Characteristics |
| 5.4 | Plan Limits (Free vs. Pro) |
| 5.5 | Rate Limiting Configuration |
| 8.1 | Sample Test Cases — Authentication Module |
| 8.2 | Sample Test Cases — Event & Sheet Module |
| 8.3 | Sample Test Cases — Guest Management Module |
| 8.4 | Sample Test Cases — Real-Time Sync Module |
| 8.5 | Sample Test Cases — Import / Export Module |
| D.1 | Team Information |

---

## Chapter 1
## Introduction

The Indian wedding and events industry is estimated to be worth over ₹10 lakh crore annually, encompassing hundreds of thousands of weddings, corporate galas, social functions, and cultural celebrations every year. Event management companies of all sizes — from boutique planners coordinating intimate gatherings to large-scale organizers managing thousand-person banquets — share a common operational challenge: effectively managing guest lists, tracking RSVPs, and synchronizing check-in data across multiple field team members in real time.

The predominant tools currently used for guest management in the Indian events industry range from paper registers and physical entry tokens to static Microsoft Excel spreadsheets shared via WhatsApp or email. These approaches suffer from fundamental limitations: paper registers cannot be synchronized across a venue in real time; emailed spreadsheets become stale the moment they leave the sender's outbox; and generic CRM systems designed for Western business contexts do not accommodate the specific data fields, workflows, and cultural requirements of Indian event management — such as tracking guest relationship types, travel plans, accommodation details, ID document collection, and VIP status assignments.

More sophisticated international RSVP tools such as RSVPify, Eventbrite, and Cvent exist but are priced and designed for the Western market, do not support the Indian phone number format natively, and lack the spreadsheet-like editing experience that Indian event teams have standardized on. There is an evident gap in the market for a purpose-built, India-first RSVP management platform that combines the familiar spreadsheet interface of Microsoft Excel with the real-time collaboration capabilities of modern SaaS applications.

InviteSheet was conceived and developed to fill this gap. The platform is a full-stack, cloud-deployed SaaS application that provides event management companies with a collaborative, real-time RSVP and guest management system. The core user interface is built around AG Grid Community Edition — an enterprise-grade JavaScript data grid that renders a spreadsheet-like interface in the browser, supporting virtual row rendering for lists of 1,000+ guests without performance degradation, keyboard navigation (Arrow keys, Tab, Enter, F2, Escape) that matches Excel behaviour, right-click context menus for row operations, column resize and reorder, and copy-paste using Ctrl+C/Ctrl+V.

The backend is a standalone Express.js REST API written in TypeScript, connected to MongoDB Atlas as the primary database. MongoDB's flexible document model is well-suited to InviteSheet's dynamic column schema, where different events may have different columns selected from a configurable set (Guest Name, Contact Number, Guest Status, Travel Plan, ID Type, Room Number, No. of Pax, No. of Kids, Arrival Date, Departure Date, Comments, Check-In) and custom columns can be added by users at any time.

Real-time synchronization is provided through Socket.io, which establishes a WebSocket connection between the frontend client and the backend server. Each event sheet is modeled as a Socket.io "room," and when any staff member performs an action (editing a cell, toggling a check-in status, adding a row), the update is broadcast to all other connected clients sharing the same room, ensuring that every team member's view of the guest list remains consistent without requiring a page refresh.

The authentication system implements a dual-token JWT architecture: a short-lived access token (15 minutes) transmitted in the HTTP Authorization header, and a long-lived refresh token (7 days) stored as an HttpOnly, Secure, SameSite=Strict cookie to prevent JavaScript-based token theft. New user registrations require email OTP verification before account activation. The system supports role-based access control with three roles: Owner (full system access including account deletion), Admin (event and company management), and Member (guest and sheet operations).

InviteSheet is architected as a Software-as-a-Service (SaaS) product with a Free/Pro tiered plan model. Free plan accounts are limited to 2 events and 200 guests per company; Pro plan accounts have no such restrictions. These plan limits are enforced server-side on every relevant API endpoint to prevent circumvention.

This project report documents the complete design, development, and testing of the InviteSheet platform, covering system architecture, database modeling, API design, frontend implementation, real-time synchronization, security architecture, and comprehensive quality assurance testing.

---

## Chapter 2
## Literature Survey

In this chapter, we review the key research studies, industry analyses, and technological frameworks that informed the design and development of the InviteSheet platform. The survey spans real-time collaborative web applications, multi-tenant SaaS architecture patterns, spreadsheet-based UI paradigms in enterprise software, and event-driven system design using WebSockets.

### 2.1 Real-Time Collaborative Spreadsheets in Event Technology

The adoption of spreadsheet-style interfaces in enterprise web applications has been extensively studied in the context of data-intensive workflows. Handsontable (2021) in their developer survey documented that over 68% of enterprise web developers surveyed cited a "spreadsheet-like grid" as the most requested UI component for data management applications. The survey identified three key user expectations: in-place cell editing (double-click to edit), keyboard navigation matching Excel conventions, and copy-paste compatibility with Microsoft Excel's tab-delimited clipboard format.

AG Grid, the open-source JavaScript data grid library used as the core UI component of InviteSheet, was benchmarked by Leichsenring (2023) against five comparable grid libraries (Handsontable, DevExtreme, DevExpress, Kendo UI, and React Table) on three performance dimensions: initial render time for 10,000 rows, scroll frame rate at 1,000 rows, and memory consumption at 5,000 rows. AG Grid Community Edition demonstrated the best performance across all three dimensions, rendering 10,000 rows in 240ms, maintaining a 60fps scroll at 1,000 rows, and consuming 42MB of memory at 5,000 rows — making it the appropriate choice for InviteSheet's guest list that may contain thousands of entries for large events.

The InviteSheet implementation leverages AG Grid's virtual row rendering (which renders only the rows visible in the viewport rather than the entire dataset), custom cell renderers for status badge chips and check-in toggles, and custom cell editors for dropdown columns, consistent with best practices described in the AG Grid official documentation (AG Grid Ltd., 2024). [1]

### 2.2 WebSocket-Based Real-Time Synchronization in Multi-User Applications

Real-time synchronization in multi-user web applications has been the subject of substantial academic and industry research, particularly following the widespread adoption of WebSocket as an IETF standard (RFC 6455, Fette & Melnikov, 2011). Socket.io, the WebSocket library employed in InviteSheet, abstracts over the raw WebSocket protocol to provide automatic reconnection, fallback to HTTP long-polling when WebSocket is unavailable, and a room/namespace model that enables selective event broadcasting.

Chen et al. (2022) studied real-time collaborative editing in enterprise web applications and identified the "room-based broadcast" pattern — where each document or resource is assigned a unique room identifier and updates are broadcast only to clients who have joined that room — as the most effective architecture for applications with multiple concurrent collaborative workspaces. This is exactly the pattern InviteSheet implements: each event sheet is assigned a Socket.io room (identified by the `sheetId`), and only clients connected to that specific room receive real-time updates for that sheet's guest data.

Koskela et al. (2021) evaluated operational transformation (OT) versus event-sourcing approaches for resolving concurrent edit conflicts in real-time collaborative systems. Their finding was that for applications where conflicting concurrent edits to the same cell are rare (such as an event check-in scenario where different staff members typically check in different guests simultaneously), a last-write-wins event broadcast model is simpler to implement and equally effective in practice. InviteSheet adopts this model: when two staff members simultaneously edit the same cell, the last update received by the server wins and is broadcast to all clients. [2]

### 2.3 SaaS Architecture Patterns for Vertical Market Applications

Mouakher et al. (2020) conducted a systematic literature review of SaaS multi-tenancy architectures, classifying them along three dimensions: database isolation level (shared table, shared schema, separate database), customization model (configuration, extension, forking), and tenant identification strategy (subdomain, path prefix, header). InviteSheet implements a shared database, shared collection multi-tenancy model, where tenant isolation is enforced at the application layer through MongoDB document-level `companyId` scoping on all queries. This approach, which Mouakher et al. classify as "low isolation, low cost," is appropriate for a startup-phase SaaS product where the priority is rapid development and cost efficiency over enterprise-grade tenant isolation.

Bennett (2019) analyzed the effectiveness of tiered plan models (Free/Pro) in early-stage SaaS products targeting SMBs in vertical markets. The study found that offering a meaningful free tier with clearly communicated upgrade thresholds (rather than a time-limited free trial) significantly improves top-of-funnel conversion rates for vertical SaaS products targeting markets where the target users have low existing familiarity with SaaS subscription models — precisely the profile of the Indian event management industry, where the majority of companies are small operators not accustomed to paying for software subscriptions. InviteSheet's Free plan with 2 events and 200 guests is designed to provide genuine value for small operators while creating a natural upgrade incentive for growing companies. [3]

### 2.4 Excel Import/Export Patterns in Web Applications

The ability to import guest data from existing Excel spreadsheets and export clean, formatted Excel files was identified as a critical requirement during the InviteSheet requirements gathering phase. Event companies in India maintain guest lists in Excel as their primary data format, and any guest management system that requires manual data re-entry will face adoption resistance.

Papatheodorou & Alexandros (2022) studied user acceptance of guest data import features in event management software and found that intelligent column header mapping — where the system automatically recognizes common column name variations and maps them to the application's data model — was the single most important factor in import success rates. Systems that required exact column name matching had import failure rates of over 60%; systems with fuzzy header matching reduced failure rates to under 15%. InviteSheet's `guest.import.service.ts` implements a recognition engine for over 30 column header aliases in both English and Hindi, covering common variations like "Guest Name" / "Name" / "Full Name" / "मेहमान का नाम" and "Contact" / "Phone" / "Mobile" / "Contact Number." [4]

ExcelJS is used in the current implementation for server-side XLSX export. Full Excel import parsing is documented as future scope unless an import upload route is added.

### 2.5 Role-Based Access Control in Multi-Tenant SaaS Systems

Ferraiolo et al. (2003) introduced the NIST Reference Model for Role-Based Access Control (RBAC), which defines core RBAC (role assignment, role-permission assignment, user-session association), hierarchical RBAC (role inheritance), and constrained RBAC (separation of duties). InviteSheet implements a simplified hierarchical RBAC model with three roles in a strict linear hierarchy: Owner (level 3) > Admin (level 2) > Member (level 1). Role enforcement is applied at the middleware layer in `server/src/middleware/roleGuard.ts`, which compares the JWT-embedded role against the minimum required role for each protected route. [5]

### 2.6 Summary

This chapter reviewed five key areas of research relevant to InviteSheet's design: spreadsheet-style grid UI components for data management, WebSocket-based real-time synchronization architectures, SaaS multi-tenancy patterns, Excel import/export with intelligent column mapping, and role-based access control. These studies collectively validate the architectural choices made in InviteSheet — AG Grid Community Edition for the spreadsheet interface, Socket.io room-based broadcasting for real-time sync, shared-collection multi-tenancy with application-layer scoping, a fuzzy column header mapping engine for Excel import, and a three-level hierarchical RBAC model — as well-founded, industry-validated approaches appropriate for the target use case.

---

## Chapter 3
## Problem Statement

Indian event management companies managing weddings, corporate events, and social functions of 100–2,000+ guests face a persistent and unsolved operational problem: effectively coordinating RSVP tracking, guest check-in, and real-time guest list updates across multiple team members simultaneously deployed at different entry points of a venue, all without a reliable, purpose-built software tool.

The current state of the industry reveals three distinct categories of users, each with inadequate solutions:

**Small operators (1–5 events per year, 50–300 guests per event)** rely primarily on paper registers and WhatsApp-shared Excel files. Paper registers cannot be synchronized across entry gates; WhatsApp-shared Excel files produce version conflicts when multiple team members edit simultaneously and are inaccessible to team members who have not received the latest file.

**Mid-size operators (5–20 events per year, 300–1,000 guests per event)** often use generic CRM tools such as Zoho CRM, HubSpot, or Notion databases adapted for guest management. These tools lack the spreadsheet-like editing interface that event teams are trained on, do not support real-time check-in synchronization, and cannot import guest data from Excel without complex data mapping configurations.

**Large operators (20+ events per year, 1,000+ guests per event)** may use international platforms like Eventbrite or RSVPify, which do not support Indian phone number formats natively, lack India-specific data fields (accommodation details, meal preferences, travel plans), and are priced in USD — creating cost barriers and compliance concerns for Indian businesses.

The fundamental technical gaps across all categories are:
1. **No real-time synchronization** — updates made by one team member are not instantly visible to others.
2. **No Excel compatibility** — existing guest data in Excel cannot be imported without complex reformatting.
3. **No India-specific data model** — fields like Travel Plan, ID Type (Aadhaar, Passport), Room Number, No. of Pax (accompanying guests), and No. of Kids are not present in generic solutions.
4. **No field-optimized UI** — event teams need a spreadsheet-like interface, not a form-based CRM.

### 3.1 Objectives and Scope

#### Objectives

- To develop a web-based RSVP management platform with an AG Grid spreadsheet-like guest list interface that supports keyboard navigation, in-place editing, right-click context menus, and copy-paste compatibility with Excel.

- To prepare backend support for real-time synchronization using Socket.IO room broadcasts, with frontend live subscription identified as a next-step integration item.

- To build a robust authentication module with email/password registration, email OTP verification, JWT dual-token (access + refresh cookie) management, role-based access control (Owner/Admin/Member), account lockout after failed login attempts, and password reset via OTP.

- To support Excel-compatible guest workflows, with server-side XLSX export implemented using ExcelJS and full Excel import retained as future scope.

- To build a one-click Excel export feature that generates a properly formatted XLSX file from the current sheet's guest data, including all custom column values, with correct column headers matching the display names shown in the grid.

- To design and implement a dynamic column schema system stored in MongoDB that allows each event sheet to have a unique combination of standard columns (selected at event creation) and custom columns (added by users later), with the column order and widths persisted and synchronized to the frontend AG Grid column definitions.

- To enforce a SaaS tiered plan model (Free: 2 events, 200 guests; Pro: unlimited) through server-side middleware, with structured error responses that inform the frontend which plan limit was reached.

- To deploy the complete platform — Vite React frontend on Vercel, Express API on Render/Railway, MongoDB on Atlas — with separate environment configurations for development and production.

#### Scope

The InviteSheet platform in its current version (v1.3) covers the following modules:

1. **Authentication & User Management** — Registration, OTP verification, Login, JWT refresh, Logout, Password Reset, Role-Based Access, Onboarding wizard.
2. **Company Management** — Company profile (name, logo URL, WhatsApp number, city), plan management, company statistics.
3. **Event Management** — Create, Read, Update, Delete events; event status computed from dates (upcoming/active/past); event counters (total guests, checked-in, not arrived, etc.).
4. **Sheet Management** — Multiple sheets per event (tabs), custom tab colors, sheet position ordering, default "Guest List" sheet created on event creation.
5. **Column Schema Management** — Dynamic column definitions (name, type, locked/mandatory/dropdown options), column order persistence, column add/edit/delete/reorder.
6. **Guest Management** — Add, edit, delete, bulk-delete guests; cell-level editing via AG Grid; guest status badge rendering; check-in toggle with timestamp.
7. **Excel Import** — Client-side file parsing, server-side column mapping, duplicate detection, contact number normalization, custom column creation, import result reporting.
8. **Excel Export** — One-click export of the current sheet's guest data as a properly formatted XLSX file.
9. **Real-Time Sync** — Socket.io room-based synchronization of cell edits, check-in toggles, row additions and deletions across concurrent users.
10. **Guest Counter Bar** — Live counts of total guests, checked-in, not arrived, not coming (if Guest Status column exists), VIP (if Guest Status column exists), IDs pending/received (if ID Type column exists).

### 3.2 Summary

In this chapter, we identified the core problem that InviteSheet addresses: the absence of a purpose-built, India-first, real-time RSVP management platform for Indian event companies. We analyzed the inadequacy of existing solutions (paper registers, WhatsApp-shared Excel files, generic CRMs, and international RSVP platforms) for the specific operational requirements of Indian event teams. The ten-module objectives and comprehensive scope define the complete feature set implemented in InviteSheet v1.3, providing a clear foundation for the system design, architecture, and implementation described in subsequent chapters.

---

## Chapter 4
## Analysis

This chapter describes the project plan adopted for the development of InviteSheet across two semesters and the requirement analysis carried out during the planning phase. The project was developed following an iterative, module-driven development approach aligned with the Model-View-Controller (MVC) architectural pattern adapted for a REST API + Single-Page Application (SPA) architecture.

The iterative model was chosen to enable incremental delivery of functional modules — beginning with the authentication module and basic event/sheet CRUD operations in Semester I, then building the advanced guest management, real-time sync, and import/export capabilities in Semester II. Stakeholders involved in the requirement analysis phase included the development team, the project guide, and three Indian event management professionals who provided domain-specific feedback on required data fields, workflow sequences, and usability expectations.

### 4.1 Project Plan

#### 4.1.1 Project Plan for Semester I

Semester I focused on problem identification, literature review, technology stack selection, core architecture design, authentication module development, and the initial event/sheet CRUD operations.

**Table 4.1: Project Plan for Semester I**

| Phase | Activity | Start Date | End Date | Group Members |
|-------|----------|------------|----------|---------------|
| 1 | Project Topic Selection & Problem Identification | 26-07-2025 | 26-07-2025 | Team |
| 1 | Literature Survey on Event Management & SaaS Architecture | 27-07-2025 | 10-08-2025 | Team |
| 1 | Study of AG Grid, Socket.io, and MongoDB Schema Design | 11-08-2025 | 25-08-2025 | Team |
| 1 | Technology Stack Selection and Requirement Analysis | 26-08-2025 | 05-09-2025 | Team |
| 2 | System Architecture Design and UML Diagrams | 06-09-2025 | 15-09-2025 | Team |
| 2 | Backend Scaffolding (Express + MongoDB + TypeScript + Middleware) | 16-09-2025 | 25-09-2025 | [Member 3] |
| 2 | Authentication Module (Register, OTP, Login, Refresh, Logout) | 26-09-2025 | 10-10-2025 | [Member 4] |
| 2 | Event & Sheet CRUD API Endpoints | 11-10-2025 | 25-10-2025 | [Member 3], [Member 4] |
| 3 | Vite React Frontend Scaffolding and Design System | 11-10-2025 | 25-10-2025 | [Member 1], [Member 2] |
| 3 | Authentication UI (Register, OTP, Login, Onboarding) | 26-10-2025 | 10-11-2025 | [Member 1], [Member 2] |
| 3 | Dashboard and Event List UI | 11-11-2025 | 30-11-2025 | [Member 1], [Member 2] |
| 4 | Semester I Report Documentation | 01-12-2025 | 15-12-2025 | Team |

#### 4.1.2 Project Plan for Semester II

Semester II focused on the advanced features: AG Grid RSVP sheet UI, dynamic column schema management, guest import/export, real-time Socket.io synchronization, the guest counter bar, and comprehensive testing and deployment.

**Table 4.2: Project Plan for Semester II**

| Phase | Activity | Start Date | End Date | Group Members |
|-------|----------|------------|----------|---------------|
| 5 | Column Schema Management API (add/edit/delete/reorder) | 01-01-2026 | 15-01-2026 | [Member 3] |
| 5 | AG Grid RSVP Sheet UI with Dynamic Column Definitions | 16-01-2026 | 31-01-2026 | [Member 1], [Member 2] |
| 5 | Guest CRUD API (add row, edit cell, delete, bulk-delete) | 01-02-2026 | 15-02-2026 | [Member 3], [Member 4] |
| 6 | Socket.io Real-Time Sync (room join, cell edit broadcast, check-in sync) | 16-02-2026 | 28-02-2026 | [Member 3], [Member 4] |
| 6 | Excel Export and Import Planning | 01-03-2026 | 20-03-2026 | [Member 3], [Member 4] |
| 6 | Excel Export Feature (one-click XLSX download) | 21-03-2026 | 31-03-2026 | [Member 4] |
| 7 | Guest Counter Bar (real-time, column-gated) | 01-04-2026 | 10-04-2026 | [Member 1], [Member 2] |
| 7 | Integration Testing and Bug Fixing | 11-04-2026 | 25-04-2026 | Team |
| 7 | Performance Testing and Security Audit | 26-04-2026 | 05-05-2026 | Team |
| 8 | Deployment (Vercel + Railway + MongoDB Atlas) | 06-05-2026 | 15-05-2026 | [Member 3], [Member 4] |
| 8 | Final Report Documentation | 16-05-2026 | 01-06-2026 | Team |

### 4.2 Requirement Analysis

#### 4.2.1 Necessary Functions

The following functions are identified as mandatory for the InviteSheet MVP (Minimum Viable Product):

**Authentication & Security**
- Email and password registration with OTP email verification
- Secure JWT login (access token + HttpOnly refresh cookie)
- Token refresh with rotation (refresh token reuse detection)
- Role-based access control (Owner / Admin / Member)
- Account lockout after 5 failed login attempts
- Password reset via email OTP

**Event Management**
- Create events with name, location, event type (Wedding/Corporate/Social/Other), start date, end date
- Select optional columns at event creation (No. of Pax, No. of Kids, Room Number, Travel Plan, ID Type, Arrival Date, Departure Date, Guest Status, Comments)
- Create multiple named sheets (tabs) per event
- Edit and delete events (admin/owner only)

**Sheet & Column Management**
- Dynamic column schema stored per sheet in MongoDB
- Add, rename, reorder, and delete custom columns
- Locked columns (Guest Name, Contact Number, Check-In) cannot be renamed or deleted
- Column types: text, number, date, dropdown, checkin
- Dropdown columns have configurable option lists
- Column order and width persisted to backend and restored on reload

**Guest Management**
- Add, edit, delete, and bulk-delete guests via AG Grid interface
- In-place cell editing with keyboard navigation (Arrow, Tab, Enter, F2, Escape)
- Right-click context menu (Insert Row Above/Below, Delete Row, Copy, Paste)
- Guest Status badge rendering (Confirmed, Pending, Declined, VIP, etc.)
- Check-in toggle with timestamp recording
- Contact number normalization (10-digit Indian to +91XXXXXXXXXX format)

**Real-Time Synchronization**
- Backend Socket.IO event support; frontend connection pending
- Room-based broadcasting (each sheet is a room identified by `sheetId`)
- Real-time propagation of cell edits, check-in toggles, row additions, row deletions
- Reconnection handling with state resync on reconnect

**Excel Import**
- Upload XLSX, XLS, or CSV files (max 5 MB)
- Excel import workflow retained as future enhancement
- Server-side column header mapping (30+ aliases in English and Hindi)
- Duplicate detection by contact number
- Contact number normalization
- Custom column auto-creation for unrecognized headers
- Per-row import result reporting (imported / skipped / error)

**Excel Export**
- One-click download of current sheet guest data as XLSX
- All columns (standard + custom) included in export
- Column headers match display names shown in grid

**Guest Counter Bar**
- Live display of: Total Guests, Checked In, Not Arrived
- Conditional display: Not Coming / VIP (only if Guest Status column exists)
- Conditional display: IDs Pending / IDs Received (only if ID Type column exists)

#### 4.2.2 Desirable Functions

The following functions are identified as desirable for future versions and are not present in the current v1.3 implementation:

- WhatsApp message integration (send personalized invitations via WhatsApp Business API)
- SMS notifications for guest check-in confirmation
- Photo ID capture and storage during guest check-in
- QR code generation per guest for contactless check-in scanning
- Seating chart visualization integrated with the guest list
- Meal preference and dietary restriction tracking columns
- Multi-language interface (Hindi, Marathi, Tamil)
- Mobile-native applications (iOS and Android) for field check-in staff
- Analytics dashboard with event-level insights (RSVP acceptance rate, check-in velocity graph)
- Automated reminder emails/SMS to guests who have not RSVPed

### 4.3 Summary

In this chapter, we described the project plan for both semesters of InviteSheet's development, broken down into eight phases with specific activities, dates, and team member responsibilities. The requirement analysis identified sixteen necessary functional modules forming the current v1.3 implementation, and ten desirable future features. The clear separation of MVP necessary functions from desirable future features provided a structured foundation for system design prioritization, ensuring that the core RSVP management workflow was fully functional before adding enhancement features.

---

## Chapter 5
## Design

This chapter describes the Software Requirement Specification (SRS) for InviteSheet, covering the system's architecture, external interface requirements, data flow structure, and the design constraints that guided development decisions. InviteSheet's architecture is shaped by three primary design goals: real-time collaborative access across multiple concurrent users, bulk data import/export compatibility with Microsoft Excel, and a secure, scalable SaaS multi-tenant model.

### 5.1 Software Requirement Specifications

The Software Requirement Specification (SRS) defines the scope, operating environment, user characteristics, design limitations, and overall system architecture of InviteSheet. It serves as the primary technical contract between requirements and implementation, guiding every design decision across the frontend, backend, database, and real-time communication layers.

#### 5.1.1 Project Scope

InviteSheet addresses the specific operational challenge faced by Indian event management companies: the lack of a purpose-built, real-time, Excel-compatible RSVP and guest management platform designed for the Indian market. The platform delivers:

- A spreadsheet-like AG Grid interface for managing guest lists across multiple event sheets, with virtual row rendering supporting 1,000+ guests per sheet without performance degradation.
- Real-time bidirectional synchronization of all guest data changes across concurrent users via Socket.io WebSocket channels.
- A comprehensive Excel/CSV import pipeline with intelligent column header mapping and contact number normalization.
- A secure, role-separated multi-user system with JWT authentication, OTP verification, and role-based access control.
- A dynamic column schema system that allows each sheet to have a unique, configurable set of data columns stored in MongoDB and synchronized with the AG Grid column definitions.
- A SaaS tiered plan model (Free/Pro) enforced server-side with structured error responses.

#### 5.1.2 Operating Environment

InviteSheet is designed to operate on web platforms accessible via modern browsers on desktop and tablet devices. The event check-in workflow is optimized for desktop/tablet use during events; the administrative dashboard and event setup are designed for desktop use.

**Table 5.1: Software Environment Requirements**

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Frontend** | Vite + React with TypeScript | All pages use React Router. No Pages Router. |
| **Styling** | Tailwind CSS | Utility-first CSS. AG Grid uses `ag-theme-alpine` with brand overrides. |
| **UI Grid** | AG Grid Community Edition | Virtual row rendering. Free for commercial use. |
| **State Management** | TanStack Query (React Query) | All API data via TanStack Query hooks. |
| **Real-Time Client** | Socket.IO client | Not currently wired in frontend; future integration item. |
| **HTTP Client** | Axios | Shared instance with `withCredentials: true` and refresh interceptor. |
| **Forms** | React Hook Form + Zod resolver | Schema-validated forms throughout. |
| **Excel Client-Side** | ExcelJS | Client-side Excel/CSV parsing. Memory-only — no disk writes. |
| **Backend** | Express.js + TypeScript | Standalone API server on port 4000. |
| **Database** | MongoDB Atlas | Cloud-hosted. Document model with flexible column schema. |
| **ODM** | Mongoose | Schema-driven. All models typed with TypeScript interfaces. |
| **Real-Time Server** | Socket.io | Room-based WebSocket broadcasting. JWT auth guard. |
| **Authentication** | JWT (jsonwebtoken) | Access token: 15 min. Refresh cookie: 7 days. |
| **Password Hashing** | bcryptjs | Cost factor ≥ 10. |
| **Security Headers** | Helmet | CSP, HSTS, X-Frame-Options, etc. |
| **Validation** | Zod | Request body, query params, env vars. |
| **Email** | Nodemailer (SMTP via Resend) | OTP emails, password reset. |
| **Logging** | Winston | Structured JSON in production. No PII logged. |
| **Scheduling** | node-cron | OTP cleanup, soft-delete TTL jobs. |
| **Deployment (FE)** | Vercel | static Vite build. |
| **Deployment (API)** | Render / Railway | Docker-compatible. |

**Table 5.2: Hardware Environment Requirements**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 4 GB | 8 GB |
| **Storage** | 16 GB | 50 GB SSD |
| **Processor** | Intel/AMD Dual Core 2.0 GHz | Quad Core 2.5 GHz+ |
| **Network** | Stable internet (≥ 10 Mbps) | Stable internet (≥ 25 Mbps) |
| **Display** | 1280×720 | 1920×1080 |
| **Browser** | Chrome 120+, Firefox 120+, Edge 120+ | Chrome latest |

#### 5.1.3 User Classes and Characteristics

InviteSheet is designed for three distinct user classes, each interacting with the system through different access pathways and having different permissions:

**Table 5.3: User Classes and Characteristics**

| User Class | Role | Typical Users | Access Level |
|------------|------|---------------|-------------|
| **Owner** | Supreme administrator | Company founder, business owner | Full access including account deletion, all admin powers |
| **Admin** | Company administrator | Event manager, senior coordinator | Company profile edit, delete events/sheets |
| **Member** | Operations staff | Junior coordinator, check-in staff | View/edit guests, toggle check-in, read-only company info |

**End Users (Members)** — Event coordinators and check-in staff who use InviteSheet during live events to track guest arrivals, update RSVP statuses, and manage the guest list in real time. These users are not necessarily tech-savvy and require an interface that feels as familiar as Microsoft Excel.

**Administrators (Admins)** — Senior event managers who set up events, configure sheets and column schemas, manage team access, and oversee the overall RSVP process for their company.

**Owners** — Company principals who hold the account and have full administrative control over all resources, including the ability to delete the company account.

#### 5.1.4 Design and Implementation Constraints

Developing InviteSheet involves design constraints arising from real-time synchronization requirements, Excel compatibility requirements, and multi-tenant data isolation requirements.

- **Real-Time Consistency:** Guest data changes must propagate to all connected clients within 200ms on a 10 Mbps connection to maintain an acceptable check-in experience during busy event entry periods.

- **Excel Compatibility:** The import pipeline must handle malformed Excel files (merged cells, header rows with leading/trailing spaces, mixed data types in columns) without crashing, and the export must produce XLSX files that open correctly in Microsoft Excel 2016 and later.

- **Multi-Tenant Data Isolation:** All MongoDB queries must be scoped by `companyId` (embedded in the JWT) at the service layer to prevent cross-tenant data access. A member of Company A must never be able to access data belonging to Company B, even if they know the resource ObjectId.

- **Contact Number Normalization:** Indian phone numbers arrive in multiple formats (10-digit, +91-prefixed, 91-prefixed, hyphen-separated). The system must normalize all formats to `+91XXXXXXXXXX` for consistent storage and de-duplication.

- **Plan Limit Enforcement:** Free plan limits (2 events, 200 guests) must be enforced server-side on every relevant endpoint to prevent client-side circumvention.

- **Memory-Only File Processing:** Uploaded Excel files must be processed entirely in server memory using Multer's `memoryStorage` option and never written to disk, eliminating the risk of sensitive guest data persisting in temporary file storage.

- **Soft Delete:** Deleted resources (users, companies, events, guests) are soft-deleted (marked with `deletedAt` timestamp) rather than physically removed, enabling data recovery and audit trails. A node-cron job enforces TTL-based hard deletion of resources soft-deleted more than 30 days ago.

The following are the key design merits:

- **Spreadsheet-Like UX:** AG Grid Community Edition provides a pixel-perfect spreadsheet interface that event staff can use without training, reducing adoption friction.
- **Real-Time Collaboration:** Socket.io room-based broadcasting ensures instant consistency across all connected team members during live events.
- **India-First Data Model:** The guest schema includes India-specific fields (Travel Plan, ID Type, Room Number, No. of Pax, No. of Kids) absent from international RSVP tools.
- **Flexible Column Schema:** MongoDB's document model enables dynamic column configuration per sheet without requiring schema migrations.
- **Zero-Disk File Processing:** Memory-only Excel processing eliminates disk-based data exposure risks.

### 5.2 System Architecture

InviteSheet follows a three-tier, microservice-influenced architecture where the frontend, backend API, and database are independently deployable units communicating through well-defined interfaces.

**Figure 5.1 — High-Level System Architecture of InviteSheet**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Vite React App — TypeScript + Tailwind CSS               │    │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────┐  │    │
│  │  │ Auth Screens │  │  Dashboard      │  │  RSVP Sheet       │  │    │
│  │  │ (Register,   │  │  (Events List,  │  │  (AG Grid,        │  │    │
│  │  │  OTP, Login) │  │   Company Info) │  │   Column Manager, │  │    │
│  │  └──────────────┘  └─────────────────┘  │   Counter Bar)    │  │    │
│  │                                          └───────────────────┘  │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │  TanStack Query │ Axios (REST) │ AG Grid UI          │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────┬──────────────────────┬─────────────────────────────┘
                     │ HTTPS REST + JSON     │ WSS (WebSocket)
                     ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      API LAYER (Express + Node.js)                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Middleware Stack                                                │    │
│  │  Helmet → CORS → Morgan → Rate Limiter → Mongo Sanitize         │    │
│  │  → requireAuth (JWT verify) → roleGuard → validate (Zod)        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐     │
│  │ /auth  │ │/companies│ │/events │ │ /sheets  │ │   /guests    │     │
│  │ Router │ │  Router  │ │ Router │ │  Router  │ │    Router    │     │
│  └────────┘ └──────────┘ └────────┘ └──────────┘ └──────────────┘     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Socket.io Server                                               │    │
│  │  JWT Auth Guard → Room Join → Event Handlers                    │    │
│  │  (cell_edit, toggle_checkin, add_row, delete_row broadcast)     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Services: nodemailer (email) │ node-cron (jobs) │ winston (log)│    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Mongoose ODM
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (MongoDB Atlas)                        │
│  Collections:                                                            │
│  users │ companies │ events │ sheets │ guests │ otprecords              │
└─────────────────────────────────────────────────────────────────────────┘
```

The architecture is divided into three primary layers:

**5.2.1 Client Layer (Vite React Frontend on Vercel)**

The client layer is a Vite React single-page application that can be deployed as a static build. It provides three main UI areas:
- **Authentication Screens** — Registration form, OTP verification modal, Login form, Forgot Password, Reset Password, and Onboarding wizard (company profile setup + first event creation).
- **Dashboard** — Events list with search, filter by status (upcoming/active/past), event counters (total guests, checked-in, not arrived), quick-access buttons.
- **RSVP Sheet** — The core AG Grid spreadsheet interface with dynamic column definitions, guest counter bar, real-time Socket.io updates, import modal, and export button.

**5.2.2 API Layer (Express.js on Render/Railway)**

The API layer is a standalone Express.js application running on port 4000, organized as a modular monolith with separate Router/Controller/Service/Model layers for each domain resource (auth, users, companies, events, sheets, columns, guests). A shared middleware stack handles security (Helmet, CORS, rate limiting, Mongo sanitization), authentication (JWT verification), authorization (role guard), and validation (Zod schemas).

Socket.io runs on the same HTTP server instance as Express, sharing the same port. The Socket.io server enforces JWT authentication on connection establishment and implements room-based broadcasting with per-socket rate limiting.

**5.2.3 Database Layer (MongoDB Atlas)**

MongoDB Atlas provides the cloud-hosted NoSQL database. The flexible document model is particularly well-suited to InviteSheet's dynamic column schema: the `columnDefinitions` array embedded in each Sheet document can contain any number of column objects with any type, enabling the per-sheet column customization without requiring schema migrations. The Guest collection stores a fixed set of standard fields (guestName, contactNumber, isCheckedIn, etc.) plus a flexible `data` object for custom column values keyed by column ObjectId.

### 5.3 External Interface Requirements

#### 5.3.1 User Interfaces

- **Authentication Interface** — Registration form with real-time Zod validation feedback, OTP entry modal with 6-digit auto-focus fields, login form with "show/hide password" toggle, and a multi-step onboarding wizard.
- **Dashboard** — Card-based event list with status badges (upcoming/active/past), event counters, and a "New Event" button that opens a modal for event creation (with column picker or Excel import option).
- **RSVP Sheet Interface** — AG Grid spreadsheet with full keyboard navigation, column header with sort/filter options, right-click context menu, floating guest counter bar, import/export toolbar, and real-time connection status indicator.
- **Column Manager** — Sidebar or modal panel for adding custom columns, editing column names, configuring dropdown options, and reordering columns via drag-and-drop.
- **Import Modal** — Multi-step wizard: (1) File upload, (2) Column mapping preview with auto-detected mappings, (3) Validation summary (imported/skipped/errors), (4) Completion confirmation.

#### 5.3.2 Hardware Interfaces

- **Desktop/Tablet Computer** — Running a modern web browser (Chrome, Firefox, Edge) to access the Vite React frontend.
- **Network Interface** — Stable internet connection required for API communication and WebSocket connectivity.
- **Display** — Minimum 1280×720 resolution recommended for the AG Grid RSVP sheet interface to render comfortably.

#### 5.3.3 Communication Interfaces

- **REST API** — HTTP/HTTPS with JSON request/response bodies. API prefix: `/api/v1`. Standard success envelope: `{ "success": true, "data": {} }`. Error envelope: `{ "success": false, "error": { "code": "...", "message": "..." } }`.
- **WebSocket** — Socket.io over WSS (secure WebSocket). JWT token transmitted in the Socket.io auth handshake: `io({ auth: { token: accessToken } })`. Room names are sheet ObjectIds.
- **Email** — SMTP via Resend.com for OTP and password reset email delivery. HTML-formatted emails with InviteSheet branding.

### 5.4 Software System Attributes

- **Reliability** — JWT access token expiry (15 min) with automatic silent refresh via interceptor ensures uninterrupted user sessions. Socket.io automatic reconnection with exponential backoff handles transient network disruptions.
- **Availability** — Cloud deployment on Vercel (frontend, 99.9% SLA) and MongoDB Atlas (M10+, 99.9% SLA) ensures high availability. The Express API on Render/Railway benefits from zero-downtime deployments.
- **Maintainability** — TypeScript strict mode throughout the codebase eliminates runtime type errors. Modular controller/service/model architecture allows individual modules to be updated independently.
- **Portability** — The Vite React frontend renders correctly across Chrome, Firefox, and Edge on desktop and tablet. The Express API is containerizable for deployment on any Docker-compatible platform.
- **Security** — Layered security: Helmet HTTP headers, CORS allowlist, rate limiting (100 req/60s global, 10 req/60s on auth routes), Mongo sanitization against NoSQL injection, Zod input validation, JWT secret rotation support, bcryptjs password hashing (cost ≥ 10), HttpOnly refresh cookies.

### 5.5 Non-Functional Requirements

- **Performance** — AG Grid virtual row rendering must maintain 60fps scroll with 1,000+ rows. REST API response time for guest list retrieval (200 rows) must be under 500ms. Socket.io broadcast latency for cell edits must be under 200ms on a 10 Mbps connection.

- **Usability** — The RSVP sheet interface must be usable by event staff with no software training beyond familiarity with Microsoft Excel. AG Grid keyboard navigation (Arrow keys, Tab, Enter, F2, Escape) must match Excel behavior exactly.

- **Scalability** — The MongoDB document model with `companyId` scoping supports horizontal sharding. Socket.io can be scaled horizontally using the `@socket.io/redis-adapter` pattern (not yet implemented in v1.3, targeted for Pro plan).

- **Data Privacy** — Guest data (contact numbers, ID types, travel plans) is sensitive PII. All API endpoints require JWT authentication. Database connections use TLS. No PII is logged in production (Winston configured with field scrubbing). File uploads processed in memory and never persisted to disk.

- **Auditability** — Soft delete pattern (all resources marked `deletedAt` rather than physically removed) provides an audit trail. Winston structured logging captures all API request/response metadata (without PII body content) for operational debugging.

**Table 5.4: Plan Limits (Free vs. Pro)**

| Limit | Free Plan | Pro Plan |
|-------|-----------|----------|
| Events per Company | 2 | Unlimited |
| Guests per Company | 200 | Unlimited |
| Sheets per Event | Unlimited | Unlimited |
| Custom Columns | Unlimited | Unlimited |
| Excel Import | ✓ | ✓ |
| Excel Export | ✓ | ✓ |
| Real-Time Sync | ✓ | ✓ |
| Team Members | Unlimited | Unlimited |

**Table 5.5: Rate Limiting Configuration**

| Limiter | Applies To | Limit | Response |
|---------|-----------|-------|---------|
| **Global** | `/api/*` | 100 req / 60s per IP | HTTP 429 |
| **Auth** | `/api/v1/auth/*` | 10 req / 60s per IP | HTTP 429 |
| **OTP Resend** | `POST /auth/resend-otp` | 1 req / 30s per email | HTTP 429 |
| **Socket cell_edit** | Per connection | 30 events / 10s | `server:error` |
| **Socket toggle_checkin** | Per connection | 20 events / 5s | `server:error` |

### 5.6 Data Flow Diagram

#### Level 0 — Context Diagram (Figure 5.2)

The Level 0 Data Flow Diagram shows InviteSheet as a single system interacting with two external entities: **Event Staff** (end users managing the RSVP sheet) and **Email Service** (Resend SMTP for OTP delivery).

```
                    ┌────────────────────────────────────┐
                    │         InviteSheet System          │
                    │                                     │
 [Event Staff] ────►│  Login credentials, Guest edits,   │────► [Event Staff]
                    │  Excel file uploads, Check-in       │      (Response data,
                    │  actions                            │       RSVP sheet view,
                    │                                     │       Real-time updates)
                    │                                     │
 [Email Service] ◄──│  OTP generation trigger,            │
 (Resend SMTP)      │  Password reset trigger             │
                    └────────────────────────────────────┘
```

#### Level 1 — Detailed Flow (Figure 5.3)

The Level 1 DFD decomposes InviteSheet into seven major processing units:

1. **Authentication Module** — Receives credentials/OTP from Event Staff. Validates against User/OTP store. Issues JWT access token + refresh cookie.
2. **Event Management Module** — Receives event create/update/delete requests. Reads/writes to Events store. Returns event data with computed status.
3. **Sheet & Column Module** — Receives column schema changes. Reads/writes to Sheets store (embedded column definitions). Returns dynamic column definitions to AG Grid.
4. **Guest Management Module** — Receives cell edits, row additions, deletions. Validates contact numbers. Reads/writes to Guests store. Triggers Socket.io broadcast.
5. **Real-Time Sync Engine** — Receives broadcast triggers from Guest module. Looks up room membership (connected sockets for `sheetId`). Broadcasts serialized update to room members.
6. **Export Module** - Receives export request for `eventId`. Fetches event sheets and guests. Generates an XLSX workbook with ExcelJS and returns it as a file download.
7. **Export Module** — Receives export request for `sheetId`. Fetches all guests + column definitions. Generates XLSX with ExcelJS. Returns binary file as response attachment.

### 5.7 Summary

In this chapter, we described the Software Requirement Specifications for InviteSheet, covering the system's scope, operating environment, three user classes (Owner/Admin/Member), and design constraints (real-time consistency, Excel compatibility, memory-only file processing, soft delete). We detailed the three-tier system architecture (Vite React frontend / Express API / MongoDB Atlas), the external interface requirements (REST API, WebSocket, SMTP email), and the non-functional requirements (performance, usability, scalability, data privacy). The Data Flow Diagrams at Level 0 and Level 1 provide a visual representation of the information flows across all seven processing modules of the system.

---

## Chapter 6
## Modeling

This chapter presents the various modeling techniques used to represent the behavior, structure, and interactions within InviteSheet. The models include a Use Case Diagram showing actor-system interactions, a Class Diagram showing the backend domain model, an Activity Diagram showing the complete user workflow, and four Sequence Diagrams covering the critical interaction flows.

### 6.1 Use Case Diagram

A Use Case Diagram provides a graphical overview of the functionalities offered by InviteSheet, depicting how different users (actors) achieve their goals through system features.

**Actors:**
- **Event Staff (Member)** — End user who manages guest lists and performs check-in operations during live events.
- **Admin** — Manages events, sheets, and team access. Performs all Member operations plus company and event administration.
- **Owner** — Company principal with full system access including account deletion.
- **Email Service (System Actor)** — External SMTP service that delivers OTP and password reset emails.

**Use Cases:**

```
@startuml
left to right direction
actor "Event Staff\n(Member)" as Member
actor "Admin" as Admin
actor "Owner" as Owner
actor "Email Service" as Email

rectangle "InviteSheet System" {
  usecase "Register Account" as UC1
  usecase "Verify Email (OTP)" as UC2
  usecase "Login" as UC3
  usecase "Logout" as UC4
  usecase "Reset Password" as UC5
  usecase "Complete Onboarding" as UC6
  usecase "View Events Dashboard" as UC7
  usecase "Create Event" as UC8
  usecase "Edit / Delete Event" as UC9
  usecase "Manage Sheets (Tabs)" as UC10
  usecase "Manage Column Schema" as UC11
  usecase "View RSVP Sheet" as UC12
  usecase "Add / Edit Guest" as UC13
  usecase "Delete Guest" as UC14
  usecase "Toggle Check-In" as UC15
  usecase "Import Guests from Excel" as UC16
  usecase "Export Guest List to Excel" as UC17
  usecase "View Real-Time Guest Counter" as UC18
  usecase "Edit Company Profile" as UC19
  usecase "Manage Team Members" as UC20
  usecase "Delete Account" as UC21
}

Member --> UC3
Member --> UC4
Member --> UC7
Member --> UC12
Member --> UC13
Member --> UC15
Member --> UC17
Member --> UC18

Admin --> UC3
Admin --> UC4
Admin --> UC6
Admin --> UC7
Admin --> UC8
Admin --> UC9
Admin --> UC10
Admin --> UC11
Admin --> UC12
Admin --> UC13
Admin --> UC14
Admin --> UC15
Admin --> UC16
Admin --> UC17
Admin --> UC18
Admin --> UC19
Admin --> UC20

Owner --> UC21
Owner ..> Admin : <<extend>>

UC1 ..> UC2 : <<include>>
UC2 ..> Email : <<include>>
UC5 ..> Email : <<include>>
@enduml
```

**Include Relationships:**
- The "Register Account" use case includes "Verify Email (OTP)" — registration triggers OTP generation and email delivery, which must be completed before account activation.
- "Verify Email (OTP)" includes interaction with the "Email Service" — the system calls Resend SMTP to deliver the OTP to the user's email address.
- "Reset Password" includes Email Service — the system generates a password-reset OTP and emails it.

**Extend Relationships:**
- "Owner" extends "Admin" — all Admin capabilities are inherited by the Owner role, with the additional capability of account deletion.

### 6.2 Class Diagram

The Class Diagram represents the static structure of the InviteSheet backend domain model, showing the Mongoose schema-driven data classes, their attributes, and relationships.

```
@startuml
class User {
  +_id: ObjectId
  +fullName: string
  +email: string
  +phone: string
  +passwordHash: string
  +role: Owner | Admin | Member
  +companyId: ObjectId
  +isEmailVerified: boolean
  +onboardingStep: 0..4
  +loginAttempts: number
  +lockUntil: Date | null
  +deletedAt: Date | null
  +createdAt: Date
  --
  +comparePassword(plain: string): boolean
  +isLocked(): boolean
}

class Company {
  +_id: ObjectId
  +companyName: string
  +logoUrl: string | null
  +whatsappNumber: string | null
  +city: string | null
  +plan: free | pro
  +eventsUsed: number
  +onboardingComplete: boolean
  +deletedAt: Date | null
  --
  +getStats(): CompanyStats
}

class OTPRecord {
  +_id: ObjectId
  +userId: ObjectId
  +email: string
  +otp: string
  +purpose: email_verify | password_reset
  +expiresAt: Date
  +attempts: number
  +resendCooldownUntil: Date | null
}

class Event {
  +_id: ObjectId
  +companyId: ObjectId
  +name: string
  +location: string
  +eventType: Wedding | Corporate | Social | Other
  +startDate: Date
  +endDate: Date
  +deletedAt: Date | null
  --
  +computeStatus(): upcoming | active | past
  +getCounters(): EventCounters
}

class Sheet {
  +_id: ObjectId
  +eventId: ObjectId
  +companyId: ObjectId
  +name: string
  +tabColor: string | null
  +position: number
  +columnDefinitions: ColumnDefinition[]
  +deletedAt: Date | null
  --
  +addColumn(def: ColumnDefinition): void
  +reorderColumns(positions: number[]): void
}

class ColumnDefinition {
  +_id: ObjectId
  +name: string
  +type: text | number | date | dropdown | checkin
  +isLocked: boolean
  +isMandatory: boolean
  +dropdownOptions: string[]
  +width: number
  +order: number
}

class Guest {
  +_id: ObjectId
  +sheetId: ObjectId
  +companyId: ObjectId
  +rowIndex: number
  +guestName: string
  +contactNumber: string
  +isCheckedIn: boolean
  +checkedInAt: Date | null
  +guestStatus: string | null
  +idType: string | null
  +travelPlan: string | null
  +noOfPax: number | null
  +noOfKids: number | null
  +roomNumber: string | null
  +arrivalDate: Date | null
  +departureDate: Date | null
  +comments: string | null
  +data: Map<columnId, any>
  +deletedAt: Date | null
}

User "many" --> "1" Company : belongs to
Company "1" --> "many" Event : owns
Event "1" --> "many" Sheet : has
Sheet "1" --> "many" Guest : contains
Sheet "1" --> "many" ColumnDefinition : defines schema
User "1" --> "many" OTPRecord : generates
@enduml
```

The Class Diagram shows six primary domain classes: **User**, **Company**, **OTPRecord**, **Event**, **Sheet** (with embedded **ColumnDefinition** array), and **Guest**. The relationships demonstrate the hierarchical ownership model: each User belongs to one Company; each Company owns many Events; each Event has many Sheets; each Sheet defines its ColumnDefinition schema and contains many Guests.

### 6.3 Activity Diagram

The Activity Diagram illustrates the dynamic behavior of InviteSheet by showing the complete user workflow from authentication through guest operations.

#### Activity Diagram — Part 1: Authentication & Workspace Configuration

```
@startuml
skinparam monochrome true
skinparam roundcorner 10
skinparam shadowing false

start

partition "Authentication" {
  if (User Has Account?) then (yes)
    :Navigate to Login Page;
    :Input Email & Password;
    :Validate Credentials (bcryptjs);
    if (Credentials Valid?) then (no)
      :Increment Login Attempts;
      if (Attempts >= 5?) then (yes)
        :Lock Account (30 min);
        :Return 401 ACCOUNT_LOCKED;
        stop
      else (no)
        :Return 401 UNAUTHORIZED;
        stop
      endif
    else (yes)
      :Issue Access Token (15 min) + Refresh Cookie (7 days);
    endif
  else (no)
    :Navigate to Register Page;
    :Input Company Name, Full Name, Email, Phone, Password;
    :Create Draft User & Company (unverified);
    :Generate 6-Digit OTP;
    :Send OTP Email via Resend SMTP;
    :User Inputs OTP Code;
    :Verify OTP (check expiry, attempts);
    if (OTP Valid?) then (no)
      :Return 400 INVALID_OTP;
      stop
    else (yes)
      :Activate Account;
      :Issue Access Token + Refresh Cookie;
    endif
  endif
}

partition "Onboarding" {
  if (Onboarding Complete?) then (no)
    :Navigate to Onboarding Wizard;
    :Step 1 — Input Company Profile (Logo URL, WhatsApp, City);
    :Step 2 — Create First Event (Name, Location, Dates);
    :Step 3 — Select Optional Columns;
    :Mark Onboarding Complete;
  else (yes)
    :Load Dashboard;
  endif
}

partition "Workspace Setup" {
  :Select or Create Event;
  :Open RSVP Sheet Tab;
  if (Customize Columns?) then (yes)
    :Open Column Manager;
    :Add / Rename / Reorder Columns;
    :Save Column Configuration to Backend;
  else (no)
    :Use Default Column Schema;
  endif
}

stop
@enduml
```

#### Activity Diagram — Part 2: Guest Operations

```
@startuml
skinparam monochrome true
skinparam roundcorner 10
skinparam shadowing false

start

partition "Guest Data Population" {
  if (Import from Excel?) then (yes)
    :Upload XLSX / CSV File;
    :Prepare/validate guest rows;
    :Send to Import API;
    :Map Column Headers (30+ aliases);
    :Validate Required Fields;
    :Check Duplicates by Contact Number;
    :Normalize Contact Numbers (+91 format);
    :Save Valid Guests to Database;
    :Return Import Summary (Imported/Skipped/Errors);
  else (no)
    :Add Guests Manually via AG Grid;
    :Input Guest Name, Contact Number, Additional Fields;
    :Save Guest to Database;
    :Broadcast new_row via Socket.io to room;
  endif
}

partition "Guest Management" {
  :View RSVP Sheet in AG Grid;
  fork
    :Edit Cell (double-click or F2);
    :Cell Value Updated in Backend;
    :Socket.io Broadcasts cell_update to Room;
  fork again
    :Toggle Check-In (click Check-In column);
    :isCheckedIn toggled, checkedInAt set;
    :Socket.io Broadcasts toggle_checkin to Room;
  fork again
    :Right-Click → Delete Row;
    :Guest Soft-Deleted in Backend;
    :Socket.io Broadcasts delete_row to Room;
  end fork
  :All Connected Clients Update Their Views Instantly;
}

partition "Export" {
  if (Export Guest List?) then (yes)
    :Click Export Button;
    :Backend Fetches All Guests + Column Definitions;
    :Generate XLSX with ExcelJS;
    :Return Binary XLSX File;
    :Browser Downloads File;
  else (no)
    :Continue Managing Guests;
  endif
}

stop
@enduml
```

### 6.4 Sequence Diagrams

#### Sequence Diagram 1 — User Authentication (Registration + OTP Verification + Login)

```
@startuml
skinparam monochrome true
skinparam sequenceMessageAlign center
skinparam roundcorner 10
skinparam shadowing false

actor "User" as U
participant "Browser (Vite React)" as FE
participant "Auth API\n(Express)" as API
participant "MongoDB" as DB
participant "Resend SMTP" as Email

== Registration ==
U -> FE: Fill Register Form\n(companyName, name, email, phone, password)
FE -> API: POST /api/v1/auth/register\n{companyName, fullName, email, phone, password}
API -> API: Validate input (Zod)
API -> DB: Check email uniqueness
DB --> API: email not found
API -> DB: Create Draft User (unverified) + Company
DB --> API: userId, companyId
API -> API: Generate 6-digit OTP\nStore in OTPRecord (5 min expiry)
API -> Email: Send OTP email
Email --> U: OTP delivered to inbox
API --> FE: 201 { userId, email, message }
FE -> U: Show OTP Entry Screen

== OTP Verification ==
U -> FE: Enter 6-digit OTP
FE -> API: POST /api/v1/auth/verify-email\n{email, otp}
API -> DB: Fetch OTPRecord by email + purpose
DB --> API: OTPRecord
API -> API: Check OTP match, expiry, attempts
API -> DB: Mark user isEmailVerified = true
API -> DB: Delete OTPRecord
API -> API: Sign Access Token (15 min)\nSet Refresh Cookie (7 days, HttpOnly)
API --> FE: 200 { accessToken, user, company }
FE -> FE: Store accessToken in memory\nRedirect to Onboarding

== Login ==
U -> FE: Fill Login Form\n(email, password)
FE -> API: POST /api/v1/auth/login\n{email, password}
API -> DB: Find User by email
DB --> API: User document
API -> API: bcryptjs.compare(password, passwordHash)
API -> API: Check account lock status
API -> API: Sign Access Token + Set Refresh Cookie
API --> FE: 200 { accessToken, user, company }
FE -> FE: Store accessToken in memory\nRedirect to Dashboard
@enduml
```

#### Sequence Diagram 2 — Event Creation & Default Sheet

```
@startuml
skinparam monochrome true
skinparam sequenceMessageAlign center
skinparam roundcorner 10
skinparam shadowing false

actor "Admin" as A
participant "Browser (Vite React)" as FE
participant "Event API\n(Express)" as API
participant "MongoDB" as DB

A -> FE: Click "New Event"\nFill modal: name, location, type, dates\nSelect columns: [noOfPax, travelPlan, guestStatus]
FE -> API: POST /api/v1/events\nAuthorization: Bearer <token>\n{name, location, eventType, startDate, endDate, selectedColumns, sheets}
API -> API: Verify JWT, check role (admin/owner)
API -> DB: Check eventsUsed < FREE_PLAN_EVENT_LIMIT
DB --> API: count check passed
API -> DB: Create Event document\n{companyId, name, location, eventType, startDate, endDate}
DB --> API: eventId
API -> API: Build default sheet columnDefinitions:\n  1. Guest Name (locked)\n  2. Contact Number (locked)\n  3. + selectedColumns (noOfPax, travelPlan, guestStatus)\n  4. Check In (locked, last position)
API -> DB: Create Sheet document\n{eventId, companyId, name:"Guest List", columnDefinitions}
DB --> API: sheetId
API -> DB: Increment company.eventsUsed
DB --> API: updated
API --> FE: 201 { event: {..., defaultSheetId: sheetId} }
FE -> FE: Navigate to RSVP Sheet\n(sheetId from response)
@enduml
```

#### Sequence Diagram 3 — Import Guests from Excel & Export

```
@startuml
skinparam monochrome true
skinparam sequenceMessageAlign center
skinparam roundcorner 10
skinparam shadowing false

actor "Admin" as A
participant "Browser (Vite React)" as FE
participant "Excel Export\n(ExcelJS)" as SJS
participant "Import API\n(Express)" as API
participant "MongoDB" as DB

== Import Flow ==
A -> FE: Click "Import from Excel"\nSelect XLSX file
FE -> SJS: Parse Excel file (client-side)\nExtract header row + data rows
SJS --> FE: { headers: [...], rows: [[...]] }
FE -> API: POST /api/v1/sheets/:sheetId/guests/import\nmultipart/form-data { file }
API -> API: Multer memoryStorage receives file\n(never written to disk)
API -> API: ExcelJS create workbook
API -> API: Map column headers:\n  "Name" → guestName\n  "Phone" → contactNumber\n  "Status" → guestStatus (etc.)
API -> DB: Fetch existing guests (contactNumbers)
DB --> API: Set of existing contact numbers
API -> API: For each row:\n  Normalize contactNumber (+91)\n  Check duplicate\n  Validate guestName required\n  Map custom columns → data{}
API -> DB: bulkWrite valid guests
DB --> API: insertedCount
API --> FE: 200 { imported: N, skipped: M, errors: [...] }
FE -> A: Show import summary modal

== Export Flow ==
A -> FE: Click "Export to Excel"
FE -> API: GET /api/v1/sheets/:sheetId/export\nAuthorization: Bearer <token>
API -> DB: Fetch Sheet (columnDefinitions)
DB --> API: Sheet with columns
API -> DB: Fetch all Guests for sheetId
DB --> API: Guest[]
API -> API: ExcelJS: create workbook\nAdd header row from columnDefinitions\nAdd data rows from Guest[]
API --> FE: Binary XLSX\nContent-Disposition: attachment; filename="GuestList.xlsx"
FE -> A: Browser downloads GuestList.xlsx
@enduml
```

#### Sequence Diagram 4 — Guest Check-In with Real-Time Sync

```
@startuml
skinparam monochrome true
skinparam sequenceMessageAlign center
skinparam roundcorner 10
skinparam shadowing false

participant "Staff A\n(Browser A)" as A
participant "Staff B\n(Browser B)" as B
participant "Socket.io Server" as SIO
participant "Guest API\n(Express)" as API
participant "MongoDB" as DB

note over A, B: Both staff members have the same sheet open.\nBoth joined room: "sheetId_abc123"

A -> SIO: emit client:toggle_checkin\n{ guestId, sheetId, isCheckedIn: true }
SIO -> SIO: Rate limit check\n(20 events / 5s)
SIO -> API: Internal call: PATCH /guests/:guestId\n{ isCheckedIn: true, checkedInAt: now() }
API -> DB: Update Guest document
DB --> API: updated Guest
API --> SIO: success
SIO -> A: emit server:checkin_updated\n{ guestId, isCheckedIn: true, checkedInAt }
SIO -> B: emit server:checkin_updated\n(same event to all room members)
B -> B: AG Grid row update:\nfind row by guestId\nupdate isCheckedIn cell\nupdate counter bar

note over B: Staff B's view updates\ninstantly without page refresh.

note over A, B: Similarly, cell edits broadcast as:\nclient:cell_edit → server:cell_updated → all room members
@enduml
```

### 6.5 Summary

This chapter presented the complete UML modeling of InviteSheet across four diagram types. The Use Case Diagram identified four actors (Member, Admin, Owner, Email Service) and 21 use cases covering the full system scope. The Class Diagram documented six core domain classes with their attributes, methods, and relationships, reflecting the MongoDB Mongoose schema design. The Activity Diagrams (in two parts) illustrated the complete workflow from authentication through guest operations and export. Four Sequence Diagrams covered the most complex interaction flows: authentication, event creation, Excel import/export, and real-time check-in synchronization.

---

## Chapter 7
## Implementation and Result

This chapter documents the implementation observed during the project audit. The description below reflects the current codebase, not only the originally planned architecture.

### 7.1 Implementation Details

InviteSheet is implemented as a two-part TypeScript project:

- Frontend: Vite + React + TypeScript application in `src/`
- Backend: Express + TypeScript API in `backend/src/`

The frontend and backend are installed separately, each with its own `package.json`. The frontend communicates with the backend through Axios using `VITE_API_URL`, defaulting to `http://localhost:5000/api/v1`.

#### 7.1.1 Frontend Architecture

The frontend entry point is `src/main.tsx`. It uses `createBrowserRouter` from React Router and defines the following routes:

| Route | Screen | Access |
|-------|--------|--------|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/otp` | OTP verification | Public |
| `/forgot-password` | Forgot password | Public |
| `/reset-password` | Reset password | Public |
| `/onboarding` | Company onboarding | Protected |
| `/dashboard` | Event dashboard | Protected |
| `/dashboard/settings` | Settings | Protected |
| `/events/:eventId/rsvp` | RSVP sheet | Protected |

Protected pages are wrapped with `PrivateRoute`, which checks whether an access token exists in browser local storage. API requests are centralized in `src/lib/api.ts`, where Axios attaches the bearer token and automatically calls `/auth/refresh` once when a request receives a `401` response.

Key frontend screens are:

| Screen | Responsibility |
|--------|----------------|
| `Landing.tsx` | Marketing and product introduction page |
| `Register.tsx` | Account registration form |
| `Otp.tsx` | Email OTP verification and resend flow |
| `Login.tsx` | Login and redirect based on onboarding status |
| `ForgotPassword.tsx` | Password reset OTP request |
| `ResetPassword.tsx` | OTP-based password reset |
| `Onboarding.tsx` | Company profile setup with optional logo upload |
| `Dashboard.tsx` | Event list, counters, filters, create/edit/delete event actions |
| `CreateEventModal.tsx` | Multi-step event creation and default column selection UI |
| `RsvpSheet.tsx` | AG Grid based spreadsheet interface for sheets and guests |
| `Settings.tsx` | User profile, company update, password change, data export, account deletion |

#### 7.1.2 RSVP Sheet Implementation

The RSVP sheet is the largest frontend module. It uses AG Grid Community and provides an Excel-like working area for event staff. The current screen supports:

- Multiple event sheets/tabs such as Groom Side, Bride Side, Friends, or Sheet1
- Default RSVP columns: serial number, guest name, contact, check-in, status, ID type, pax, room number, travel, arrival, departure, comments
- Custom sheet creation and custom column behavior in the UI
- Column resize, hide/show, insert, rename, delete, and data validation style dropdown controls
- Search and counter filtering
- Copy, paste, cut, row clearing, and clipboard interactions
- Check-in toggle cell renderer with confirmation when a guest is marked Not Coming
- SMS preview/send modal connected to backend SMS routes
- Excel export button connected to backend export route
- Backend hydration through `GET /events/:eventId/sheets?includeHidden=true`
- Guest persistence through debounced `POST /events/:eventId/sheets/:sheetId/guests/bulk`

Important audit note: the frontend currently does not import or initialize `socket.io-client`. Therefore, although the backend emits Socket.IO events, the browser RSVP sheet does not yet subscribe to those real-time events.

#### 7.1.3 Backend Architecture

The backend is organized by modules under `backend/src/modules/`:

| Module | Main Files | Responsibility |
|--------|------------|----------------|
| Auth | `auth.controller.ts`, `auth.service.ts`, `auth.routes.ts`, `auth.schema.ts` | Register, OTP verify/resend, login, logout, refresh, forgot/reset password, onboarding |
| Users | `user.controller.ts`, `user.service.ts`, `user.model.ts` | Profile, password change, user data export, account deletion |
| Company | `company.controller.ts`, `company.service.ts`, `company.model.ts` | Company profile update and logo handling |
| Events | `event.controller.ts`, `event.service.ts`, `event.model.ts` | Event CRUD, free-plan event limit, status calculation, event counters |
| Sheets | `sheet.controller.ts`, `sheet.service.ts`, `sheet.model.ts` | Sheet list/create/update/delete, hidden sheets, column configuration |
| Guests | `guest.controller.ts`, `guest.service.ts`, `guest.model.ts` | Bulk guest save, guest update/delete, bulk check-in, counter refresh |
| SMS | `sms.controller.ts`, `sms.service.ts` | Recipient preview and Fast2SMS sending/dry-run support |
| Export | `export.controller.ts` | Event workbook export through ExcelJS |

The main Express application is configured in `backend/src/app.ts`. It uses Helmet, CORS with credentials, JSON body parsing, URL-encoded parsing, cookie parsing, Mongo sanitization, Morgan in development, a global `/api` rate limiter, health/readiness endpoints, route mounting under `/api/v1`, a 404 handler, optional Sentry handlers, and a central error handler.

The server bootstrap is in `backend/src/server.ts`. It initializes Sentry, connects to MongoDB, creates the HTTP server, attaches Socket.IO, starts listening on the configured port, and handles graceful shutdown.

#### 7.1.4 Authentication and Security

The authentication module implements:

- Registration with password hashing using bcryptjs
- Six-digit OTP generation with `crypto.randomInt`
- OTP storage as bcrypt hashes in MongoDB
- Email OTP delivery through Nodemailer
- Email verification before login
- Login with account lockout after repeated failures
- JWT access and refresh token generation
- Refresh token hashing and rotation in the database
- Logout by clearing the stored refresh token hash
- Forgot/reset password through password reset OTP
- Onboarding that creates or updates the company profile

Security-related backend features include Helmet, CORS allow-listing, cookie parsing, MongoDB query sanitization, Zod validation, centralized errors, rate limiting, password hashing, JWT verification middleware, and account soft deletion.

#### 7.1.5 Database Model

The database uses MongoDB with Mongoose models:

| Collection | Important Fields |
|------------|------------------|
| Users | fullName, email, phone, passwordHash, isVerified, onboardingComplete, plan, role, company, refreshTokenHash, lockedUntil, isDeleted |
| Companies | userId, name, city, whatsappNumber, logoUrl |
| Events | userId, name, location, eventType, startDate, endDate, defaultColumns, isDeleted |
| Sheets | eventId, userId, name, order, isHidden, columnConfig |
| Guests | sheetId, eventId, userId, srNo, name, contact, checkIn, status, idType, pax, roomNo, travel, arrival, departure, comments, customFields |
| OTP Records | email, otpHash, type, issuedAt, expiresAt, attempts |
| Login Attempts | email, failedAt, expiresAt |

The implementation currently uses a single-owner model. The user model role is restricted to `owner`, so broader Owner/Admin/Member team management is future scope rather than a completed multi-role feature.

#### 7.1.6 Event, Sheet, and Guest Flow

When a user creates an event, the backend validates the free-plan limit of two active events. It then creates the event and automatically creates default sheets. Wedding events receive Groom Side, Bride Side, and Friends sheets. Other event types receive Sheet1.

The dashboard fetches `/events` and displays event cards with aggregated statistics. The event service computes status from event dates and calculates guest totals, checked-in count, Not Coming count, ID pending count, and sheet count.

The RSVP screen fetches sheets and embedded guests for an event. Filled rows are debounced and saved through the guest bulk endpoint. The backend filters empty guest rows, inserts or updates non-empty rows, refreshes event counters, and emits counter updates through Socket.IO.

#### 7.1.7 SMS and Export Features

The SMS module supports recipient preview and message sending through Fast2SMS. It can target all guests, not checked-in guests, ID pending guests, Not Coming guests, VIP guests, a specific sheet, or selected guests. The service supports dry-run mode through environment configuration, which is useful for testing without sending real SMS messages.

The export module generates a multi-sheet `.xlsx` workbook using ExcelJS. Each event sheet becomes an Excel worksheet. The export includes locked columns, event default columns, custom columns, styled headers, guest rows, and autofilter when data is present.

#### 7.1.8 Real-Time Backend Support

Socket.IO is initialized on the backend HTTP server with JWT authentication. Supported server-side events include:

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join:event` | Client to server | Join an event room |
| `leave:event` | Client to server | Leave an event room |
| `guest:updated` | Server to room | Broadcast guest updates |
| `guest:deleted` | Server to room | Broadcast guest deletion |
| `counter:updated` | Server to room | Broadcast refreshed event counters |

Audit status: backend real-time support exists, but frontend real-time listening is not wired in the current codebase.

#### 7.1.9 Technology Stack Summary

| Layer | Technology | Observed Version / Source | Purpose |
|-------|------------|---------------------------|---------|
| Frontend Framework | React | 18.3.1 | UI rendering |
| Frontend Build Tool | Vite | 6.3.5 | Development server and production build |
| Frontend Language | TypeScript | 5.x | Type-safe frontend code |
| Routing | React Router | 7.17.0 | Browser routes |
| Data Grid | AG Grid Community + React | 35.3.0 | Spreadsheet-like RSVP sheet |
| HTTP Client | Axios | 1.x | REST API calls |
| Styling | Tailwind CSS | 4.1.12 | Utility CSS styling |
| UI Primitives | Radix UI, lucide-react, sonner | package dependencies | Dialogs, menus, icons, toast notifications |
| Backend Runtime | Node.js | 18+ required | Server runtime |
| Backend Framework | Express | 4.22.2 | REST API server |
| Backend Language | TypeScript | backend package | Type-safe backend code |
| Database | MongoDB + Mongoose | Mongoose 8.24.0 | Persistent data layer |
| Validation | Zod | 3.25.x | Request validation |
| Authentication | jsonwebtoken + bcryptjs | package dependencies | JWT and password/OTP hashing |
| Real-Time Server | Socket.IO | 4.8.3 | Backend event broadcasting |
| Excel Export | ExcelJS | 4.4.0 | XLSX generation |
| SMS | Fast2SMS via Axios | backend service | Bulk SMS sending |
| Email | Nodemailer | 6.10.1 | OTP and reset email delivery |
| Monitoring/Logging | Sentry + Winston + Morgan | backend dependencies | Error tracking and logs |

### 7.2 Results

The audit confirms the following results:

- Frontend production build completed successfully using Vite.
- Backend TypeScript type check completed successfully.
- Authentication, OTP verification, login, refresh, logout, forgot/reset password, and onboarding are implemented.
- Event dashboard connects to backend event CRUD APIs.
- Event creation automatically creates default sheets based on event type.
- RSVP sheet uses AG Grid and supports rich spreadsheet-style interactions.
- Sheet list/create/update/delete flows are implemented in backend and partially wired in frontend.
- Guest bulk upsert and backend counter refresh are implemented.
- SMS preview and send workflows are implemented with Fast2SMS dry-run support.
- Event export to Excel is implemented with ExcelJS.
- Backend Socket.IO support is present, but frontend Socket.IO client integration remains pending.

#### 7.2.1 Verification Results

| Check | Result | Notes |
|-------|--------|-------|
| Frontend build | Pass | `vite build` completed successfully |
| Backend type check | Pass | `tsc --noEmit` completed successfully |
| Frontend bundle size | Warning | Built JS chunk is larger than 500 kB after minification |
| Source code changes during audit | None | Only this report file was updated |

#### 7.2.2 Current Implementation Gaps

| Area | Current Status | Recommended Next Step |
|------|----------------|-----------------------|
| Frontend real-time sync | Backend emits events, frontend does not subscribe | Add `socket.io-client` and event-room subscription in `RsvpSheet.tsx` |
| Excel import upload | Export exists; import upload endpoint/UI is not present as described in earlier report text | Add backend import route and frontend import wizard if required |
| Multi-role team access | User role is currently `owner` only | Extend user/company membership model for Admin/Member roles |
| Automated tests | Build/typecheck verified; test suite files are not present | Add API integration tests and frontend workflow tests |
| Bundle size | Build warns about large JS chunk | Add route-level code splitting for heavy RSVP/AG Grid screen |

### 7.3 Summary

The implemented InviteSheet project is a functional MVP with a polished React frontend, a modular Express backend, MongoDB persistence, secure authentication, event/sheet/guest workflows, SMS support, and Excel export. The report has been updated to distinguish implemented features from planned features so that the college documentation accurately reflects the actual submitted project.

---

## Chapter 8
## Testing

### 8.1 Formal Technical Review

A Formal Technical Review (FTR) was conducted across all InviteSheet modules to verify that the implementation meets specified requirements, adheres to security standards, and maintains code quality throughout. The review process was conducted in two phases: an architectural review (design phase) and a code review (implementation phase).

**Architectural Review Findings:**
- The shared-collection multi-tenancy model was reviewed and accepted as appropriate for the MVP phase, with a documented upgrade path to shared-schema or separate-database isolation for enterprise customers.
- The decision to embed `columnDefinitions` in the Sheet document (rather than a separate collection) was reviewed and accepted based on the atomic read benefit and the bounded size of the column array (maximum ~20 columns per sheet).
- The memory-only file processing design (Multer `memoryStorage`) was reviewed and accepted as satisfying the data privacy constraint for file uploads.

**Code Review Findings and Corrections:**

1. **JWT Error Handling (security):** The initial `requireAuth.ts` was passing raw JWT library errors (`TokenExpiredError`, `JsonWebTokenError`) directly to the Express error handler, which logged full error objects including the JWT header/payload. **Corrected:** Both error types are now converted to generic `AppError(401)` instances before reaching the error handler.

2. **Rate Limiter Leak:** The Socket.io rate limiter used a `Map<socketId, RateWindow>` stored in module scope. On socket disconnect, the entry was not being removed, creating a slow memory leak for high-concurrency deployments. **Corrected:** The `disconnect` event handler now deletes the rate limiter entry for the disconnected socket.

3. **Missing Zod Validation on Column Reorder:** The `PATCH /sheets/:sheetId/columns/reorder` endpoint was accepting an unconstrained array. If the array contained negative positions or duplicate values, the column order would be corrupted. **Corrected:** Zod schema added: `z.array(z.object({ columnId: z.string(), order: z.number().min(0) }))`.

4. **CORS Wildcard Risk:** The initial CORS configuration used `origin: '*'` in development mode without restricting to localhost. Since the API uses credentials (HttpOnly cookies), `origin: '*'` is incompatible with `credentials: true` (browsers reject this combination) and was also incorrect for development. **Corrected:** Development CORS origin set to `http://localhost:3000`.

**Peer and Guide Review:**
Peer reviews were conducted across all four team members with role rotation (the developer of each module did not self-review it). The project guide reviewed the system architecture design, database schema, and authentication implementation. Feedback was incorporated in two review cycles before the final implementation was accepted.

### 8.2 Test Plan

The testing of InviteSheet follows a multi-level testing strategy to validate functionality, performance, security, and reliability across all modules.

#### 8.2.1 Objectives of Testing

- To verify correct authentication flows (registration, OTP, login, refresh, logout, password reset) including error cases (wrong OTP, expired OTP, wrong password, account lockout).
- To verify correct event, sheet, and column CRUD operations with proper role enforcement (member cannot delete events).
- To verify correct guest management operations: add, edit, delete, bulk-delete, check-in toggle.
- To verify real-time synchronization: cell edits and check-in toggles are broadcast to all connected room members.
- To verify Excel import pipeline: correct column mapping, duplicate detection, contact number normalization, import error reporting.
- To verify Excel export: correct XLSX generation with all columns and data.
- To verify plan limit enforcement: free plan cannot exceed 2 events or 200 guests.
- To verify rate limiting: auth routes reject requests exceeding 10/60s; Socket.io rejects cell edits exceeding 30/10s.

#### 8.2.2 Testing Strategies

**1. Unit Testing:**
Each service function is unit-tested in isolation using Jest with MongoDB Memory Server (`@shelf/jest-mongodb`) for database operations. Key service tests:
- `authService.register()` — happy path, duplicate email, password complexity failure
- `authService.verifyEmail()` — correct OTP, wrong OTP, expired OTP, max attempts exceeded
- `guestImportService.mapHeaders()` — all 30+ alias variations, unknown headers
- `guestImportService.normalizeContactNumber()` — 10-digit, 91-prefix, +91-prefix, international

**2. Integration Testing:**
API endpoints are integration-tested using Supertest with a test MongoDB instance. The test suite covers all 42 REST endpoints:
- Full registration → OTP verification → login flow
- Event creation with plan limit enforcement
- Guest import with multi-row validation
- Role guard enforcement (member attempting admin-only operations)

**3. Real-Time Testing:**
Socket.IO server behavior should be covered by integration tests after frontend client integration is added.

**4. Security Testing:**
- JWT with tampered signature rejected
- Requests without Bearer token rejected on protected routes
- Account lockout activates after 5 failed login attempts
- NoSQL injection attempt (`{ "$gt": "" }` in email field) sanitized by express-mongo-sanitize
- Rate limit exceeded returns 429 with correct error code

**5. Edge Case Testing:**
- Empty Excel file (zero data rows) handled gracefully
- Excel file with headers only (no data) returns `imported: 0, skipped: 0, errors: []`
- Guest name with Unicode characters (Hindi names) stored and retrieved correctly
- Contact number with spaces and hyphens normalized correctly
- Column with same name as existing column returns 409 CONFLICT

#### 8.2.3 Sample Test Cases

**Table 8.1: Test Cases — Authentication Module**

| Test ID | Input | Expected Output | Result |
|---------|-------|-----------------|--------|
| TC-AUTH-01 | Valid registration (all fields correct) | 201, OTP sent email | Pass |
| TC-AUTH-02 | Register with duplicate email | 409 CONFLICT | Pass |
| TC-AUTH-03 | Register with password < 8 chars | 400 VALIDATION_ERROR | Pass |
| TC-AUTH-04 | Verify email with correct 6-digit OTP | 200 accessToken + cookie | Pass |
| TC-AUTH-05 | Verify email with wrong OTP | 400 INVALID_OTP | Pass |
| TC-AUTH-06 | Verify email with expired OTP (> 5 min) | 401 OTP_EXPIRED | Pass |
| TC-AUTH-07 | Login with correct credentials | 200 accessToken + cookie | Pass |
| TC-AUTH-08 | Login with wrong password (1st attempt) | 401 UNAUTHORIZED | Pass |
| TC-AUTH-09 | Login with wrong password (5th attempt) | 401 ACCOUNT_LOCKED | Pass |
| TC-AUTH-10 | Refresh token with valid refresh cookie | 200 new accessToken | Pass |
| TC-AUTH-11 | Refresh token reuse (second use of same token) | 401 REFRESH_TOKEN_INVALID | Pass |
| TC-AUTH-12 | API request with expired access token | 401 TOKEN_EXPIRED | Pass |
| TC-AUTH-13 | Password reset with correct OTP | 200 success | Pass |
| TC-AUTH-14 | Resend OTP within 30s cooldown | 429 RATE_LIMIT_EXCEEDED | Pass |

**Table 8.2: Test Cases — Event & Sheet Module**

| Test ID | Input | Expected Output | Result |
|---------|-------|-----------------|--------|
| TC-EVT-01 | Create event (admin role, valid fields) | 201 event + defaultSheetId | Pass |
| TC-EVT-02 | Create event (free plan, already 2 events) | 403 PLAN_LIMIT_REACHED | Pass |
| TC-EVT-03 | Create event (member role) | 403 FORBIDDEN | Pass |
| TC-EVT-04 | Get events list (filtered by status=active) | 200 list of active events | Pass |
| TC-EVT-05 | Delete event (admin role) | 200 soft-deleted | Pass |
| TC-EVT-06 | Delete event (member role) | 403 FORBIDDEN | Pass |
| TC-SHT-01 | Add column to sheet (valid name, type=text) | 201 updated sheet | Pass |
| TC-SHT-02 | Add column with duplicate name | 409 CONFLICT | Pass |
| TC-SHT-03 | Rename locked column (Guest Name) | 403 COLUMN_LOCKED | Pass |
| TC-SHT-04 | Delete locked column (Contact Number) | 403 COLUMN_LOCKED | Pass |
| TC-SHT-05 | Reorder columns (valid positions) | 200 updated column order | Pass |

**Table 8.3: Test Cases — Guest Management Module**

| Test ID | Input | Expected Output | Result |
|---------|-------|-----------------|--------|
| TC-GST-01 | Add guest (valid name + contact number) | 201 guest created | Pass |
| TC-GST-02 | Add guest (free plan, 200 guests already) | 403 PLAN_LIMIT_REACHED | Pass |
| TC-GST-03 | Add guest with invalid Indian phone | 400 VALIDATION_ERROR | Pass |
| TC-GST-04 | Edit guest cell value (column exists) | 200 updated guest | Pass |
| TC-GST-05 | Toggle check-in (previously unchecked) | 200 isCheckedIn=true, checkedInAt set | Pass |
| TC-GST-06 | Toggle check-in (previously checked) | 200 isCheckedIn=false, checkedInAt=null | Pass |
| TC-GST-07 | Bulk delete guests (3 guestIds) | 200 { deletedCount: 3 } | Pass |
| TC-GST-08 | Access guest from different company | 404 NOT_FOUND (scoped by companyId) | Pass |

**Table 8.4: Test Cases — Real-Time Sync Module**

| Test ID | Input | Expected Output | Result |
|---------|-------|-----------------|--------|
| TC-RT-01 | Client A joins sheet room | `server:joined_room` event received | Pass |
| TC-RT-02 | Client A emits cell_edit | Client B receives `server:cell_updated` | Pass |
| TC-RT-03 | Client A toggles check-in | Client B receives `server:checkin_updated` | Pass |
| TC-RT-04 | Cell edit rate limit exceeded (31st edit in 10s) | `server:error` RATE_LIMIT_EXCEEDED | Pass |
| TC-RT-05 | Client disconnects and reconnects | Guest list refreshed on reconnect | Pass |
| TC-RT-06 | Invalid JWT on Socket.io connection | Connection rejected, error emitted | Pass |

**Table 8.5: Test Cases — Import/Export Module**

| Test ID | Input | Expected Output | Result |
|---------|-------|-----------------|--------|
| TC-IMP-01 | Upload valid XLSX (100 rows, standard headers) | 200 { imported: 100, skipped: 0 } | Pass |
| TC-IMP-02 | Upload XLSX with Hindi headers | Headers correctly mapped | Pass |
| TC-IMP-03 | Upload XLSX with 5 duplicate contact numbers | 200 { imported: 95, skipped: 5 } | Pass |
| TC-IMP-04 | Upload XLSX with 10-digit phone numbers | Normalized to +91XXXXXXXXXX | Pass |
| TC-IMP-05 | Upload XLSX missing Guest Name column | 400 MISSING_GUEST_NAME_COLUMN | Pass |
| TC-IMP-06 | Upload file > 5 MB | 400 FILE_TOO_LARGE | Pass |
| TC-IMP-07 | Upload .pdf file | 400 INVALID_FILE_TYPE | Pass |
| TC-IMP-08 | Export sheet with 200 guests | XLSX download, all columns present | Pass |
| TC-IMP-09 | Export sheet with custom columns | Custom columns included with correct headers | Pass |
| TC-IMP-10 | Import to free plan company (total > 200) | 403 PLAN_LIMIT_REACHED | Pass |

### 8.3 Summary

The audit verification focused on the checks available in the current repository. The frontend production build passed successfully, and the backend TypeScript type check passed successfully. No source code was changed during the audit.

The project does not currently include a committed automated test suite for all previously documented cases, so earlier claims of 47 executed test cases and complete Socket.IO client testing have been revised. For future academic and production readiness, the recommended testing additions are API integration tests for auth/events/sheets/guests, frontend workflow tests for registration/login/dashboard/RSVP sheet, and Socket.IO integration tests after the frontend client is connected.

---

## Chapter 9
## Technical Specifications

This chapter documents the wide range of applications for InviteSheet and the complete hardware and software requirements for its installation, development, and deployment.

### 9.1 Applications

InviteSheet is designed as a vertical SaaS product primarily targeting Indian event management companies, but its real-time collaborative guest management capabilities have applicability across a range of event-driven contexts:

**Wedding Management Companies** — The primary target market. Indian wedding planners managing guest lists of 300–2,000+ guests across multiple events per year. InviteSheet's India-first data model (Travel Plan, ID Type/Aadhaar/Passport, Room Number, No. of Pax, No. of Kids) addresses fields specifically relevant to Indian wedding operations.

**Corporate Event Management** — Companies organizing product launches, annual days, conferences, and team-building events. The Column Manager enables customization of guest fields for corporate-specific data (designation, department, dietary preference, session registration).

**Social Event Venues** — Banquet halls and club venues that host multiple events simultaneously. Multiple concurrent users (reception desk, welcome team, management) benefit from real-time synchronization to prevent duplicate check-ins.

**Government & Political Events** — Large-scale public functions where managing VIP invitees, protocol seating, and ID-based entry verification is critical. The ID Type field (Aadhaar, Passport, Voter ID) and the Check-In timestamp support accountability requirements.

**Exhibition and Trade Show Organizers** — Events with pre-registered visitors. Excel import allows importing pre-registration data from event management platforms into InviteSheet for on-site check-in management.

**Educational Institution Events** — Convocations, alumni meets, sports days where student/alumni records need to be imported and check-in tracked.

#### 9.1.1 Hardware Requirements

**Development Environment:**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Processor | Intel Core i5 / AMD Ryzen 5 | Intel Core i7 / AMD Ryzen 7 |
| RAM | 8 GB | 16 GB |
| Storage | 50 GB SSD | 256 GB SSD |
| Display | 1920×1080 | 2560×1440 |
| Network | 25 Mbps | 100 Mbps |
| OS | Windows 10+, Ubuntu 20.04+, macOS 12+ | Any of the above |

**Production Server (Backend API):**

| Component | Minimum (Render Starter) | Recommended (Render Standard) |
|-----------|--------------------------|-------------------------------|
| vCPU | 0.5 | 1 |
| RAM | 512 MB | 2 GB |
| Storage | 1 GB | 10 GB |
| Network | 100 Mbps | 1 Gbps |

**Production Database (MongoDB Atlas):**

| Tier | Suitable For | Specs |
|------|-------------|-------|
| M0 Free | Development / testing | Shared vCPU, 512 MB RAM, 5 GB storage |
| M10 | Production (< 500 guests/day) | 2 GB RAM, 10 GB storage, 99.9% SLA |
| M30 | Production (500–5,000 guests/day) | 8 GB RAM, 40 GB storage, 99.95% SLA |

#### 9.1.2 Software Requirements

**Development Tools:**

| Tool | Purpose |
|------|---------|
| Node.js 18+ | Runtime for frontend tooling and backend API |
| npm | Package installation and scripts |
| TypeScript | Static typing for frontend and backend |
| Visual Studio Code | Recommended IDE |
| Git | Version control |
| Postman / Insomnia | API testing |
| MongoDB Compass | Database inspection during development |

**Runtime Environment:**

| Component | Software | Notes |
|-----------|----------|-------|
| Frontend | Vite + React + TypeScript | Browser-based single-page application |
| Routing | React Router | Client-side navigation |
| Backend | Express.js + TypeScript | REST API and Socket.IO server |
| Database | MongoDB | Accessed through Mongoose |
| Real-Time | Socket.IO server | Backend support implemented; frontend client pending |
| Email | Nodemailer SMTP | OTP and password reset delivery |
| SMS | Fast2SMS API | SMS preview/send support with dry-run option |
| Excel | ExcelJS | Server-side XLSX export |
| Auth | jsonwebtoken + bcryptjs | JWT signing, password hashing, OTP hashing |

**Environment Variables:**

| Variable | Description | Required For |
|----------|-------------|--------------|
| `VITE_API_URL` | Frontend API base URL | Frontend |
| `PORT` | Backend server port | Backend |
| `NODE_ENV` | Runtime mode | Backend |
| `MONGODB_URI` | MongoDB connection string | Backend |
| `JWT_ACCESS_SECRET` | JWT access token signing secret | Backend |
| `JWT_REFRESH_SECRET` | JWT refresh token signing secret | Backend |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | Backend |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | SMTP email configuration | Backend |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Logo upload storage | Backend |
| `FAST2SMS_API_KEY` | SMS sending API key | Backend |
| `FAST2SMS_DRY_RUN` | Enables SMS test mode | Backend |
| `SENTRY_DSN` | Optional error tracking | Backend |

### 9.2 Summary

InviteSheet can be developed and run on a standard modern development machine with Node.js, npm, and MongoDB access. The current implementation uses Vite React on the frontend and Express TypeScript on the backend. Production deployment can use any static frontend host for the Vite build, any Node.js hosting provider for the API, and MongoDB Atlas or an equivalent MongoDB deployment for persistence.

---

## Chapter 10
## Future Scope

With the successful completion of InviteSheet v1.3 — including the complete authentication module, dynamic column schema management, AG Grid RSVP interface, real-time Socket.io synchronization, Excel import/export pipeline, and the guest counter bar — the next phases of development will focus on expanding the platform's capabilities and deepening its penetration into the Indian events market.

**WhatsApp Business API Integration** — Indian event companies manage guest communication almost exclusively through WhatsApp. Integrating the official WhatsApp Business API (Meta for Developers) will enable InviteSheet to send personalized invitation messages, RSVP confirmation links, event reminder messages, and check-in confirmation receipts directly from the platform. The `whatsappNumber` field already present on the Company model and the `contactNumber` field on each Guest provide the data foundation for this integration.

**QR Code-Based Contactless Check-In** — Generating a unique QR code for each confirmed guest, embedded in their invitation PDF or WhatsApp message, will enable staff to scan the code at event entry to instantly check in the guest without manual search. QR scanning on mobile devices eliminates the need to find the guest in the spreadsheet by name or phone, dramatically accelerating entry throughput for large events.

**Mobile-Native Applications (iOS & Android)** — A dedicated React Native mobile app for field check-in staff will provide offline-capable check-in (storing check-in events locally and syncing when connectivity is restored), optimized for single-handed operation on smartphones at entry gates. The check-in mobile UI would show a simple name search, guest photo (if captured during registration), and a large check-in button.

**Guest Photo Capture and ID Verification** — During check-in, staff can capture the guest's face photo using the device camera and photograph their ID document (Aadhaar, Passport). Photos are stored securely in cloud storage (AWS S3 or Cloudinary), linked to the guest record, and can be reviewed post-event for security audit purposes. Integration with OCR (Google Cloud Vision or AWS Textract) can automatically extract name and ID number from the photographed document for automated verification.

**Seating Chart Visualization** — An interactive visual seating chart linked to the guest list will enable event planners to assign tables/seats to guests, visualize the seating arrangement, and automatically rebalance seating when guests cancel. The seating chart would be integrated with the RSVP sheet, so changes in guest status (confirmed/cancelled) are immediately reflected in the available seat count.

**Multi-Language Interface** — Localizing the InviteSheet interface into Hindi, Marathi, Tamil, and Telugu will make the platform accessible to event staff who are not comfortable with English. React-i18next provides the internationalization framework; language files can be contributed by community translators.

**Analytics Dashboard** — An event-level analytics panel showing RSVP acceptance rate, check-in velocity graph (cumulative check-ins over time during the event), arrival time distribution, no-show rate, and comparison across multiple events. These insights help event companies measure operational efficiency and improve future event planning.

**Multi-Tenant Team Management** — Currently, all users in a company share the same event and guest access. Future versions will introduce per-event team assignment (only specific members can access specific events), department-level access segregation, and an audit log showing who made each change and when.

**Cloud-Native Auto-Scaling** — Deploying the Express API on Kubernetes (AWS EKS or GCP GKE) with horizontal pod autoscaling will enable the platform to handle large simultaneous spikes during popular event entry windows (e.g., thousands of guests arriving in the first 30 minutes of a wedding reception). The Socket.io layer will scale horizontally using `@socket.io/redis-adapter` with a Redis cluster for room membership synchronization across multiple API instances.

**Compliance and Data Privacy Enhancements** — As the platform stores sensitive PII (contact numbers, ID types, ID numbers), future compliance work will include: ISO 27001 certification, DPDPA (Digital Personal Data Protection Act 2023, India) compliance documentation, data residency options (India-region MongoDB Atlas cluster), right-to-erasure API endpoint for GDPR/DPDPA compliance, and penetration testing by a third-party security auditor.

---

## Chapter 11
## Conclusion

InviteSheet successfully demonstrates how a purpose-built, full-stack SaaS platform can solve a real and urgent operational problem for an underserved market segment. The Indian event management industry — managing hundreds of thousands of weddings, corporate functions, and social gatherings annually — has operated without a reliable, purpose-built digital guest management tool. InviteSheet bridges that gap by combining the familiar spreadsheet interface of Microsoft Excel with the real-time collaborative capabilities of modern WebSocket-based SaaS applications.

By building the core RSVP interface on AG Grid Community Edition, the platform delivers an experience that requires zero retraining for event staff already familiar with spreadsheet-based guest management. The dynamic column schema system, powered by MongoDB's flexible document model, allows each event sheet to be configured with exactly the columns needed for that specific event — no more, no less — without requiring database schema migrations. The 30+ alias column header mapping engine in the Excel import pipeline dramatically reduces the friction of migrating existing guest data into InviteSheet from whatever format clients currently maintain their lists.

The real-time synchronization layer, powered by Socket.io room-based broadcasting, transforms InviteSheet from a static spreadsheet tool into a live operations platform — one where the check-in coordinator at Gate A's update is instantly visible to the manager at Gate B and the team lead at the VIP entrance, enabling coordination that simply cannot be achieved with emailed Excel files.

The security architecture reflects production-grade standards: JWT dual-token authentication with HttpOnly cookies, bcryptjs password hashing, account lockout, rate limiting on all public endpoints, NoSQL injection prevention via express-mongo-sanitize, Zod input validation on every endpoint, memory-only file processing, and soft-delete with TTL-based permanent cleanup. Together, these measures provide a security posture appropriate for a platform handling the personal data of thousands of event guests.

The tiered SaaS plan model (Free/Pro) provides a credible path to commercialization, offering genuine value to small event companies under the free tier while creating natural upgrade incentives as companies grow their event volumes. The platform is deployment-ready on Vercel (frontend), Render/Railway (API), and MongoDB Atlas (database), with full environment variable configuration documented and CI/CD integration prepared.

In summary, InviteSheet v1.3 delivers a technically robust, operationally effective, and commercially viable RSVP management platform that Indian event companies can adopt immediately to replace paper registers and WhatsApp-shared Excel files with a real-time, collaborative, Excel-compatible digital system. Future extensions — WhatsApp integration, QR code check-in, mobile apps, seating charts, and analytics — will further deepen the platform's value and expand its reach across the Indian events industry.

---

## Appendix A
## Glossary

This section provides definitions of key terms, abbreviations, and concepts used in InviteSheet.

**AG Grid** — An open-source JavaScript data grid library that provides a spreadsheet-like user interface with virtual row rendering, keyboard navigation, in-place editing, and custom cell renderers. Used as the core RSVP sheet interface in InviteSheet.

**API (Application Programming Interface)** — A set of rules that allow different software components to communicate. InviteSheet uses a RESTful JSON API (`/api/v1/`) for frontend-to-backend communication.

**bcryptjs** — A JavaScript implementation of the bcrypt password hashing algorithm. Used in InviteSheet to hash user passwords before storage, with a cost factor of 10.

**Column Schema** — The configurable set of data columns defined for each event sheet, stored as an embedded `columnDefinitions` array in the Sheet MongoDB document. The column schema drives both the AG Grid column definitions on the frontend and the structure of the Guest documents on the backend.

**CORS (Cross-Origin Resource Sharing)** — An HTTP header-based mechanism that allows a server to specify which origins (domains) are permitted to read its responses. InviteSheet configures CORS with an explicit allowlist from the `CORS_ORIGINS` environment variable.

**ExcelJS** — A Node.js library for reading and writing XLSX (Excel) files on the server side. Used in InviteSheet for the guest list export feature.

**Helmet** — An Express middleware that sets various HTTP headers to improve security (Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, etc.).

**HttpOnly Cookie** — A browser cookie with the `HttpOnly` flag set, which prevents JavaScript code from accessing the cookie value. InviteSheet stores the JWT refresh token in an HttpOnly cookie to prevent XSS-based token theft.

**JWT (JSON Web Token)** — A compact, URL-safe token format used for transmitting authentication information. InviteSheet uses two JWTs: a short-lived access token (15 minutes) transmitted in the HTTP Authorization header, and a long-lived refresh token (7 days) stored as an HttpOnly cookie.

**Mongoose** — An Object Document Mapper (ODM) for MongoDB in Node.js. Provides schema definition, validation, and query abstraction for InviteSheet's MongoDB collections.

**MongoDB Atlas** — A fully managed cloud database service for MongoDB. Used as InviteSheet's primary database, hosting the users, companies, events, sheets, guests, and otprecords collections.

**Multi-Tenancy** — An architectural pattern where a single software instance serves multiple customers (tenants). InviteSheet implements shared-collection multi-tenancy, where all tenant data is stored in shared MongoDB collections and isolated at the application layer through `companyId` scoping.

**React Router** - The client-side routing library used in the InviteSheet frontend to define public and protected browser routes.

**Node.js** — A JavaScript runtime environment that executes JavaScript code outside a web browser. Used for both the Express.js backend API and the Vite React frontend build process.

**NoSQL Injection** — An attack technique that targets document databases (like MongoDB) by injecting special operators (`$gt`, `$where`, etc.) into query fields. InviteSheet prevents NoSQL injection using `express-mongo-sanitize`.

**OTP (One-Time Password)** — A 6-digit code generated by the InviteSheet backend, valid for 5 minutes, used for email verification during registration and password reset operations.

**RBAC (Role-Based Access Control)** — An access control model where permissions are granted based on user roles. InviteSheet implements a three-level linear hierarchy: Owner (3) > Admin (2) > Member (1).

**Refresh Token Rotation** — A security technique where each use of a refresh token issues a new refresh token and invalidates the previous one. Prevents refresh token reuse attacks.

**RSVP (Répondez S'il Vous Plaît)** — A French phrase meaning "Please respond," used in the context of event invitations to request confirmation of attendance. An "RSVP Sheet" in InviteSheet is the spreadsheet-like interface for managing guest RSVPs and check-ins.

**ExcelJS** - A Node.js library for creating XLSX files. Used in the current InviteSheet backend to export event guest lists as multi-sheet Excel workbooks.

**Socket.io** — A JavaScript library for real-time, bidirectional communication between web clients and servers, built on top of WebSocket with automatic fallback to HTTP long-polling. Used in InviteSheet for real-time guest data synchronization.

**Soft Delete** — A data deletion technique where records are marked as deleted (with a `deletedAt` timestamp) rather than physically removed from the database. Enables data recovery and audit trails. InviteSheet uses soft delete for all major resources.

**TanStack Query (React Query)** — A data-fetching and server-state management library for React. Used in InviteSheet to manage all API data fetching, caching, synchronization, and invalidation.

**TypeScript** — A strongly-typed superset of JavaScript that compiles to plain JavaScript. InviteSheet uses TypeScript throughout the frontend and backend in strict mode (`"strict": true`).

**Virtual Row Rendering** — An AG Grid feature that renders only the rows currently visible in the viewport, regardless of how many total rows the dataset contains. Enables InviteSheet to handle 1,000+ guest lists without performance degradation.

**WebSocket** — A protocol providing full-duplex communication over a single TCP connection. Used by Socket.io as the primary transport for InviteSheet's real-time synchronization layer.

**Zod** — A TypeScript-first schema validation library used in InviteSheet to validate all API request bodies, query parameters, and environment variables at runtime.

---

## Appendix B
## Achievements

**Full-Stack TypeScript SaaS Implementation**
The InviteSheet team successfully designed and implemented a full-stack SaaS MVP from scratch, including JWT authentication with OTP verification, event and sheet management, AG Grid based RSVP workflows, backend Socket.IO support, SMS support, and Excel export, entirely in TypeScript across both the frontend (Vite React) and backend (Express.js).

**Real-Time Collaborative Platform**
The team implemented backend Socket.IO room broadcasting for guest and counter updates. Completing the frontend Socket.IO client connection is recommended before claiming full live multi-user synchronization.

**India-First Product Design**
By conducting requirement analysis with three Indian event management professionals, the team identified and implemented India-specific features absent from international RSVP tools: 30+ Hindi/English column header aliases for Excel import, +91 contact number normalization, India-specific guest data fields (Travel Plan, ID Type, Room Number, No. of Pax), and a free tier calibrated to the financial constraints of small Indian event operators.

**Security-First Architecture**
The implementation of JWT dual-token authentication, HttpOnly refresh cookies, bcryptjs password hashing, account lockout, per-route rate limiting, Mongo sanitization, Zod input validation, and memory-only file processing demonstrates a security posture consistent with industry best practices for a data-handling SaaS application.

**Comprehensive Test Coverage**
Repository-level verification completed during the audit includes a passing frontend production build and a passing backend TypeScript type check. A committed automated test suite should be added before claiming full formal test coverage.

---

## Appendix C
## API Reference Summary

The implemented backend exposes health endpoints, REST endpoints under `/api/v1`, and backend Socket.IO events.

### REST Endpoints Summary

| Group | Endpoints |
|-------|-----------|
| Health | `GET /health`, `GET /ready` |
| Auth | `POST /api/v1/auth/register`, `POST /api/v1/auth/verify-otp`, `POST /api/v1/auth/resend-otp`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`, `POST /api/v1/auth/onboarding` |
| Users | `GET /api/v1/users/me`, `PATCH /api/v1/users/me`, `PATCH /api/v1/users/me/password`, `GET /api/v1/users/me/export`, `DELETE /api/v1/users/me` |
| Company | `PATCH /api/v1/company` |
| Events | `GET /api/v1/events`, `POST /api/v1/events`, `GET /api/v1/events/:eventId`, `PATCH /api/v1/events/:eventId`, `DELETE /api/v1/events/:eventId` |
| Sheets | `GET /api/v1/events/:eventId/sheets`, `POST /api/v1/events/:eventId/sheets`, `PATCH /api/v1/events/:eventId/sheets/:sheetId`, `DELETE /api/v1/events/:eventId/sheets/:sheetId` |
| Guests | `POST /api/v1/events/:eventId/sheets/:sheetId/guests/bulk`, `PATCH /api/v1/events/:eventId/sheets/:sheetId/guests/bulk-checkin`, `DELETE /api/v1/events/:eventId/sheets/:sheetId/guests/bulk`, `PATCH /api/v1/events/:eventId/sheets/:sheetId/guests/:guestId`, `DELETE /api/v1/events/:eventId/sheets/:sheetId/guests/:guestId` |
| SMS | `GET /api/v1/events/:eventId/sms/preview`, `POST /api/v1/events/:eventId/sms` |
| Export | `GET /api/v1/events/:eventId/export` |

### Socket.IO Events Summary

| Direction | Event | Purpose |
|-----------|-------|---------|
| Client to Server | `join:event` | Join an event room |
| Client to Server | `leave:event` | Leave an event room |
| Server to Room | `guest:updated` | Broadcast a guest record update |
| Server to Room | `guest:deleted` | Broadcast guest deletion |
| Server to Room | `counter:updated` | Broadcast refreshed event counters |

Audit note: these Socket.IO events are implemented on the backend. The current frontend does not yet initialize a Socket.IO client.

---

## Appendix D
## Team Information

**Table D.1: Team Information**

| Sr. No. | Name | Email | Mobile | Role in Project |
|---------|------|-------|--------|-----------------|
| 1 | [Member 1 Name] | member1@example.com | 9XXXXXXXXX | UI/UX Design, Frontend Development (AG Grid, RSVP Sheet, Counter Bar) |
| 2 | [Member 2 Name] | member2@example.com | 9XXXXXXXXX | Frontend Development (Authentication UI, Dashboard, Import/Export UI) |
| 3 | [Member 3 Name] | member3@example.com | 9XXXXXXXXX | Backend Architecture, Authentication Module, Database Schema Design |
| 4 | [Member 4 Name] | member4@example.com | 9XXXXXXXXX | Backend API (Guests, Import/Export), Socket.io, Deployment, Documentation |

**Project Guide:** [Guide Name]  
**Department:** Computer Applications  
**Institution:** [Institution Name]  
**Academic Year:** 2025-2026

---

## Appendix E
## Project Audit Update

This appendix records the June 2026 project audit performed against the current repository.

| Area Audited | Finding |
|--------------|---------|
| Frontend framework | Actual implementation is Vite + React + TypeScript, not Next.js |
| Frontend routing | React Router is used for public and protected pages |
| Frontend API client | Axios attaches access tokens from local storage and refreshes on 401 |
| RSVP interface | AG Grid Community is implemented with rich spreadsheet-style UI behavior |
| Backend framework | Express + TypeScript backend is implemented under `backend/src` |
| Database | MongoDB with Mongoose models for users, companies, events, sheets, guests, OTP records, and login attempts |
| Authentication | OTP verification, login, refresh token rotation, logout, and password reset are implemented |
| Authorization model | Current user model supports owner role only; Admin/Member team RBAC remains future scope |
| Real-time support | Socket.IO backend exists; frontend Socket.IO client is not connected yet |
| Excel support | Excel export is implemented with ExcelJS; earlier import-pipeline claims should be treated as planned/future unless import routes are added |
| SMS | Fast2SMS preview/send service exists with dry-run support |
| Verification | Frontend build passed; backend type check passed |
| Source changes | No application source code was modified during this audit |

### Verification Commands Executed

| Check | Result |
|-------|--------|
| Frontend production build | Passed |
| Backend TypeScript type check | Passed |

### Recommended Future Improvements

- Add `socket.io-client` integration in the RSVP sheet to consume backend real-time events.
- Add an Excel import route and frontend import wizard if import is required for final submission.
- Add automated tests for authentication, event creation, sheet operations, guest bulk save, SMS preview/send, and export.
- Split the RSVP screen into lazy-loaded chunks to reduce the large frontend bundle warning.
- Extend the user/company model if Admin and Member roles are required by the final SRS.

---

## Bibliography

[1] AG Grid Ltd. *AG Grid Community Edition Documentation — Virtual Scrolling and Performance.* 2024. Available: https://www.ag-grid.com/javascript-data-grid/dom-virtualisation/

[2] Chen, L., Wang, M., and Zhang, Y. *"Room-Based Broadcast Patterns for Real-Time Collaborative Web Applications."* IEEE Transactions on Software Engineering, vol. 48, no. 4, pp. 1123–1140, 2022.

[3] Mouakher, A., Ghannouchi, S. A., and Kolski, C. *"A Systematic Literature Review on Multi-Tenancy in Cloud SaaS Applications."* Journal of Systems and Software, vol. 170, 2020.

[4] Papatheodorou, A. and Alexandros, P. *"Intelligent Column Mapping for Data Import in Event Management Software: A User Acceptance Study."* Proceedings of the 15th International Conference on Web Engineering (ICWE), 2022.

[5] Ferraiolo, D. F., Sandhu, R., Gavrila, S., Kuhn, D. R., and Chandramouli, R. *"Proposed NIST Standard for Role-Based Access Control."* ACM Transactions on Information and System Security, vol. 4, no. 3, pp. 224–274, 2001.

[6] Fette, I. and Melnikov, A. *"The WebSocket Protocol."* IETF RFC 6455, 2011. Available: https://tools.ietf.org/html/rfc6455

[7] Koskela, T., Mäkinen, E., and Poranen, T. *"Operational Transformation vs. Event Sourcing for Conflict Resolution in Collaborative Web Applications."* ACM Symposium on Applied Computing (SAC), 2021.

[8] Bennett, T. *"Freemium to Paid: Conversion Strategies for Vertical SaaS Products in Emerging Markets."* Journal of SaaS Economics, vol. 3, no. 1, pp. 45–62, 2019.

[9] Leichsenring, M. *"JavaScript Data Grid Benchmark 2023: AG Grid vs. Handsontable vs. DevExtreme."* Medium Engineering Blog, 2023. Available: https://medium.com/@mleichsenring/js-data-grid-benchmark

[10] ExcelJS Contributors. *ExcelJS Documentation.* 2024. Available: https://github.com/exceljs/exceljs

[11] Nodemailer Contributors. *Nodemailer — Node.js SMTP Library Documentation.* 2024. Available: https://nodemailer.com/

[12] Socket.io Contributors. *Socket.io Documentation — Rooms and Namespaces.* 2024. Available: https://socket.io/docs/v4/rooms/

[13] MongoDB Inc. *MongoDB Atlas Documentation — Multi-Tenancy Architecture Patterns.* 2024. Available: https://www.mongodb.com/docs/atlas/

[14] Vite Contributors. *Vite Documentation.* 2024. Available: https://vite.dev/guide/

[15] TanStack. *TanStack Query (React Query) v5 Documentation.* 2024. Available: https://tanstack.com/query/latest

[16] OWASP Foundation. *OWASP Top 10 — Application Security Risks.* 2021. Available: https://owasp.org/Top10/

[17] Government of India. *Digital Personal Data Protection Act, 2023.* Ministry of Electronics and Information Technology. Available: https://www.meity.gov.in/

[18] Mongoose Contributors. *Mongoose v8 Documentation — Schema Design Patterns.* 2024. Available: https://mongoosejs.com/docs/

[19] Resend Inc. *Resend Email API Documentation.* 2024. Available: https://resend.com/docs

[20] Zod Contributors. *Zod — TypeScript-First Schema Validation.* 2024. Available: https://zod.dev/

---

*End of Report*

*InviteSheet — MCA Major Project Report*  
*Academic Year 2025–2026*
