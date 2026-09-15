# Landing page setup

The landing page is ready as a static site. It contains no visible hotel name or page header.

## Required before publishing

Open `config.js` and add:

1. `whatsappNumber`: hotel WhatsApp number with country code and digits only.
2. `googleScriptUrl`: deployed Google Apps Script Web App URL.

GA4 `G-487QVEW30G` and Meta Pixel `925632936518912` are already installed.

## Google Sheet connection

1. Create or open the Google Sheet.
2. Open Extensions > Apps Script.
3. Paste the contents of `apps-script.gs` and save.
4. Select Deploy > New deployment > Web app.
5. Execute as `Me` and allow access to `Anyone`.
6. Copy the Web App URL into `config.js`.

The script creates a `Leads` tab and stores one row per lead. A WhatsApp button click updates the same row. Actual message receipt must be confirmed manually in the sheet unless WhatsApp Cloud API is connected later.

## Ad tracking URL

Use this pattern in Meta ads:

```text
https://redvelvetform.mediatusk.com/?utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}
```

## Local preview

Run the included PowerShell preview script:

```powershell
powershell -ExecutionPolicy Bypass -File .\preview.ps1
```

Then open `http://localhost:4173`.
