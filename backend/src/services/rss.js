const RSSParser = require('rss-parser')
const supabase = require('../config/db')

const parser = new RSSParser()

// these are all free public RSS feeds — no API key needed
const RSS_FEEDS = [
  {
    name: 'BBC India',
    url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml'
  },
  {
  name: 'The Hindu',
  url: 'https://www.thehindu.com/news/national/feeder/default.rss'
  },
  {
    name: 'PIB India',
    url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3'
  },
  {
    name: 'NDTV',
    url: 'https://feeds.feedburner.com/ndtvnews-top-stories'
  }
]

async function fetchAndStoreArticles() {
  console.log('RSS fetch started:', new Date().toISOString())
  let totalSaved = 0

  for (const feed of RSS_FEEDS) {
    try {
      const result = await parser.parseURL(feed.url)

      for (const item of result.items.slice(0, 10)) {
        // skip if no title
        if (!item.title) continue

        // check if article already exists in DB
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('url', item.link || '')
          .single()

        if (existing) continue  // already saved, skip

        // save new article
        const { error } = await supabase
          .from('articles')
          .insert({
            title: item.title,
            source: feed.name,
            summary: item.contentSnippet || item.content || item.title,
            url: item.link || '',
            published_at: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : new Date().toISOString()
          })

        if (!error) totalSaved++
      }

      console.log(`✓ ${feed.name} — fetched`)

    } catch (err) {
      // one feed failing should not stop others
      console.error(`✗ ${feed.name} failed:`, err.message)
    }
  }

  console.log(`RSS fetch complete — ${totalSaved} new articles saved`)
  return totalSaved
}

module.exports = { fetchAndStoreArticles }