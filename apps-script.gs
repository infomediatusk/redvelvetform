/*
 * Bind this script to the Google Sheet that should receive the leads.
 * Deploy as Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 * Paste the deployed URL into config.js -> googleScriptUrl.
 *
 * Optional Meta Conversions API setup in Apps Script > Project Settings >
 * Script properties:
 *   META_PIXEL_ID       925632936518912
 *   META_ACCESS_TOKEN   paste the token from Events Manager
 *   META_API_VERSION    current supported Graph API version, e.g. vXX.X
 *   META_TEST_EVENT_CODE optional; remove after testing
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

    // Keep the Sheet write independent from Meta delivery. If Meta is
    // temporarily unavailable, the lead is still safely stored here.
    let metaStatus = 'skipped';
    try {
      metaStatus = sendMetaConversion_(data);
    } catch (metaError) {
      console.error('Meta CAPI delivery failed: ' + String(metaError.message || metaError));
      metaStatus = 'failed';
    }

    return json_({ ok: true, lead_id: data.lead_id, meta_capi: metaStatus });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  } finally {
    lock.releaseLock();
  }
}

// The landing page posts leads with a cross-origin request. It then checks this
// endpoint using JSONP, which lets it verify that this exact lead ID exists in
// the Sheet before revealing the offer. No customer details are returned here.
function doGet(e) {
  const parameters = (e && e.parameter) || {};
  const callback = sanitiseCallback_(parameters.callback);
  const action = String(parameters.action || '');

  if (action !== 'lead_status') {
    return jsonOrJsonp_({ ok: false, error: 'Unknown action' }, callback);
  }

  const leadId = String(parameters.lead_id || '').trim();
  if (!leadId || leadId.length > 100) {
    return jsonOrJsonp_({ ok: false, error: 'Invalid lead ID' }, callback);
  }

  try {
    const sheet = getLeadSheet_();
    const saved = findLeadRow_(sheet, leadId) > 0;
    return jsonOrJsonp_({ ok: true, lead_id: leadId, saved: saved }, callback);
  } catch (error) {
    return jsonOrJsonp_({ ok: false, error: 'Status check failed' }, callback);
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

function sendMetaConversion_(data) {
  const properties = PropertiesService.getScriptProperties().getProperties();
  const accessToken = String(properties.META_ACCESS_TOKEN || '').trim();
  if (!accessToken) return 'not_configured';

  const pixelId = String(properties.META_PIXEL_ID || '925632936518912').trim();
  const apiVersion = String(properties.META_API_VERSION || '').trim();
  if (!apiVersion) throw new Error('Missing META_API_VERSION in Script Properties');

  const isWhatsAppClick = data.action === 'whatsapp_click';
  const eventName = isWhatsAppClick ? 'Contact' : 'Lead';
  const eventId = isWhatsAppClick ? `${data.lead_id}-WA` : String(data.lead_id);
  const userData = compactObject_({
    ph: data.phone ? [sha256_(normalisePhone_(data.phone))] : undefined,
    fbp: data.fbp || undefined,
    fbc: data.fbc || undefined,
    client_user_agent: data.user_agent || undefined
  });

  const serverEvent = {
    event_name: eventName,
    event_time: eventTime_(data.submitted_at),
    event_id: eventId,
    action_source: 'website',
    event_source_url: data.page_url || 'https://redvelvetform.mediatusk.com/',
    user_data: userData,
    custom_data: compactObject_({
      content_name: isWhatsAppClick
        ? `${data.event_type || 'Celebration'} WhatsApp activation`
        : `${data.event_type || 'Celebration'} enquiry`,
      content_category: 'Celebration enquiry',
      event_type: data.event_type || undefined,
      offer_code: data.offer_code || undefined
    })
  };

  const requestBody = {
    data: [serverEvent],
    partner_agent: 'red_velvet_google_apps_script'
  };
  const testEventCode = String(properties.META_TEST_EVENT_CODE || '').trim();
  if (testEventCode) requestBody.test_event_code = testEventCode;

  const endpoint = `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;
  const response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  });
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();
  if (responseCode < 200 || responseCode >= 300) {
    throw new Error(`Meta API ${responseCode}: ${responseText.slice(0, 300)}`);
  }

  console.log(`Meta CAPI ${eventName} sent: ${responseText.slice(0, 300)}`);
  return 'sent';
}

function eventTime_(submittedAt) {
  const parsed = Date.parse(String(submittedAt || ''));
  return Math.floor((Number.isNaN(parsed) ? Date.now() : parsed) / 1000);
}

function normalisePhone_(value) {
  return String(value || '').replace(/\D/g, '');
}

function sha256_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function (byte) {
    const unsigned = byte < 0 ? byte + 256 : byte;
    return ('0' + unsigned.toString(16)).slice(-2);
  }).join('');
}

function compactObject_(object) {
  return Object.keys(object).reduce(function (result, key) {
    const value = object[key];
    if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length)) {
      result[key] = value;
    }
    return result;
  }, {});
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

function jsonOrJsonp_(value, callback) {
  if (!callback) return json_(value);
  return ContentService
    .createTextOutput(`${callback}(${JSON.stringify(value)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function sanitiseCallback_(value) {
  const callback = String(value || '');
  return /^[A-Za-z_$][0-9A-Za-z_$]{0,80}$/.test(callback) ? callback : '';
}
