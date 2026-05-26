import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'
import VerdictBadge from '../components/VerdictBadge'

const API = import.meta.env.VITE_API_URL

export default function Home() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [articles, setArticles] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingArticles, setLoadingArticles] = useState(true)

  useEffect(() => {
    axios.get(`${API}/api/stats`)
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false))

    axios.get(`${API}/api/articles`)
      .then(res => setArticles(res.data))
      .catch(() => setArticles([]))
      .finally(() => setLoadingArticles(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* Hero section — only visible on desktop */}
        <div className="hidden sm:block text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Truth<span className="text-brand">Feed</span>
          </h1>
          <p className="text-gray-500 text-base">{t.tagline}</p>
        </div>

        {/* Stats counter bar */}
        <div className="bg-brand-light border border-green-200 rounded-2xl p-4 sm:p-5 flex justify-between items-center mb-4 sm:mb-6">
          <div>
            <div className="text-xs sm:text-sm text-green-700 font-medium mb-1">
              {t.todayChecks}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-800">
              {loadingStats ? '...' : (stats?.today_checks ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="w-px h-10 bg-green-200" />
          <div className="text-right">
            <div className="text-xs sm:text-sm text-red-600 font-medium mb-1">
              {t.misinformation}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-red-700">
              {loadingStats ? '...' : (stats?.misinformation_caught ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Main CTA button */}
        <button
          onClick={() => navigate('/check')}
          className="w-full bg-brand hover:bg-brand-dark active:scale-95 text-white font-semibold py-4 sm:py-5 rounded-2xl text-base sm:text-lg flex items-center justify-center gap-3 transition-all mb-6 sm:mb-8 shadow-sm"
        >
          <span className="text-xl">🛡️</span>
          <span>{t.checkBtn}</span>
        </button>

        {/* Section label */}
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4">
          {t.verifiedNews}
        </div>

        {/* News feed */}
        {loadingArticles ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded-full w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map(article => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="block bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:border-green-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="text-sm sm:text-base font-medium text-gray-900 leading-snug group-hover:text-brand transition-colors">
                    {article.title}
                  </div>
                  <div className="flex-shrink-0">
                    <VerdictBadge verdict="TRUE" confidence="high" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 font-medium">
                    {article.source}
                  </span>
                  <span>·</span>
                  <span>
                    {new Date(article.published_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Bottom padding for mobile */}
        <div className="h-8" />

      </div>
    </div>
  )
}
