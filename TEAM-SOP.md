# TEAM-SOP — back-office daily queue routine

This is the day-to-day routine for working the Submission Desk **Queue**. If you're admin, you also have **Admin Dashboard** and **Settings** — those are covered at the bottom.

## The rule everyone is working against

> Complete files received before **11:00 AM** (Trinidad time) get an underwriting response **the same day**. Files completed after 11:00 AM get a response by **11:00 AM the next business day**.

Our job is to acknowledge fast, chase missing items in one consolidated ask (never piecemeal), and get complete files to underwriting before they breach.

---

## 1. Start of day — triage the queue

Open **Queue**. It defaults to the **Open** filter (everything not yet with Underwriting). Rows are sorted by whichever deadline is soonest — oldest/most urgent at the top.

Each row shows:
- **Status pill** — `Submitted` / `Acknowledged` / `GM Approval` / `Needs Info` / `Underwriting`
- **SLA dot** — green (on track), amber (75%+ of the SLA window used), red (breached)
- **Owner** — who's handling it, or "Unassigned"
- A **stale** badge if there's been no update in 3+ business days

Use the filters to focus:
- **Owned by me** — your personal worklist
- **Unassigned** — claim these first thing
- **Needs Info** — files waiting on the agent, not on you
- **All** — includes files already with Underwriting, for reference

**Any red dot gets dealt with before anything else, regardless of filter.**

---

## 2. Opening a file

Click into a row to see the full detail: the route visual (Agent → CRM Record → Underwriting, with Branch GM in between if that's switched on in Settings), the submitted details, required documents vs. what was actually attached, and the full timeline.

### Claim it
If **Owner** is blank, assign yourself (or whoever's picking it up) in the Owner dropdown.

### Set next action + due date — every file, every time
**You cannot save without both an owner and a next action + due date/time filled in.** This is enforced on purpose — no file should sit in the queue without someone having decided what happens to it and by when. Use plain language for the next action ("Acknowledge", "Awaiting police report", "Prepare UW pack", etc.).

---

## 3. The four action buttons

- **Acknowledge** — use this the moment you've looked at a new `Submitted` file. It logs the acknowledgement, sets the next action automatically (Branch GM approval if that's switched on, otherwise straight to "Prepare for Underwriting"), sets a fresh due date from the Acknowledge SLA in Settings (default 2 business hours), and opens a ready-made client message to send.

- **Request missing info** — if the file isn't complete, **write everything missing in one note** here and send it. This is the single consolidated ask — don't follow up again until the agent responds, and don't message the agent outside the system for small individual items. The file moves to `Needs Info`, and a client-update message opens automatically.

- **Send to Underwriting** — once the file (and, if required, the Branch GM step) is fully ready, use this. It moves the file to `Underwriting` and opens a client-update message. **Nothing is sent to Tatil automatically** — this step is you confirming the pack is ready; actually get the pack to Tatil underwriting yourself (the file's submitted details, required-docs list, and attached files are all shown on this screen for you to copy/assemble into whatever you send).

- **Message client** — use any time you want to send an update outside of the automatic ones above (e.g. a status nudge). Opens the same preview/edit/WhatsApp/email flow.

### The acknowledge SLA
Every new file must be acknowledged within the SLA set in Settings (default 2 business hours, Mon–Fri 08:00–16:00 Trinidad time, skipping configured holidays). Watch the amber dots — they mean you're inside the last 25% of that window.

### The "no update in 3+ business days" rule
If a file — regardless of status — hasn't had any update (acknowledge, needs-info, message, status change) in 3+ business days, it gets a stale badge in both the Queue and the agent's My Files. Treat every stale badge as a prompt to either chase the next step yourself or message the client/agent, even if it's not technically overdue by SLA.

---

## 4. When a file comes in off-system (WhatsApp, email, paper)

Don't just process it quietly — **log it**. Click **"+ Log off-system submission"** at the top of the Queue (also available from the Admin Dashboard), fill in product/agent/client/notes, and save. This is how admin tracks which agents still aren't using the Submission Desk, so it can be followed up with them directly. It does not go through the normal document checklist — just a record for visibility.

---

## 5. Admin-only: Dashboard and Settings

**Admin Dashboard** gives weekly numbers (total submissions, overdue count, needs-info count, sent-to-UW count, off-system-logged count) and an **Export CSV** button for anything you need outside the tool (board reporting, audits, etc.).

**Settings** is where the rules themselves live — change these as the business needs change, no code involved:
- Cutoff time (default 11:00), business hours, Acknowledge SLA hours
- Branch GM approval toggle (on/off)
- Trinidad public holidays list (keeps next-business-day math correct)
- Product checklist / cutoff overrides (advanced — leave as `{}` unless a product's document list or cutoff behaviour needs to change)
- Message templates (advanced — leave as `{}` for the built-in wording, override per status if you want different phrasing)
- Read-only list of agents/back office/admin — add or edit people in the **Agents tab of the Google Sheet** directly (see `SETUP.md`), not here.

---

## 6. If something looks wrong

- A file stuck with no SLA dot or a blank due date usually means **Save owner / next action** was never clicked after Acknowledge — go in and set it.
- If a whole day's files look off (wrong cutoff times, wrong business hours), check **Settings** first before assuming it's a bug.
- If the Queue or a client message looks broken, check `SETUP.md` → "If something breaks" for how to check the Apps Script execution log.
