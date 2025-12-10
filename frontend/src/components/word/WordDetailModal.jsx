import React from 'react'

const WordDetailModal = ({ word, onClose }) => {
    if (!word) return null

    const hasLongContent = (word.definition && word.definition.length > 200) || 
                          (word.notes && word.notes.length > 200) ||
                          (word.usage && word.usage.length > 200)

    const image = word.image || '📝'
    const types = word.types || (word.category ? [word.category] : ['general'])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-slate-900">{word.english}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Image/Icon */}
                    <div className="flex justify-center">
                        <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                            {image && (image.startsWith('data:image') || image.startsWith('/uploads/')) ? (
                                <img
                                    src={image.startsWith('/uploads/') ? `http://localhost:5000${image}` : image}
                                    alt={word.english}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                        const fallback = e.target.parentElement.querySelector('.image-fallback')
                                        if (fallback) fallback.style.display = 'block'
                                    }}
                                />
                            ) : (
                                <span className="text-9xl">{image}</span>
                            )}
                            <span className="image-fallback text-9xl hidden">📝</span>
                        </div>
                    </div>

                    {/* Main Translation */}
                    <div className="text-center space-y-2">
                        <h3 className="text-4xl font-bold text-slate-900">{word.khmer}</h3>
                        {word.romanized && (
                            <p className="text-lg text-slate-600">{word.romanized}</p>
                        )}
                        {word.chinese && (
                            <p className="text-xl font-semibold text-emerald-600">{word.chinese}</p>
                        )}
                    </div>

                    {/* Type Badges */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {types.map((type, idx) => {
                            const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
                            return (
                                <span
                                    key={idx}
                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200"
                                >
                                    {typeLabel}
                                </span>
                            )
                        })}
                    </div>

                    {/* Example */}
                    {word.example && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                            <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                                <span>💡</span> Example
                            </h4>
                            <p className="text-slate-700 leading-relaxed">{word.example}</p>
                        </div>
                    )}

                    {/* Definition */}
                    {word.definition && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <span>📖</span> Definition
                            </h4>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{word.definition}</p>
                        </div>
                    )}

                    {/* Usage */}
                    {word.usage && (
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                            <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                <span>🔧</span> Usage
                            </h4>
                            <p className="text-slate-700 leading-relaxed">{word.usage}</p>
                        </div>
                    )}

                    {/* Notes */}
                    {word.notes && (
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                            <h4 className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                                <span>📝</span> Notes
                            </h4>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{word.notes}</p>
                        </div>
                    )}

                    {/* Audio Button */}
                    <button className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-base font-semibold text-white cursor-pointer transition hover:from-amber-600 hover:to-orange-600 shadow-lg">
                        🔊 Play Audio
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WordDetailModal

