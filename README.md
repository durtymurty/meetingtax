# MeetingTax 💸

> Every meeting has a price. Now you can see it.

A full-stack app that shows the real dollar cost of your meetings in real time, powered by AWS DynamoDB and Claude AI.

**Built for H0: Hack the Zero Stack (Vercel + AWS Databases Hackathon)**

---

## Stack

- **Frontend**: Next.js 15 (App Router) on Vercel
- **Database**: AWS DynamoDB (PAY_PER_REQUEST — scales to zero, handles concurrent meeting writes perfectly)
- **AI**: Anthropic Claude Sonnet for meeting pattern analysis
- **UI**: Custom design system, no component library

---

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd meetingtax
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
DYNAMODB_TABLE_PEOPLE=meetingtax-people
DYNAMODB_TABLE_MEETINGS=meetingtax-meetings
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Create DynamoDB tables

```bash
node scripts/setup-dynamo.mjs
```

Or create manually in AWS Console:
- Table: `meetingtax-people`, Partition key: `id` (String), Billing: On-demand
- Table: `meetingtax-meetings`, Partition key: `id` (String), Billing: On-demand

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "initial commit"
gh repo create meetingtax --public --push
```

### 2. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Add all environment variables from `.env.local`
4. Deploy

### 3. Set up AWS credentials for production

In Vercel dashboard → Settings → Environment Variables, add:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DYNAMODB_TABLE_PEOPLE`
- `DYNAMODB_TABLE_MEETINGS`
- `ANTHROPIC_API_KEY`

---

## Why DynamoDB?

DynamoDB is the right choice here because:

1. **Concurrent writes during live meetings** — when a meeting ends, we write the full record atomically. In a real deployment, dozens of meetings could end simultaneously across a company.
2. **PAY_PER_REQUEST billing** — perfect for a B2B SaaS with variable load (more meetings during work hours, quiet at night).
3. **No connection pooling** — serverless Next.js API routes connect via the AWS SDK without needing persistent DB connections.
4. **Schema flexibility** — meeting records can evolve (add new fields) without migrations.

---

## Architecture

```
Browser (Next.js on Vercel)
    │
    ├── GET/POST /api/people   ──→  DynamoDB: meetingtax-people
    ├── GET/POST /api/meetings ──→  DynamoDB: meetingtax-meetings
    └── POST /api/analyze      ──→  Anthropic Claude API
```

---

## Features

- **Org builder** — add team members with name, role, and salary
- **Live meeting room** — real-time dollar counter that updates every 500ms
- **Cost breakdown** — total cost, cost per person, cost per minute
- **Meeting history** — all past meetings persisted in DynamoDB
- **Analytics dashboard** — total spend, averages, bar chart
- **Claude AI analysis** — press a button, get sharp insights on which meetings to cut

---

## Hackathon Submission Notes

- Track: **Monetizable B2B App**
- AWS Database: **Amazon DynamoDB** (PAY_PER_REQUEST)
- Frontend: **Vercel / Next.js**
- AI: **Claude Sonnet** (Anthropic)
- Monetization model: SaaS — $X/month per team, free tier for solo users
