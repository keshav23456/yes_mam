import { NextResponse } from 'next/server'

const POD_ID = '019ef813-ad27-7435-aa76-5a19c12dc7e7'
const API_BASE = `https://api.lemma.work/pods/${POD_ID}`
const ACCESS_TOKEN = `eyJraWQiOiJkLTE3ODIxMjMwMDI5NjYiLCJ0eXAiOiJKV1QiLCJ2ZXJzaW9uIjoiNSIsImFsZyI6IlJTMjU2In0.eyJpYXQiOjE3ODIzMTg1NDksImV4cCI6MTc4MjMyMjE0OSwic3ViIjoiMjNkY2FmZTUtZDcyZS00ZDE1LTkzYjEtNGU5NWNjNDBkZDQwIiwidElkIjoicHVibGljIiwicnN1YiI6IjIzZGNhZmU1LWQ3MmUtNGQxNS05M2IxLTRlOTVjYzQwZGQ0MCIsInNlc3Npb25IYW5kbGUiOiJlMzQ4ZDFkMC0wNTIwLTQ1NTEtOWQzYi1jN2M4Yjk3MGIzYWQiLCJyZWZyZXNoVG9rZW5IYXNoMSI6IjJiZDMxYzZmOGQ1NmNlZDExMWY1YTUzZjhmNTg3YzYyNzA1MTIyYzM2MTQ2Yjc3YzdhZThjNzhjMDg2ODVmNjMiLCJwYXJlbnRSZWZyZXNoVG9rZW5IYXNoMSI6bnVsbCwiYW50aUNzcmZUb2tlbiI6bnVsbCwiaXNzIjoiaHR0cHM6Ly9hcGkubGVtbWEud29yay9zdC9hdXRoIn0.rUyVNk91gy4NshySPHjti2658_tBy7ZAaiVFYE0W9mLMTx1ky7PSU1TrXamgjqOIEn7hXsiZBTf50PW0RoMc2n2i5XdepMtHD4cYxP99Cx7XgYHZlv21wr3dAd76EGqu3VZ3214AK_CmtuYrYDTNjdXJwLAQKYZakUOkHWN485Y7jAoMk8M3vJ33n8OvhffbcSJ00brzB9csuuwhlLALiA8VNl1rKVxV5Plg_2ibWa0VR6ooV0HGo-Iewe954okgGJjbPCEVxovoT2U53xYFfMx7RxJs2h1l7NYBkBIFGdaELEj_CxrCZrmJt5LYvZ5S345GhKmHFjy2QnZLgmknmA`

const HEADERS = {
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'st-auth-mode': 'header',
}

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/datastore/tables/partners/records?limit=100`, { headers: HEADERS })
    if (!res.ok) throw new Error(`Lemma API error: ${res.status}`)
    const data = await res.json()
    return NextResponse.json({ partners: data.records ?? data.items ?? data ?? [], source: 'lemma' })
  } catch (e) {
    console.error('Lemma fetch failed, using seed data:', e)
    return NextResponse.json({ partners: [], source: 'error', error: String(e) })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json()
    const res = await fetch(`${API_BASE}/tables/partners/records/${id}`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ status })
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
