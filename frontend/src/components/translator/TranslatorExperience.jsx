import React, { useMemo, useState } from 'react'

const contexts = [
  { label: 'Restaurant', emoji: '🍽️' },
  { label: 'Travel', emoji: '🧳' },
  { label: 'Business', emoji: '💼' },
  { label: 'Chat', emoji: '💬' },
  { label: 'School', emoji: '🎓' },
  { label: 'Slang', emoji: '🤟' },
  { label: 'Polite', emoji: '🙏' },
  { label: 'Formal', emoji: '📝' },
  { label: 'Village', emoji: '🌾' }
]

const examples = ['hello', 'good morning', 'friend', 'help', 'thanks', 'sorry']

export const presetTranslation = {
  primary: 'សួស្តី',
  romanized: 'suos-dai',
  confidence: '99% Confidence',
  alternatives: [
    { tone: 'Formal', value: 'សូមជម្រាបសួរ លោក/លោកស្រី' },
    { tone: 'Informal', value: 'មែនអី?' }
  ],
  definition: 'ការប៉ន់សួរសុខទុក្ខសម្រាប់ការសន្ទនាទូលំទូលាយ។',
  examples: {
    en: '"Hello, how are you?"',
    kh: '"សួស្តី តើអ្នកសុខសប្បាយទេ?"'
  }
}

const TranslatorExperience = ({ showHero = true }) => {
  const [selectedContext, setSelectedContext] = useState('Chat')
  const [inputText, setInputText] = useState('hello')
  const [result, setResult] = useState(presetTranslation)

  const headline = useMemo(
    () => contexts.find(({ label }) => label === selectedContext)?.label ?? 'Chat',
    [selectedContext]
  )

  const handleTranslate = () => {
    setResult({
      ...presetTranslation,
      primary: inputText.trim().length ? presetTranslation.primary : '—'
    })
  }

  const handleClear = () => {
    setInputText('')
    setResult(presetTranslation)
  }

  return (
    <div className="w-full">
      <div className="w-full px-3 sm:px-6 lg:px-0">
        {showHero && (
          <header className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">
              Khmer Translate Pro
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">
              Context-aware English to Khmer translation
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Choose the right cultural tone so every conversation feels natural.
            </p>
          </header>
        )}

        <main className={`${showHero ? 'mt-10' : ''} grid gap-6 lg:grid-cols-2`}>
          <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
            <p className="text-sm font-medium text-slate-500">Select Your Situation</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {contexts.map(({ label, emoji }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedContext(label)}
                  className={`flex items-center justify-center rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                    selectedContext === label
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span className="mr-1 text-lg">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                {headline} mode
              </label>
              <textarea
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Type in English..."
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleTranslate}
                className="flex-1 rounded-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 py-3 text-center text-sm font-semibold text-white transition hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
              >
                Translate
              </button>
              <button
                onClick={handleClear}
                className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
              >
                Clear
              </button>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Try These Examples ({selectedContext.toLowerCase()})
              </p>
              <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-2 text-sm">
                {examples.map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setInputText(sample)}
                    className="w-full rounded-xl border border-transparent px-3 py-2 text-left text-slate-600 transition hover:border-indigo-200 hover:bg-white"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Primary Translation (in {selectedContext.toLowerCase()})
                </p>
                <span className="text-xs font-semibold text-emerald-500">{result.confidence}</span>
              </div>
              <p className="mt-5 text-4xl font-bold text-slate-900">{result.primary}</p>
              <p className="mt-2 text-base text-slate-500">{result.romanized}</p>
              <button className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                🔊 Play Audio
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-500">Alternatives</p>
              <div className="mt-4 space-y-3">
                {result.alternatives.map((item) => (
                  <div key={item.tone} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{item.tone}</p>
                      <p className="mt-1 text-base font-medium text-slate-700">{item.value}</p>
                    </div>
                    <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                      🔊
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5 space-y-3">
              <p className="text-sm font-semibold text-slate-500">Definition</p>
              <p className="text-sm text-slate-600">{result.definition}</p>
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-500">Example (English)</p>
                <p>{result.examples.en}</p>
                <p className="mt-3 font-semibold text-slate-500">Example (Khmer)</p>
                <p>{result.examples.kh}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 rounded-2xl bg-linear-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-semibold text-white ring-2 ring-white transition hover:from-emerald-600 hover:to-cyan-600">
                Save Translation
              </button>
              <button className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:border-slate-300">
                Copy Result
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default TranslatorExperience

