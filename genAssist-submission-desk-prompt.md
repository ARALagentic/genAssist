# Claude Code prompt — genAssist "Submission Desk" upgrade

Paste everything below the line into Claude Code, with the current genAssist `index.html` in the working folder.

---

## Scope — read first

Work **only** on the genAssist `index.html` in this folder. It is a standalone ARAL insurance tool. It is **not** related to, and must not be merged with, reused from, or linked to:
- the Eleganza Naturally Beautiful CRM (ENBbrows-crm),
- The Closing Floor, Tatil Brain, the Ops Agenda dashboard, the ARAL Policy Desk / bordereau system, the sales campaign CRM, or any other project or work in progress.

If you find other `index.html` files or projects on this machine, ignore them. Don't import code, data, styles or config from anywhere else. If anything in this folder looks like it belongs to another project, stop and ask me before touching it.

## Context

`index.html` is **genAssist**, a single-file front-end prototype for ARAL (A. Rauseo & Associates Ltd.), the intermediary placing general insurance business with Tatil. It already helps agents complete Tatil forms (tabs via `data-form`: motor, kyc, corpkyc, covercare, change, infant, ach, ccproposal, achlife, achcancel, amendment, surrender, condition, quotation, conversion), explains questions, flags risks, and shows a route: Agent → CRM Record → Branch GM → Underwriting. Today "Send for Approval" only creates a sample reference. No data is saved, and it runs on a sample client.

**The business problem:** agents submit by WhatsApp/email instead of the Google Form we built. Our 2-person back-office team gets incomplete files, goes back and forth for missing items, follows up inconsistently, and agents and clients don't know where a file stands. Agents have lost trust in the team.

**Goal:** turn genAssist into the single front door for submissions — faster for agents than WhatsApp, impossible to submit incomplete, with visible status for everyone and enforced follow-up for the back office. This replaces the Google Form.

## Rules

- Keep every existing form, explanation, risk flag and the "genAssist Fill" export working. Don't redesign the visual style; reuse the existing CSS tokens and components.
- Remove the sample client (Marlene Ramsingh) from the default state; keep it only behind a "Load demo" button.
- Mobile-first: an agent must be able to submit a motor file from a phone in under 3 minutes.
- Nothing is sent to Tatil automatically. The "Send to Underwriting" step produces a submission pack for the back office to send.
- Before building, read the whole file, then show me a short plan and the data model, and wait for my OK.

## Backend (no new subscriptions)

We already pay for Google Workspace. Use it:
- **Google Apps Script web app** as the API (`doGet`/`doPost`, JSON).
- **Google Sheet** as the database (tabs: `Submissions`, `Events`, `Agents`, `Settings`).
- **Google Drive folder** for uploaded documents (one subfolder per reference number).
- Put the Apps Script code in `/backend/Code.gs` with a `SETUP.md` that walks me through deploying it step by step (non-developer instructions).
- In `index.html`, put all storage behind one `dataLayer` object with two adapters: `LocalDemoAdapter` (browser storage, for testing) and `AppsScriptAdapter` (live). One config line switches them.
- Simple access: agents sign in with their agent code + a PIN stored in the `Agents` tab; back-office and admin roles set in the same tab. (Fine for now; note in SETUP.md that we can move to Google sign-in later.)

## Build these 6 pieces

### 1. Agent "New Submission" (the front door)
- Step 1: pick product (Motor, Property/Home, Covercare, Change in Policy, Renewal, Other). Only that product's questions and documents appear.
- Step 2: client basics (name, phone, email, preferred contact: WhatsApp/email/call).
- Step 3: the existing genAssist form for that product.
- Step 4: **required documents checklist per product** with phone camera/photo upload for each (e.g., Motor: ID, driver's permit, certified copy/registration, vehicle photos ×4, valuation if applicable, proof of address, KYC). Store the checklists in a `PRODUCT_RULES` config object at the top of the file so I can edit them without touching code.
- **Completeness gate:** Submit stays disabled until every required field and document is present. Show exactly what's missing in plain language.
- **11:00 AM cut-off rule** (Trinidad time, business days): show this note on the New Submission screen before the agent starts: *"Complete submissions received before 11:00 AM get an underwriting response the same day. Submissions after 11:00 AM get a response by 11:00 AM the next business day."* Show a live countdown to today's cut-off, or "Next-day response" after 11:00 AM.
- On submit: generate a reference (`ARAL-YYMM-####`), show it on screen, and show the expected response time calculated from the cut-off rule (e.g., "Expected response: today by 4:00 PM" or "Expected response: Tue 13 Oct by 11:00 AM"). The clock starts when the file is **complete**, not when a draft is first saved. Files sent back as `Needs Info` get a new expected time when resubmitted.
- Autosave drafts so an agent can finish later.

### 2. Agent "My Files" (status tracker)
- List of the agent's submissions with a clear status badge and last update time.
- Statuses: `Submitted` → `Received` → `Needs Info` → `With Underwriting` → `UW Query` → `Approved` / `Declined` → `Documents Issued` → `Closed`.
- Each file shows a timeline of every status change and note.
- When status is `Needs Info`, the agent sees one consolidated list of what's needed and can upload/answer directly in the file. Resubmitting moves it back to `Received`.

### 3. Back-office "Queue"
- One queue of all files, sorted by urgency. Filters: status, product, agent, owner, overdue.
- Every file must have an **Owner** and a **Next Action + due date**. A file can't be saved without them.
- **SLA timers** (business hours, Mon–Fri 8:00–16:00, Trinidad time), configurable in `Settings`:
  - Acknowledge (Submitted → Received): 2 business hours
  - Complete file received before 11:00 AM → with underwriting the same morning so the response comes back the same day; received after 11:00 AM → response by 11:00 AM the next business day. Each file shows its "response due" time in the queue, and files due today sit at the top.
  - No file without an update for more than 2 business days
  - Show green / amber (75% of SLA used) / red (breached).
- **"Request missing info" button:** reviewer ticks items from the product checklist and adds notes once → one consolidated request goes to the agent. No piecemeal back-and-forth.
- **"Send to Underwriting" button:** builds a submission pack (summary page + document list with Drive links) the reviewer can download or copy into an email to Tatil underwriting, then sets status `With Underwriting`.
- Keep the existing Branch GM step as an optional approval toggled in `Settings`.

### 4. Client updates (consistent communication)
- At each status change, generate a ready-to-send branded client message (WhatsApp text + email version) from templates in `Settings`: Received, Need documents, With Underwriting, Approved, Documents Ready.
- One-tap "Copy" and "Open WhatsApp" (`wa.me` link with the client's number and message). Log in the timeline that the client was updated, and by whom.
- Flag files where the client hasn't been updated in more than 3 business days.

### 5. Admin dashboard (for me)
- Weekly numbers: files submitted, average time to acknowledge, average time to underwriting, % of files returned for missing info, overdue files, files per agent, files per back-office owner.
- **Adoption tracker:** a "Log off-system submission" button the back office uses whenever a file arrives by WhatsApp/email, so I can see which agents still bypass genAssist.
- Export to CSV.

### 6. Settings (admin only)
- Edit SLAs, the daily cut-off time (default 11:00 AM), public holidays (Trinidad and Tobago) so next-day dates skip them, business hours, product document checklists, message templates, staff and agent list, GM-approval toggle.

## Done means

- I can run it locally in demo mode and click through: agent submits incomplete file (blocked), completes it, back office acknowledges, requests missing info, agent responds, file goes to underwriting, approved, client messages generated, dashboard updates.
- `SETUP.md` gets me live on Google Sheets/Drive with no paid tools.
- A one-page `AGENT-GUIDE.md` (plain English, screenshots optional) I can send to agents, with the 11:00 AM cut-off rule stated prominently at the top, and a `TEAM-SOP.md` for the back office covering the daily queue routine.
- Summarise what changed and anything you couldn't do.
