import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderPage from '../header/HeaderPage'

const MasterLayouts = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white/90 backdrop-blur border-b border-slate-100">
        <HeaderPage />
      </header>

      <main className="w-full px-6 py-10 md:px-12">
        <Outlet />
      </main>
    </div>
  )
}

export default MasterLayouts