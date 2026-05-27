import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Tesseract from 'tesseract.js'
import { useLanguage } from '../context/LanguageContext'

const API = import.meta.env.VITE_API_URL

export default function Check() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState('')
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  // ── VOICE INPUT ──────────────────────────────────────────────
  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input not supported. Try Chrome on Android.')
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.onstart = () => setListening(true)
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript
      setText(prev => prev ? prev + ' ' + spoken : spoken)
    }
    recognition.onerror = (e) => {
      setListening(false)
      if (e.error === 'not-allowed') alert('Allow microphone access in browser settings.')
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }

  // ── SCREENSHOT → OCR ─────────────────────────────────────────
  async function handleScreenshot(e) {
    const file = e.target.files[0]
    if (!file) return
    setProcessing('Reading image...')
    setError('')
    try {
      const { data: { text: extracted } } = await Tesseract.recognize(file, 'eng+hin', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProcessing(`Reading image... ${Math.round(m.progress * 100)}%`)
          }
        }
      })
      const cleaned = extracted.trim()
      if (cleaned.length < 5) {
        setError('Could not read text from image. Try a clearer screenshot.')
      } else {
        setText(cleaned)
      }
    } catch {
      setError('Failed to read image. Please try again.')
    } finally {
      setProcessing('')
      e.target.value = ''
    }
  }

  // ── LINK FETCH ───────────────────────────────────────────────
  async function handleLink() {
    const url = prompt('Paste the link you want to fact-check:')
    if (!url) return
    if (!url.startsWith('http')) {
      setError('Please enter a valid URL starting with http or https')
      return
    }
    setProcessing('Fetching link content...')
    setError('')
    try {
      const res = await axios.post(`${API}/api/fetch-link`, { url })
      if (res.data.text) {
        setText(res.data.text.slice(0, 2000))
      } else {
        setError('Could not extract text from that link.')
      }
    } catch {
      setError('Could not fetch that link. Try copying the text manually.')
    } finally {
      setProcessing('')
    }
  }

  // ── VOICE NOTE → TRANSCRIPTION ───────────────────────────────
  async function handleVoiceNote(e) {
    const file = e.target.files[0]
    if (!file) return
    setProcessing('Transcribing audio...')
    setError('')
    try {
      const formData = new FormData()
      formData.append('audio', file)
      const res = await axios.post(`${API}/api/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data.text) {
        setText(res.data.text)
      } else {
        setError('Could not transcribe audio. Try a clearer recording.')
      }
    } catch {
      setError('Transcription failed. Please try again.')
    } finally {
      setProcessing('')
      e.target.value = ''
    }
  }

  // ── PDF → TEXT ───────────────────────────────────────────────
  async function handlePDF(e) {
    const file = e.target.files[0]
    if (!file) return
    setProcessing('Reading PDF...')
    setError('')
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ''
      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map(item => item.str).join(' ') + '\n'
      }
      const cleaned = fullText.trim()
      if (cleaned.length < 5) {
        setError('Could not extract text from PDF. Try a text-based PDF.')
      } else {
        setText(cleaned.slice(0, 2000))
      }
    } catch {
      setError('Failed to read PDF. Please try again.')
    } finally {
      setProcessing('')
      e.target.value = ''
    }
  }

  // ── SUBMIT ───────────────────────────────────────────────────
  async function handleSubmit() {
    if (text.trim().length < 5) {
      setError('Please enter at least a few words to check.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/check`, { text: text.trim() })
      navigate('/result', { state: { result: res.data, originalText: text } })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{t.checkBtn}</h1>
        <p className="text-sm text-gray-500 mb-6">{t.tagline}</p>

        {/* Text input */}
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

        {/* Processing indicator */}
        {processing && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-3">
            <span className="animate-spin text-blue-500">⏳</span>
            <span className="text-sm text-blue-700">{processing}</span>
          </div>
        )}

        {/* Upload options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">

          {/* Screenshot */}
          <label className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 cursor-pointer hover:border-brand hover:bg-brand-light transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
            <span className="text-2xl">🖼️</span>
            <span className="text-xs font-medium text-gray-700">Screenshot</span>
            <span className="text-xs text-gray-400">JPG, PNG</span>
          </label>

          {/* Link */}
          <div
            onClick={handleLink}
            className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 cursor-pointer hover:border-brand hover:bg-brand-light transition-colors"
          >
            <span className="text-2xl">🔗</span>
            <span className="text-xs font-medium text-gray-700">Paste a link</span>
            <span className="text-xs text-gray-400">Any URL</span>
          </div>

          {/* Voice note */}
          <label className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 cursor-pointer hover:border-brand hover:bg-brand-light transition-colors">
            <input type="file" accept="audio/*" className="hidden" onChange={handleVoiceNote} />
            <span className="text-2xl">🎙️</span>
            <span className="text-xs font-medium text-gray-700">Voice note</span>
            <span className="text-xs text-gray-400">MP3, OGG</span>
          </label>

          {/* PDF */}
          <label className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 cursor-pointer hover:border-brand hover:bg-brand-light transition-colors">
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handlePDF} />
            <span className="text-2xl">📄</span>
            <span className="text-xs font-medium text-gray-700">PDF / Doc</span>
            <span className="text-xs text-gray-400">PDF, DOCX</span>
          </label>

        </div>

        {/* Trust bar */}
        <div className="bg-brand-light border border-green-200 rounded-xl p-3 flex gap-3 items-start mb-6">
          <span className="text-green-600 mt-0.5">🔒</span>
          <p className="text-xs text-green-800 leading-relaxed">{t.howWeVerify}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
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
            <><span className="animate-spin">⏳</span><span>{t.loading}</span></>
          ) : (
            <><span>🔍</span><span>{t.checkNow}</span></>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">{t.disclaimer}</p>

      </div>
    </div>
  )
}
