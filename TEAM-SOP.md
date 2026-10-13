# TEAM-SOP — back-office daily queue routine

This is the day-to-day routine for working the Submission Desk **Queue**. If you're admin, you also have **Admin Dashboard** and **Settings** — those are covered at the bottom.

## The rule everyone is working against

> Complete files received before **11:00 AM** (Trinidad time) get an underwriting response **the same day**. Files completed after 11:00 AM get a response by **11:00 AM the next business day**.

Our job is to acknowledge fast, chase missing items in one consolidated ask (never piecemeal), and get complete files to underwriting before they breach.

---

## 1. Start of day — triage the queue

Open **Queue**. It defaults to the **Open** filter — everything that needs action from you right now. That's every status except `Underwriting` (sitting with Tatil, nothing to do yet) and `Closed`/finished files; a file waiting on an Underwriting query or decision still shows up here, since that's on you to chase or record. Rows are sorted by whichever deadline is soonest — oldest/most urgent at the top.

Each row shows:
- **Status pill** — `Quoted` / `Submitted` / `Acknowledged` / `GM Approval` / `Needs Info` / `Underwriting` / `UW Query` / `Approved` / `Payment Pending` / `Payment Received` / `Documents Issued` / `Closed` (Claims uses `Query` / `Repudiated` / `Payment Issued` instead of the UW Query/Declined/Documents Issued wording, and skips the two payment statuses entirely — same lifecycle, different words, nothing to collect from the client on a claim)
- **SLA dot** — green (on track), amber (75%+ of the SLA window used), red (breached)
- **Owner** — who's handling it, or "Unassigned"
- A **stale** badge if there's been no update in 3+ business days

Use the filters to focus:
- **Owned by me** — your personal worklist
- **Unassigned** — claim these first thing
- **Needs Info** — files waiting on the agent, not on you
- **All** — includes files currently with Underwriting and closed files, for reference

**Any red dot gets dealt with before anything else, regardless of filter.**

**A `Quoted` row is a Quick Quote, not yet a full submission** — an agent is racing to get a price back to a client before they go elsewhere. It shows up in Open like everything else. There's nothing to acknowledge or send to Underwriting on it yet (it has no documents), but treat it with the same urgency as anything else on the clock — a slow quote loses the business before a file is ever opened.

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

## 4. Recording Underwriting's response — same file, no new submission

Once a file is `Underwriting`, it drops out of the default **Open** filter (switch to **All** to find it). When Tatil actually comes back to you, open that same file and use the **Underwriting outcome** buttons at the bottom of the detail screen — never log the response as a brand-new submission, it stays on the original reference number the whole way through so the agent's history and your audit trail stay in one thread:

- **Log a query from Underwriting** — if Tatil comes back asking for something before they'll decide, write it as one consolidated note (same rule as Request missing info). The file moves to `UW Query` (Claims shows `Query`), and the agent sees it highlighted on their file. Once you've got what's needed, use **Resolved — resubmit to Underwriting** to put it back to `Underwriting` on the same thread.
- **Record: Approved** / **Record: Declined** — once Tatil gives a decision, record it here with an optional note (policy reference, terms, reason for decline, etc.). This moves the file to `Approved` or `Declined` — for Claims, a decline is recorded as `Repudiated` instead, since that's the correct term for a claim. A client-update message opens automatically either way, and the agent sees the decision and your note on the file.
- **Mark Documents Issued** (Claims: **Mark Payment Issued**) — once the policy documents or claim payment have actually gone out, mark it here so the file reflects reality. On insurance products this button only appears after payment has been recorded (see below) — there's nothing to collect from a claimant, so Claims go straight from Approved to this button.
- **Close file** — once there's nothing left to do (after Declined/Repudiated, or after Documents/Payment Issued), close it out.

The agent never needs to be told any of this outside the system — it shows up on their file automatically as soon as you save it.

---

## 4a. Collecting payment (insurance products only — not Claims)

Once an insurance file is `Approved`, it needs a payment step before documents can be issued — there's nothing to collect on a Claim, so claims skip straight from Approved to Mark Payment Issued.

- **Request payment** — tap this once you know the terms. Record the **plan** (full annual payment, or 2-part if it's fully comprehensive), the **mode** (cash at ARAL, online payment to ARAL, or cheque — ARAL's preference is cash/online over paying Tatil directly), and the **amount due**. The file moves to `Payment Pending` and a client-update message opens automatically so the agent/client knows how and how much to pay.
- **Payment received** — once the money's actually in, tap this and record the **amount received** and when. The file moves to `Payment Received`, which is what unlocks the **Mark Documents Issued** button.

---

## 4b. Renewals — spinning up a linked thread (insurance products only — not Claims)

Once a file is `Documents Issued` (or already `Closed`), a **Create renewal reminder** button is available on it. Use it when it's time to start the renewal conversation — typically about a month before the policy's renewal date, after you've liaised with Tatil on claims history, rate changes, or vehicle-value changes that might affect the requote.

Tapping it creates a **new, separate submission thread** at the `Quoted` stage, carrying over the client and product details, with **"Linked to [original reference]"** shown on it so anyone opening either file can trace the relationship. Treat it exactly like any other Quick Quote from there — same urgency, same flow into a full submission once the client confirms they're renewing.

(If `installRenewalTrigger()` has been run in the backend — see `SETUP.md` — this same thing happens automatically every morning for any file that's due, so you may find some renewal threads already waiting in the queue without anyone having clicked the button.)

---

## 5. When a file comes in off-system (WhatsApp, email, paper)

Don't just process it quietly — **log it**. Click **"+ Log off-system submission"** at the top of the Queue (also available from the Admin Dashboard), fill in product/agent/client/notes, and save. This is how admin tracks which agents still aren't using the Submission Desk, so it can be followed up with them directly. It does not go through the normal document checklist — just a record for visibility.

---

## 6. Admin-only: Dashboard and Settings

**Admin Dashboard** gives weekly numbers (total submissions, overdue count, needs-info count, sent-to-UW count, off-system-logged count) and an **Export CSV** button for anything you need outside the tool (board reporting, audits, etc.).

**Settings** is where the rules themselves live — change these as the business needs change, no code involved:
- Cutoff time (default 11:00), business hours, Acknowledge SLA hours
- Branch GM approval toggle (on/off)
- Trinidad public holidays list (keeps next-business-day math correct)
- Product checklist / cutoff overrides (advanced — leave as `{}` unless a product's document list or cutoff behaviour needs to change)
- Message templates (advanced — leave as `{}` for the built-in wording, override per status if you want different phrasing)
- Read-only list of agents/back office/admin — add or edit people in the **Agents tab of the Google Sheet** directly (see `SETUP.md`), not here.

---

## 7. If something looks wrong

- A file stuck with no SLA dot or a blank due date usually means **Save owner / next action** was never clicked after Acknowledge — go in and set it.
- If a whole day's files look off (wrong cutoff times, wrong business hours), check **Settings** first before assuming it's a bug.
- If the Queue or a client message looks broken, check `SETUP.md` → "If something breaks" for how to check the Apps Script execution log.
