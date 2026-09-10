/**
 * E4 Chess Academy — lead capture endpoint.
 * Paste this into Extensions -> Apps Script on your Google Sheet, then
 * Deploy -> New deployment -> Web app (Execute as: Me, Access: Anyone).
 * The tab and header row are created automatically on the first booking.
 */

// This sheet: https://docs.google.com/spreadsheets/d/1c-73hXboypy7btbS1AnimRfbcpxv5UYEPGuB0CJh508/edit
// Addressed by ID so the script works whether it is bound to the sheet or
// standalone — getActiveSpreadsheet() returns null in a standalone project.
var SHEET_ID = '1c-73hXboypy7btbS1AnimRfbcpxv5UYEPGuB0CJh508';
var TAB_NAME = 'Leads';
var HEADERS = ['Received', 'Parent Name', 'Email', 'Phone',
               "Child's Age", 'Experience', 'Country'];

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(TAB_NAME);

  if (!sheet) {
    // Reuse a pristine default tab rather than leaving an empty "Sheet1" behind.
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
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
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
