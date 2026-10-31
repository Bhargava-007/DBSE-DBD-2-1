# SupportDesk — Customer Support Ticketing Platform

A lightweight, lightning-fast customer support ticketing platform designed with the clean, restrained aesthetic of Linear and Help Scout. Built with local services, zero external API dependencies, keyword-based ticket classification, and automated SLA tracking.

---

## Architecture & System Overview

```
                        ┌────────────────────────────────────────┐
                        │      Client (React + Vite + Tailwind)  │
                        │             Port: 3000                 │
                        └───────────────────┬────────────────────┘
                                            │ /api
                                            ▼
                        ┌────────────────────────────────────────┐
                        │        Server (Node + Express)         │
                        │             Port: 5000                 │
                        └─────────┬───────────────────┬──────────┘
                                  │                   │
                     HTTP /classify                   │ Mongoose
                                  ▼                   ▼
┌──────────────────────────────────────┐     ┌──────────────────────────────────┐
│ Classifier Microservice (FastAPI)    │     │       MongoDB Database           │
│ Port: 8000 (Pure Keyword Matching)   │     │ mongodb://localhost:27017/       │
└──────────────────────────────────────┘     │         supportdesk              │
                                             └────────────────┬─────────────────┘
                                                              ▲
                                                              │ Mongoose
┌──────────────────────────────────────┐                      │
│ SLA Worker (Node + node-cron)        │──────────────────────┘
│ Every minute: scans & flags breaches │
└──────────────────────────────────────┘
```

### Folder Structure
- `/client` — React 18 frontend with Vite, Tailwind CSS, React Router, Lucide icons, and Recharts.
- `/server` — Express REST API with Mongoose, validation, auto-incrementing ticket counter, stats aggregator, and dev mode seed endpoints.
- `/classifier` — Python FastAPI microservice running on port 8000 performing keyword extraction, confidence scoring, priority adjustment, and canned response generation.
- `/worker` — Dedicated Node process executing a `node-cron` job every minute to detect and flag SLA breaches with audit history.

---

## Key Features & Highlights

- **Clean, Minimal UI**: Light theme only. White background, `gray-50` surfaces, `gray-200` borders, `gray-900` text, and a single `indigo-600` accent. Inter typography (weights 400 and 500 only, max 20px page titles), 1px borders, and 6px border radii.
- **Empty State Polish**: App boots with an **EMPTY** database (0 customers, 0 tickets). When empty, stat cards show `0`, charts show clean placeholders, and friendly empty-state cards invite users to create tickets.
- **Auto-Provisioned Essentials**: On server boot, 5 default support agents and 4 SLA policies are created automatically if missing.
- **Keyword Classifier Microservice**:
  - `POST /classify`: Detects category (`billing`, `technical`, `account`, `shipping`, `general`), calculates priority, scores confidence (`0.70` - `0.95`), and provides tailored canned replies.
  - Fail-safe fallback: If the Python service is offline, the Node API automatically falls back to an embedded local keyword classifier.
- **Automated SLA Worker**:
  - Urgent: 1 hour SLA
  - High: 4 hours SLA
  - Medium: 24 hours SLA
  - Low: 72 hours SLA
  - Flags overdue tickets as `slaBreached: true` and logs an `"SLA breached"` event in ticket history.
- **Interactive UI Polish**:
  - **Inline Editing**: Change ticket status, priority, or assigned agent straight from the tickets table row with optimistic updates.
  - **Keyboard Shortcuts**: Press `/` to focus global search, `c` to open the New Ticket modal from anywhere, `Esc` to close modals.
  - **Live Suggestion**: Typing subject/description in the New Ticket modal queries the classifier (debounced 600ms) and displays a 1-click suggestion chip.
  - **Suggested Reply**: Ticket detail thread features an AI suggested reply chip that populates the response textarea on click.
  - **Dev Mode Toggle**: Toggle Dev Mode in the user menu to reveal "Load demo data" and "Clear demo data" buttons directly on the Dashboard.

---

## Prerequisites

1. **Node.js**: v18.0 or newer
2. **Python**: v3.10 or newer (with `fastapi` and `uvicorn`)
3. **MongoDB**: Running locally at `mongodb://localhost:27017`

---

## Quick Start (Minimal Setup)

### 1. Install Dependencies
Run from the repository root:
```bash
npm run install:all
```
*(Or install in each directory: `npm install`, `cd server && npm install`, `cd worker && npm install`, `cd client && npm install`)*

Ensure Python requirements are installed:
```bash
pip install -r classifier/requirements.txt
```

### 2. Seed Demo Data (Optional)
To populate 15 realistic customers and 40 demo tickets spread across the last 14 days:
```bash
npm run seed
```
To clear demo data at any time:
```bash
npm run seed:clear
```

### 3. Start All Services (One Command)
Run from the repository root:
```bash
npm run dev
```

This concurrently starts:
- **Classifier**: `http://localhost:8000`
- **Server API**: `http://localhost:5000`
- **SLA Worker**: Background process (cron every 60s)
- **Client App**: `http://localhost:3000`

Open **`http://localhost:3000`** in your browser.

---

## Authentication & User Modes

SupportDesk uses local session switching (stored in `localStorage`):
- **Continue as Agent**: Choose from the default staff (`Sarah Chen (Admin)`, `Alex Rivera`, `Marcus Vance`, `Priya Patel`, `Jordan Lee`). Provides access to Dashboard, Tickets, Customers, and Agents.
- **Continue as Customer**: Enter your name and email. Creates or re-uses your customer profile. Provides a simplified portal view (`My Tickets` and `New Request`).
- To switch roles or toggle **Dev Mode**, click the user avatar in the top-right corner.

---

## REST API Reference

### Tickets
- `GET /api/tickets` — Query tickets with filters (`status`, `priority`, `assignedAgent`, `customer`, `search`), sorting, and pagination.
- `GET /api/tickets/:id` — Fetch single ticket by `ticketId` (e.g. `TKT-1001`) or `_id`.
- `POST /api/tickets` — Create ticket. Automatically invokes classifier if category or priority is not specified, assigns SLA deadline, and creates initial audit history.
- `PATCH /api/tickets/:id` — Update status, priority, or assignee. Pushes changelog entries to `ticket.history`.
- `POST /api/tickets/:id/messages` — Add customer or agent message to ticket thread.

### Customers & Agents
- `GET /api/customers` — List all customers with their total ticket counts.
- `GET /api/customers/:id` — Customer profile with list of submitted tickets.
- `POST /api/customers` — Register or lookup customer by email.
- `GET /api/agents` — List support agents with active ticket workload and resolution statistics.
- `POST /api/agents` — Add new agent.

### Operational Analytics
- `GET /api/stats` — Metrics for dashboard: counts by status, counts by priority, SLA breach count, average resolution time, tickets per agent, and 7-day creation volume.

### Microservice & Dev Endpoints
- `POST /api/classify` — Proxies request to FastAPI microservice with automatic local JavaScript fallback.
- `POST /api/dev/seed` — Inserts demo data (when `DEV_MODE=true`).
- `DELETE /api/dev/seed` — Deletes demo documents (when `DEV_MODE=true`).

---

## License
MIT
