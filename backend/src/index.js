const express = require('express')
const cors = require('cors')
const cron = require('node-cron')
require('dotenv').config()
const statsRoute = require('./routes/stats')
const checkRoute = require('./routes/check')
const { fetchAndStoreArticles } = require('./services/rss')
const articlesRoute = require('./routes/articles')
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TruthFeed backend is alive' })
})

// routes
app.use('/api/check', checkRoute)
app.use('/api/stats', statsRoute)
app.use('/api/articles', articlesRoute)

// manual trigger route — useful for testing
app.get('/api/fetch-news', async (req, res) => {
  const count = await fetchAndStoreArticles()
  res.json({ message: `Fetched successfully`, articles_saved: count })
})

// cron job — runs every hour automatically
// '0 * * * *' means: at minute 0 of every hour
cron.schedule('0 * * * *', async () => {
  console.log('Hourly cron triggered')
  await fetchAndStoreArticles()
})

// run once immediately when server starts
fetchAndStoreArticles()

app.listen(PORT, () => {
  console.log(`TruthFeed backend running on http://localhost:${PORT}`)
})