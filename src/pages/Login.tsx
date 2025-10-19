import { motion } from "framer-motion"
import { useAuth } from "../contexts/AuthContext"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

function friendlyAuthError(code?: string, fallback?: string) {
  switch (code) {
    case 'auth/invalid-email': return 'Please enter a valid email.'
    case 'auth/user-not-found': return 'No account found for that email.'
    case 'auth/wrong-password': return 'Incorrect password. Try again.'
    case 'auth/invalid-credential': return 'Incorrect email or password. Please try again.'
    case 'auth/invalid-login-credentials': return 'Incorrect email or password. Please try again.'
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a minute and try again.'
    case 'auth/network-request-failed': return 'The sign-in service is currently unavailable. Please attempt to sign in again later.'
    case 'auth/email-already-in-use': return 'Email already in use. Try logging in.'
    case 'auth/weak-password': return 'Use a stronger password (6+ characters).'
    case 'auth/popup-closed-by-user': return 'Google sign-in was closed. Please try again.'
    case 'app/not-configured': return 'The sign-in service is currently unavailable. Please attempt to sign in again later.'
    default: return fallback || 'Something went wrong. Please try again.'
  }
}

export default function Login() {
  const { user, loading, signInGoogle, signInEmail, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [msgType, setMsgType] = useState<'info'|'error'|'success'>('info')
  const [introLoading, setIntroLoading] = useState(true)

  useEffect(() => { const t = setTimeout(() => setIntroLoading(false), 1200); return () => clearTimeout(t) }, [])
  useEffect(() => { if (!loading && user) navigate('/') }, [loading, user, navigate])

  async function handleGoogleLogin() {
    setMsg(null); setMsgType('info')
    try {
      setPending(true)
      await signInGoogle()
      setMsg('Signed in with Google.')
      setMsgType('success')
    } catch (e: any) {
      setMsg(friendlyAuthError(e?.code, e?.message))
      setMsgType('error')
    } finally {
      setPending(false)
    }
  }


  async function handleResetPassword() {
    setMsg(null); setMsgType('info')
    if (!email) { setMsg('Enter your email to reset password'); setMsgType('error'); return }
    try {
      setPending(true)
      await resetPassword(email)
      setMsg('Password reset email sent.')
      setMsgType('success')
    } catch (e: any) {
      setMsg(friendlyAuthError(e?.code, e?.message))
      setMsgType('error')
    } finally {
      setPending(false)
    }
  }

  async function handleEmailLogin(e?: FormEvent) {
    e?.preventDefault()
    setMsg(null); setMsgType('info')
    if (!email || !password) { setMsg('Enter email and password'); setMsgType('error'); return }
    try {
      setPending(true)
      await signInEmail(email, password)
      setMsg('Welcome back!')
      setMsgType('success')
    } catch (e: any) {
      setMsg(friendlyAuthError(e?.code, e?.message))
      setMsgType('error')
    } finally {
      setPending(false)
    }
  }


  function handleGuestLogin() {
    setMsg(null); setMsgType('info')
    navigate('/demo')
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
        <h1 className="text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600 mb-6">GENIBI</h1>

        {/* Email form */}
        <form className="grid gap-4" onSubmit={handleEmailLogin}>
         <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
            <input id="email" type="email" autoComplete="email" autoFocus value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email address" className="w-full px-3 py-3 rounded-xl border placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow transition-colors duration-200" />
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-3 py-3 rounded-xl border placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 transition-shadow transition-colors duration-200" />
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
          <div className="mt-4 text-center text-sm text-slate-500">or continue with Google</div>
          <button type="button" onClick={handleGoogleLogin} disabled={pending} className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white transition-opacity transition-shadow duration-200 hover:opacity-90 hover:shadow-sm active:scale-[.99] disabled:opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8c-6.9 0-12.5-5.6-12.5-12.5S17.1 11 24 11c3.2 0 6.2 1.2 8.5 3.3l5.7-5.7C34.7 5.2 29.6 3 24 3C16.8 3 10.3 6.7 6.3 14.7z"/><path fill="#FF3D00" d="m6.3 14.7l6.6 4.8C14.8 16 19.1 13 24 13c3.2 0 6.2 1.2 8.5 3.3l5.7-5.7C34.7 5.2 29.6 3 24 3C16.8 3 10.3 6.7 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.3 0 10.2-2 13.9-5.2l-6.4-5.3C29.9 35.7 27.1 36.6 24 36.6c-5.3 0-9.7-3.3-11.3-8H1.9v5.1C5.6 40.3 14.1 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.7 7.1l6.4 5.3C36.7 42.4 43 37 44.9 29.5c.2-.8.3-1.7.3-2.5c0-1.2-.1-2.3-.3-3.5z"/></svg>
            Continue with Google
          </button>

          {/* Centered primary actions */}
          <div className="mt-4 grid gap-4">
            <button type="submit" disabled={pending} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white transition-opacity transition-shadow duration-200 disabled:opacity-60 hover:opacity-90 hover:shadow-sm active:scale-[.99]">
              {pending && (<span className="inline-block h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />)}
              Login
            </button>
            <button type="button" onClick={handleGuestLogin} disabled={pending} className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-700 bg-white transition-opacity transition-shadow duration-200 hover:opacity-90 hover:shadow-sm active:scale-[.99] disabled:opacity-60">Continue as guest</button>
          </div>

          {/* Forgot password link */}
          <div className="mt-4 text-center">
            <button type="button" onClick={handleResetPassword} className="text-blue-600 hover:underline text-sm transition-opacity duration-200 hover:opacity-80">Forgot password?</button>
          </div>
        </form>

        {/* hint below form */}
        <div className="mt-4 text-center text-sm text-slate-600">
        Don't have an account? <button type="button" onClick={() => navigate('/register')} className="text-blue-600 hover:underline transition-opacity duration-200 hover:opacity-80">Register</button>
        </div>


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