# Lead capture — live

Every demo booking is captured **twice, independently**:

1. **Email** to e4cacademy@gmail.com via Web3Forms (free plan, 250/month)
2. **A row** in the leads sheet via a Google Apps Script web app (free, unlimited)

Neither can take the other down. The sheet write runs first and is
fire-and-forget, so a Sheets outage cannot delay or fail a booking; if email
delivery fails, the visitor is offered a prefilled WhatsApp/email handoff.

- Sheet: <https://docs.google.com/spreadsheets/d/1c-73hXboypy7btbS1AnimRfbcpxv5UYEPGuB0CJh508/edit>
- Script project: <https://script.google.com/u/0/home/projects/1KOi0JaACm3_ewv1nYgfrwxWSJj3QsU1ifDUFe62ELCNxQ0VLIgk5-bs1/edit>
- Endpoint: `.../macros/s/AKfycbz38fhpHeU3rSYN.../exec` (set in `index.html`)

Verified working on 2026-09-10: health check returns ok, direct POSTs append
rows, and a booking submitted on the live site fired both destinations.

**Setup is complete. The steps below are only for reference if it ever breaks.**

---

### 1. Make the sheet — ✅ done
No headers needed; the script writes them on the first booking.

### 2. Create the script project — ✅ done

### 3. Paste the script
Open the script project, select everything in the editor, delete it, then paste
the whole of `scripts/leads-to-sheet.gs` in and press **Cmd+S**.

The sheet ID is already filled in — nothing to edit.

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
