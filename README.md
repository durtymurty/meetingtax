### 3. Create DynamoDB tables

```bash
node scripts/setup-dynamo.mjs
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
vercel --prod
```

Add all environment variables in the Vercel dashboard under Settings → Environment Variables, then redeploy.

---

## Monetization model

MeetingTax targets B2B SaaS with a simple pricing model:

- **Free** — up to 5 team members, 10 meetings/month
- **Pro** — $12/month per workspace, unlimited everything
- **Enterprise** — custom pricing, SSO, audit logs, Slack integration

The core insight: companies waste thousands per month on unnecessary meetings. MeetingTax makes that waste visible, which is the first step to fixing it.

---

## Hackathon

- **Event**: H0: Hack the Zero Stack with Vercel v0 and AWS Databases
- **Track**: Monetizable B2B App
- **AWS Database**: Amazon DynamoDB (PAY_PER_REQUEST)
- **Dates**: May 27 – June 29, 2026