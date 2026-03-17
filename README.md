# CalmLayer

CalmLayer is an agentic AI-powered app that detects stress in your typed messages, labels the emotion you are feeling in that moment, and instantly rewrites your reply into a calmer, clearer version so you can communicate with intention, not impulse. Built for students, professionals, and anyone who has ever regretted hitting send.

## What it does

Paste a message, pick a context (Work, Academic, or Social), and CalmLayer will:

- Detect your stress level — Low, Medium, or High
- Identify the pressure type (e.g. Workload Anxiety, Academic Pressure)
- Rewrite your message in a calmer, more composed tone
- Activate **Calm Mode** on the UI when stress is detected

If the Nova AI API is unavailable, the app falls back to a keyword-based stress analyzer and sends you an email alert automatically.

---

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router, API Routes
- TypeScript
- Nova AI API — primary stress analysis
- Keyword fallback — runs locally when Nova is down
- Nodemailer — email alerts when the API fails
- Jest + ts-jest — unit testing

---

## Project Structure

```
app/
  page.tsx                  # Main UI
  api/analyze/
    route.ts                # POST /api/analyze — core analysis endpoint
    __tests__/
      route.test.ts         # Unit tests for API down scenarios
lib/
  nova.ts                   # Nova AI API client
  mailer.ts                 # Email alert sender
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Nova AI
NOVA_API_KEY=your-nova-api-key
NOVA_MODEL=nova-2-lite-v1

# Email alerts (sent when Nova API is down)
ALERT_EMAIL_FROM=your-gmail@gmail.com
ALERT_EMAIL_PASSWORD=your-gmail-app-password
ALERT_EMAIL_TO=your-gmail@gmail.com
```

> `ALERT_EMAIL_PASSWORD` should be a [Gmail App Password](https://myaccount.google.com/apppasswords), not your actual Gmail password.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API

### `POST /api/analyze`

**Request body:**
```json
{
  "message": "I'm completely overwhelmed and can't finish this in time.",
  "context": "work"
}
```

`context` accepts: `work`, `school`, `social`

**Response:**
```json
{
  "stressLevel": "High",
  "pressureType": "Workload Anxiety",
  "calmMode": true,
  "rewrittenMessage": "I'm currently managing a heavy workload and may need a little more time to complete this. Would tomorrow work?",
  "supportMessage": "Your message shows strong signs of pressure, so Calm Mode has been activated."
}
```

---

## Fallback Behavior

When the Nova API is unreachable or returns an error:

1. The app switches to a local keyword-based stress scorer
2. An email alert is sent to `ALERT_EMAIL_TO` with the error and timestamp
3. The response includes `(Fallback mode was used.)` in `supportMessage`

---

## Running Tests

```bash
npm test
```

The test suite covers:
- Nova returns HTTP 503 → fallback used + alert email sent
- Nova is unreachable (network error) → fallback used + alert email sent
- Nova returns invalid JSON → fallback used + alert email sent
- Nova succeeds → no alert email sent
