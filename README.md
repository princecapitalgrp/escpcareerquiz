# Rise by Solis — ESCP Career Quiz

AI-powered career intelligence quiz. Classifies users into one of four psychological archetypes and generates a personalised career protocol with sector alignment and three actionable moves.

## File Structure

```
escpcareerquiz/
├── index.html        ← The quiz (no API keys)
├── api/
│   └── generate.js  ← Vercel serverless function (OpenAI proxy)
├── vercel.json       ← Routing config
└── README.md
```

## Deploy to Vercel (15 minutes)

### Step 1 — Push this repo to GitHub
Already done if you're reading this.

### Step 2 — Connect to Vercel
1. Go to vercel.com → Log in with GitHub
2. Click "Add New Project"
3. Import the `escpcareerquiz` repository
4. Leave all settings as default
5. Click "Deploy"

### Step 3 — Add your OpenAI API key (CRITICAL)
1. In Vercel dashboard → your project → Settings → Environment Variables
2. Add a new variable:
   - Name:  `OPENAI_API_KEY`
   - Value: `sk-proj-...` (your key from platform.openai.com)
   - Environment: Production + Preview + Development
3. Click Save
4. Go to Deployments → click the three dots on your latest deployment → Redeploy

### Step 4 — Set up EmailJS (optional but recommended)
1. Go to emailjs.com → create free account
2. Add Email Service → choose Gmail → connect your account
3. Create a **Result** email template with these variables:
   - Subject: `{{subject}}`
   - Body: `{{result_text}}`
   - To Email: `{{to_email}}`
4. Create a **Feedback** email template with these variables:
   - Subject: `{{subject}}`
   - Body: `From: {{from_email}}` + `Q quality: {{question_quality}}` + `Accuracy: {{career_accuracy}}` + `Feedback: {{open_feedback}}` + `Time: {{timestamp}}`
   - To Email: `{{to_email}}`
5. Copy your Service ID, both Template IDs, and Public Key
6. Paste them into `index.html` where it says:
   - `YOUR_EMAILJS_PUBLIC_KEY`
   - `YOUR_EMAILJS_SERVICE_ID`  
   - `YOUR_EMAILJS_RESULT_TEMPLATE_ID`
   - `YOUR_EMAILJS_FEEDBACK_TEMPLATE_ID`
   - `YOUR_INBOX_EMAIL`
7. Commit and push — Vercel redeploys automatically

### Step 5 — Share
Your URL will be: `https://escpcareerquiz.vercel.app` (or similar)

Send to the ESCP group chat. Done.

## What the OpenAI Key Is and Where It Lives

The OpenAI key is what lets the quiz generate AI results. It **never touches the browser** — it lives only in Vercel's encrypted environment variables and is called server-side by `api/generate.js`. This is why it's safe to have this repo public.

Cost per quiz completion: approximately $0.01–0.02 USD.

## Feedback Data

Feedback submissions are emailed to you via EmailJS (no database).

## Support

Built with the Solis archetype system: Architect / Alchemist / Sentinel / Tide.
