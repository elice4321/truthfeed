const Groq = require('groq-sdk')
const supabase = require('../config/db')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function buildVerdict(text, classification) {
  const { data: articles } = await supabase
    .from('articles')
    .select('title, source, summary, url')
    .order('published_at', { ascending: false })
    .limit(5)

  const articleContext = articles && articles.length > 0
    ? articles.map((a, i) =>
        `[${i + 1}] "${a.title}" — ${a.source}\nSummary: ${a.summary}`
      ).join('\n\n')
    : 'No recent articles found in database.'

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 500,
    messages: [
      {
        role: 'system',
        content: `You are a strict fact-checker for a misinformation detection app used by non-tech Indian adults.
Your job:
1. Compare claims ONLY against provided reference articles
2. For health claims with no articles, use established scientific consensus
3. NEVER make up sources. NEVER guess.
4. Be honest about uncertainty.
Respond ONLY with valid JSON. No markdown, no backticks, no explanation outside JSON.`
      },
      {
        role: 'user',
        content: `Verify this claim and respond with ONLY this JSON shape:
{
  "verdict": "TRUE" or "FALSE" or "MISLEADING" or "UNVERIFIED",
  "confidence": "high" or "medium" or "low" or "unverifiable",
  "reason": "2-3 sentences in plain simple English",
  "reason_hi": "same in simple Hindi",
  "source": "source name or null"
}

Confidence rules:
- "high": claim directly matches or contradicts a reference article
- "medium": claim partially covered or related to references
- "low": not in references, based on general consensus
- "unverifiable": cannot be checked

Claim: "${text}"
Claim type: ${classification.type}

Reference articles:
${articleContext}`
      }
    ]
  })

  const raw = completion.choices[0].message.content.trim()

  try {
    return JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/s)
    if (match) return JSON.parse(match[0])
    return {
      verdict: 'UNVERIFIED',
      confidence: 'unverifiable',
      reason: 'We could not process this claim right now. Please try again.',
      reason_hi: 'हम अभी इस दावे की जाँच नहीं कर सके। कृपया पुनः प्रयास करें।',
      source: null,
    }
  }
}

module.exports = { buildVerdict }
