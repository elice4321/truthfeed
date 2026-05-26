export default function VerdictBadge({ verdict, confidence }) {
  const verdictStyles = {
    TRUE:       'bg-green-100 text-green-800 border-green-300',
    FALSE:      'bg-red-100 text-red-800 border-red-300',
    MISLEADING: 'bg-amber-100 text-amber-800 border-amber-300',
    UNVERIFIED: 'bg-purple-100 text-purple-800 border-purple-300',
  }

  const confidenceDot = {
    high:          'bg-green-500',
    medium:        'bg-amber-500',
    low:           'bg-purple-500',
    unverifiable:  'bg-gray-400',
  }

  const icons = {
    TRUE:       '✓',
    FALSE:      '✗',
    MISLEADING: '⚠',
    UNVERIFIED: '?',
  }

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${verdictStyles[verdict] || verdictStyles.UNVERIFIED}`}>
      <span>{icons[verdict] || '?'}</span>
      <span>{verdict}</span>
      <span className={`w-2 h-2 rounded-full ${confidenceDot[confidence] || confidenceDot.unverifiable}`} title={`Confidence: ${confidence}`} />
    </div>
  )
}