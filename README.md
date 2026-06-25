# YesMadam Partner Ops Desk 🚀

AI-powered internal operations tool for managing beauty professionals — built for the **Gappy AI Hackathon** using the **Lemma SDK**.

## Problem
YesMadam manages 7,500+ beauty professionals across 58 cities. Partner quality ops — complaints, certifications, performance flags — are handled manually across WhatsApp, calls, and spreadsheets. No unified view. No real-time alerts.

## Solution
An AI ops desk where any manager can instantly query, monitor, and act on partner health in natural language.

## Features
- 📊 **Live Dashboard** — KPIs across 20 partners, 8 cities
- 🔍 **Partner Database** — searchable, filterable table with real-time status
- 🤖 **AI Agent** — Groq llama-3.3-70b, answers queries like "show high complaint partners"
- 🚨 **Smart Alerts** — auto-detects cert issues, complaints, inactive partners
- 🏷️ **Flag Workflow** — one-click flagging, persists across sessions

## Tech Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **AI Agent:** Groq (llama-3.3-70b-versatile)
- **SDK:** Lemma — partners table, partner_flags table, partner-ops-agent, flag_partner_for_review function, daily_alert_scan schedule
- **Lemma Pod:** `019ef813-ad27-7435-aa76-5a19c12dc7e7`

## Setup
```bash
npm install
cp .env.example .env.local  # add GROQ_API_KEY and LEMMA_API_TOKEN
npm run dev
```

Open `http://localhost:3000`
