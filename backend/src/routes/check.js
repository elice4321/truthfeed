const express = require('express')
const router = express.Router()
const { classifyClaim } = require('../services/classifier')
const { buildVerdict } = require('../services/checker')
const supabase = require('../config/db')

router.post('/', async (req, res) => {
  try {
    const { text } = req.body

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a claim to check' })
    }

    const normalised = text.trim().toLowerCase()

    // cache check
    const { data: cached } = await supabase
      .from('checks')
      .select('*')
      .eq('normalised_input', normalised)
      .single()

    if (cached) {
      return res.json({ ...cached, from_cache: true })
    }

    const classification = await classifyClaim(text)
    const verdict = await buildVerdict(text, classification)

    const { data: saved, error: insertError } = await supabase
  .from('checks')
  .insert({
    original_input: text,
    normalised_input: normalised,
    claim_type: classification.type,
    language: classification.language,
    core_claim: classification.claim,
    verdict: verdict.verdict,
    confidence: verdict.confidence,
    reason: verdict.reason,
    reason_hi: verdict.reason_hi,
    source: verdict.source,
  })
  .select()
  .single()



res.json({ ...saved, from_cache: false })

  } catch (err) {
    console.error('Check route error:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

module.exports = router
