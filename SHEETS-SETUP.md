# Send E4CA demo bookings into a Google Sheet

Every booking already arrives as **email** at e4cacademy@gmail.com via Web3Forms.
This adds a second, permanent copy as a row in a Google Sheet — free, unlimited,
and independent of Web3Forms (their Sheets integration is a paid PRO feature).

Takes about 10 minutes. You only do it once.

---

## 1. Create the sheet

1. Go to <https://sheets.new> — a blank sheet opens.
2. Name it **E4CA Leads** (top-left).
3. In **row 1**, type these seven headers, one per column, A through G:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Received | Parent Name | Email | Phone | Child's Age | Experience | Country |

4. Rename the tab at the bottom from `Sheet1` to **Leads** (double-click it).

---

## 2. Add the script

1. In the sheet: **Extensions → Apps Script**. A code editor opens in a new tab.
2. Delete whatever is in there (`function myFunction() {}`).
3. Paste this in, exactly:

```javascript
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // stops two simultaneous bookings clobbering a row

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads') || ss.getSheets()[0];
    var d = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      d.name       || '',
      d.email      || '',
      d.phone      || '',
      d.childAge   || '',
      d.experience || '',
      d.country    || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

4. Click the **save** icon (or Cmd+S).

---

## 3. Publish it

1. Top right: **Deploy → New deployment**.
2. Click the **gear icon** next to "Select type" → choose **Web app**.
3. Set:
   - **Description**: `E4CA lead capture`
   - **Execute as**: **Me (your@gmail.com)**
   - **Who has access**: **Anyone**  ← must be "Anyone", not "Anyone with Google account"
4. Click **Deploy**.
5. Google asks you to authorise it. Click **Authorize access** → pick your account →
   you'll see a scary **"Google hasn't verified this app"** screen. This is normal for
   your own scripts. Click **Advanced** → **Go to E4CA lead capture (unsafe)** → **Allow**.
6. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfycb..................../exec`

---

## 4. Plug it into the site

Open `index.html`, find line ~1020:

```javascript
const SHEETS_ENDPOINT = '';
```

Paste your URL between the quotes, save, commit and push:

```
git add index.html && git commit -m "Enable Google Sheets lead capture" && git push
```

---

## 5. Test it

Once Vercel redeploys (~30 seconds), submit a test booking on the live site.
A new row should appear in the sheet within a couple of seconds, and the email
should land in Gmail.

If the row doesn't appear, check in this order:
- **"Who has access"** is set to **Anyone** (the single most common mistake)
- The tab is named **Leads**
- You copied the `/exec` URL, not the `/dev` one
- After *any* edit to the script you must **Deploy → Manage deployments → edit
  (pencil) → Version: New version → Deploy**. Editing the code alone changes nothing
  on the live URL.

---

## Using it day to day

Add your own columns from **H** onwards — `Called?`, `Demo date`, `Coach`,
`Converted?`. The script only ever appends to A–G, so your columns are safe.

Then: freeze row 1 (**View → Freeze → 1 row**), and turn on notifications with
**Tools → Notification settings → Notify me when… any changes are made → Email daily digest**.
