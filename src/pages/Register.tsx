import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { isFirebaseEnabled } from "../lib/firebase"

function friendlyAuthError(code?: string, fallback?: string) {
  switch (code) {
    case 'auth/invalid-email': return 'Please enter a valid email.'
    case 'auth/email-already-in-use': return 'Email already in use. Try logging in.'
    case 'auth/weak-password': return 'Use a stronger password (6+ characters).'
    case 'auth/network-request-failed': return 'Network issue. Check your connection and try again.'
    case 'auth/operation-not-allowed': return 'Enable Email/Password under Firebase Authentication → Sign-in method.'
    case 'app/not-configured': return 'Firebase is not configured. Add VITE_FIREBASE_* in .env, enable Email/Password in Firebase, then restart the dev server.'
    default: return fallback || 'Something went wrong. Please try again.'
  }
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.562 2.684-3.86 2.684-6.616z" fill="#4285F4" fillRule="evenodd"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.048 13.56c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.716H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" fillRule="evenodd"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" fillRule="evenodd"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" fillRule="evenodd"/>
  </svg>
)

export default function Register() {
  const { user, loading, signInGoogle, signUpEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [msgType, setMsgType] = useState<'info'|'error'|'success'>('info')
  const [introLoading, setIntroLoading] = useState(true)

  useEffect(() => { const t = setTimeout(() => setIntroLoading(false), 800); return () => clearTimeout(t) }, [])
  useEffect(() => { if (!loading && user) navigate('/') }, [loading, user, navigate])

  async function handleGoogleSignup() {
    setMsg(null); setMsgType('info')
    try {
      setPending(true)
      await signInGoogle()
      setMsg('Signed up with Google.')
      setMsgType('success')
    } catch (e: any) {
      setMsg(friendlyAuthError(e?.code, e?.message))
      setMsgType('error')
    } finally {
      setPending(false)
    }
  }

  async function handleEmailSignup(e?: FormEvent) {
    e?.preventDefault()
    setMsg(null); setMsgType('info')
    if (!email || !password) { setMsg('Enter email and password'); setMsgType('error'); return }
    if (password.length < 6) { setMsg('Use a stronger password (6+ characters).'); setMsgType('error'); return }
    try {
      setPending(true)
      await signUpEmail(email, password)
      setMsg('Account created. Welcome!')
      setMsgType('success')
      navigate('/')
    } catch (e: any) {
      setMsg(friendlyAuthError(e?.code, e?.message))
      setMsgType('error')
    } finally {
      setPending(false)
    }
  }

  if (introLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600"
        >
          GENIBI
        </motion.h1>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6 py-12">
      {/* background accents */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 0.6, scale: 1 }} transition={{ duration: 1 }}
          className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-mint-200 opacity-30 blur-xl absolute -top-16 -left-20" />
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 0.5, scale: 1 }} transition={{ duration: 1 }}
          className="w-80 h-80 md:w-[28rem] md:h-[28rem] rounded-full bg-lavender-200 opacity-30 blur-xl absolute bottom-0 right-0" />
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-8">
        {/* brand text */}
        <h1 className="text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600 mb-6">Create your account</h1>

        {/* setup guidance when not configured */}
        {!isFirebaseEnabled && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
            Email/password sign-up requires Firebase configuration. Add VITE_FIREBASE_* values in <code>.env</code>, enable Email/Password in Firebase Authentication, then restart the dev server.
          </div>
        )}

        {/* Email form */}
        <form className="grid gap-4" onSubmit={handleEmailSignup}>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
            <input id="email" type="email" autoComplete="email" autoFocus value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email address" className="w-full px-3 py-3 rounded-xl border placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow transition-colors duration-200" disabled={!isFirebaseEnabled} />
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" className="w-full px-3 py-3 rounded-xl border placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 transition-shadow transition-colors duration-200" disabled={!isFirebaseEnabled} />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 cursor-pointer transition-opacity duration-200 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 6c-5 0-9.27 3.11-11 7.5C2.73 17.89 7 21 12 21s9.27-3.11 11-7.5C21.27 9.11 17 6 12 6m0 13a9.77 9.77 0 0 1-8.82-5.5A9.76 9.76 0 0 1 12 8a9.76 9.76 0 0 1 8.82 5.5A9.77 9.77 0 0 1 12 19m0-10a4.5 4.5 0 1 0 4.5 4.5A4.5 4.5 0 0 0 12 9"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M2 3.27L.73 4.54l4.2 4.2A12.39 12.39 0 0 0 1 13.5C2.73 17.89 7 21 12 21a11.7 11.7 0 0 0 5.49-1.41l3 3l1.27-1.27zM12 19a9.77 9.77 0 0 1-8.82-5.5a9.91 9.91 0 0 1 3.69-4.09l2.18 2.18A4.49 4.49 0 0 0 8.5 14A4.5 4.5 0 0 0 13 18.5a4.4 4.4 0 0 0 2.41-.71l1.57 1.57A9.86 9.86 0 0 1 12 19m0-11a4.43 4.43 0 0 1 1.24.18l3.28 3.28A4.46 4.46 0 0 1 15.5 14A4.5 4.5 0 0 1 11 9.5a4.46 4.46 0 0 1 .31-1.62L9.58 6.15A11.93 11.93 0 0 1 12 6c5 0 9.27 3.11 11 7.5a12.14 12.14 0 0 1-4.1 4.76l-1.46-1.46A9.69 9.69 0 0 0 20.82 13.5A9.76 9.76 0 0 0 12 8c-.46 0-.9 0-1.33.07z"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Alternative option */}
          <div className="mt-4 text-center text-sm text-slate-500">or sign up with Google</div>
          <button 
            type="button"
            onClick={handleGoogleSignup}
            disabled={pending || !isFirebaseEnabled}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-white text-[#757575] font-roboto font-medium border border-gray-200 rounded-md px-3 py-3 shadow-sm hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            <div className="bg-white p-0.5 rounded-sm flex items-center justify-center">
              <GoogleIcon />
            </div>
            <span className="text-sm">Sign up with Google</span>
          </button>

          {/* Primary action */}
          <div className="mt-4 grid gap-4">
            <button type="submit" disabled={pending || !isFirebaseEnabled} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white transition-opacity transition-shadow duration-200 disabled:opacity-60 hover:opacity-90 hover:shadow-sm active:scale-[.99]">
              {pending && (<span className="inline-block h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />)}
              Register
            </button>
          </div>

          {/* hint below form */}
          <div className="mt-4 text-center text-sm text-slate-600">
            Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:underline transition-opacity duration-200 hover:opacity-80">Login</button>
          </div>
        </form>

        {/* status messages */}
        {msg && (
          <p aria-live="polite" role="status" className={`mt-3 text-sm rounded-md px-3 py-2 ${
            msgType === "error"
              ? "bg-red-100 text-red-700 border border-red-200"
              : msgType === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-slate-100 text-slate-700 border border-slate-200"
          }`}>
            {msg}
          </p>
        )}

        {loading && <p className="text-xs text-slate-500 mt-3 text-center">Preparing your space...</p>}
      </motion.div>
    </div>
  )
}