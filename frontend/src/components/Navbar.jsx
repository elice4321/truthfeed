import { useLanguage } from '../context/LanguageContext'

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="text-lg font-semibold text-gray-900">
        Truth<span className="text-brand">Feed</span>
      </div>
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-1 text-sm font-medium transition-colors ${
            lang === 'en'
              ? 'bg-brand text-white'
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('hi')}
          className={`px-3 py-1 text-sm font-medium transition-colors ${
            lang === 'hi'
              ? 'bg-brand text-white'
              : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          हिं
        </button>
      </div>
    </nav>
  )
}