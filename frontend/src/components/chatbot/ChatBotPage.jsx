import React, { useState, useRef, useEffect } from 'react'

const quickPrompts = [
  { emoji: '🍽️', text: 'How do I order food in Khmer?', category: 'Restaurant' },
  { emoji: '🧳', text: 'Common travel phrases', category: 'Travel' },
  { emoji: '💼', text: 'Business greetings in Khmer', category: 'Business' },
  { emoji: '🎓', text: 'School vocabulary', category: 'School' },
  { emoji: '🙏', text: 'Polite expressions', category: 'Polite' },
  { emoji: '💬', text: 'Casual conversation starters', category: 'Chat' }
]

const sampleResponses = {
  default: {
    text: "I'm your Khmer language assistant! I can help you with translations, cultural context, pronunciation, and conversational practice. Try asking me about common phrases, grammar, or specific situations!",
    khmer: "ខ្ញុំជាជំនួយការភាសាខ្មែររបស់អ្នក!",
    suggestions: ['Translate a phrase', 'Explain grammar', 'Practice conversation']
  },
  restaurant: {
    text: "Here are some essential restaurant phrases in Khmer:\n\n• \"I would like to order\" - ខ្ញុំចង់បញ្ជាទិញ (khnhom chong ban-jea-tinh)\n• \"The menu, please\" - សូមម៉ឺនុយ (som menu)\n• \"How much is this?\" - តម្លៃប៉ុន្មាន? (tom-lai bon-marn?)\n• \"Delicious!\" - ឆ្ងាញ់! (chhngahn!)",
    khmer: "ឃ្លាសំខាន់ៗក្នុងភោជនីយដ្ឋាន",
    suggestions: ['More food vocabulary', 'Dietary restrictions', 'Paying the bill']
  },
  travel: {
    text: "Essential travel phrases:\n\n• \"Where is...?\" - ...នៅឯណា? (...nov ae-na?)\n• \"How do I get to...?\" - ទៅ...យ៉ាងម៉េច? (tov...yang mech?)\n• \"I need help\" - ខ្ញុំត្រូវការជំនួយ (khnhom trov-kar chom-nuoy)\n• \"Thank you\" - អរគុណ (or-kun)",
    khmer: "ឃ្លាសម្រាប់ការធ្វើដំណើរ",
    suggestions: ['Directions', 'Transportation', 'Emergency phrases']
  }
}

const ChatBotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "សួស្តី! Hello! I'm your Khmer language assistant. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = (text = inputText) => {
    if (!text.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const responseKey = text.toLowerCase().includes('food') || text.toLowerCase().includes('order') || text.toLowerCase().includes('restaurant')
        ? 'restaurant'
        : text.toLowerCase().includes('travel') || text.toLowerCase().includes('direction')
          ? 'travel'
          : 'default'

      const response = sampleResponses[responseKey]

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response.text,
        khmer: response.khmer,
        suggestions: response.suggestions,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickPrompt = (prompt) => {
    handleSendMessage(prompt)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="px-3 text-center sm:px-6 lg:px-0">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
          AI Chatbot Assistant
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          Learn Khmer Through Conversation
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Practice real-world scenarios, get instant translations, and understand cultural context.
        </p>
      </div>

      {/* Main Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Chat Area */}
        <div className="flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Khmer AI Assistant</h3>
                <p className="flex items-center gap-1 text-xs text-emerald-500">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                  Online
                </p>
              </div>
            </div>
            <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
              Clear Chat
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6" style={{ maxHeight: '500px', minHeight: '500px' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.type === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-slate-50 text-slate-800'
                    }`}
                >
                  {message.khmer && (
                    <p className="mb-2 text-xs font-semibold opacity-70">{message.khmer}</p>
                  )}
                  <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                  {message.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickPrompt(suggestion)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-100 p-4">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-4">
          {/* Quick Prompts */}
          <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/5">
            <h3 className="text-sm font-semibold text-slate-900">Quick Prompts</h3>
            <p className="mt-1 text-xs text-slate-500">Start with common questions</p>
            <div className="mt-4 space-y-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <span className="mr-2 text-base">{prompt.emoji}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 p-5 ring-1 ring-indigo-100">
            <h3 className="text-sm font-semibold text-slate-900">✨ Features</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Context-aware translations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Cultural insights & explanations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Pronunciation guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Real-world scenarios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>Interactive learning</span>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/5">
            <h3 className="text-sm font-semibold text-slate-900">Your Progress</h3>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Messages</span>
                  <span className="font-semibold text-slate-900">{messages.length}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500"
                    style={{ width: `${Math.min((messages.length / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 p-3 text-center">
                <p className="text-xs text-slate-600">Keep chatting to unlock</p>
                <p className="mt-1 text-sm font-bold text-emerald-600">🏆 Conversation Master</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBotPage