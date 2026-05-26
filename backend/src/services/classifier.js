const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function classifyClaim(text) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 200,
    messages: [
      {
        role: 'system',
        content: 'You are a claim classifier. Respond ONLY with valid JSON. No markdown, no backticks, no explanation.'
      },
      {
        role: 'user',
        content: `Classify this claim and respond with ONLY this JSON shape:
{"type":"...","claim":"...","language":"..."}

Rules:
- "type" must be exactly one of: "news", "health", "government", "unknown"
- "claim" is the core claim in one sentence
- "language" must be exactly one of: "en", "hi", "other"

Claim: "${text}"`
      }
    ]
  })

  const raw = completion.choices[0].message.content.trim()

  try {
    return JSON.parse(raw)
  } catch {
    const match = raw.match(/\{.*\}/s)
    if (match) return JSON.parse(match[0])
    return { type: 'unknown', claim: text, language: 'en' }
  }
}

module.exports = { classifyClaim }
