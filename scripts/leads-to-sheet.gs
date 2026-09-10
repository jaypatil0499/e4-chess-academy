/**
 * E4 Chess Academy — lead capture endpoint.
 *
 * On every booking this does three things, in this order:
 *   1. append the lead to the sheet   (must never fail)
 *   2. email you the details          (free, sent from your own Gmail)
 *   3. WhatsApp you the details       (optional, only if WHATSAPP_APIKEY is set)
 *
 * The row is written first and notification errors are swallowed, so a mail
 * or WhatsApp problem can never cost you the lead itself.
 *
 * Deploy: Deploy -> New deployment -> Web app
 *         Execute as: Me   |   Who has access: Anyone
 */

// ---------------------------------------------------------------- settings
var SHEET_ID   = '1c-73hXboypy7btbS1AnimRfbcpxv5UYEPGuB0CJh508';
var TAB_NAME   = 'Leads';
var NOTIFY_TO  = 'e4cacademy@gmail.com';   // where booking alerts are sent

// WhatsApp alerts via CallMeBot (free). Leave the key empty to skip WhatsApp.
// To switch it on, see WHATSAPP-ALERTS.md — takes about 2 minutes.
var WHATSAPP_TO     = '917676782072';
var WHATSAPP_APIKEY = '';
// -------------------------------------------------------------------------

var HEADERS = ['Received', 'Parent Name', 'Email', 'Phone',
               "Child's Age", 'Experience', 'Country'];

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_NAME);

  if (!sheet) {
    var first = ss.getSheets()[0];
    if (ss.getSheets().length === 1 && first.getLastRow() === 0) {
      sheet = first.setName(TAB_NAME);
    } else {
      sheet = ss.insertSheet(TAB_NAME);
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
  }
  return sheet;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // two bookings at once must not share a row

  try {
    var d = JSON.parse(e.postData.contents);

    getSheet_().appendRow([
      new Date(),
      d.name       || '',
      d.email      || '',
      d.phone      || '',
      d.childAge   || '',
      d.experience || '',
      d.country    || ''
    ]);

    // Past this point the lead is safe. Alerts are best-effort only.
    notify_(d);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function notify_(d) {
  try { emailAlert_(d); }    catch (err) { console.error('Email alert failed: ' + err); }
  try { whatsappAlert_(d); } catch (err) { console.error('WhatsApp alert failed: ' + err); }
}

function field_(label, value) {
  return '<tr>'
    + '<td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#888;font-size:13px;width:40%;">' + label + '</td>'
    + '<td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#1A1A1A;font-weight:600;">' + (value || '—') + '</td>'
    + '</tr>';
}

function emailAlert_(d) {
  var when = Utilities.formatDate(new Date(), 'Asia/Kolkata', "d MMM yyyy 'at' h:mm a");

  var html =
    '<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#F7F3EA;border-radius:12px;">'
    + '<div style="background:#0D1F2D;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">'
    +   '<span style="font-size:36px;">&#9822;</span>'
    +   '<h2 style="color:#C9A84C;font-family:Georgia,serif;margin:8px 0 4px;">New Demo Booking</h2>'
    +   '<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">E4 Chess Academy</p>'
    + '</div>'
    + '<table style="width:100%;border-collapse:collapse;">'
    +   field_('Parent Name', d.name)
    +   '<tr><td style="padding:10px 0;border-bottom:1px solid #E4DCC8;color:#888;font-size:13px;">Email</td>'
    +   '<td style="padding:10px 0;border-bottom:1px solid #E4DCC8;"><a href="mailto:' + (d.email || '') + '" style="color:#00B4D8;font-weight:600;">' + (d.email || '—') + '</a></td></tr>'
    +   field_('Phone', d.phone)
    +   field_("Child's Age", d.childAge)
    +   field_('Experience', d.experience)
    +   field_('Country', d.country)
    + '</table>'
    + '<div style="margin-top:24px;text-align:center;">'
    +   '<a href="https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit" '
    +   'style="display:inline-block;background:#C9A84C;color:#0D1F2D;padding:12px 28px;border-radius:100px;text-decoration:none;font-weight:700;font-size:14px;">Open the leads sheet</a>'
    + '</div>'
    + '<p style="text-align:center;color:#aaa;font-size:11px;margin-top:20px;">Submitted ' + when + ' IST</p>'
    + '</div>';

  MailApp.sendEmail({
    to: NOTIFY_TO,
    subject: 'New demo booking — ' + (d.name || 'Unknown') + ' (' + (d.country || '—') + ')',
    htmlBody: html,
    replyTo: d.email || NOTIFY_TO,   // hit reply to answer the parent directly
    name: 'E4 Chess Academy Website'
  });
}

function whatsappAlert_(d) {
  if (!WHATSAPP_APIKEY) return;

  var msg = 'New demo booking!\n\n'
    + 'Parent: ' + (d.name  || '—') + '\n'
    + 'Email: '  + (d.email || '—') + '\n'
    + 'Phone: '  + (d.phone || '—') + '\n'
    + 'Age: '    + (d.childAge   || '—') + '\n'
    + 'Level: '  + (d.experience || '—') + '\n'
    + 'Country: '+ (d.country    || '—');

  var url = 'https://api.callmebot.com/whatsapp.php'
    + '?phone='  + encodeURIComponent(WHATSAPP_TO)
    + '&text='   + encodeURIComponent(msg)
    + '&apikey=' + encodeURIComponent(WHATSAPP_APIKEY);

  UrlFetchApp.fetch(url, { muteHttpExceptions: true });
}

// Opening the /exec URL in a browser confirms the deployment is live and public.
function doGet() {
  return json_({ ok: true, message: 'E4CA lead endpoint is live.' });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor to send yourself a sample alert. */
function sendTestAlert() {
  notify_({
    name: 'Test Parent', email: 'test@example.com', phone: '+91 90000 00000',
    childAge: '9 years', experience: 'Knows basic rules', country: 'India'
  });
}
