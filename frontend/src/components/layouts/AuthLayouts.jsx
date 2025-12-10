import React from 'react'
import { Link, Outlet } from 'react-router-dom'

const AuthLayouts = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

            {/* Decorative Blobs */}
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl filter"></div>
            <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl filter"></div>
            <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-200/20 blur-3xl filter"></div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/20 bg-white/60 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link to="/" className="flex items-center gap-2 transition hover:opacity-80">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
                            <span className="text-xl font-bold">K</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900">Prime-Education</span>
                    </Link>

                    <Link
                        to="/"
                        className="group flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600"
                    >
                        <span className="transition group-hover:-translate-x-1">←</span>
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex min-h-[calc(100vh-73px)] items-center justify-center px-6 py-12">
                <Outlet />
            </main>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/20 bg-white/60 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-6 py-4 text-center text-sm text-slate-600">
                    <p>© 2025 KhmerTranslate. Learn Khmer with confidence.</p>
                </div>
            </div>
        </div>
    )
}

export default AuthLayouts
