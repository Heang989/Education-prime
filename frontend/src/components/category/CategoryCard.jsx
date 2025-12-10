import React, { useState, useRef } from 'react'

const CategoryCard = ({ category, onClick }) => {
    const [isPlaying, setIsPlaying] = useState(false)
    // Use useRef to persist audio object across renders (performance optimization)
    const audioRef = useRef(new Audio())

    const handlePlayAudio = (e) => {
        e.stopPropagation() // Prevent card click when clicking audio button

        const audio = audioRef.current

        if (isPlaying) {
            audio.pause()
            audio.currentTime = 0
            setIsPlaying(false)
            return
        }

        // For demo purposes, we'll use text-to-speech or just show the action
        // In production, this would load the actual audio file
        setIsPlaying(true)

        // Simulate audio playback
        setTimeout(() => {
            setIsPlaying(false)
        }, 2000)

        // Uncomment this when you have actual audio files:
        // audio.src = category.audioUrl
        // audio.play()
        // audio.onended = () => setIsPlaying(false)
    }

    return (
        <div
            onClick={() => onClick && onClick(category)}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:ring-indigo-500/50 cursor-pointer"
        >
            {/* Background decoration */}
            <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${category.bgColor} opacity-50 blur-2xl transition-all duration-300 group-hover:scale-150`}></div>

            {/* Type labels - support multiple types */}
            <div className="relative mb-4 flex flex-wrap gap-1.5">
                {(Array.isArray(category.type) ? category.type : (category.type ? [category.type] : ['General'])).map((type, idx) => (
                    <span 
                        key={idx}
                        className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 break-words leading-tight max-w-[200px]"
                        title={type}
                    >
                        <span className="block line-clamp-2">{type}</span>
                    </span>
                ))}
            </div>

            {/* Icon */}
            <div className="relative mb-6 flex justify-center">
                <div className={`flex h-24 w-24 items-center justify-center rounded-2xl overflow-hidden ${category.icon && (category.icon.startsWith('data:image') || category.icon.startsWith('/uploads/')) ? 'bg-white/5' : category.bgColor} ${category.icon && (category.icon.startsWith('data:image') || category.icon.startsWith('/uploads/')) ? '' : 'text-5xl'} transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}>
                    {category.icon && (category.icon.startsWith('data:image') || category.icon.startsWith('/uploads/')) ? (
                        <img
                            src={category.icon.startsWith('/uploads/') ? `http://localhost:5000${category.icon}` : category.icon}
                            alt={category.englishName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        category.icon
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="relative text-center">
                {/* English Name */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {category.englishName}
                </h3>

                {/* Khmer Name */}
                <p className="text-2xl font-bold text-slate-800 mb-1">
                    {category.khmerName}
                </p>

                {/* Chinese Name (optional) */}
                {category.chineseName && (
                    <p className="text-xl font-semibold text-emerald-700 mb-1">
                        {category.chineseName}
                    </p>
                )}

                {/* Phonetic */}
                <p className="text-sm text-slate-500 mb-4">
                    {category.phonetic}
                </p>

                {/* Play Audio Button */}
                <button
                    onClick={handlePlayAudio}
                    disabled={isPlaying}
                    className={`w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 ${isPlaying
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 hover:shadow-orange-500/30'
                        }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        {isPlaying ? (
                            <>
                                <svg className="h-5 w-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                                Playing...
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                </svg>
                                Play Audio
                            </>
                        )}
                    </span>
                </button>
            </div>
        </div>
    )
}

export default CategoryCard
