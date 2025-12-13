import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import logoImage from '../../assets/image logo/6bea2fd6-9cc9-4f3a-9b66-d644e3e8aba0.jpg'
import { GiTeacher } from "react-icons/gi";

const navLinks = [
  // { label: 'Home', path: '/' },
  // { label: 'Features', path: '/features' },
  // { label: 'Pricing', path: '/pricing' },
  // { label: 'Contact', path: '/contact' }
]

const modeButtons = [
  {
    label: 'Translator',
    path: '/translator',
    badgeClass: 'bg-indigo-100 text-indigo-600',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h9M4 12h9M4 19h9" strokeLinecap="round" />
        <path d="M15 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: 'Chatbot',
    path: '/chatbot',
    badgeClass: 'bg-emerald-100 text-emerald-600',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M4 8a6 6 0 016-6h4a6 6 0 016 6v4a6 6 0 01-6 6h-1.5L10 22v-4H10a6 6 0 01-6-6V8z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="11" r="1" />
        <circle cx="14" cy="11" r="1" />
      </svg>
    )
  },
  {
    label: 'Word Learning',
    path: '/word-translate',
    badgeClass: 'bg-amber-100 text-amber-600',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: 'Class',
    path: '/class',
    badgeClass: 'bg-violet-100 text-violet-600',
    icon: (
      <GiTeacher className="h-4 w-4" />
    )
  },
  {
    label: 'Learning Path',
    path: '/learning-path',
    badgeClass: 'bg-rose-100 text-rose-600',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
]

const HeaderPage = () => {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const token = localStorage.getItem('token')

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      // Wait for logout to complete
      await dispatch(logout()).unwrap()
      // Clear any other stored data
      localStorage.removeItem('accessToken')
      // Navigate after logout completes
      navigate('/login', { replace: true })
    } catch (error) {
      // Even if logout fails, clear local storage and navigate
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      navigate('/login', { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Use cached user data from localStorage for immediate rendering
  // This prevents flickering - show logged-in state immediately if we have cached data
  const cachedUser = (() => {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  })()

  // Show logged-in state if we have user (from Redux or cache) and token exists
  // This ensures no flicker - we show logged-in state immediately on reload
  const isUserLoggedIn = (isAuthenticated && user) || (token && cachedUser)
  const displayUser = user || cachedUser // Use Redux user if available, otherwise cached

  return (
    <div className="flex w-full items-center justify-between px-6 py-4 md:px-12">
      <Link to="/" className="flex items-center gap-2">
        <img 
          src={logoImage} 
          alt="Prime-Education Logo" 
          className="h-10 w-auto object-contain rounded-xl"
        />
        <span className="text-xl font-bold tracking-tight text-slate-900">
          Prime-Education
        </span>
      </Link>
    
      <nav className="hidden gap-6 text-sm font-medium text-slate-600 sm:flex">
        {navLinks.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `transition hover:text-indigo-600 ${isActive ? 'text-indigo-600' : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    
      <div className="hidden items-center gap-2 md:flex">
        {modeButtons.map(({ label, badgeClass, icon, path }) => {
          const isLocked = !isUserLoggedIn
          return (
            <div key={label} className="relative group">
              {isLocked ? (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-all duration-300 cursor-pointer opacity-60 hover:opacity-100 hover:border-amber-300 hover:shadow-lg hover:scale-105 hover:bg-amber-50/30 active:scale-95 relative group/button"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 group-hover/button:scale-110 ${badgeClass} opacity-50 group-hover/button:opacity-70`}
                  >
                    {icon}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 transition-colors duration-300 group-hover/button:text-slate-700">
                    {label}
                  </span>
                  {/* Lock icon with animation */}
                  <svg
                    className="h-4 w-4 text-slate-400 absolute -top-1 -right-1 transition-all duration-300 group-hover/button:scale-125 group-hover/button:text-amber-500 group-hover/button:rotate-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </button>
              ) : (
                <Link
                  to={path}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-transform duration-300 group-hover:scale-110 ${badgeClass}`}
                  >
                    {icon}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 transition-colors duration-300 group-hover:text-indigo-600">
                    {label}
                  </span>
                </Link>
              )}
            </div>
          )
        })}
      </div>
    
      <div className="flex items-center gap-3">
        {isUserLoggedIn ? (
          <>
            <div className="hidden text-sm font-medium text-slate-700 md:block">
              Hi, {displayUser?.name || 'User'}
            </div>
            {displayUser?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Admin
              </Link>
            )}
            {/* <Link
              to="/dashboard"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600"
            >
              Dashboard
            </Link> */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </>
              ) : (
                'Logout'
              )}
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default HeaderPage