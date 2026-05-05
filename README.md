# Brevo SMS → MOBILEPHONE Sync

A Vercel serverless webhook that automatically copies the `SMS` field to `MOBILEPHONE` field for Brevo contacts.

## How it works

1. Brevo automation triggers and POSTs contact data to this webhook
2. Webhook reads the `SMS` attribute from the payload
3. Calls Brevo API to update `MOBILEPHONE` with the SMS value

## Project Structure

```
brevo-sync/
├── api/
│   ├── index.js          ← Health check (GET /api)
│   └── sync-mobile.js    ← Main webhook handler (POST /api/sync-mobile)
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create brevo-sync --public --push
```

### 2. Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

### 3. Add Environment Variable

In Vercel dashboard → Your Project → Settings → Environment Variables:

```
BREVO_API_KEY = your_brevo_api_key_here
```

Or via CLI:
```bash
vercel env add BREVO_API_KEY
```

### 4. Your Webhook URL

```
https://your-project.vercel.app/api/sync-mobile
```

## Brevo Setup

1. Go to **Automation → Create Workflow**
2. Set your trigger
3. Add a **Webhook** step
4. URL: `https://your-project.vercel.app/api/sync-mobile`
5. Method: `POST`

## Expected Payload from Brevo

```json
{
  "appName": "workflow-action-processor",
  "attributes": {
    "SMS": "919549808731",
    "FIRSTNAME": "John",
    "LASTNAME": "Doe"
  },
  "contact_id": 27007,
  "email": "contact@example.com",
  "step_id": 5,
  "workflow_id": 9
}
```

## Test Locally

```bash
npm install
vercel dev
```

Then POST to `http://localhost:3000/api/sync-mobile` with the sample payload above.
