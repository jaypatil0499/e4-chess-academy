# Free lead database — 4 steps, ~5 minutes

Bookings already arrive as **email**. This adds a permanent copy as a row in a
Google Sheet. Completely free, unlimited rows, no plan or card required.

You do steps 1–4. Send Jay's Claude the URL from step 4 and it does the rest.

---

### 1. Make the sheet
Open **<https://sheets.new>** — a blank sheet appears. Name it `E4CA Leads`.
Don't type any headers. The script builds them for you.

### 2. Open the editor
In that sheet: **Extensions → Apps Script**.
Select everything in the editor and delete it.

### 3. Paste the script
Paste the whole of `scripts/leads-to-sheet.gs` in, then press **Cmd+S** to save.

### 4. Publish and copy the URL
- **Deploy → New deployment**
- Gear icon next to "Select type" → **Web app**
- **Execute as:** `Me`
- **Who has access:** `Anyone`  ← must be **Anyone**, not "Anyone with a Google account"
- **Deploy**

Google will ask you to authorise it, then show a red
**"Google hasn't verified this app"** warning. That is expected — it's your own
script, and Google shows this for every personal script. Click
**Advanced → Go to … (unsafe) → Allow**.

Copy the **Web app URL**. It ends in `/exec`:

```
https://script.google.com/macros/s/AKfycb....../exec
```

**Paste that URL in the chat.** That's everything you need to do.

---

## Checking it yourself

Open the `/exec` URL in a browser tab. You should see:

```json
{"ok":true,"message":"E4CA lead endpoint is live."}
```

If you see that, it's deployed correctly. If you get a sign-in page or an error,
"Who has access" isn't set to **Anyone** — redo step 4.

---

## If you ever edit the script

Changing the code does nothing on its own. You must republish:
**Deploy → Manage deployments → pencil icon → Version: New version → Deploy.**

---

## Day to day

Add your own columns from **H** rightwards — `Called?`, `Demo date`, `Coach`,
`Converted?`. The script only writes A–G, so your columns are never touched.

Turn on alerts with **Tools → Notification settings → Notify me when… any changes
are made**.
