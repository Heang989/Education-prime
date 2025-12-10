import React, { useState } from 'react'
import TranslatorExperience, {
  presetTranslation
} from '../../components/translator/TranslatorExperience'

const initialMessages = [
  { role: 'bot', text: 'Hi! I am your Khmer context coach. What do you need to say?' },
  { role: 'user', text: 'How do I say “good evening” politely?' },
  {
    role: 'bot',
    text: 'Try “សួស្តី នៅពេលល្ងាច” for polite conversations. Want me to tailor it further?'
  }
]

const HomePage = () => {
  const [chatMessages, setChatMessages] = useState(initialMessages)
  const [chatInput, setChatInput] = useState('')

  const handleChatSend = () => {
    const trimmed = chatInput.trim()
    if (!trimmed.length) return

    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      {
        role: 'bot',
        text: `Here is how you can say “${trimmed}” in conversational tone: ${presetTranslation.primary}. I will send it to the translator for fine-tuning.`
      }
    ])
    setChatInput('')
  }

  return (
    <div className="w-full space-y-16">
      <TranslatorExperience />

      <section
        id="chatbot"
        className="mx-3 grid gap-8 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5 sm:mx-6 lg:mx-0 lg:grid-cols-2"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
            Conversational planning
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">AI Chatbot for translation</h2>
          <p className="mt-3 text-base text-slate-600">
            Map out your conversation with a chatbot that understands tone, audience, and intent
            before you generate the final Khmer copy. This flow keeps the user focused on goals:
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                1
              </span>
              Draft what you want to say and let the bot clarify context or preferred tone.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                2
              </span>
              Confirm the audience (friend, elder, customer) so the translator can adjust nuance.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                3
              </span>
              Send the refined prompt to the translation engine with one tap.
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-5 shadow-inner">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Chat prototype
              </p>
              <p className="text-sm text-slate-500">Simulated responses for planning</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
              Coming soon
            </span>
          </div>

          <div className="h-72 space-y-3 overflow-y-auto rounded-2xl bg-white p-4">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                    {message.role === 'user' ? 'You' : 'Bot'}
                  </p>
                  <p className="mt-1">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask the bot how to translate..."
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              onClick={handleChatSend}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage