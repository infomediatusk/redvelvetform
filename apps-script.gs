/*
 * Bind this script to the Google Sheet that should receive the leads.
 * Deploy as Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 * Paste the deployed URL into config.js -> googleScriptUrl.
 */

const SHEET_NAME = 'Leads';

const HEADERS = [
  'Submitted At',
  'Lead ID',
  'Event ID',
  'Offer Code',
  'Name',
  'Phone',
  'Event Type',
  'Event Date',
  'Guest Count',
  'Budget',
  'Booking Timeline',
  'Visit Preference',
  'Lead Status',
  'WhatsApp Confirmed',
  'Qualified Status',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Content',
  'UTM Term',
  'Campaign ID',
  'Ad Set ID',
  'Ad ID',
  'FBCLID',
  'FBP',
  'FBC',
  'Page URL',
  'Referrer',
  'User Agent',
  'Last Updated'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = parsePayload_(e);
    if (!data.lead_id) throw new Error('Missing lead_id');

    const sheet = getLeadSheet_();
    const existingRow = findLeadRow_(sheet, data.lead_id);

    if (data.action === 'whatsapp_click' && existingRow > 0) {
      sheet.getRange(existingRow, 13).setValue('WhatsApp Clicked');
      sheet.getRange(existingRow, 30).setValue(new Date());
    } else if (existingRow > 0) {
      sheet.getRange(existingRow, 13).setValue(data.lead_status || 'Form Submitted');
      sheet.getRange(existingRow, 30).setValue(new Date());
    } else {
      sheet.appendRow(toRow_(data));
    }

    return json_({ ok: true, lead_id: data.lead_id });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  } finally {
    lock.releaseLock();
  }
}

function parsePayload_(e) {
  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }
  throw new Error('Empty request');
}

function getLeadSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#4a0d19')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findLeadRow_(sheet, leadId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const match = sheet.getRange(2, 2, lastRow - 1, 1)
    .createTextFinder(String(leadId))
    .matchEntireCell(true)
    .findNext();
  return match ? match.getRow() : -1;
}

function toRow_(data) {
  return [
    data.submitted_at || new Date().toISOString(),
    data.lead_id || '',
    data.event_id || '',
    data.offer_code || '',
    data.name || '',
    data.phone || '',
    data.event_type || '',
    data.event_date || '',
    data.guest_count || '',
    data.budget || '',
    data.booking_timeline || '',
    data.visit_preference || '',
    data.lead_status || 'Form Submitted',
    data.whatsapp_confirmed || 'No - update after message is received',
    '',
    data.utm_source || '',
    data.utm_medium || '',
    data.utm_campaign || '',
    data.utm_content || '',
    data.utm_term || '',
    data.campaign_id || '',
    data.adset_id || '',
    data.ad_id || '',
    data.fbclid || '',
    data.fbp || '',
    data.fbc || '',
    data.page_url || '',
    data.referrer || '',
    data.user_agent || '',
    new Date()
  ];
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
