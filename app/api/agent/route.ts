import { NextRequest, NextResponse } from 'next/server'
import { SEED_PARTNERS } from '@/lib/partners'

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  const partnerContext = JSON.stringify(SEED_PARTNERS, null, 2)

  const systemPrompt = `You are the YesMadam Partner Ops AI — an internal assistant for operations managers at YesMadam, India's leading home beauty services platform with 7,500+ active beauty professionals across 58 cities.

You have access to the complete partner database below. Answer questions, flag issues, and suggest actions based on the data.

PARTNER DATABASE:
${partnerContext}

CAPABILITIES:
- Query partners by city, status, complaints, certification, rating, bookings
- Flag partners for review (complaints > 2)
- Identify inactive partners (no bookings or last_active > 10 days ago)  
- Find certification issues (Expired or Pending)
- Summarize ops metrics

RESPONSE STYLE:
- Be concise and direct
- Use bullet points for lists of partners
- Always include partner ID, name, city in responses
- For action requests (flag, suspend), confirm what action you'd take
- End with a short "Suggested Action" when relevant`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    })
  })

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content ?? 'No response from agent.'

  return NextResponse.json({ reply })
}
