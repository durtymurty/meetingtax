# MeetingTax 💸

**Every meeting has a price. Now you can see it.**

Most companies have no idea how much they spend on meetings. A 6-person standup with senior engineers costs $50 before anyone says a word. MeetingTax puts a live dollar counter on every meeting so teams can finally see — and fix — where time is being wasted.

Live demo: [meetingtax-lac.vercel.app](https://meetingtax-lac.vercel.app)

---

## Features

- **Team builder** — set up your org with names, roles, and salaries. Hourly rates are calculated automatically.
- **Live meeting room** — select attendees, hit start, and watch the real-time dollar counter tick up every 500ms. Turns amber at $50, red at $200.
- **Cost breakdown** — total cost, cost per person, cost per minute, and live duration all update in real time.
- **Meeting history** — every meeting is saved with full attendee list, duration, and cost. Delete old records anytime.
- **Analytics dashboard** — total spend, average cost per meeting, longest meeting, bar chart of all meeting costs.
- **AI analysis** — one click sends your meeting data to Claude, which gives sharp, specific insights on which meetings to cut and what your ideal meeting cadence should look like.

---

## Why it exists

The average knowledge worker spends 31 hours per month in unproductive meetings. For a team of 10 with average salaries, that's over $50,000 per year in meeting costs alone — most of which goes untracked.

MeetingTax makes the invisible visible. When you can see a number ticking up in real time, you think twice about scheduling that next 90-minute all-hands.

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React, TypeScript |
| Deployment | Vercel |
| Database | AWS DynamoDB (PAY_PER_REQUEST) |
| AI | Anthropic Claude Haiku |
| Auth | None (single-team, self-hosted) |

---

## Architecture

```
Browser (Next.js on Vercel)
    │
    ├── GET/POST/DELETE /api/people   ──→  DynamoDB: meetingtax-people
    ├── GET/POST        /api/meetings ──→  DynamoDB: meetingtax-meetings
    └── POST            /api/analyze  ──→  Anthropic Claude API
                                  ↑
                             GitHub (auto-deploy on push)
```

All API keys live server-side in Vercel environment variables. The browser never sees them.

---

## Why DynamoDB

DynamoDB is the intentional choice here, not a default:

- **High-frequency concurrent writes** — in a real deployment, dozens of meetings could end simultaneously across a company. DynamoDB handles concurrent writes natively with no connection pooling or locking.
- **PAY_PER_REQUEST billing** — meeting activity spikes during work hours and drops to zero at night. On-demand pricing means you pay for exactly what you use.
- **Serverless-native** — Next.js API routes on Vercel are stateless functions. DynamoDB connects via the AWS SDK with no persistent connections required, making it a natural fit.
- **Schema flexibility** — meeting records can gain new fields over time (tags, categories, integrations) without migrations.

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/durtymurty/meetingtax.git
cd meetingtax
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
AWS_REGION=us-east-2
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

This creates both tables in your AWS account with PAY_PER_REQUEST billing. Takes about 5 seconds.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**, then redeploy. Every `git push` to main auto-deploys after that.

---

## Roadmap

- [ ] Slack integration — post meeting cost summary to a channel when a meeting ends
- [ ] Calendar sync — import meetings from Google Calendar automatically
- [ ] Team workspaces — multi-tenant support with invite links
- [ ] Weekly email digest — automated report of top 5 most expensive meetings
- [ ] Meeting templates — set recurring meetings with saved attendee lists
- [ ] Export to CSV — download full meeting history for finance teams

---

## Monetization

MeetingTax is designed as a monetizable B2B SaaS product:

- **Free** — up to 5 team members, 10 meetings/month
- **Pro** — $12/month per workspace, unlimited everything
- **Enterprise** — custom pricing, SSO, audit logs, Slack and calendar integrations

The target customer is any company that runs a lot of internal meetings and wants data to justify cutting them.

---

## Hackathon

Built for the **H0: Hack the Zero Stack** hackathon by Amazon and Vercel.

- **Track**: Monetizable B2B App
- **AWS Database**: Amazon DynamoDB (PAY_PER_REQUEST)
- **Frontend**: Vercel / Next.js
- **AI**: Anthropic Claude Haiku
- **Dates**: May 27 – June 29, 2026
- **Submission**: [devpost.com/h01](https://h01.devpost.com)