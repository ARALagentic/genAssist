# SETUP — connecting the Submission Desk to a real backend

## 0. What this is

Right now, agent submissions arrive by WhatsApp, email, or a Google Form, and someone has to manually chase, copy, and track each one. The **genAssist Submission Desk** (the `index.html` file in this folder) is a single web page that replaces that intake with a proper wizard, a back-office queue, and an admin view.

By default the page runs in **demo mode** — everything lives only in your own browser (no backend needed, nothing is shared between agents). This document is for turning on the **real backend**, so submissions actually get saved centrally and the whole team sees the same queue.

The backend is a free **Google Apps Script**, reading and writing a normal **Google Sheet** (plus **Google Drive** for uploaded documents). There is no new subscription, no outside vendor — it's entirely inside your existing Google account, and you (ARAL) fully control it.

You do not need to know how to code to do this. Just follow the numbered steps.

---

## 1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and click **+ Blank** to create a new spreadsheet.
2. Click on "Untitled spreadsheet" at the top left and rename it to **ARAL Submission Desk — Data**.
3. Leave it open — you'll need it for the next step.

---

## 2. Add the backend script

1. In that same Sheet, click the **Extensions** menu, then **Apps Script**. A new tab opens with a code editor.
2. You'll see a file called `Code.gs` with some placeholder text already in it (something like `function myFunction() {}`). Click inside the editor, select all the text (Ctrl/Cmd+A), and delete it.
3. Open the file `backend/Code.gs` that lives inside this same project folder (`genAssist build/backend/Code.gs`) — open it in any text editor, or ask whoever gave you this project to send you its contents.
4. Copy the **entire contents** of that file and paste it into the empty Apps Script editor.
5. Click the **floppy-disk save icon** (or Ctrl/Cmd+S) at the top of the Apps Script editor. You can rename the project at the top (e.g. "ARAL Submission Desk Backend") if you like — it doesn't affect anything.

---

## 3. Run setup() once

This step creates the four tabs the backend needs (`Submissions`, `Events`, `Agents`, `Settings`) with the right column headers, and one starter admin login.

1. At the top of the Apps Script editor, there's a dropdown that lets you pick which function to run. Make sure it says **setup**. (If it shows a different function name, click the dropdown and choose `setup`.)
2. Click the **Run** button (▶) next to it.
3. The first time you do this, Google will show a permissions screen: **"Authorization required"**. This is normal — it's asking permission for *your own script* to edit *your own Sheet* and *your own Drive*. Click **Review permissions**, pick your Google account, and if you see a warning screen that says "Google hasn't verified this app," click **Advanced**, then **Go to [project name] (unsafe)**. This warning appears only because this is a personal/internal script, not something published on the Google marketplace — it's expected and safe for a script you wrote/pasted yourself.
4. Click **Allow**.
5. A popup should appear in the Sheet saying "Setup complete." If you don't see it, switch back to the Sheet tab and check — Apps Script sometimes shows the alert there.
6. Go back to the Sheet tab and confirm you now have four tabs at the bottom: **Submissions**, **Events**, **Agents**, **Settings**.

If you ever think the Sheet got out of sync (a tab deleted by accident, etc.), you can re-run `setup()` any time — it only adds what's missing and never deletes or duplicates existing data. This also covers new columns: if you update `Code.gs` to a newer version of this project and it adds new fields (e.g. payment or renewal tracking), re-running `setup()` will add just those missing columns to the end of the `Submissions` tab without touching any existing rows.

---

## 4. Deploy as a Web App

This turns the script into a private web address the Submission Desk page can talk to.

1. In the Apps Script editor, click **Deploy** (top right) → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: "Submission Desk backend" (anything you like)
   - **Execute as**: **Me** (your account — this means the script always runs with your permissions, not the visitor's)
   - **Who has access**: **Anyone** — this sounds broader than it is: it means anyone *with the exact secret web address* can reach the script, not that it's listed anywhere public. Nobody can guess this URL. Treat the URL itself as a password and don't post it publicly.
4. Click **Deploy**.
5. Click **Authorize access** again if prompted (same safe/expected warning as step 3).
6. You'll be shown a **Web app URL** that ends in `/exec`. Click the copy icon or select and copy the whole thing.

Keep this URL somewhere safe (e.g. a password manager or internal doc) — you'll need it again if you ever redeploy.

---

## 5. Point the Submission Desk at your backend

1. Open `index.html` in a text editor and search for `APPS_SCRIPT_URL`. You'll find a line like:
   ```js
   var SD_CONFIG = {
     backend: 'local', // 'local' | 'appsscript'
     APPS_SCRIPT_URL: ''
   };
   ```
2. Paste your Web App URL between the quotes for `APPS_SCRIPT_URL`.
3. Change `backend: 'local'` to `backend: 'appsscript'`.
4. Save the file. Reload `index.html` in a browser — it's now reading and writing your real Google Sheet instead of the demo (local-only) mode.

---

## 6. Add your real agents

Submissions and sign-ins are controlled entirely by the **Agents** tab in the Sheet — no code changes needed.

1. Open the Sheet, click the **Agents** tab.
2. Add one row per person who should be able to sign in. Columns are:
   - `code` — a short sign-in code (e.g. agent's initials or staff number)
   - `pin` — a 4-digit PIN they'll use alongside the code
   - `name` — full name shown in the app
   - `branch` — their branch/office
   - `role` — exactly one of `agent`, `backoffice`, or `admin` (controls what they can see/do)
   - `active` — `true` or `false` (set to `false` to disable someone without deleting their row)
3. There's already one starter row: code `ADMIN1`, pin `0000`, role `admin`. Change that PIN to something real before going live, or delete the row and add your own admin.

---

## 7. Adjust cutoff time, business hours, holidays, and SLAs

All of this lives in the **Settings** tab — one row per setting, in the `value` column. No code changes needed:

| `key` | What it controls | Example `value` |
|---|---|---|
| `cutoffTime` | The daily submission cutoff (24-hour clock, Trinidad time) | `11:00` |
| `timezone` | Should stay as Trinidad's timezone | `America/Port_of_Spain` |
| `businessHoursStart` / `businessHoursEnd` | Office hours used for SLA countdowns | `08:00` / `16:00` |
| `ackSlaHours` | How many business hours back office has to acknowledge a new submission | `2` |
| `gmApprovalRequired` | Whether an extra GM-approval step is required before sending to Underwriting | `true` or `false` |
| `holidays` | Trinidad public holidays to skip for SLA counting — a JSON list of dates | `["2026-01-01","2026-03-30"]` |
| `productRuleOverrides` | Per-product overrides of the built-in document checklists (advanced — leave as `{}` unless you know you need to change a checklist) | `{}` |
| `messageTemplates` | Custom wording for client WhatsApp/email updates (advanced, leave as `{}` for the built-in defaults) | `{}` |

Just click the cell in the `value` column for the row you want to change, type the new value, and press Enter. Changes apply immediately — nobody needs to redeploy anything.

---

## 7a. Optional: automatic renewal reminders

Back office can always create a renewal thread manually from a file's detail screen (see `TEAM-SOP.md`). If you'd rather this happened on its own every morning for files that are due:

1. In the Apps Script editor, pick **installRenewalTrigger** from the function dropdown at the top.
2. Click **Run** (▶). Authorize again if prompted (same safe/expected warning as step 3 above).
3. You'll see a confirmation alert once it's installed. From then on, the script checks once a day (around 7am Trinidad time) for any issued policy that's due a renewal thread and creates it automatically — same result as clicking the manual button, just without anyone having to remember to.

This is entirely optional — skip it if you'd rather renewals stayed a deliberate, manual action by back office.

---

## 8. If something breaks

1. In the Apps Script editor, click **Executions** in the left sidebar. This shows every time the script has run, including from the live web page, and will show a red error if something failed — click into one to see the details.
2. The most common issue is the Sheet tabs or column headers being edited by hand and no longer matching what the script expects. Re-running `setup()` (step 3) is always safe and will not touch or duplicate existing rows — it only fixes/creates what's missing.
3. If sign-in stops working for everyone, double check the **Agents** tab still has the exact header row: `code, pin, name, branch, role, active`.
4. If you redeploy (Deploy → Manage deployments → edit → new version), you'll get a new `/exec` URL — update `APPS_SCRIPT_URL` in `index.html` again (step 5) whenever that happens.

---

## 9. A note on cost and ownership

This backend is entirely inside your own Google account. There's no subscription, no third-party service, and no vendor lock-in — the data is a normal Google Sheet you can open, filter, back up, or export at any time, and the files agents upload live in a normal Google Drive folder named **"genAssist Submission Desk Files."** If this tool is ever retired, the data simply stays exactly where it already was.
