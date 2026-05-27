import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const strings = {
  en: {
    appName: 'TruthFeed',
    tagline: 'Know the truth first',
    checkBtn: 'Check any claim',
    todayChecks: 'Forwards checked today',
    misinformation: 'Misinformation caught',
    verifiedNews: "Today's verified news",
    checkPlaceholder: 'Paste any message, news or claim here...',
    speakInstead: 'Speak instead',
    listening: 'Listening...',
    checkNow: 'Check this now',
    disclaimer: 'We never store your personal messages. Checks are anonymous.',
    howWeVerify: 'How we verify: Your message is compared only against articles from BBC, The Hindu & PIB — not AI guesswork. Sources are always shown.',
    loading: 'Checking your forward...',
    verdict_TRUE: 'True',
    verdict_FALSE: 'False',
    verdict_MISLEADING: 'Misleading',
    verdict_UNVERIFIED: 'Unverified',
    confidence_high: 'High confidence',
    confidence_medium: 'Medium confidence',
    confidence_low: 'Low confidence',
    confidence_unverifiable: 'Cannot verify',
    shareResult: 'Share this result',
    checkAnother: 'Check another forward',
  },
  hi: {
    appName: 'TruthFeed',
    tagline: 'सच जानो, फिर आगे बढ़ाओ',
    checkBtn: 'कोई भी दावा जाँचें',
    todayChecks: 'आज जाँचे गए फॉरवर्ड',
    misinformation: 'पकड़ी गई अफवाहें',
    verifiedNews: 'आज की सत्यापित खबरें',
    checkPlaceholder: 'कोई भी मैसेज, खबर या दावा यहाँ पेस्ट करें...',,
    speakInstead: 'बोलकर जाँचें',
    listening: 'सुन रहे हैं...',
    checkNow: 'अभी जाँचें',
    disclaimer: 'आपके मैसेज कभी सेव नहीं होते। जाँच पूरी तरह गुमनाम है।',
    howWeVerify: 'हम कैसे जाँचते हैं: आपका मैसेज सिर्फ BBC, The Hindu और PIB के असली लेखों से मिलाया जाता है।',
    loading: 'आपका फॉरवर्ड जाँचा जा रहा है...',
    verdict_TRUE: 'सच',
    verdict_FALSE: 'झूठ',
    verdict_MISLEADING: 'भ्रामक',
    verdict_UNVERIFIED: 'असत्यापित',
    confidence_high: 'उच्च विश्वास',
    confidence_medium: 'मध्यम विश्वास',
    confidence_low: 'कम विश्वास',
    confidence_unverifiable: 'सत्यापित नहीं हो सकता',
    shareResult: 'यह परिणाम शेयर करें',
    checkAnother: 'दूसरा फॉरवर्ड जाँचें',
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = strings[lang]
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}