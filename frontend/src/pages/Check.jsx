import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useLanguage } from '../context/LanguageContext'

const API = import.meta.env.VITE_API_URL

export default function Check() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  // voice input using browser Web Speech API — free, no API key
  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser. Try Chrome.')
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN' // works for both Hindi and English
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript
      setText(prev => prev ? prev + ' ' + spoken : spoken)
      setListening(false)
    }

    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  async function handleSubmit() {
    if (text.trim().length < 5) {
      setError('Please enter at least a few words to check.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/check`, { text: text.trim() })
      // pass result to Result page via navigation state
      navigate('/result', { state: { result: res.data, originalText: text } })
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          {t.checkBtn}
        </h1>
        <p className="text-sm text-gray-500 mb-6">{t.tagline}</p>

        {/* Text input area */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 focus-within:border-brand transition-colors">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t.checkPlaceholder}
            rows={5}
            className="w-full text-sm sm:text-base text-gray-900 placeholder-gray-400 resize-none outline-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{text.length} / 2000</span>
            <button
              onClick={toggleVoice}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                listening
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-brand-light border-green-200 text-green-700 hover:bg-green-100'
              }`}
            >
              <span>{listening ? '⏹' : '🎤'}</span>
              <span>{listening ? t.listening : t.speakInstead}</span>
            </button>
          </div>
        </div>

        {/* Upload options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: '🖼️', label: 'Screenshot', sub: 'JPG, PNG' },
            { icon: '🔗', label: 'Paste a link', sub: 'Any URL' },
            { icon: '🎙️', label: 'Voice note', sub: 'MP3, OGG' },
            { icon: '📄', label: 'PDF / Doc', sub: 'PDF, DOCX' },
          ].map(item => (
            <div
              key={item.label}
              className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 cursor-pointer hover:border-gray-200 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
              <span className="text-xs text-gray-400">{item.sub}</span>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="bg-brand-light border border-green-200 rounded-xl p-3 flex gap-3 items-start mb-6">
          <span className="text-green-600 text-base mt-0.5">🔒</span>
          <p className="text-xs text-green-800 leading-relaxed">{t.howWeVerify}</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || text.trim().length < 5}
          className={`w-full font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-3 transition-all shadow-sm ${
            loading || text.trim().length < 5
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-brand hover:bg-brand-dark active:scale-95 text-white'
          }`}
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>{t.loading}</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span>{t.checkNow}</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">{t.disclaimer}</p>

      </div>
    </div>
  )
}
