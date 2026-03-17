import { useState, useEffect } from 'react'
import { isAuthPromptDismissed, dismissAuthPrompt } from '../logic/storage'

export default function AuthPrompt({ user, signIn }) {
  const [dismissed, setDismissed] = useState(isAuthPromptDismissed())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Show success toast briefly when user signs in
  useEffect(() => {
    if (user && !dismissed) {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [user, dismissed])

  // Success toast — auto-dismisses after 3 seconds
  if (showSuccess) {
    return (
      <div
        className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between animate-slide-up"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #bbf7d0',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#10b981', flexShrink: 0,
            }}
          />
          <span className="text-sm font-medium" style={{ color: '#15803d', fontFamily: 'var(--font-body)' }}>
            Connected — colleagues can see your time off
          </span>
        </div>
        <button
          onClick={() => setShowSuccess(false)}
          className="text-sm px-2 py-1"
          style={{ color: '#15803d' }}
        >
          ✕
        </button>
      </div>
    )
  }

  // Already signed in (returning user) — show nothing
  if (user) return null

  // Dismissed — don't show
  if (dismissed) return null

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    const result = await signIn()
    if (result?.error) {
      setError(result.error.message)
      setLoading(false)
    }
    // On success, Google redirects the browser — no further action needed
  }

  function handleDismiss() {
    dismissAuthPrompt()
    setDismissed(true)
  }

  return (
    <div
      className="rounded-2xl p-5 mb-4 animate-slide-up relative"
      style={{
        background: 'linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%)',
        border: '1px solid #ddd6fe',
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-sm px-2 py-1 rounded-lg"
        style={{ color: 'var(--color-muted)' }}
        aria-label="Dismiss"
      >
        ✕
      </button>
      <p className="text-2xl mb-2" role="img" aria-label="team">
        👥
      </p>
      <p
        className="font-semibold text-sm mb-1"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}
      >
        See when colleagues are off
      </p>
      <p className="text-sm mb-3" style={{ color: 'var(--color-muted)' }}>
        Connect your account to see colored dots on the calendar when a colleague has time off planned.
      </p>
      {error && (
        <p className="text-sm mb-2" style={{ color: 'var(--color-danger)' }}>{error}</p>
      )}
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
        style={{
          background: 'white',
          color: '#3c4043',
          border: '1px solid #dadce0',
          fontFamily: 'var(--font-body)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        {loading ? 'Connecting...' : 'Sign in with Google'}
      </button>
    </div>
  )
}
