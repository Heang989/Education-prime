import React from 'react'
import TranslatorExperience from './TranslatorExperience'

const TranslatorPage = () => {
  return (
    <div className="w-full space-y-10">
      <div className="px-3 text-center sm:px-6 lg:px-0">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">
          Translator workspace
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Deep-dive into Khmer contexts</h1>
        <p className="mt-2 text-base text-slate-500">
          Explore every tone, save presets, and collaborate with teammates inside the dedicated
          translator studio.
        </p>
      </div>

      <TranslatorExperience showHero={false} />
    </div>
  )
}

export default TranslatorPage