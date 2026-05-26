const express = require('express')
const router = express.Router()
const supabase = require('../config/db')

router.get('/', async (req, res) => {
  try {
    // total checks ever
    const { count: totalChecks } = await supabase
      .from('checks')
      .select('*', { count: 'exact', head: true })

    // checks today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count: todayChecks } = await supabase
      .from('checks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())

    // verdict breakdown — how many TRUE, FALSE, MISLEADING, UNVERIFIED
    const { data: verdictRows } = await supabase
      .from('checks')
      .select('verdict')

    const verdictBreakdown = {
      TRUE: 0,
      FALSE: 0,
      MISLEADING: 0,
      UNVERIFIED: 0
    }

    if (verdictRows) {
      verdictRows.forEach(row => {
        if (verdictBreakdown.hasOwnProperty(row.verdict)) {
          verdictBreakdown[row.verdict]++
        }
      })
    }

    // misinformation caught = FALSE + MISLEADING
    const misinformationCaught = verdictBreakdown.FALSE + verdictBreakdown.MISLEADING

    // total articles in knowledge base
    const { count: totalArticles } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })

    // most recent check timestamp
    const { data: lastCheck } = await supabase
      .from('checks')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    res.json({
      total_checks: totalChecks || 0,
      today_checks: todayChecks || 0,
      misinformation_caught: misinformationCaught,
      verdict_breakdown: verdictBreakdown,
      total_articles: totalArticles || 0,
      last_check_at: lastCheck?.created_at || null,
    })

  } catch (err) {
    console.error('Stats route error:', err)
    res.status(500).json({ error: 'Could not fetch stats' })
  }
})

module.exports = router