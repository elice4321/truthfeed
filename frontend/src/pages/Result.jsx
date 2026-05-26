import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import VerdictBadge from '../components/VerdictBadge'

export default function Result() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { result, originalText } = location.state || {}
  const [speaking, setSpeaking] = useState(false)

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No result to show.</p>
          <button
            onClick={() => navigate('/check')}
            className="bg-brand text-white px-6 py-3 rounded-xl font-medium"
          >
            Check a forward
          </button>
        </div>
      </div>
    )
  }

  const verdict = result.verdict || 'UNVERIFIED'
  const confidence = result.confidence || 'unverifiable'
  const reason = lang === 'hi' && result.reason_hi ? result.reason_hi : result.reason
  const fromCache = result.from_cache

  const cardBg = {
    TRUE:       'bg-green-50 border-green-200',
    FALSE:      'bg-red-50 border-red-200',
    MISLEADING: 'bg-amber-50 border-amber-200',
    UNVERIFIED: 'bg-purple-50 border-purple-200',
  }[verdict] || 'bg-purple-50 border-purple-200'

  const shareText = `I checked this on TruthFeed:\n\n"${originalText}"\n\nVerdict: ${verdict}\n${reason}\n\nCheck it yourself: https://truthfeed.vercel.app`

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: 'TruthFeed Result', text: shareText })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Result copied! Paste it on WhatsApp.')
    }
  }

  function handleListen() {
    if (!window.speechSynthesis) {
      alert('Voice not supported in this browser.')
      return
    }
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(reason)
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    utterance.rate = 0.9
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* Back button */}
        <button
          onClick={() => navigate('/check')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Check another
        </button>

        {/* Original claim */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 mb-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Claim checked
          </div>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            "{originalText}"
          </p>
        </div>

        {/* Main verdict card */}
        <div className={`border rounded-2xl p-5 sm:p-6 mb-4 ${cardBg}`}>

          <div className="flex items-center justify-between mb-4">
            <VerdictBadge verdict={verdict} confidence={confidence} />
            {fromCache && (
              <span className="text-xs text-gray-400 bg-white border border-gray-100 rounded-full px-2 py-1">
                ⚡ Instant result
              </span>
            )}
          </div>

          <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-4">
            {reason}
          </p>

          {result.source && result.source !== 'null' && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <span>📌</span>
              <span>Source: <span className="font-medium">{result.source}</span></span>
            </div>
          )}

          <button
            onClick={handleListen}
            className={`flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2 border transition-colors ${
              speaking
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{speaking ? '⏹' : '🔊'}</span>
            <span>{speaking ? 'Stop' : 'Listen to this result'}</span>
          </button>
        </div>

        {/* Confidence explanation */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Confidence level
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              confidence === 'high'   ? 'bg-green-500' :
              confidence === 'medium' ? 'bg-amber-500' :
              confidence === 'low'    ? 'bg-purple-500' : 'bg-gray-400'
            }`} />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {t[`confidence_${confidence}`] || confidence}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {confidence === 'high'          && 'Directly matched against a verified source article.'}
                {confidence === 'medium'        && 'Partially matched. Some aspects could not be verified.'}
                {confidence === 'low'           && 'Based on general consensus. No direct source article found.'}
                {confidence === 'unverifiable'  && 'Not enough information available to verify this claim.'}
              </div>
            </div>
          </div>
        </div>

        {/* Trust note */}
        <div className="bg-brand-light border border-green-200 rounded-xl p-3 flex gap-3 items-start mb-6">
          <span className="text-green-600 mt-0.5">🔒</span>
          <p className="text-xs text-green-800 leading-relaxed">{t.howWeVerify}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-brand hover:bg-brand-dark active:scale-95 text-white font-semibold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>📤</span>
            <span>{t.shareResult}</span>
          </button>
          <button
            onClick={() => navigate('/check')}
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span>🔍</span>
            <span>{t.checkAnother}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
