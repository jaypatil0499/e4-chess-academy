# WhatsApp alerts for new bookings (free, ~2 minutes)

Email alerts work as soon as you paste the updated script — nothing to configure.
This adds a **WhatsApp message to +91 76767 82072** for every booking, on top of
the email and the sheet row.

It uses **CallMeBot**, a free service for sending WhatsApp messages to your own
number. No account, no card.

---

### 1. Save the CallMeBot number

Add **+34 644 51 95 23** to your phone contacts. Name it anything (e.g. `CallMeBot`).

### 2. Message it on WhatsApp

From **+91 76767 82072** — the number you want alerts on — send this contact
exactly this text on WhatsApp:

```
I allow callmebot to send me messages
```

### 3. Wait for your key

Within a minute or two it replies with your **API key**, a number like `123456`.

### 4. Put the key in the script

In the [script project](https://script.google.com/u/0/home/projects/1KOi0JaACm3_ewv1nYgfrwxWSJj3QsU1ifDUFe62ELCNxQ0VLIgk5-bs1/edit), find this line near the top:

```javascript
var WHATSAPP_APIKEY = '';
```

Put your key between the quotes:

```javascript
var WHATSAPP_APIKEY = '123456';
```

Save (**Cmd+S**), then republish:
**Deploy → Manage deployments → pencil → Version: New version → Deploy.**

### 5. Test it

In the editor, pick **`sendTestAlert`** from the function dropdown at the top and
click **Run**. You should get a WhatsApp message and an email within seconds.

---

## Notes

- The key only ever lets messages be sent **to your own number** — it is not a
  password, and it lives in your script, not on the public website.
- If WhatsApp alerts ever stop, bookings are unaffected: the row and the email
  still go through. Alert failures are logged in the script's **Executions** tab
  and never block a lead.
- To turn WhatsApp alerts off, set `WHATSAPP_APIKEY` back to `''` and republish.
