const express = require('express')
const router = express.Router()
const supabase = require('../config/db')

router.get('/', async (req, res) => {
  try {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(20)

    res.json(data || [])
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch articles' })
  }
})

module.exports = router