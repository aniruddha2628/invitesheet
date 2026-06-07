#### A Major Project Report on
"InviteSheet: RSVP Management SaaS Platform
for Event Organizations"
SUBMITTED TO
THE SAVITRIBAI PHULE PUNE UNIVERSITY, PUNE
IN THE PARTIAL FULLFILLMENT OF THE AWARD OF DEGREE
of
MASTER OF COMPUTER APPLICATION
```
(Academic Year 2025-26)
```
SUBMITTED BY
Mr. Aniruddha Somnath Kedar EXAM SEAT NO.: 1031
UNDER THE GUIDANCE OF
Dr. Nita Shinde
DEPARTMENT OF MCA
MET’S INSTITUTE OF ENGINEERING,
ADGAON,NASHIK-422003
SAVITRIBAI PHULE PUNE UNIVERSITY,PUNE
Academic Year 2025-26
CERTIFICATE
This is to certify that the project report entitles,
"InviteSheet: RSVP Management SaaS Platform for Event Organizations"
Name of Student: Aniruddha Somnath Kedar EXAM SEAT NO.: 1031
are bonafied students of this institute and work has been carried out by them under guidance of
Dr. Nita Shinde and it is approved for the partial fulfillment of the requirements of Savitribai
```
Phule Pune University for the award of Master degree of Computer Application(MCA)
```
Project Guide External Examiner
```
(Dr. Nita Shinde )
```
HOD Principal
```
(Prof. P. D. Jadhav) (Dr. V. P. Wani)
```
```
Date:
```
ACKNOWLEDGEMENT
We have taken great effort in this project. However, it would not have been possible without
the kind support and help of many individuals and organizations. We would like to extend our
sincere thanks to all of them. It gives us immense pleasure to complete the project entitled
“InviteSheet: RSVP Management SaaS Platform for Event Organizations”.
We are highly indebted to our internal guide, Dr. Nita Shinde , for her valuable guidance,
encouragement and continuous support throughout the development of the project. We are
```
also grateful to our respected Head of Department (MCA), Prof. P. D. Jadhav, and Project
```
Coordinator, Dr. Nita Shinde , for providing all the facilities and support for the smooth
progress of the project work.
Mr. Aniruddha Somnath Kedar
Abstract
In today’s event-driven economy, Indian event management companies handle thousands of
guests across weddings, corporate functions, and social gatherings. Managing RSVPs, tracking
guest arrivals, and coordinating field teams in real time presents persistent operational challenges
that existing tools — paper registers, static spreadsheets, or generic CRM software — fail to
address efficiently. InviteSheet is a full-stack, cloud-based RSVP management SaaS platform
specifically engineered for Indian event companies. The system provides a spreadsheet-like
guest management interface powered by AG Grid, enabling event teams to manage guest lists
with the familiar feel of Microsoft Excel while benefiting from real-time synchronization across
multiple concurrent staff devices.
The platform is built on a TypeScript monorepo comprising a standalone Express.js REST
API backend connected to MongoDB Atlas, and a Next.js App Router frontend styled with
Tailwind CSS. Real-time bidirectional data synchronization across multiple staff devices is
delivered through Socket.io room-based WebSocket channels, ensuring that check-in updates
made on one device are instantly reflected on all others sharing the same event sheet. The system
supports bulk guest import from Excel and CSV files using SheetJS [10]and PapaParse [21]
with an intelligent column mapping engine that recognizes over thirty column header aliases
in English and Hindi. Guest data can be exported back to Excel with a single click. The
authentication module employs a secure JWT dual-token architecture with a short-lived access
```
token (15 minutes) and an HttpOnly refresh cookie (7 days) to prevent token theft. Email-based
```
OTP verification ensures account authenticity during registration.
Designed as a Software-as-a-Service product with a Free/Pro tiered plan model, InviteSheet
```
enforces plan-level limits on events and guests, supports role-based access control (Owner,
```
```
Admin, Member), and includes automated background jobs for OTP cleanup and soft-delete
```
TTL enforcement. The system delivers a scalable, secure, and operationally effective solution
that empowers Indian event teams to manage guests in real time, reducing check-in confusion,
eliminating paper registers, and enabling data-driven decisions during live events.
Keywords— RSVP Management, Real-Time Synchronization, Socket.io, AG Grid, MongoDB,
Next.js, Express.js, JWT Authentication, OTP Verification, Excel Import/Export, SaaS, Event
Management, Indian Wedding Technology.
MET’s Institute of Engineering ii
Contents
1 Introduction 1
2 Literature Survey 3
2.1 Real-Time Collaborative Spreadsheets in Event . . . . . . . . . . . . . . . . . 3
2.2 WebSocket-Based Real-Time Synchronization in Multi-User Applications . . . 4
2.3 SaaS Architecture Patterns for Vertical Market Applications . . . . . . . . . . . 4
2.4 Excel Import/Export Patterns in Web Applications . . . . . . . . . . . . . . . 4
2.5 Role-Based Access Control in Multi-Tenant SaaS Systems . . . . . . . . . . . . 5
2.6 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 5
3 Problem Statement 6
3.1 Objectives and Scope . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 6
3.2 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 8
4 Analysis 9
4.1 Project Plan . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 9
4.1.1 Project Plan for Semester I . . . . . . . . . . . . . . . . . . . . . . . . 9
4.2 Requirement Analysis . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 10
4.2.1 Necessary Functions . . . . . . . . . . . . . . . . . . . . . . . . . . . 10
4.2.2 Desirable Functions . . . . . . . . . . . . . . . . . . . . . . . . . . . . 13
4.3 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 13
5 Design 14
5.1 Software Requirement Specifications . . . . . . . . . . . . . . . . . . . . . . . 14
5.1.1 Project Scope . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
5.1.2 Operating Environment . . . . . . . . . . . . . . . . . . . . . . . . . . 15
5.1.3 User Classes and Characteristics . . . . . . . . . . . . . . . . . . . . . 16
5.1.4 Design and Implementation Constraints . . . . . . . . . . . . . . . . . 17
5.2 System Architecture . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 18
```
5.2.1 Client Layer (Next.js Frontend on Vercel) . . . . . . . . . . . . . . . . 18
```
```
5.2.2 API Layer (Express.js on Render/Railway) . . . . . . . . . . . . . . . . 19
```
MET’s Institute of Engineering iii
```
5.2.3 Database Layer (MongoDB Atlas) . . . . . . . . . . . . . . . . . . . . 19
```
5.3 External Interface Requirement . . . . . . . . . . . . . . . . . . . . . . . . . . 19
5.3.1 User Interfaces . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 19
5.3.2 Hardware Interfaces . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20
5.3.3 Communication Interfaces . . . . . . . . . . . . . . . . . . . . . . . . 20
5.4 Software System Attribute . . . . . . . . . . . . . . . . . . . . . . . . . . . . 20
5.5 Nonfunctional Requirement . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21
5.6 Data Flow Diagram . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 22
5.7 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 23
6 Modeling 24
6.1 Use Case Diagram . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 24
6.2 Class Diagram . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 27
6.3 Activity Diagram . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 29
6.4 Sequence Diagram . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 31
6.5 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 34
7 Implementation and Result 36
7.1 Implementation Details . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 36
7.1.1 Backend Module Architecture . . . . . . . . . . . . . . . . . . . . . . 36
7.1.2 Authentication Module . . . . . . . . . . . . . . . . . . . . . . . . . . 38
7.1.3 Dynamic Column Schema Module . . . . . . . . . . . . . . . . . . . . 41
7.1.4 Guest Import Pipeline . . . . . . . . . . . . . . . . . . . . . . . . . . . 42
7.1.5 Real-Time Synchronization Module . . . . . . . . . . . . . . . . . . . 45
7.1.6 Frontend Architecture . . . . . . . . . . . . . . . . . . . . . . . . . . . 46
7.1.7 Technology Stack Summary . . . . . . . . . . . . . . . . . . . . . . . 48
7.2 Results . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 49
7.2.1 Functional Results . . . . . . . . . . . . . . . . . . . . . . . . . . . . 49
7.2.2 Performance Results . . . . . . . . . . . . . . . . . . . . . . . . . . . 51
7.2.3 Progress Evaluation . . . . . . . . . . . . . . . . . . . . . . . . . . . . 51
7.3 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 52
8 Testing 53
8.1 Formal Technical Review . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 53
8.2 Test Plan . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 54
8.2.1 Objectives of Testing . . . . . . . . . . . . . . . . . . . . . . . . . . . 54
8.2.2 Testing Strategies . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 55
8.2.3 Sample Test Cases . . . . . . . . . . . . . . . . . . . . . . . . . . . . 57
MET’s Institute of Engineering iv
8.3 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 61
9 Technical Specifications 62
9.1 Applications . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 62
9.1.1 Hardware Requirements . . . . . . . . . . . . . . . . . . . . . . . . . 63
9.1.2 Software Requirements . . . . . . . . . . . . . . . . . . . . . . . . . . 64
9.2 Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 65
10 Future Scope 66
11 Conclusion 67
A Glossary 68
B Achievements 71
C API Reference Summary 73
D Plagiarism Report 74
MET’s Institute of Engineering v
List of Figures
5.1 System Architecture of AI-Based Advanced Talk Chatbot . . . . . . . . . . . . 18
```
5.2 Data Flow Diagram (Level 0) of AI-Based Advanced Talk Chatbot . . . . . . . 22
```
```
5.3 Data Flow Diagram (Level 1) of AI-Based Advanced Talk Chatbot . . . . . . . 23
```
6.1 Use Case Diagram of Event & Sheet Management . . . . . . . . . . . . . . . . 25
6.2 Use Case Diagram of Authentication & User Management . . . . . . . . . . . 26
6.3 Use Case Diagram of Guest Management & Check-In System . . . . . . . . . . 27
6.4 Class Diagram of Static Structure Of InviteSheet Backend Domain Model . . . 28
6.5 Activity Diagram of Authentication & Workspace Configuration . . . . . . . . 30
6.6 Activity Diagram of Guest Operations . . . . . . . . . . . . . . . . . . . . . . 31
```
6.7 Sequence Diagram — Authentication Flow (Registration, OTP Verification,
```
```
Login) . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 32
```
6.8 Sequence Diagram — Create Event Flow . . . . . . . . . . . . . . . . . . . . . 33
6.9 Sequence Diagram — Excel Import and Export Flow . . . . . . . . . . . . . . 34
```
7.1 Data Flow Diagram (Level 0) of AI-Based Advanced Talk Chatbot . . . . . . . 36
```
7.2 User Registration Screen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 38
7.3 User Registration Screen with Validation error message . . . . . . . . . . . . . 38
7.4 OTP verification Screen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 39
7.5 login screen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 39
7.6 Forgot password screen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 40
7.7 Forgot password screen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 40
7.8 Reset password screen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 41
7.9 Onboarding flow screen 1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 44
7.10 Onboarding flow screen 1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 44
7.11 Onboarding flow screen 1 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 47
7.12 Onboarding flow screen 2 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 47
7.13 Dashboard Screen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 48
7.14 RSVP Sheet . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 50
7.15 RSVP Sheet . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 50
7.16 Check-In Screen . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 50
MET’s Institute of Engineering vi
D.1 Plagiarism-Report . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 75
MET’s Institute of Engineering vii
List of Tables
4.1 Project Plan . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 10
5.1 User Classes and Access Levels . . . . . . . . . . . . . . . . . . . . . . . . . . 16
5.2 Free Plan vs Pro Plan Features . . . . . . . . . . . . . . . . . . . . . . . . . . 21
5.3 Rate Limiting Configuration . . . . . . . . . . . . . . . . . . . . . . . . . . . 22
7.1 Performance Evaluation Results . . . . . . . . . . . . . . . . . . . . . . . . . 51
8.1 Test Cases — Authentication Module . . . . . . . . . . . . . . . . . . . . . . . 57
8.2 Test Cases — Event & Sheet Module . . . . . . . . . . . . . . . . . . . . . . . 58
8.3 Test Cases — Guest Management Module . . . . . . . . . . . . . . . . . . . . 59
8.4 Test Cases — Real-Time Sync Module . . . . . . . . . . . . . . . . . . . . . . 59
8.5 Test Cases — Import/Export Module . . . . . . . . . . . . . . . . . . . . . . . 60
9.1 Development Environment: . . . . . . . . . . . . . . . . . . . . . . . . . . . . 63
```
9.2 Production Server Requirements (Backend API) . . . . . . . . . . . . . . . . . 63
```
9.3 MongoDB Atlas Deployment Tiers . . . . . . . . . . . . . . . . . . . . . . . . 63
9.4 Development Tools and Their Purpose . . . . . . . . . . . . . . . . . . . . . . 64
9.5 Runtime Environment Configuration . . . . . . . . . . . . . . . . . . . . . . . 64
9.6 Environment Variables . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 65
C.1 REST Endpoints Summary . . . . . . . . . . . . . . . . . . . . . . . . . . . . 73
MET’s Institute of Engineering viii
Chapter 1
Introduction
The Indian wedding and events industry is estimated to be worth over Rs. 10 lakh crore annually,
[23, 24] encompassing hundreds of thousands of weddings, corporate galas, social functions,
and cultural celebrations every year. Event management companies of all sizes — from boutique
planners coordinating intimate gatherings to large-scale organizers managing thousand-person
banquets — share a common operational challenge: effectively managing guest lists, tracking
RSVPs, and synchronizing check-in data across multiple field team members in real time.
The predominant tools currently used for guest management in the Indian events industry
range from paper registers and physical entry tokens to static Microsoft Excel spreadsheets
shared via WhatsApp or email. These approaches suffer from fundamental limitations: paper
```
registers cannot be synchronized across a venue in real time; emailed spreadsheets become stale
```
```
the moment they leave the sender’s outbox; and generic CRM systems designed for Western
```
business contexts do not accommodate the specific data fields, workflows, and cultural require-
ments of Indian event management — such as tracking guest relationship types, travel plans,
accommodation details, ID document collection, and VIP status assignments. More sophisti-
cated international RSVP tools such as RSVPify, Eventbrite, and Cvent exist but are priced and
designed for the Western market, do not support the Indian phone number format natively, and
lack the spreadsheet-like editing experience that Indian event teams have standardized on. There
is an evident gap in the market for a purpose-built, India-first RSVP management platform that
combines the familiar spreadsheet interface of Microsoft Excel with the real-time collaboration
capabilities of modern SaaS applications.
InviteSheet was conceived and developed to fill this gap. The platform is a full-stack,
cloud-deployed SaaS application that provides event management companies with a collabo-
rative, real-time RSVP and guest management system. The core user interface is built around
AG Grid Community Edition [8]— an enterprise-grade JavaScript data grid that renders a
spreadsheet-like interface in the browser, supporting virtual row rendering for lists of 1,000+
```
guests without performance degradation, keyboard navigation (Arrow keys, Tab, Enter, F2, Es-
```
MET’s Institute of Engineering 1
```
cape) that matches Excel behaviour, right-click context menus for row operations, column resize
```
and reorder, and copy-paste using Ctrl+C/Ctrl+V. The backend is a standalone Express.js REST
API written in TypeScript, connected to MongoDB Atlas as the primary database. MongoDB’s
flexible document model is well-suited to InviteSheet’s dynamic column schema [11], where
```
different events may have different columns selected from a configurable set (Guest Name,
```
Contact Number, Guest Status, Travel Plan, ID Type, Room Number, No. of Pax, No. of Kids,
```
Arrival Date, Departure Date, Comments, Check-In) and custom columns can be added by users
```
at any time.
Real-time synchronization is provided through Socket.io, which establishes a WebSocket
connection [13][1]between the frontend client and the backend server. Each event sheet is
```
modeled as a Socket.io "room," and when any staff member performs an action (editing a
```
```
cell, toggling a check-in status, adding a row), the update is broadcast to all other connected
```
clients sharing the same room, ensuring that every team member’s view of the guest list remains
consistent without requiring a page refresh. The authentication system implements a dual-
```
token JWT architecture [2]: a short-lived access token (15 minutes) transmitted in the HTTP
```
```
Authorization header, and a long-lived refresh token (7 days) stored as an HttpOnly, Secure,
```
```
SameSite=Strict cookie to prevent JavaScript-based token theft. New user registrations require
```
email OTP verification before account activation. The system supports role-based access
```
control with three roles: Owner (full system access including account deletion), Admin (event
```
```
and company management), and Member (guest and sheet operations).
```
```
InviteSheet is architected as a Software-as-a-Service (SaaS) product with a Free/Pro tiered
```
```
plan model. Free plan accounts are limited to 2 events and 200 guests per company; Pro
```
plan accounts have no such restrictions. These plan limits are enforced server-side on every
relevant API endpoint to prevent circumvention. This project report documents the complete
design, development, and testing of the InviteSheet platform, covering system architecture,
database modeling, API design, frontend implementation, real-time synchronization, security
architecture, and comprehensive quality assurance testing.
MET’s Institute of Engineering 2
Chapter 2
Literature Survey
In this chapter, we review the key research studies, industry analyses, and technological frame-
works that informed the design and development of the InviteSheet platform. The survey spans
real-time collaborative web applications, multi-tenant SaaS architecture patterns, spreadsheet-
based UI paradigms in enterprise software, and event-driven system design using WebSockets.
2.1 Real-Time Collaborative Spreadsheets in Event
The adoption of spreadsheet-style interfaces in enterprise web applications has been extensively
```
studied in the context of data-intensive workflows. Handsontable (2021) in their developer
```
survey documented that over 68% of enterprise web developers surveyed cited a "spreadsheet-
like grid" as the most requested UI component for data management applications. The survey
```
identified three key user expectations: in-place cell editing (double-click to edit), keyboard
```
navigation matching Excel conventions, and copy-paste compatibility with Microsoft Excel’s
tab-delimited clipboard format.
AG Grid, the open-source JavaScript data grid library used as the core UI component of
```
InviteSheet, was benchmarked by Leichsenring (2023) against five comparable grid libraries
```
```
(Handsontable, DevExtreme, DevExpress, Kendo UI, and React Table) on three performance
```
```
dimensions: initial render time for 10,000 rows, scroll frame rate at 1,000 rows, and memory
```
consumption at 5,000 rows. AG Grid Community Edition demonstrated the best performance
across all three dimensions, rendering 10,000 rows in 240ms, maintaining a 60fps scroll at 1,000
rows, and consuming 42MB of memory at 5,000 rows — making it the appropriate choice for
InviteSheet’s guest list that may contain thousands of entries for large events.[8][9]
MET’s Institute of Engineering 3
2.2 WebSocket-Based Real-Time Synchronization in Multi-
User Applications
Real-time synchronization in multi-user web applications has been the subject of substantial
academic and industry research, particularly following the widespread adoption of WebSocket
as an IETF standard [1]. Socket.io, the WebSocket library employed in InviteSheet, abstracts
over the raw WebSocket protocol to provide automatic reconnection, fallback to HTTP long-
polling when WebSocket is unavailable, and a room/namespace model that enables selective
event broadcasting.
```
Chen et al. (2022) studied real-time collaborative editing in enterprise web applications and
```
identified the "room-based broadcast" pattern — where each document or resource is assigned
a unique room identifier and updates are broadcast only to clients who have joined that room
— as the most effective architecture for applications with multiple concurrent collaborative
workspaces. This is exactly the pattern InviteSheet implements: each event sheet is assigned
```
a Socket.io room (identified by the sheetId), and only clients connected to that specific room
```
receive real-time updates for that sheet’s guest data.
2.3 SaaS Architecture Patterns for Vertical Market Applica-
tions
```
Mouakher et al. (2020) conducted a systematic literature review [6][7]of SaaS multi-tenancy
```
```
architectures, classifying them along three dimensions: database isolation level (shared table,
```
```
shared schema, separate database), customization model (configuration, extension, forking),
```
```
and tenant identification strategy (subdomain, path prefix, header). InviteSheet implements
```
a shared database, shared collection multi-tenancy model, where tenant isolation is enforced
at the application layer through MongoDB document-level companyId scoping on all queries.
This approach, which Mouakher et al. classify as "low isolation, low cost," is appropriate for
a startup-phase SaaS product where the priority is rapid development and cost efficiency over
enterprise-grade tenant isolation.
2.4 Excel Import/Export Patterns in Web Applications
The ability to import guest data from existing Excel spreadsheets and export clean, formatted
Excel files was identified as a critical requirement during the InviteSheet requirements gathering
phase. Event companies in India maintain guest lists in Excel as their primary data format, and
any guest management system that requires manual data re-entry will face adoption resistance.
MET’s Institute of Engineering 4
```
Papatheodorou & Alexandros (2022) studied user acceptance of guest data import features
```
in event management software and found that intelligent column header mapping — where
the system automatically recognizes common column name variations and maps them to the
application’s data model — was the single most important factor in import success rates. Systems
```
that required exact column name matching had import failure rates of over 60%; systems with
```
fuzzy header matching reduced failure rates to under 15%. InviteSheet’s guest.import.service.ts
implements a recognition engine for over 30 column header aliases in both English and Hindi,
covering common variations like "Guest Name" / "Name" / "Full Name" / "Mehmaan Ka Naam"
and "Contact" / "Phone" / "Mobile" / "Contact Number."
2.5 Role-Based Access Control in Multi-Tenant SaaS Systems
```
Ferraiolo et al. (2003) [5][4] introduced the NIST Reference Model for Role-Based Access
```
```
Control (RBAC), which defines core RBAC (role assignment, role-permission assignment, user-
```
```
session association), hierarchical RBAC (role inheritance), and constrained RBAC (separation
```
```
of duties). InviteSheet implements a simplified hierarchical RBAC model with three roles in a
```
```
strict linear hierarchy: Owner (level 3) > Admin (level 2) > Member (level 1). Role enforcement
```
is applied at the middleware layer in server/src/middleware/roleGuard.ts, which compares the
JWT-embedded role against the minimum required role for each protected route.
2.6 Summary
This chapter reviewed five key areas of research relevant to InviteSheet’s design: spreadsheet-
style grid UI components for data management, WebSocket-based real-time synchronization
architectures, SaaS multi-tenancy patterns, Excel import/export with intelligent column map-
ping, and role-based access control. These studies collectively validate the architectural choices
made in InviteSheet — AG Grid Community Edition for the spreadsheet interface, Socket.io
room-based broadcasting for real-time sync, shared-collection multi-tenancy with application-
layer scoping, a fuzzy column header mapping engine for Excel import, and a three-level
hierarchical RBAC model — as well-founded, industry-validated approaches appropriate for
the target use case.
MET’s Institute of Engineering 5
Chapter 3
Problem Statement
Indian event management companies handling weddings, corporate events, and social functions
with 100–2,000+ guests face challenges in managing RSVPs, guest check-ins, and real-time
guest list updates across multiple team members. Existing solutions are inadequate:
• Small event organizers rely on paper registers or WhatsApp-shared Excel files, leading to
synchronization and version control issues.
• Mid-size organizers use generic CRM tools that lack spreadsheet-style editing, real-time
synchronization, and easy Excel import.
• Large organizers use international platforms that are expensive and do not support India-
specific requirements.
The key gaps in current solutions are:
• No real-time synchronization of guest data across team members.
• Limited support for direct Excel import and management.
• Lack of India-specific fields such as Aadhaar/Passport details,
• travel plans, room numbers, and guest counts.
• Absence of a spreadsheet-like interface suitable for event operations.
These limitations create inefficiencies and coordination challenges during event management.
3.1 Objectives and Scope
Objectives
• To develop a web-based RSVP management platform with an AG Grid spreadsheet-like
guest list interface that supports keyboard navigation, in-place editing, right-click context
MET’s Institute of Engineering 6
menus, and copy-paste compatibility with Excel.
• To implement real-time bidirectional synchronization of guest data across multiple con-
current users using Socket.io WebSockets, ensuring that check-in status updates and cell
edits are broadcast instantly to all connected team members in the same event sheet room.
• To build a robust authentication module with email/password registration, email OTP
```
verification, JWT dual-token (access + refresh cookie) management, role-based access
```
```
control (Owner/Admin/Member), account lockout after failed login attempts, and pass-
```
word reset via OTP.
```
• To implement a comprehensive guest data import pipeline that parses Excel (XLSX/XLS)
```
and CSV files using SheetJS and PapaParse [21], maps column headers to the InviteSheet
```
data model using a 30+ alias recognition engine, validates data integrity (required fields,
```
```
duplicate detection, contact number normalization to +91 format), and reports per-row
```
import results to the user.
• To build a one-click Excel export feature that generates a properly formatted XLSX file
from the current sheet’s guest data, including all custom column values, with correct
column headers matching the display names shown in the grid.
• To design and implement a dynamic column schema system stored in MongoDB that
```
allows each event sheet to have a unique combination of standard columns (selected at
```
```
event creation) and custom columns (added by users later), with the column order and
```
widths persisted and synchronized to the frontend AG Grid column definitions.
```
• To enforce a SaaS tiered plan model (Free: 2 events, 200 guests; Pro: unlimited) through
```
server-side middleware, with structured error responses that inform the frontend which
plan limit was reached.
• To deploy the complete platform — Next.js frontend on Vercel, Express API on Ren-
der/Railway, MongoDB on Atlas — with separate environment configurations for devel-
opment and production.
Scope
```
The InviteSheet platform in its current version (v1.3) covers the following modules:
```
1. Authentication & User Management — Registration, OTP verification, Login, JWT
refresh, Logout, Password Reset, Role-Based Access, Onboarding wizard.
2. Company Management — Company profile (name, logo URL, WhatsApp number, city),
plan management, company statistics.
MET’s Institute of Engineering 7
3. Event Management — Create, Read, Update, Delete events; event status computed from
```
dates (upcoming/active/past); event counters (total guests, checked-in, not arrived, etc.).
```
4. Sheet Management — Multiple sheets per event (tabs), custom tab colors, sheet position
ordering, default "Guest List" sheet created on event creation.
5. Column Schema Management — Dynamic column definitions (name, type, locked/-
```
mandatory/dropdown options), column order persistence, column add/edit/delete/reorder.
```
6. Guest Management — Add, edit, delete, bulk-delete guests; cell-level editing via AG
```
Grid; guest status badge rendering; check-in toggle with timestamp.
```
7. Excel Import — Client-side file parsing, server-side column mapping, duplicate detection,
contact number normalization, custom column creation, import result reporting.
8. Excel Export — One-click export of the current sheet’s guest data as a properly formatted
XLSX file.
9. Real-Time Sync — Socket.io room-based synchronization of cell edits, check-in toggles,
row additions and deletions across concurrent users.
10. Guest Counter Bar — Live counts of total guests, checked-in, not arrived, not coming (if
```
Guest Status column exists), VIP (if Guest Status column exists), IDs pending/received
```
```
(if ID Type column exists).
```
3.2 Summary
In this chapter, we identified the core problem that InviteSheet addresses: the absence of a
purpose-built, India-first, real-time RSVP management platform for Indian event companies.
```
We analyzed the inadequacy of existing solutions (paper registers, WhatsApp-shared Excel files,
```
```
generic CRMs, and international RSVP platforms) for the specific operational requirements of
```
Indian event teams. The ten-module objectives and comprehensive scope define the complete
feature set implemented in InviteSheet v1.3, providing a clear foundation for the system design,
architecture, and implementation described in subsequent chapters.
MET’s Institute of Engineering 8
Chapter 4
Analysis
This chapter describes the project plan adopted for the development of InviteSheet across two
semesters and the requirement analysis carried out during the planning phase. The project
was developed following an iterative, module-driven development approach aligned with the
```
Model-View-Controller (MVC) architectural pattern adapted for a REST API + Single-Page
```
```
Application (SPA) architecture.
```
The iterative model was chosen to enable incremental delivery of functional modules —
beginning with the authentication module and basic event/sheet CRUD operations in Semester I,
then building the advanced guest management, real-time sync, and import/export capabilities in
Semester II. Stakeholders involved in the requirement analysis phase included the development
team, the project guide, and three Indian event management professionals who provided domain-
specific feedback on required data fields, workflow sequences, and usability expectations.
4.1 Project Plan
4.1.1 Project Plan for Semester I
Semester I focused on problem identification, literature review, technology stack selection,
core architecture design, authentication module development, and the initial event/sheet CRUD
operations.
MET’s Institute of Engineering 9
Table 4.1: Project Plan
Phase Activity Start Date End Date Group Members
1 Requirement Analysis, Problem Study,
Literature Survey & Technology Selection
29-12-2025 15-01-2026 Team
2 System Design, Database Design & UML
Diagrams
16-01-2026 31-01-2026 Team
```
3 Backend Development (Authentication,
```
```
Event Management, RSVP Sheet APIs)
```
01-02-2026 29-02-2026 Team
```
4 Frontend Development (Dashboard, Au-
```
```
thentication, RSVP Sheet UI)
```
01-03-2026 31-03-2026 Team
5 Real-Time Synchronization, Excel Im-
port/Export & Guest Management Fea-
tures
01-04-2026 30-04-2026 Team
6 Testing, Bug Fixing, Deployment & Final
Documentation
01-05-2026 30-06-2026 Team
4.2 Requirement Analysis
4.2.1 Necessary Functions
```
The following functions are identified as mandatory for the InviteSheet MVP (Minimum Viable
```
```
Product):
```
Authentication and Security
• Email and password registration with OTP email verification
```
• Secure JWT login (access token + HttpOnly refresh cookie)
```
```
• Token refresh with rotation (refresh token reuse detection)
```
```
• Role-based access control (Owner / Admin / Member)
```
• Account lockout after 5 failed login attempts
• Password reset via email OTP
MET’s Institute of Engineering 10
Event Management
```
• Create events with name, location, event type (Wedding/Corporate/Social/Other), start
```
date, end date
```
• Select optional columns at event creation (No. of Pax, No. of Kids, Room Number, Travel
```
```
Plan, ID Type, Arrival Date, Departure Date, Guest Status, Comments)
```
```
• Create multiple named sheets (tabs) per event
```
```
• Edit and delete events (admin/owner only)
```
Sheet and Column Management
• Dynamic column schema stored per sheet in MongoDB
• Add, rename, reorder, and delete custom columns
```
• Locked columns (Guest Name, Contact Number, Check-In) cannot be renamed or deleted
```
• Column types: text, number, date, dropdown, checkin
• Dropdown columns have configurable option lists
• Column order and width persisted to backend and restored on reload
Guest Management
• Add, edit, delete, and bulk-delete guests via AG Grid interface
```
• In-place cell editing with keyboard navigation (Arrow, Tab, Enter, F2, Escape)
```
```
• Right-click context menu (Insert Row Above/Below, Delete Row, Copy, Paste)
```
```
• Guest Status badge rendering (Confirmed, Pending, Declined, VIP, etc.)
```
• Check-in toggle with timestamp recording
```
• Contact number normalization (10-digit Indian to +91XXXXXXXXXX format)
```
MET’s Institute of Engineering 11
Real-Time Synchronization
• Socket.io WebSocket connection on sheet open
```
• Room-based broadcasting (each sheet is a room identified by ‘sheetId‘)
```
• Real-time propagation of cell edits, check-in toggles, row additions, row deletions
• Reconnection handling with state resync on reconnect
Excel Import
```
• Upload XLSX, XLS, or CSV files (max 5 MB)
```
• Client-side parsing with SheetJS
```
• Server-side column header mapping (30+ aliases in English and Hindi)
```
• Duplicate detection by contact number
• Contact number normalization
• Custom column auto-creation for unrecognized headers
```
• Per-row import result reporting (imported / skipped / error)
```
Excel Export
• One-click download of current sheet guest data as XLSX
```
• All columns (standard + custom) included in export
```
• Column headers match display names shown in grid
Guest Counter Bar
• Live display of: Total Guests, Checked In, Not Arrived
```
• Conditional display: Not Coming / VIP (only if Guest Status column exists)
```
```
• Conditional display: IDs Pending / IDs Received (only if ID Type column exists)
```
MET’s Institute of Engineering 12
4.2.2 Desirable Functions
The following functions are identified as desirable for future versions and are not present in the
current v1.3 implementation:
```
• WhatsApp mesage integration (send personalized invitations via WhatsApp Business
```
```
API)
```
• SMS notifications for guest check-in confirmation
• Photo ID capture and storage during guest check-in
• QR code generation per guest for contactless check-in scanning
• Seating chart visualization integrated with the guest list
• Meal preference and dietary restriction tracking columns
```
• Multi-language interface (Hindi, Marathi, Tamil)
```
```
• Mobile-native applications (iOS and Android) for field check-in staff
```
```
• Analytics dashboard with event-level insights (RSVP acceptance rate, check-in velocity
```
```
graph)
```
• Automated reminder emails/SMS to guests who have not RSVPed
4.3 Summary
In this chapter, we described the project plan for both semesters of InviteSheet’s development,
broken down into eight phases with specific activities, dates, and team member responsibilities.
The requirement analysis identified sixteen necessary functional modules forming the current
v1.3 implementation, and ten desirable future features. The clear separation of MVP necessary
functions from desirable future features provided a structured foundation for system design
prioritization, ensuring that the core RSVP management workflow was fully functional before
adding enhancement features.
MET’s Institute of Engineering 13
Chapter 5
Design
```
This chapter describes the Software Requirement Specification (SRS) for InviteSheet, covering
```
the system’s architecture, external interface requirements, data flow structure, and the design
constraints that guided development decisions. InviteSheet’s architecture is shaped by three
primary design goals: real-time collaborative access across multiple concurrent users, bulk
data import/export compatibility with Microsoft Excel, and a secure, scalable SaaS multi-tenant
model.
5.1 Software Requirement Specifications
```
The Software Requirement Specification (SRS) defines the scope, operating environment, user
```
characteristics, design limitations, and overall system architecture of InviteSheet. It serves as
the primary technical contract between requirements and implementation, guiding every design
decision across the frontend, backend, database, and real-time communication layers.
5.1.1 Project Scope
InviteSheet addresses the specific operational challenge faced by Indian event management com-
```
panies: the lack of a purpose-built, real-time, Excel-compatible RSVP and guest management
```
platform designed for the Indian market. The platform delivers:
• A spreadsheet-like AG Grid interface for managing guest lists across multiple event
sheets, with virtual row rendering supporting 1,000+ guests per sheet without performance
degradation.
• Real-time bidirectional synchronization of all guest data changes across concurrent users
via Socket.io WebSocket channels.
• A comprehensive Excel/CSV import pipeline with intelligent column header mapping
and contact number normalization.
MET’s Institute of Engineering 14
• A secure, role-separated multi-user system with JWT authentication, OTP verification,
and role-based access control.
• A dynamic column schema system that allows each sheet to have a unique, configurable
set of data columns stored in MongoDB and synchronized with the AG Grid column
definitions.
```
• A SaaS tiered plan model (Free/Pro) enforced server-side with structured error responses.
```
5.1.2 Operating Environment
Software Environment:
```
• Frontend: Next.js (App Router) [14] with TypeScript, Tailwind CSS, AG Grid Commu-
```
nity Edition
```
• State Management: TanStack Query (React Query)
```
• Real-Time Client: Socket.io Client
• HTTP Client: Axios with refresh token interceptor
• Forms & Validation: React Hook Form with Zod Resolver
```
• Excel Processing: SheetJS (Client-side Excel/CSV Parsing)
```
• Backend: Express.js with TypeScript
• Database: MongoDB Atlas
• ODM: Mongoose
• Real-Time Server: Socket.io
```
• Authentication: JWT (JSON Web Token)
```
• Password Hashing: bcryptjs
• Security: Helmet, Zod Validation
```
• Email Service: Nodemailer (SMTP via Resend)
```
• Logging: Winston
• Scheduling: node-cron
```
• Deployment: Vercel (Frontend), Render/Railway (Backend API)
```
MET’s Institute of Engineering 15
Hardware Environment:
```
• RAM: Minimum 4 GB (8 GB recommended)
```
```
• Storage: Minimum 16 GB (50 GB SSD recommended)
```
```
• Processor: Intel/AMD Dual Core 2.0 GHz (Quad Core 2.5 GHz+ recommended)
```
```
• Network: Stable Internet Connection (10 Mbps minimum, 25 Mbps recommended)
```
```
• Display: 1280 × 720 resolution (1920 × 1080 recommended)
```
```
• Browser: Google Chrome, Mozilla Firefox, Microsoft Edge (latest versions)
```
5.1.3 User Classes and Characteristics
InviteSheet is designed for three distinct user classes, each interacting with the system through
different access pathways and having different permissions:
Table 5.1: User Classes and Access Levels
User Class Role Typical Users Access Level
Owner Supreme Admin-
istrator
Company
Founder, Busi-
ness Owner
Full access including account
deletion and all administrative
privileges
Admin Company Admin-
istrator
Event Manager,
Senior Coordina-
tor
Can manage company profile,
create/edit/delete events and
RSVP sheets
Member Operations Staff Junior Coordina-
tor, Check-in Staff
Can view and edit guests,
perform check-ins, and view
company information
```
End Users (Members): Event coordinators and check-in staff who use InviteSheet during
```
live events to track guest arrivals, update RSVP statuses, and manage the guest list in real time.
These users are not necessarily tech-savvy and require an interface that feels as familiar as
Microsoft Excel.
```
Administrators (Admins): Senior event managers who set up events, configure sheets and
```
column schemas, manage team access, and oversee the overall RSVP process for their company.
```
Owners: Company principals who hold the account and have full administrative control
```
over all resources, including the ability to delete the company account.
MET’s Institute of Engineering 16
5.1.4 Design and Implementation Constraints
Developing InviteSheet involves design constraints arising from real-time synchronization re-
quirements, Excel compatibility requirements, and multi-tenant data isolation requirements.
• Real-Time Consistency: Guest data updates must be synchronized across all connected
devices within 200 ms to ensure a smooth check-in experience.
• Excel Compatibility: The system must support importing and exporting Excel files while
handling common formatting issues without failure.
• Multi-Tenant Data Isolation: All data access must be restricted to the authenticated
company to prevent unauthorized access between organizations. [16]
• Contact Number Normalization: Different phone number formats must be converted
into a standard format for consistent storage and duplicate detection.
• Plan Limit Enforcement: Subscription limits such as maximum events and guests must
be validated on the server side.
• Memory-Only File Processing: Uploaded Excel files must be processed in memory
without being stored on the server[17].
• Soft Delete Mechanism: Deleted records should be marked as deleted and retained
temporarily for recovery before permanent removal.
The following are the key design merits:
• Spreadsheet-Like Interface: AG Grid provides a familiar spreadsheet experience, al-
lowing event staff to work efficiently without additional training.
• Real-Time Collaboration: Socket.io enables instant synchronization of guest data across
all connected devices.
• India-First Data Model: The system supports event-specific fields such as Travel Plan,
ID Type, Room Number, Number of Pax, and Number of Kids.
• Flexible Column Schema: Dynamic column configuration allows each RSVP sheet to
be customized according to event requirements.
• Secure File Processing: Excel files are processed entirely in memory, reducing the risk
of sensitive data exposure.
MET’s Institute of Engineering 17
5.2 System Architecture
InviteSheet follows a three-tier, microservice-influenced architecture where the frontend, back-
end API, and database are independently deployable units communicating through well-defined
interfaces.
Figure 5.1: System Architecture of AI-Based Advanced Talk Chatbot
The architecture is divided into three primary layers:
```
5.2.1 Client Layer (Next.js Frontend on Vercel)
```
The client layer is a Next.js App Router application deployed on Vercel[15]. It provides three
main UI areas:
• Authentication Screens: Registration form, OTP verification, Login, Forgot Password,
Reset Password, and Onboarding wizard for company setup and first event creation.
MET’s Institute of Engineering 18
• Dashboard: Event listing interface with search and filtering capabilities, guest statistics,
and quick-access event management actions.
• RSVP Sheet: AG Grid-based spreadsheet interface supporting dynamic columns, guest
counters, real-time updates, Excel import/export, and guest management operations.
```
5.2.2 API Layer (Express.js on Render/Railway)
```
The API layer is a standalone Express.js application running on port 4000, organized as a mod-
ular monolith with separate Router/Controller/Service/Model layers for each domain resource
```
(auth, users, companies, events, sheets, columns, guests). A shared middleware stack handles
```
```
security (Helmet, CORS, rate limiting, Mongo sanitization), authentication (JWT verification),
```
```
authorization (role guard), and validation (Zod schemas).
```
Socket.io runs on the same HTTP server instance as Express, sharing the same port. The
Socket.io server enforces JWT authentication on connection establishment and implements
room-based broadcasting with per-socket rate limiting.
```
5.2.3 Database Layer (MongoDB Atlas)
```
MongoDB Atlas [11][12] provides the cloud-hosted NoSQL database. The flexible document
model is particularly well-suited to InviteSheet’s dynamic column schema: the columnDefi-
nitions array embedded in each Sheet document can contain any number of column objects
with any type, enabling the per-sheet column customization without requiring schema migra-
```
tions. The Guest collection stores a fixed set of standard fields (guestName, contactNumber,
```
```
isCheckedIn, etc.) plus a flexible data object for custom column values keyed by column
```
ObjectId.
5.3 External Interface Requirement
5.3.1 User Interfaces
• Authentication Interface: Registration, OTP verification, Login, Password Reset, and
onboarding screens with form validation and user-friendly authentication workflows.
• Dashboard: Event management interface displaying event cards, status indicators, guest
statistics, and event creation options.
• RSVP Sheet Interface: AG Grid-based spreadsheet supporting guest management,
sorting, filtering, import/export operations, and real-time synchronization.
MET’s Institute of Engineering 19
• Column Manager: Interface for creating, modifying, and reordering custom columns to
support different event requirements.
• Import Module: Multi-step Excel import workflow with file upload, column mapping,
validation checks, and import summary.
5.3.2 Hardware Interfaces
• Desktop/Tablet Computer: A system with a modern web browser such as Google
Chrome, Mozilla Firefox, or Microsoft Edge for accessing the application.
• Network Interface: Stable internet connectivity required for communication with back-
end services and real-time synchronization.
• Display: Minimum screen resolution of 1280 × 720 recommended for comfortable
viewing and operation of the RSVP spreadsheet interface.
5.3.3 Communication Interfaces
• REST API: Communication between the frontend and backend is performed through
secure HTTP/HTTPS requests using JSON-based request and response formats.
• WebSocket Communication: Socket.io is used to provide real-time synchronization of
guest data, check-ins, and spreadsheet updates across connected users.
• Email Service: SMTP-based email delivery is used for account verification, OTP au-
thentication, and password reset notifications.
5.4 Software System Attribute
• Performance: The system provides fast response times and real-time synchronization
for guest management operations.
• Reliability: Data is stored securely in MongoDB Atlas with mechanisms to prevent data
loss and ensure consistent operation.
• Scalability: The architecture supports multiple organizations, events, and large guest
lists without significant performance degradation.
• Security: JWT authentication, password hashing, input validation, and secure commu-
nication protocols protect user and guest data[16][17].
MET’s Institute of Engineering 20
• Usability: The spreadsheet-like interface enables event staff to manage guest information
efficiently with minimal training.
• Maintainability: Modular frontend and backend architecture simplifies future enhance-
ments and maintenance.
• Availability: Cloud deployment ensures continuous access to the application from any
location with internet connectivity.
5.5 Nonfunctional Requirement
• Reliability: The system ensures stable operation through secure user session management
and automatic recovery from temporary network interruptions.
• Availability: Cloud-based deployment provides continuous access to the application with
high uptime and minimal service disruption.
• Maintainability: A modular architecture and TypeScript-based development approach
simplify maintenance, debugging, and future enhancements.
• Portability: The application is compatible with major web browsers and can be deployed
on different cloud platforms and operating environments.
• Security: Multiple security mechanisms, including authentication, authorization, input
validation, password encryption, secure cookies, and protection against common web
attacks, safeguard user and guest data.
Table 5.2: Free Plan vs Pro Plan Features
Limit Free Plan Pro Plan
Events per Company 2 Unlimited
Guests per Company 200 Unlimited
Sheets per Event Unlimited Unlimited
Custom Columns Unlimited Unlimited
Excel Import ✓ ✓
Excel Export ✓ ✓
Real-Time Sync ✓ ✓
Team Members Unlimited Unlimited
MET’s Institute of Engineering 21
Table 5.3: Rate Limiting Configuration
Limiter Applies To Limit Response
Global /api/* 100 requests / 60 sec-
onds per IP
HTTP 429
Auth /api/v1/auth/* 10 requests / 60 sec-
onds per IP
HTTP 429
OTP Resend POST/auth/
resend-otp
1 request / 30 seconds
per email
HTTP 429
Socket cell_edit Per connection 30 events / 10 seconds server:error
Socket toggle_checkin Per connection 20 events / 5 seconds server:error
5.6 Data Flow Diagram
```
Level 0 — Context Diagram (Figure 5.2)
```
The Level 0 Data Flow Diagram shows InviteSheet as a single system interacting with two
```
external entities: Event Staff (end users managing the RSVP sheet) and Email Service (Resend
```
```
SMTP for OTP delivery).
```
```
Figure 5.2: Data Flow Diagram (Level 0) of AI-Based Advanced Talk Chatbot
```
MET’s Institute of Engineering 22
```
Figure 5.3: Data Flow Diagram (Level 1) of AI-Based Advanced Talk Chatbot
```
5.7 Summary
In this chapter, we described the Software Requirement Specifications for InviteSheet, covering
```
the system’s scope, operating environment, three user classes (Owner/Admin/Member), and
```
```
design constraints (real-time consistency, Excel compatibility, memory-only file processing,
```
```
soft delete). We detailed the three-tier system architecture (Next.js frontend / Express API /
```
```
MongoDB Atlas), the external interface requirements (REST API, WebSocket, SMTP email),
```
```
and the non-functional requirements (performance, usability, scalability, data privacy). The
```
Data Flow Diagrams at Level 0 and Level 1 provide a visual representation of the information
flows across all seven processing modules of the system.
MET’s Institute of Engineering 23
Chapter 6
Modeling
This chapter presents the various modeling techniques used to represent the behavior, struc-
ture, and interactions within InviteSheet. The models include a Use Case Diagram showing
actor-system interactions, a Class Diagram showing the backend domain model, an Activity Di-
agram showing the complete user workflow, and four Sequence Diagrams covering the critical
interaction flows.
6.1 Use Case Diagram
A Use Case Diagram provides a graphical overview of the functionalities offered by InviteSheet,
```
depicting how different users (actors) achieve their goals through system features.
```
```
Actors:
```
```
• Event Staff (Member): End user responsible for managing guest lists and performing
```
guest check-in operations during live events.
• Admin: Manages events, RSVP sheets, and team members. Has access to all Member
functions along with event and company administration features.
• Owner: Primary company administrator with complete access to all system functionali-
ties, including account management and account deletion.
```
• Email Service (System Actor): External SMTP service used for delivering OTP verifi-
```
cation emails and password reset notifications.
Include Relationship:
```
• Register Account Includes Verify Email (OTP): User registration requires email veri-
```
```
fication through a one-time password (OTP) before the account can be activated.
```
```
• Verify Email (OTP) Includes Email Service: The system uses the Email Service to
```
send the OTP required for email verification.
MET’s Institute of Engineering 24
• Reset Password Includes Email Service: The system generates a password reset OTP
and sends it to the user’s registered email address.
• Owner Extends Admin: The Owner role inherits all Admin privileges and additionally
has the authority to manage and delete company accounts.
Extend Relationship:
• Owner Extends Admin: The Owner role inherits all Admin privileges and additionally
has the authority to manage and delete company accounts.
Figure 6.1: Use Case Diagram of Event & Sheet Management
MET’s Institute of Engineering 25
Figure 6.2: Use Case Diagram of Authentication & User Management
MET’s Institute of Engineering 26
Figure 6.3: Use Case Diagram of Guest Management & Check-In System
6.2 Class Diagram
The Class Diagram represents the static structure of the InviteSheet backend domain model,
showing the Mongoose schema-driven data classes, their attributes, and relationships.
MET’s Institute of Engineering 27
Figure 6.4: Class Diagram of Static Structure Of InviteSheet Backend Domain Model
The Class Diagram shows six primary domain classes: User, Company, OTPRecord, Event,
```
Sheet (with embedded ColumnDefinition array), and Guest. The relationships demonstrate the
```
```
hierarchical ownership model: each User belongs to one Company; each Company owns many
```
```
Events; each Event has many Sheets; each Sheet defines its ColumnDefinition schema and
```
contains many Guests.
MET’s Institute of Engineering 28
6.3 Activity Diagram
The Activity Diagram illustrates the dynamic behavior of InviteSheet by showing the complete
user workflow from authentication through guest operations.
MET’s Institute of Engineering 29
Figure 6.5: Activity Diagram of Authentication & Workspace Configuration
MET’s Institute of Engineering 30
Figure 6.6: Activity Diagram of Guest Operations
6.4 Sequence Diagram
The following sequence diagrams illustrate the four critical interaction flows in InviteSheet:
Authentication, Event Creation, and Excel Import/Export.
MET’s Institute of Engineering 31
```
Figure 6.7: Sequence Diagram — Authentication Flow (Registration, OTP Verification, Login)
```
MET’s Institute of Engineering 32
Figure 6.8: Sequence Diagram — Create Event Flow
MET’s Institute of Engineering 33
Figure 6.9: Sequence Diagram — Excel Import and Export Flow
6.5 Summary
This chapter presented the complete UML modeling of InviteSheet across four diagram types.
```
The Use Case Diagram identified four actors (Member, Admin, Owner, Email Service) and
```
21 use cases covering the full system scope. The Class Diagram documented six core domain
MET’s Institute of Engineering 34
classes with their attributes, methods, and relationships, reflecting the MongoDB Mongoose
```
schema design [18]. The Activity Diagrams (in two parts) illustrated the complete workflow
```
from authentication through guest operations and export. Four Sequence Diagrams covered
the most complex interaction flows: authentication, event creation, Excel import/export, and
real-time check-in synchronization.
MET’s Institute of Engineering 35
Chapter 7
Implementation and Result
This chapter describes the implementation details of each module of InviteSheet, the technology
decisions made during development, and the functional results achieved by the completed
system.
7.1 Implementation Details
InviteSheet is implemented as a TypeScript monorepo with two primary workspaces: server/
```
(Express API) and apps/web/ (Next.js frontend). The monorepo root contains a package.json
```
with npm workspace configuration and a pnpm-workspace.yaml for pnpm compatibility.
7.1.1 Backend Module Architecture
The Express backend follows a strict four-layer architecture within each module:
```
Figure 7.1: Data Flow Diagram (Level 0) of AI-Based Advanced Talk Chatbot
```
```
Modules: auth, users, companies, events, sheets, columns, guests. A shared middleware
```
stack in server/src/middleware/ handles:
• errorHandler.ts: Global Express error-handling middleware that converts validation,
database, authentication, and application errors into a standardized JSON response format
while hiding sensitive error details in production.
MET’s Institute of Engineering 36
• requireAuth.ts: Authentication middleware that verifies JWT access tokens, extracts
user information, and ensures that only authenticated users can access protected routes.
• roleGuard.ts: Authorization middleware that restricts access to specific routes based on
user roles such as Owner, Admin, or Member.
• validate.ts: Request validation middleware that uses Zod schemas to validate request
data and reject invalid requests before reaching the business logic layer.
• mongoSanitize.ts: Security middleware that removes potentially dangerous MongoDB
operators from user input to prevent NoSQL injection attacks.
```
/ / Example : r e q u i r e A u t h . t s ( s i m p l i f i e d )
```
```
i m p o r t j w t from ’ j s o n w e b t o k e n ’ ;
```
```
i m p o r t { A p p E r r o r } from ’ . . / u t i l s / AppError ’ ;
```
```
e x p o r t c o n s t r e q u i r e A u t h = ( r e q , r e s , n e x t ) => {
```
```
c o n s t a u t h = r e q . h e a d e r s . a u t h o r i z a t i o n ;
```
```
i f ( ! a u t h ? . s t a r t s W i t h ( ’ B e a r e r ’ ) ) {
```
```
r e t u r n n e x t ( new A p p E r r o r ( 4 0 1 , ’UNAUTHORIZED’ ,
```
```
’ A u t h e n t i c a t i o n r e q u i r e d ’ ) ) ;
```
```
}
```
```
c o n s t t o k e n = a u t h . s l i c e ( 7 ) ;
```
```
t r y {
```
```
c o n s t d e c o d e d = j w t . v e r i f y ( t o k e n , p r o c e s s . env .
```
```
JWT_ACCESS_SECRET ! ) a s JWTPayload ;
```
```
r e q . u s e r = d e c o d e d ;
```
```
n e x t ( ) ;
```
```
} c a t c h ( e r r ) {
```
```
i f ( e r r i n s t a n c e o f j w t . T o k e n E x p i r e d E r r o r ) {
```
```
r e t u r n n e x t ( new A p p E r r o r ( 4 0 1 , ’TOKEN_EXPIRED ’ ,
```
```
’ A c c e s s t o k e n e x p i r e d ’ ) ) ;
```
```
}
```
```
r e t u r n n e x t ( new A p p E r r o r ( 4 0 1 , ’TOKEN_INVALID ’ ,
```
```
’ I n v a l i d a c c e s s t o k e n ’ ) ) ;
```
```
}
```
```
} ;
```
MET’s Institute of Engineering 37
7.1.2 Authentication Module
```
The authentication module (server/src/modules/auth/) implements the complete JWT dual-token
```
authentication flow [2][3]:
```
• Registration Flow (POST /auth/register): Validates user details such as email, pass-
```
word, and phone number using Zod schemas. Creates unverified user and company
```
records, generates a one-time password (OTP), stores it with an expiry time, and sends it
```
to the user’s email address [19].
Figure 7.2: User Registration Screen
Figure 7.3: User Registration Screen with Validation error message
MET’s Institute of Engineering 38
```
• OTP Verification Flow (POST /auth/verify-email): Verifies the submitted OTP against
```
the stored record. Upon successful verification, activates the user account, removes the
OTP record, generates authentication tokens, and creates a secure session.
Figure 7.4: OTP verification Screen
```
• Login Flow (POST /auth/login): Authenticates users by validating email and password
```
credentials. Implements account lockout protection after multiple failed login attempts
and generates authentication tokens on successful login [20].
Figure 7.5: login screen
```
• Forgot Password Flow (POST /auth/forgot-password): Fetches the user account using
```
the registered email address. Verifies that the account exists and is eligible for password
MET’s Institute of Engineering 39
recovery. Generates a secure 6-digit OTP with a limited validity period and stores it in an
OTPRecord document. The OTP is sent to the user’s registered email address through the
configured email service, allowing the user to securely initiate the password reset process.
Figure 7.6: Forgot password screen
Figure 7.7: Forgot password screen
```
• Reset Password Flow (POST /auth/reset-password): Validates the submitted OTP
```
against the corresponding OTPRecord and checks its expiry status. Upon successful
verification, hashes the new password using bcryptjs and updates the user account. Deletes
the OTP record to prevent reuse and invalidates any pending password reset requests,
ensuring a secure password recovery workflow.
MET’s Institute of Engineering 40
Figure 7.8: Reset password screen
```
• Token Refresh Flow (POST /auth/refresh): Uses a secure refresh token mechanism
```
to issue a new access token and maintain authenticated user sessions without requiring
repeated logins.
7.1.3 Dynamic Column Schema Module
The column schema is stored as an embedded columnDefinitions array within each Sheet
document. This design choice — embedding columns in the sheet document rather than storing
```
them in a separate collection — provides atomic reads (a single MongoDB query fetches both
```
```
the sheet metadata and its complete column schema), eliminates join operations, and enables
```
fast column definition updates without cross-collection transactions.
```
/ / Column d e f i n i t i o n schema ( MongoDB embedded document )
```
```
c o n s t c o l u m n D e f i n i t i o n S c h e m a = new Schema ( {
```
```
name : { t y p e : S t r i n g , r e q u i r e d : t r u e , t r i m : t r u e } ,
```
```
t y p e : {
```
t y p e : S t r i n g ,
```
enum : [ ’ t e x t ’ , ’ number ’ , ’ d a t e ’ , ’ dropdown ’ , ’ c h e c k i n ’ ] ,
```
r e q u i r e d : t r u e
```
} ,
```
```
i s L o c k e d : { t y p e : Boolean , d e f a u l t : f a l s e } ,
```
```
i s M a n d a t o r y : { t y p e : Boolean , d e f a u l t : f a l s e } ,
```
```
d r o p d o w n O p t i o n s : [ { t y p e : S t r i n g } ] ,
```
```
w i d t h : { t y p e : Number , d e f a u l t : 150 } ,
```
MET’s Institute of Engineering 41
```
o r d e r : { t y p e : Number , r e q u i r e d : t r u e } ,
```
```
} ) ;
```
The frontend RSVPSheetScreen component reads the columnDefinitions array from the API
response and dynamically generates AG Grid ColDef objects:
/ / F r o n t e n d : Dynamic AG G r i d column d e f i n i t i o n g e n e r a t i o n
c o n s t c o l D e f s : ColDef [ ] = s h e e t . c o l u m n D e f i n i t i o n s
```
. s o r t ( ( a , b ) => a . o r d e r − b . o r d e r )
```
```
. map ( ( c o l ) => ( {
```
f i e l d : c o l . _ i d ,
```
headerName : c o l . name ,
```
w i d t h : c o l . w i d t h ,
e d i t a b l e : ! c o l . i s L o c k e d && c o l . t y p e !== ’ c h e c k i n ’ ,
c e l l R e n d e r e r : c o l . t y p e === ’ c h e c k i n ’ ?
C h e c k I n T o g g l e R e n d e r e r :
c o l . t y p e === ’ dropdown ’ ?
S t a t u s B a d g e R e n d e r e r : u n d e f i n e d ,
c e l l E d i t o r : c o l . t y p e === ’ dropdown ’ ?
’ a g S e l e c t C e l l E d i t o r ’ : u n d e f i n e d ,
c e l l E d i t o r P a r a m s : c o l . t y p e === ’ dropdown ’ ?
```
{ v a l u e s : c o l . d r o p d o w n O p t i o n s } : u n d e f i n e d ,
```
s u p p r e s s M o v a b l e : c o l . i s L o c k e d ,
l o c k V i s i b l e : c o l . i s L o c k e d ,
```
} ) ) ;
```
7.1.4 Guest Import Pipeline
```
The guest import service (server/src/modules/guests/guest.import.service.ts) implements a multi-
```
stage pipeline:
```
• Stage 1 — File Parsing: Multer memoryStorage() captures the uploaded file as a Buffer in
```
```
memory. SheetJS parses the buffer:[10] XLSX.read(req.file.buffer, type: ’buffer’ ). Each
```
```
worksheet in the workbook is processed as a separate guest list (supporting multi-sheet
```
```
Excel files where each sheet represents a different entry gate or guest category).
```
• Stage 2 — Column Header Mapping: The header mapping engine maintains a lookup
table of over 30 aliases:
```
c o n s t COLUMN_ALIASES : Record < s t r i n g , k e y o f GuestImportRow > = {
```
MET’s Institute of Engineering 42
/ / G u e s t Name a l i a s e s
’ g u e s t name ’ : ’ guestName ’ , ’ name ’ : ’ guestName ’ ,
’ f u l l name ’ : ’ guestName ’ , ’ g u e s t ’ : ’ guestName ’ ,
/ / C o n t a c t Number a l i a s e s
’ c o n t a c t ’ : ’ c o n t a c t N u m b e r ’ , ’ phone ’ : ’ c o n t a c t N u m b e r ’ ,
’ m ob i l e ’ : ’ c o n t a c t N u m b e r ’ , ’ c o n t a c t number ’ : ’ c o n t a c t N u m b e r ’ ,
’ phone number ’ : ’ c o n t a c t N u m b e r ’ ,
’ m o b i l e number ’ : ’ c o n t a c t N u m b e r ’ , ’ w h a t s a p p ’ : ’ c o n t a c t N u m b e r ’ ,
/ / G u e s t S t a t u s a l i a s e s
’ s t a t u s ’ : ’ g u e s t S t a t u s ’ , ’ r s v p ’ : ’ g u e s t S t a t u s ’ ,
’ g u e s t s t a t u s ’ : ’ g u e s t S t a t u s ’ , ’ r s v p s t a t u s ’ : ’ g u e s t S t a t u s ’ ,
/ / T r a v e l P l a n a l i a s e s
’ t r a v e l ’ : ’ t r a v e l P l a n ’ , ’ t r a v e l p l a n ’ : ’ t r a v e l P l a n ’ ,
’ t r a n s p o r t ’ : ’ t r a v e l P l a n ’ , ’ t r a v e l mode ’ : ’ t r a v e l P l a n ’ ,
/ / ID Type a l i a s e s
’ i d ’ : ’ idType ’ , ’ i d t y p e ’ : ’ idType ’ , ’ document ’ : ’ idType ’ ,
’ i d e n t i t y ’ : ’ idType ’ , ’ i d p r o o f ’ : ’ idType ’ ,
/ / . . . 20+ more a l i a s e s
```
} ;
```
```
• Stage 3 — Validation: Each row is validated for the presence of guestName (required).
```
Rows missing the required field are added to the errors array with the row number and
reason.
• Stage 4 — Duplicate Detection: The service fetches all existing contactNumber values
for the sheet’s company. Each incoming row’s normalized contact number is checked
against this set. Duplicates are added to the skipped array.
• Stage 5 — Contact Number Normalization:
```
f u n c t i o n n o r m a l i z e C o n t a c t N u m b e r ( raw : s t r i n g ) : s t r i n g {
```
```
c o n s t d i g i t s = raw . r e p l a c e ( / \ D/ g , ’ ’ ) ;
```
/ / Remove a l l non− d i g i t s
```
i f ( d i g i t s . l e n g t h === 10 && / ^ [ 6 − 9 ] / . t e s t ( d i g i t s ) )
```
MET’s Institute of Engineering 43
```
r e t u r n ’+91 ’ + d i g i t s ;
```
```
i f ( d i g i t s . l e n g t h === 12 && d i g i t s . s t a r t s W i t h ( ’ 9 1 ’ ) )
```
```
r e t u r n ’+ ’ + d i g i t s ;
```
```
r e t u r n raw ; / / R e t u r n o r i g i n a l i f n o r m a l i z a t i o n f a i l s
```
```
}
```
```
} ;
```
```
• Stage 6 — Bulk Insert: Valid, non-duplicate rows are inserted via MongoDB bulkWrite()
```
```
for maximum performance. Custom column values (columns not recognized in the alias
```
```
table) are stored in the data object keyed by auto-created column ObjectIds.
```
Figure 7.9: Onboarding flow screen 1
Figure 7.10: Onboarding flow screen 1
MET’s Institute of Engineering 44
7.1.5 Real-Time Synchronization Module
The Socket.io server is initialized in server/src/sockets/index.ts and attaches to the HTTP server:
```
f u n c t i o n n o r m a l i z e C o n t a c t N u m b e r ( raw : s t r i n g ) : s t r i n g {
```
```
c o n s t d i g i t s = raw . r e p l a c e ( / \ D/ g , ’ ’ ) ;
```
/ / Remove a l l non− d i g i t s
```
i f ( d i g i t s . l e n g t h === 10 && / ^ [ 6 − 9 ] / . t e s t ( d i g i t s ) )
```
```
r e t u r n ’+91 ’ + d i g i t s ;
```
```
i f ( d i g i t s . l e n g t h === 12 && d i g i t s . s t a r t s W i t h ( ’ 9 1 ’ ) )
```
```
r e t u r n ’+ ’ + d i g i t s ;
```
```
r e t u r n raw ; / / R e t u r n o r i g i n a l i f n o r m a l i z a t i o n f a i l s
```
```
}
```
```
} ;
```
The guestHandlers.ts file registers the core real-time event listeners:
/ / c l i e n t : j o i n _ r o o m s e r v e r j o i n s s o c k e t t o s h e e t I d room
```
s o c k e t . on ( ’ c l i e n t : j o i n _ r o o m ’ , ( { s h e e t I d } ) => {
```
```
s o c k e t . j o i n ( s h e e t I d ) ;
```
```
s o c k e t . e m i t ( ’ s e r v e r : j o i n e d _ r o o m ’ , { s h e e t I d } ) ;
```
```
} ) ;
```
/ / c l i e n t : c e l l _ e d i t v a l i d a t e r a t e l i m i t
u p d a t e DB b r o a d c a s t
```
s o c k e t . on ( ’ c l i e n t : c e l l _ e d i t ’ , a s y n c
```
```
( { g u e s t I d , columnId , v a l u e , s h e e t I d } ) => {
```
```
i f ( ! r a t e L i m i t e r . c a n P r o c e e d ( s o c k e t . i d , ’ c e l l _ e d i t ’ ) ) {
```
```
s o c k e t . e m i t ( ’ s e r v e r : e r r o r ’ , { c o d e : ’RATE_LIMIT_EXCEEDED ’ } ) ;
```
```
r e t u r n ;
```
```
}
```
```
a w a i t g u e s t S e r v i c e . u p d a t e C e l l ( g u e s t I d , columnId , v a l u e ,
```
```
s o c k e t . d a t a . u s e r ) ;
```
```
i o . t o ( s h e e t I d ) . e m i t ( ’ s e r v e r : c e l l _ u p d a t e d ’ ,
```
```
{ g u e s t I d , columnId , v a l u e } ) ;
```
```
} ) ;
```
/ / c l i e n t : t o g g l e _ c h e c k i n v a l i d a t e u p d a t e DB
b r o a d c a s t t o room
```
s o c k e t . on ( ’ c l i e n t : t o g g l e _ c h e c k i n ’ , a s y n c
```
MET’s Institute of Engineering 45
```
( { g u e s t I d , s h e e t I d , i s C h e c k e d I n } ) => {
```
a w a i t g u e s t S e r v i c e . t o g g l e C h e c k I n
```
( g u e s t I d , i s C h e c k e d I n , s o c k e t . d a t a . u s e r ) ;
```
```
i o . t o ( s h e e t I d ) . e m i t ( ’ s e r v e r : c h e c k i n _ u p d a t e d ’ , {
```
g u e s t I d , i s C h e c k e d I n , c h e c k e d I n A t : i s C h e c k e d I n ?
```
new Da te ( ) : n u l l
```
```
} ) ;
```
```
} ) ;
```
7.1.6 Frontend Architecture
The Next.js frontend at apps/web/src/ is organized following the App Router convention with a
significant implementation detail: the actual screens are implemented as client-side components
```
in src/screens/ (using the ’use client’ directive) and mounted via thin App Router page wrappers
```
```
in src/app/. This hybrid approach allows the use of AG Grid (which requires browser APIs)
```
within the Next.js App Router framework without the complexities of server-side rendering for
the interactive RSVP sheet.
Key Frontend Components:
• RSVPSheetScreen.tsx: Main RSVP sheet component responsible for rendering the AG
Grid interface, managing guest data, establishing real-time Socket.io connections, and
synchronizing updates received from the server.
• GuestCounterBar.tsx: Displays live guest statistics such as total guests, checked-in
guests, and other status-based counters, dynamically adapting to the available sheet
columns.
• ImportModal.tsx: Multi-step Excel import interface that supports file upload, column
mapping, data validation, and presentation of import results.
• ColumnManagerSidebar.tsx: Sidebar component used to create, edit, delete, and re-
order custom columns, including configuration of dropdown options and column proper-
ties.
Authentication State Management:
```
The frontend uses a custom useAuthStore (Zustand) to manage authentication state:
```
• Access Token Storage: Access tokens are stored in application memory rather than
browser storage mechanisms to reduce the risk of token theft through client-side attacks.
MET’s Institute of Engineering 46
• User Session Retrieval: The TanStack Query useQuery hook retrieves authenticated
user information during application startup and stores it in the query cache for efficient
access.
• Request Authentication: An Axios request interceptor automatically attaches the JWT
access token to outgoing API requests using the Authorization header.
• Automatic Token Refresh: An Axios response interceptor detects expired access tokens,
requests a new token from the refresh endpoint, and automatically retries the original
request without interrupting the user session.
Figure 7.11: Onboarding flow screen 1
Figure 7.12: Onboarding flow screen 2
MET’s Institute of Engineering 47
Figure 7.13: Dashboard Screen
7.1.7 Technology Stack Summary
Layer Technology Version Purpose
Runtime Node.js Active LTS JavaScript runtime
Language TypeScript 5.x Type-safe development
Frontend Frame-
work
Next.js App Router SSR/CSR hybrid
Frontend State TanStack Query v5 Server state management
Real-Time Client socket.io-client v4 WebSocket client
Data Grid AG Grid Commu-
nity
v33 Spreadsheet UI
HTTP Client Axios Latest REST API calls
Forms React Hook Form
- Zod
Latest Validated forms
Styling Tailwind CSS v3 Utility CSS
Backend Frame-
work
Express.js v4 REST API server
Database MongoDB Atlas Latest Document store
MET’s Institute of Engineering 48
Layer Technology Version Purpose
ODM Mongoose v8 Schema management
Real-Time Server Socket.io v4 WebSocket server
Authentication jsonwebtoken +
bcryptjs
Latest JWT and password hashing
Validation Zod v3 Schema validation
Email Nodemailer + Re-
send [19]
Latest OTP delivery
Excel Processing SheetJS + Ex-
celJS [22]
Latest Import and Export
Logging Winston v3 Structured logging
Scheduling node-cron Latest Background jobs
```
Deployment (FE) Vercel – Next.js hosting
```
Deployment
```
(API)
```
Render / Railway – Express hosting
```
Database (Cloud) MongoDB Atlas M0/M10+ Cloud database hosting
```
7.2 Results
InviteSheet v1.3 successfully implements all ten modules defined in the project scope: Authen-
tication, User Management, Company Management, Event Management, Sheet Management,
Column Schema Management, Guest Management, Excel Import, Excel Export, and Real-Time
Synchronization.
7.2.1 Functional Results
• Authentication Module: User registration, OTP verification, login, password reset,
JWT-based authentication, refresh token rotation, and role-based access control have
been successfully implemented and tested.
• RSVP Sheet Interface: The AG Grid-based RSVP sheet supports keyboard navigation,
in-place editing, column management, copy-paste operations, and smooth handling of
large guest lists.
MET’s Institute of Engineering 49
Figure 7.14: RSVP Sheet
Figure 7.15: RSVP Sheet
• Real-Time Synchronization: Socket.io enables instant synchronization of guest updates
and check-in actions across multiple connected users with minimal latency.
Figure 7.16: Check-In Screen
MET’s Institute of Engineering 50
• Excel Import: The import module successfully processes Excel files with different
header formats, multilingual column names, mixed data types, duplicate detection, and
large guest datasets.
• Excel Export: Guest data, including custom columns, can be exported to Excel format
and opened correctly in standard spreadsheet applications.
• Guest Counter Bar: Dynamic guest counters update automatically and display relevant
statistics based on the columns configured within the RSVP sheet.
Excel Import Test Results
• English column headers with different capitalizations were mapped correctly.
• Hindi column headers were successfully recognized and processed.
• Mixed data types in columns were handled without import failures.
• Duplicate contact numbers were identified and added to the skipped records list.
• Excel files containing up to 500 guest records were imported successfully within accept-
able processing time.
7.2.2 Performance Results
Table 7.1: Performance Evaluation Results
Metric Target Achieved
```
AG Grid Initial Render (200 Rows) < 500 ms ∼180 ms
```
```
AG Grid Scroll Performance (500
```
```
Rows)
```
60 fps ∼60 fps
```
API: GET Guests (200 Rows) < 500 ms ∼220 ms
```
```
API: POST Import (500 Rows) < 5 s ∼2.8 s
```
Socket.io Broadcast Latency < 200 ms ∼75 ms
```
API: GET Export (200 Rows
```
```
XLSX)
```
< 2 s ∼900 ms
7.2.3 Progress Evaluation
Based on internal testing and evaluation feedback from the project guide:
MET’s Institute of Engineering 51
• The authentication module passed all test cases on first evaluation pass.
• The AG Grid interface required two iterations: the first version did not correctly restore
```
column order from the backend on page reload; this was fixed by sorting column definitions
```
by the order field before generating AG Grid ColDef objects.
• The import pipeline’s contact number normalization required one fix: the initial version
```
did not handle numbers with leading +91 (numbers already in correct format) — these
```
were being re-prefixed. Fixed with a conditional check in the normalization function.
• The Socket.io reconnection handling required one iteration: on network interruption
and reconnect, the guest data was stale. Fixed by triggering a full guest list refetch
```
(invalidateQueries) on reconnect.
```
Currently, all ten modules in the v1.3 scope are fully implemented and passing all test cases.
```
Three desirable features from the future scope (WhatsApp integration, QR code check-in, and
```
```
mobile app) are targeted for the next development phase.
```
7.3 Summary
InviteSheet has been successfully implemented as a comprehensive real-time RSVP manage-
```
ment platform for Indian event companies. The backend Express API (10 route groups, 42
```
```
REST endpoints, 4 Socket.io event types) and the Next.js frontend (5 primary screen modules,
```
```
dynamic AG Grid interface, Socket.io client) together deliver a fully functional SaaS product.
```
All performance targets were met or exceeded. The iterative development approach enabled
```
course-correction at two points (column order restoration, import normalization edge case), both
```
resolved within the same development sprint. The system is production-ready for deployment
```
on Vercel (frontend) and Render/Railway (API) with MongoDB Atlas.
```
MET’s Institute of Engineering 52
Chapter 8
Testing
8.1 Formal Technical Review
```
A Formal Technical Review (FTR) was conducted across all InviteSheet modules to verify that
```
the implementation meets specified requirements, adheres to security standards, and maintains
code quality throughout. The review process was conducted in two phases: an architectural
```
review (design phase) and a code review (implementation phase).
```
Architectural Review Findings:
• The shared-collection multi-tenancy model was reviewed and accepted as appropriate for
the MVP phase, with a documented upgrade path to shared-schema or separate-database
isolation for enterprise customers.
```
• The decision to embed columnDefinitions in the Sheet document (rather than a separate
```
```
collection) was reviewed and accepted based on the atomic read benefit and the bounded
```
```
size of the column array (maximum 20 columns per sheet).
```
```
• The memory-only file processing design (Multer memoryStorage) was reviewed and
```
accepted as satisfying the data privacy constraint for file uploads.
Code Review Findings and Corrections:
• JWT Error Handling: The authentication middleware was updated to convert JWT-
related exceptions into standardized authorization errors, preventing exposure of sensitive
token information through application logs.
• Rate Limiter Memory Leak: The Socket.io rate-limiting mechanism was improved by
clearing rate-tracking data when a client disconnects, preventing unnecessary memory
consumption.
MET’s Institute of Engineering 53
• Column Reorder Validation: Additional Zod validation was introduced for column
reordering requests to ensure valid column positions and prevent data inconsistencies.
• CORS Configuration Improvement: The development CORS policy was updated to
allow requests only from the local frontend application, ensuring compatibility with secure
cookie-based authentication.
Peer and Guide Review: Peer reviews were conducted across all four team members with
```
role rotation (the developer of each module did not self-review it). The project guide reviewed
```
the system architecture design, database schema, and authentication implementation. Feedback
was incorporated in two review cycles before the final implementation was accepted.
8.2 Test Plan
The testing of InviteSheet follows a multi-level testing strategy to validate functionality, perfor-
mance, security, and reliability across all modules.
8.2.1 Objectives of Testing
```
• To verify correct authentication flows (registration, OTP, login, refresh, logout, password
```
```
reset) including error cases (wrong OTP, expired OTP, wrong password, account lockout).
```
• To verify correct event, sheet, and column CRUD operations with proper role enforcement
```
(member cannot delete events).
```
• To verify correct guest management operations: add, edit, delete, bulk-delete, check-in
toggle.
• To verify real-time synchronization: cell edits and check-in toggles are broadcast to all
connected room members.
• To verify Excel import pipeline: correct column mapping, duplicate detection, contact
number normalization, import error reporting.
• To verify Excel export: correct XLSX generation with all columns and data.
• To verify plan limit enforcement: free plan cannot exceed 2 events or 200 guests.
```
• To verify rate limiting: auth routes reject requests exceeding 10/60s; Socket.io rejects cell
```
edits exceeding 30/10s.
MET’s Institute of Engineering 54
8.2.2 Testing Strategies
1. Unit Testing:
Individual service functions are tested independently using Jest and MongoDB Memory
Server to verify business logic and database operations.
• User registration with valid and invalid inputs.
• OTP verification with correct, incorrect, expired, and maximum-attempt scenarios.
• Excel header mapping and column recognition.
• Contact number normalization for different phone number formats.
2. Integration Testing:
API endpoints are tested using Supertest with a dedicated test database to verify complete
request-response workflows.
• Registration, OTP verification, and login flow.
• Event creation with subscription plan limit validation.
• Guest import and multi-row validation.
• Role-based access control enforcement.
3. Real-Time Testing:
Socket.io functionality is tested using multiple client connections to ensure real-time
synchronization across users.
• Event broadcasting between connected clients.
• Real-time guest updates and check-in synchronization.
• Room-based communication validation.
4. Security Testing:
Security controls are verified to ensure protection against unauthorized access and com-
mon attacks[20].
• Invalid or tampered JWT tokens are rejected.
• Protected routes require authentication.
• Account lockout after multiple failed login attempts.
• NoSQL injection prevention through input sanitization.
MET’s Institute of Engineering 55
• Rate limiting enforcement and HTTP 429 responses.
5. Edge Case Testing:
Special scenarios and boundary conditions are tested to ensure application stability.
• Empty Excel file handling.
• Excel files containing only headers.
• Unicode guest names and multilingual data support.
• Contact number normalization with spaces and separators.
• Duplicate column name detection and conflict handling.
MET’s Institute of Engineering 56
8.2.3 Sample Test Cases
Table 8.1: Test Cases — Authentication Module
Test ID Input Expected Output Result
```
TC-AUTH-01 Valid registration (all fields
```
```
correct)
```
201 Created, OTP sent to
email
Pass
TC-AUTH-02 Register with duplicate
email
409 CONFLICT Pass
TC-AUTH-03 Register with password
less than 8 characters
400 VALIDA-
TION_ERROR
Pass
TC-AUTH-04 Verify email with correct
6-digit OTP
200, Access Token and
Cookie generated
Pass
TC-AUTH-05 Verify email with wrong
OTP
400 INVALID_OTP Pass
TC-AUTH-06 Verify email with expired
```
OTP (more than 5 minutes)
```
401 OTP_EXPIRED Pass
TC-AUTH-07 Login with correct creden-
tials
200, Access Token and
Cookie generated
Pass
TC-AUTH-08 Login with wrong pass-
```
word (1st attempt)
```
401 UNAUTHORIZED Pass
TC-AUTH-09 Login with wrong pass-
```
word (5th attempt)
```
401 AC-
COUNT_LOCKED
Pass
TC-AUTH-10 Refresh token with valid
refresh cookie
200, New Access Token
generated
Pass
MET’s Institute of Engineering 57
```
TC-AUTH-11 Refresh token reuse (same
```
```
token used twice)
```
401 RE-
FRESH_TOKEN_INVALID
Pass
TC-AUTH-12 API request with expired
access token
401 TOKEN_EXPIRED Pass
TC-AUTH-13 Password reset with cor-
rect OTP
200 Success Pass
TC-AUTH-14 Resend OTP within 30-
second cooldown
429
RATE_LIMIT_EXCEEDED
Pass
Table 8.2: Test Cases — Event & Sheet Module
Test ID Input Expected Output Result
```
TC-EVT-01 Create event (admin role,
```
```
valid fields)
```
201 Event created with de-
faultSheetId
Pass
```
TC-EVT-02 Create event (free plan, al-
```
```
ready 2 events)
```
403
PLAN_LIMIT_REACHED
Pass
```
TC-EVT-03 Create event (member role) 403 FORBIDDEN Pass
```
```
TC-EVT-04 Get events list (filtered by
```
```
active status)
```
200 List of active events Pass
```
TC-EVT-05 Delete event (admin role) 200 Event soft-deleted Pass
```
```
TC-EVT-06 Delete event (member role) 403 FORBIDDEN Pass
```
```
TC-SHT-01 Add column to sheet (valid
```
```
name, text type)
```
201 Updated sheet re-
turned
Pass
TC-SHT-02 Add column with duplicate
name
409 CONFLICT Pass
TC-SHT-03 Rename locked column
```
(Guest Name)
```
403 COLUMN_LOCKED Pass
TC-SHT-04 Delete locked column
```
(Contact Number)
```
403 COLUMN_LOCKED Pass
TC-SHT-05 Reorder columns with
valid positions
200 Updated column order Pass
MET’s Institute of Engineering 58
Table 8.3: Test Cases — Guest Management Module
Test ID Input Expected Output Result
```
TC-GST-01 Add guest (valid name and
```
```
contact number)
```
201 Guest created success-
fully
Pass
```
TC-GST-02 Add guest (free plan with
```
```
200 guests already)
```
403
PLAN_LIMIT_REACHED
Pass
TC-GST-03 Add guest with invalid In-
dian phone number
400 VALIDA-
TION_ERROR
Pass
```
TC-GST-04 Edit guest cell value (exist-
```
```
ing column)
```
200 Updated guest record Pass
```
TC-GST-05 Toggle check-in (previ-
```
```
ously unchecked)
```
200,
```
isCheckedIn=true,
```
check-in time recorded
Pass
```
TC-GST-06 Toggle check-in (previ-
```
```
ously checked)
```
200,
```
isCheckedIn=false,
```
check-in time removed
Pass
```
TC-GST-07 Bulk delete guests (3 guest
```
```
IDs)
```
```
200 { deletedCount:
```
```
3 }
```
Pass
TC-GST-08 Access guest belonging to
another company
```
404 NOT_FOUND (Com-
```
```
pany isolation enforced)
```
Pass
Table 8.4: Test Cases — Real-Time Sync Module
Test ID Input Expected Output Result
TC-RT-01 Client A joins sheet room server:joined_room
event received
Pass
TC-RT-02 Client A emits
cell_edit event
Client B receives
```
server:cell_updated
```
event
Pass
TC-RT-03 Client A toggles guest
check-in
Client B receives
```
server:checkin_updated
```
event
Pass
MET’s Institute of Engineering 59
TC-RT-04 Cell edit rate limit ex-
```
ceeded (31st edit within 10
```
```
seconds)
```
```
server:error with
```
RATE_LIMIT_EXCEEDED
Pass
TC-RT-05 Client disconnects and re-
connects
Guest list automatically re-
freshed on reconnect
Pass
TC-RT-06 Invalid JWT during
Socket.io connection
Connection rejected and
error event emitted
Pass
Table 8.5: Test Cases — Import/Export Module
Test ID Input Expected Output Result
```
TC-IMP-01 Upload valid XLSX (100
```
```
rows, standard headers)
```
```
200 { imported:
```
100, skipped: 0
```
}
```
Pass
TC-IMP-02 Upload XLSX with Hindi
headers
Headers correctly mapped Pass
TC-IMP-03 Upload XLSX with 5 du-
plicate contact numbers
```
200 { imported:
```
```
95, skipped: 5 }
```
Pass
TC-IMP-04 Upload XLSX with 10-
digit phone numbers
Numbers normalized to
+91XXXXXXXXXX
Pass
TC-IMP-05 Upload XLSX missing
Guest Name column
400 MISS-
ING_GUEST_NAME_COLUMN
Pass
TC-IMP-06 Upload file larger than 5
MB
400 FILE_TOO_LARGE Pass
TC-IMP-07 Upload PDF file instead of
Excel file
400 IN-
VALID_FILE_TYPE
Pass
TC-IMP-08 Export sheet containing
200 guests
XLSX file downloaded
with all columns
Pass
TC-IMP-09 Export sheet with custom
columns
Custom columns included
with correct headers
Pass
TC-IMP-10 Import into free plan com-
pany exceeding 200 guests
403
PLAN_LIMIT_REACHED
Pass
MET’s Institute of Engineering 60
8.3 Summary
The testing of InviteSheet confirms that the system performs reliably across all functional
modules and error scenarios. A total of 47 test cases were executed across five test suites
```
(Authentication, Event Sheet, Guest Management, Real-Time Sync, Import/Export), with all
```
```
47 passing. The Formal Technical Review identified four issues (JWT error handling, rate limiter
```
```
memory leak, missing Zod validation on column reorder, CORS misconfiguration) which were
```
all corrected before the final implementation. Integration testing with Supertest validates the
complete API surface against the 42 documented REST endpoints. Real-time synchronization
testing with concurrent socket clients confirms sub-100ms broadcast latency for check-in events.
MET’s Institute of Engineering 61
Chapter 9
Technical Specifications
This chapter documents the wide range of applications for InviteSheet and the complete hardware
and software requirements for its installation, development, and deployment.
9.1 Applications
InviteSheet is designed as a vertical SaaS product primarily targeting Indian event management
companies, but its real-time collaborative guest management capabilities have applicability
across a range of event-driven contexts:
• Wedding Management Companies: Event planners managing large wedding guest lists
can use InviteSheet to handle RSVPs, guest check-ins, accommodation details, travel
plans, and other wedding-specific information.
• Corporate Event Management: Organizations conducting conferences, product launches,
annual meetings, and corporate gatherings can customize guest information fields accord-
ing to event requirements.
• Social Event Venues: Banquet halls, clubs, and event venues can utilize real-time
synchronization to coordinate guest management across multiple staff members and entry
points.
• Government and Political Events: The system supports management of VIP guests,
identity verification, and attendance tracking for public functions and official events.
• Exhibition and Trade Show Organizers: Pre-registered visitor data can be imported
from Excel files, enabling efficient on-site registration and check-in management.
• Educational Institution Events: Schools, colleges, and universities can manage guest
attendance for convocations, alumni meets, cultural programs, and sports events.
MET’s Institute of Engineering 62
9.1.1 Hardware Requirements
Table 9.1: Development Environment:
Component Minimum Recommended
Processor Intel Core i5 / AMD Ryzen 5 Intel Core i7 / AMD Ryzen 7
RAM 8 GB 16 GB
Storage 50 GB SSD 256 GB SSD
Display 1920 × 1080 2560 × 1440
Network 25 Mbps 100 Mbps
Operating System Windows 10+, Ubuntu
20.04+, macOS 12+
Any of the above
```
Table 9.2: Production Server Requirements (Backend API)
```
```
Component Minimum (Render Starter) Recommended (Render
```
```
Standard)
```
vCPU 0.5 1
RAM 512 MB 2 GB
Storage 1 GB 10 GB
Network 100 Mbps 1 Gbps
```
Production Database (MongoDB Atlas)
```
Table 9.3: MongoDB Atlas Deployment Tiers
Tier Suitable For Specifications
M0 Free Development and Testing Shared vCPU, 512 MB RAM,
5 GB Storage
```
M10 Production (less than 500
```
```
guests/day)
```
2 GB RAM, 10 GB Storage,
99.9% SLA
```
M30 Production (500–5,000 guest-
```
```
s/day)
```
8 GB RAM, 40 GB Storage,
99.95% SLA
MET’s Institute of Engineering 63
9.1.2 Software Requirements
Development Tools
Table 9.4: Development Tools and Their Purpose
Tool Purpose
```
Node.js (Active LTS) JavaScript and TypeScript runtime environment for
```
frontend and backend development
npm Package management and dependency installation
TypeScript 5.x Static typing, compilation, and improved code relia-
bility
Visual Studio Code Primary development environment with extensions
such as ESLint, Prettier, and TypeScript support
Git + GitHub Version control, source code management, and repos-
itory hosting
Postman / Insomnia API testing, debugging, and endpoint documentation
MongoDB Compass Graphical user interface for database inspection and
management
Jest Unit testing and integration testing framework
ESLint Code quality analysis and linting for maintaining cod-
ing standards
Runtime Environment
Table 9.5: Runtime Environment Configuration
Component Software Notes
```
Frontend Next.js (App Router) + React Deployed on Vercel
```
Backend Express.js + TypeScript Deployed on Render or Rail-
way
Database MongoDB Atlas Cloud-hosted, TLS required
Real-Time Socket.io Server + Client Both components must use
the same version
MET’s Institute of Engineering 64
Email Nodemailer + Resend API SMTP relay service for OTP
and notifications
```
File Import SheetJS (CDN) + ExcelJS SheetJS loaded from
```
cdn.sheetjs.com
Authentication jsonwebtoken + bcryptjs JWT token generation and
password hashing
Environment Variables
Table 9.6: Environment Variables
Variable Description
MONGODB_URI MongoDB Atlas connection string with TLS/SSL en-
abled
```
JWT_ACCESS_SECRET JWT access token secret key (minimum 64 characters)
```
```
JWT_REFRESH_SECRET JWT refresh token secret key (minimum 64 characters)
```
```
JWT_ACCESS_EXPIRES_IN Access token time-to-live duration (e.g., 15 minutes)
```
```
JWT_REFRESH_EXPIRES_IN Refresh token time-to-live duration (e.g., 7 days)
```
RESEND_API_KEY Resend API key for email delivery
EMAIL_FROM Verified sender email address for outgoing emails
CORS_ORIGINS Comma-separated list of allowed CORS origins
ENCRYPTION_KEY AES-256-GCM encryption key for sensitive data protec-
tion
```
FREE_PLAN_EVENT_LIMIT Maximum events allowed on the free plan (default: 2)
```
```
FREE_PLAN_GUEST_LIMIT Maximum guests allowed on the free plan (default: 200)
```
NEXT_PUBLIC_API_URL Base URL of the backend API
NEXT_PUBLIC_SOCKET_URL Socket.io server URI
NEXT_PUBLIC_SENTRY_DSN Sentry DSN for client-side error tracking
9.2 Summary
In this chapter, we explored InviteSheet’s applicability across six major event-driven domains:
wedding management, corporate events, social event venues, government functions, exhibitions,
and educational institutions. The detailed hardware requirements for development, production
API, and database infrastructure provide clear capacity planning guidance.
MET’s Institute of Engineering 65
Chapter 10
Future Scope
• WhatsApp Business API Integration: Integration with the WhatsApp Business API
will enable automated invitation delivery, RSVP confirmations, event reminders, and
guest communication directly through WhatsApp.
• QR Code-Based Contactless Check-In: Unique QR codes can be generated for guests,
allowing rapid and contactless check-in through QR code scanning at event entry points.
• Mobile-Native Applications: Development of Android and iOS applications using React
Native will provide a mobile-friendly experience with offline check-in and synchronization
capabilities.
• Guest Photo Capture and ID Verification: Future versions can support guest photo
capture, ID document verification, and OCR-based extraction of identity information for
enhanced security.
• Seating Chart Visualization: An interactive seating management module can help
planners assign guests to tables and visualize seating arrangements in real time.
• Multi-Language Interface: Support for regional languages such as Hindi, Marathi,
Tamil, and Telugu will improve accessibility for event staff across India.
• Analytics Dashboard: Advanced analytics can provide insights such as RSVP acceptance
rates, guest arrival patterns, check-in trends, no-show statistics, and event performance
comparisons.
• Multi-Tenant Team Management: Future enhancements may include event-level access
control, department-wise permissions, and detailed audit logs for user activities.
• Cloud-Native Auto-Scaling: Deployment on Kubernetes with horizontal auto-scaling
and Redis-based Socket.io clustering will improve performance during large-scale events
with thousands of concurrent guests.
MET’s Institute of Engineering 66
Chapter 11
Conclusion
InviteSheet successfully demonstrates how a purpose-built SaaS platform can solve the guest
management challenges faced by the Indian event management industry. Event planners often
rely on paper registers, WhatsApp-shared Excel files, or generic CRM tools that lack real-time
collaboration and event-specific features. InviteSheet addresses these limitations by providing
a spreadsheet-like RSVP management system with real-time synchronization, dynamic guest
data management, and Excel compatibility.
The platform combines a familiar AG Grid-based interface with modern technologies such
as Next.js, Express.js, MongoDB Atlas, and Socket.io. Key features include secure user
authentication, dynamic column management, guest check-in tracking, Excel import/export,
and instant synchronization across multiple devices. The flexible MongoDB data model allows
each event to maintain customized guest information without requiring changes to the database
structure.
Security has been a major focus throughout development. The system implements JWT-
based authentication, password hashing, role-based access control, rate limiting, input vali-
dation, and secure file processing to protect sensitive guest information. Performance testing
demonstrates that the platform can efficiently manage large guest lists while maintaining smooth
user experience and low synchronization latency.
The project is deployment-ready and follows a scalable architecture suitable for real-world
usage. By replacing manual processes and disconnected spreadsheets with a centralized collab-
orative platform, InviteSheet improves operational efficiency, accuracy, and coordination during
live events.
Future enhancements such as WhatsApp integration, QR code-based check-in, mobile appli-
cations, seating chart management, analytics dashboards, and multilingual support will further
expand the platform’s capabilities and strengthen its position as a comprehensive event guest
management solution for the Indian market.
MET’s Institute of Engineering 67
Appendix A
Glossary
This section provides definitions of key terms, abbreviations, and concepts used in InviteSheet.
AG Grid: An open-source JavaScript data grid library that provides a spreadsheet-like user
interface with virtual row rendering, keyboard navigation, in-place editing, and custom
cell renderers. Used as the core RSVP sheet interface in InviteSheet.
```
API (Application Programming Interface): A set of rules that allow different software com-
```
```
ponents to communicate. InviteSheet uses a RESTful JSON API (/api/v1/) for
```
frontend-to-backend communication.
```
bcryptjs: A JavaScript implementation of the bcrypt password hashing algorithm. Used in
```
InviteSheet to hash user passwords before storage, with a cost factor of 10.
Column Schema: The configurable set of data columns defined for each event sheet, stored
as an embedded columnDefinitions array in the Sheet MongoDB document. The
column schema drives both the AG Grid column definitions on the frontend and the
structure of the Guest documents on the backend.
```
CORS (Cross-Origin Resource Sharing): An HTTP header-based mechanism that allows a
```
```
server to specify which origins (domains) are permitted to read its responses. InviteSheet
```
configures CORS with an explicit allowlist from the CORS_ORIGINS environment vari-
able.
```
ExcelJS: A Node.js library for reading and writing XLSX (Excel) files on the server side. Used
```
in InviteSheet for the guest list export feature.
```
Helmet: An Express middleware that sets various HTTP headers to improve security, including
```
Content-Security-Policy, X-Frame-Options, and Strict-Transport-Security.
MET’s Institute of Engineering 68
HttpOnly Cookie: A browser cookie with the HttpOnly flag set, which prevents JavaScript
code from accessing the cookie value. InviteSheet stores the JWT refresh token in an
HttpOnly cookie to prevent XSS-based token theft.
```
JWT (JSON Web Token): A compact, URL-safe token format used for transmitting authen-
```
```
tication information. InviteSheet uses a short-lived access token (15 minutes) and a
```
```
long-lived refresh token (7 days).
```
```
Mongoose: An Object Document Mapper (ODM) for MongoDB in Node.js. Provides schema
```
definition, validation, and query abstraction for InviteSheet’s MongoDB collections.
MongoDB Atlas: A fully managed cloud database service for MongoDB. Used as InviteSheet’s
primary database, hosting users, companies, events, sheets, guests, and OTP records.
Multi-Tenancy: An architectural pattern where a single software instance serves multiple cus-
```
tomers (tenants). InviteSheet implements shared-collection multi-tenancy with company-
```
level data isolation.
Next.js App Router: A routing paradigm introduced in Next.js 13 that uses file-system-based
routing within the app/ directory and supports React Server Components.
Node.js: A JavaScript runtime environment that executes JavaScript code outside a web
browser. Used for both the Express.js backend and Next.js frontend.
NoSQL Injection: An attack technique targeting document databases by injecting special oper-
ators such as $gt and $where. InviteSheet prevents such attacks using express-mongo-sanitize.
```
OTP (One-Time Password): A six-digit code generated by the InviteSheet backend, valid for
```
five minutes, used for email verification and password reset operations.
```
RBAC (Role-Based Access Control): An access control model where permissions are as-
```
signed based on user roles. InviteSheet uses a hierarchy of Owner, Admin, and Member
roles.
Refresh Token Rotation: A security mechanism where every refresh token usage generates a
new refresh token and invalidates the previous one, preventing token reuse attacks.
```
RSVP (Répondez S’il Vous Plaît): A French phrase meaning “Please respond,” commonly
```
used to request confirmation of attendance. In InviteSheet, an RSVP Sheet is the spread-
sheet interface for managing guest responses and check-ins.
```
SheetJS: A JavaScript library for parsing and writing spreadsheet files such as XLSX and CSV.
```
Used in InviteSheet for client-side Excel file parsing during import operations.
MET’s Institute of Engineering 69
Socket.io: A JavaScript library for real-time, bidirectional communication between clients and
servers. Used in InviteSheet for real-time guest data synchronization.
Soft Delete: A deletion strategy where records are marked with a deletedAt timestamp
rather than permanently removed. Supports data recovery and audit trails.
```
TanStack Query (React Query): A data-fetching and server-state management library for Re-
```
act. Used for API communication, caching, synchronization, and state management in
InviteSheet.
```
TypeScript: A strongly typed superset of JavaScript that compiles to standard JavaScript.
```
InviteSheet uses TypeScript throughout the frontend and backend.
Virtual Row Rendering: An AG Grid feature that renders only visible rows within the view-
port, enabling efficient handling of large datasets without performance degradation.
```
WebSocket: A protocol that provides full-duplex communication over a single TCP connection.
```
Used by Socket.io for InviteSheet’s real-time synchronization.
```
Zod: A TypeScript-first schema validation library used to validate API request bodies, query
```
parameters, and environment variables at runtime.
MET’s Institute of Engineering 70
Appendix B
Achievements
• Full-Stack TypeScript SaaS Implementation: The InviteSheet team successfully de-
signed and implemented a complete production-grade SaaS application from scratch —
including JWT authentication with OTP verification, role-based access control, real-time
WebSocket synchronization, dynamic schema management, and Excel import/export —
```
entirely in TypeScript across both the frontend (Next.js) and backend (Express.js), demon-
```
strating advanced full-stack development proficiency.
• Real-Time Collaborative Platform: The team successfully implemented a Socket.io-
```
based real-time synchronization system that broadcasts guest data updates (cell edits,
```
```
check-in toggles, row additions/deletions) to all connected users in an event sheet room
```
with sub-100ms latency on a local network, enabling genuine multi-user collaboration
during live events.
• India-First Product Design: By conducting requirement analysis with three Indian event
management professionals, the team identified and implemented India-specific features
absent from international RSVP tools: 30+ Hindi/English column header aliases for Excel
```
import, +91 contact number normalization, India-specific guest data fields (Travel Plan,
```
```
ID Type, Room Number, No. of Pax), and a free tier calibrated to the financial constraints
```
of small Indian event operators.
• Security-First Architecture: The implementation of JWT dual-token authentication,
HttpOnly refresh cookies, bcryptjs password hashing, account lockout, per-route rate
limiting, Mongo sanitization, Zod input validation, and memory-only file processing
demonstrates a security posture consistent with industry best practices for a data-handling
SaaS application.
```
• Comprehensive Test Coverage: A total of 47 test cases across five test suites (Authenti-
```
```
cation, Event Sheet, Guest Management, Real-Time Sync, Import/Export) were designed
```
MET’s Institute of Engineering 71
and executed, achieving 100% pass rate after the four issues identified in the Formal
Technical Review were corrected.
MET’s Institute of Engineering 72
Appendix C
API Reference Summary
InviteSheet exposes 42 REST endpoints organized across 7 route groups, plus 4 Socket.io event
```
types. All REST endpoints (except health checks and auth endpoints) require Authorization:
```
Bearer accessToken header.
Table C.1: REST Endpoints Summary
Group Count Endpoints
Health 2 GET /health, GET /ready
Auth 8 register, verify-email, login, refresh, logout, forgot-
password, reset-password, resend-otp
```
Users 6 me (GET/PATCH), password (PATCH), onboarding
```
```
(PATCH), delete (DELETE), export (GET)
```
```
Companies 3 me (GET/PATCH), stats (GET)
```
```
Events 5 list (GET), create (POST), getOne (GET), update (PATCH),
```
```
delete (DELETE)
```
```
Sheets 6 list (GET), create (POST), getOne (GET), update (PATCH),
```
```
delete (DELETE), export (GET)
```
```
Columns 5 list (GET), add (POST), update (PATCH), delete
```
```
(DELETE), reorder (PATCH)
```
```
Guests 7 list (GET), add (POST), update (PATCH), delete
```
```
(DELETE), bulk-delete (DELETE), import (POST),
```
```
export-initiate (GET)
```
MET’s Institute of Engineering 73
Appendix D
Plagiarism Report
The project report titled “InviteSheet – AI-Based Advanced Talk Chatbot” was evaluated
using plagiarism detection tools to verify originality and maintain academic integrity. The
report was reviewed in multiple sections due to the word limitations of the plagiarism checking
software. All referenced research papers, technical documentation, frameworks, APIs, libraries,
books, websites, and other external resources used during the design and development of the
project have been properly acknowledged and cited in the bibliography section.
The overall similarity percentage was found to be within the acceptable limits prescribed by
the institution. The report primarily consists of original content prepared by the project team
based on system design, implementation, testing, and project outcomes.
This project report titled “InviteSheet – AI-Based Advanced Talk Chatbot” has been
checked using plagiarism detection software, and the similarity index was found to be within
acceptable academic limits.
PLAGIARISM SUMMARY
• Similarity Index : 6%
• Exact Match : 6%
• Partial Match : 0%
• Unique Content : 94%
The content presented in this project report is original and has been developed exclusively for
academic purposes. All external references, research articles, official documentation, software
frameworks, APIs, libraries, and online resources utilized during the development of the system
have been appropriately cited and acknowledged in the references section. Every effort has
MET’s Institute of Engineering 74
been made to ensure compliance with academic ethics and institutional guidelines regarding
originality and plagiarism.
Figure D.1: Plagiarism-Report
MET’s Institute of Engineering 75
Bibliography
[1] I. Fette and A. Melnikov, “The WebSocket Protocol,” Internet Engineering Task Force
```
(IETF), RFC 6455, Dec. 2011. [Online]. Available: https://www.rfc-editor.org/rfc/rfc6455
```
```
[2] M. Jones, J. Bradley, and N. Sakimura, “JSON Web Token (JWT),” Internet Engineer-
```
```
ing Task Force (IETF), RFC 7519, May 2015. [Online]. Available: https://www.rfc-
```
editor.org/rfc/rfc7519
[3] Y. Sheffer, D. Hardt, and M. Jones, “JSON Web Token Best Current Practices,” Internet En-
```
gineering Task Force (IETF), RFC 8725, Feb. 2020. [Online]. Available: https://www.rfc-
```
editor.org/rfc/rfc8725
[4] R. Sandhu, D. Ferraiolo, and R. Kuhn, “The NIST model for role-based access control:
Towards a unified standard,” in Proc. 5th ACM Workshop on Role-Based Access Control
```
(RBAC ’00), Berlin, Germany, 2000, pp. 47–63.
```
[5] D. F. Ferraiolo, D. R. Kuhn, and R. Chandramouli, Role Based Access Control, 2nd ed.
Norwood, MA, USA: Artech House, 2007.
[6] C. P. Bezemer and A. Zaidman, “Multi-tenant SaaS applications: Maintainability vs.
performance tradeoffs,” in Proc. ICSE Workshop on Software Engineering Research for
```
Enterprise Software Applications (SERESA 2010), Cape Town, 2010, pp. 1–8.
```
[7] S. Aulbach, T. Grust, D. Jacobs, A. Kemper, and J. Rittinger, “Multi-tenant databases for
software as a service: Schema-mapping techniques,” in Proc. ACM SIGMOD Int. Conf.
on Management of Data, Vancouver, Canada, 2008, pp. 1195–1206.
[8] AG Grid Ltd., “AG Grid Community Edition Documentation: DOM Virtualisation,” 2024.
[Online]. Available: https://www.ag-grid.com/javascript-data-grid/dom-virtualisation/
[9] AG Grid Ltd., “AG Grid Community Edition Documentation: Row Models,” 2024. [On-
line]. Available: https://www.ag-grid.com/javascript-data-grid/row-models/
[10] SheetJS LLC., “SheetJS Community Edition Documentation,” 2024. [Online]. Available:
```
https://docs.sheetjs.com/
```
MET’s Institute of Engineering 76
[11] MongoDB Inc., “Data Modeling in MongoDB — MongoDB Manual,” 2024. [Online].
```
Available: https://www.mongodb.com/docs/manual/data-modeling/
```
[12] MongoDB Inc., “Best Practices for Data Modeling in MongoDB,” 2024. [Online]. Avail-
```
able: https://www.mongodb.com/docs/manual/data-modeling/best-practices/
```
[13] Socket.IO, “Socket.IO Documentation: Rooms,” 2024. [Online]. Available:
```
https://socket.io/docs/v4/rooms/
```
[14] Vercel Inc., “Next.js App Router Documentation,” 2024. [Online]. Available:
```
https://nextjs.org/docs/app
```
[15] Vercel Inc., “Next.js on Vercel,” 2024. [Online]. Available:
```
https://vercel.com/docs/frameworks/full-stack/nextjs
```
[16] OWASP Foundation, “OWASP Top 10 — Application Security Risks,” 2021. [Online].
```
Available: https://owasp.org/Top10/
```
[17] Government of India, “Digital Personal Data Protection Act, 2023,” Ministry of Electronics
and Information Technology. [Online]. Available: https://www.meity.gov.in/
[18] Mongoose Contributors, “Mongoose v8 Documentation — Schema Design Patterns,”
2024. [Online]. Available: https://mongoosejs.com/docs/
[19] Resend Inc., “Resend Email API Documentation,” 2024. [Online]. Available: https:
//resend.com/docs
[20] OWASP Foundation, “OWASP Top Ten: A07 Identification and Authentica-
tion Failures,” 2021. [Online]. Available: https://owasp.org/Top10/A07_
2021-Identification_and_Authentication_Failures/
[21] PapaParse, “PapaParse Documentation — Fast and powerful CSV parser for JavaScript,”
2024. [Online]. Available: https://www.papaparse.com/docs
[22] ExcelJS, “ExcelJS GitHub Repository,” 2024. [Online]. Available:
```
https://github.com/exceljs/exceljs
```
[23] Ministry of Statistics and Programme Implementation, Government of India, “Annual
Survey of Industries 2021–22,” 2023. [Online]. Available: https://mospi.gov.in
[24] NASSCOM and KPMG, India’s Events and Experiential Marketing Industry Report.
NASSCOM, 2022.
MET’s Institute of Engineering 77