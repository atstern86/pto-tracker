import { useState, useEffect } from 'react'
import { isInstallDismissed } from '../logic/storage'

function ShareIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle' }}>
      <line x1="9" y1="1" x2="9" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <polyline points="6,4 9,1 12,4" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 7H3C2.45 7 2 7.45 2 8V15C2 15.55 2.45 16 3 16H15C15.55 16 16 15.55 16 15V8C16 7.45 15.55 7 15 7H13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    if (isIOS && !isStandalone && !isInstallDismissed()) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div
      className="fixed left-4 right-4 z-40 rounded-2xl shadow-xl p-5 animate-slide-up"
      style={{
        bottom: 'calc(5rem + env(safe-area-inset-bottom))',
        background: 'var(--color-surface)',
        border: '1px solid #e9d5ff',
      }}
    >
      <div className="mb-3">
        <div
          className="font-bold"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Install First 📲
        </div>
      </div>
      <p className="text-sm mb-3" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
        Add to your home screen first — then set up your profile. Your data only saves inside the installed app, not in Safari.
      </p>

      {/* Toolbar diagram */}
      <div
        className="rounded-xl p-3 mb-3 text-center text-xs"
        style={{
          background: 'var(--color-primary-light, #ede9fe)',
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-body)',
          lineHeight: '1.8',
        }}
      >
        <div className="text-sm font-medium mb-1">Browser Toolbar</div>
        <div
          className="rounded-lg px-3 py-2 inline-flex items-center gap-3 text-sm font-medium mx-auto"
          style={{ background: 'white', color: 'var(--color-text)' }}
        >
          <span>◀</span>
          <span>▶</span>
          <span style={{ flex: 1, textAlign: 'center' }}>pto-tracker.netlify.app</span>
          <ShareIcon size={18} color="var(--color-primary)" />
          <span>⋯</span>
        </div>
        <div className="mt-1">↑ tap the share icon</div>
      </div>

      <div
        className="flex items-center gap-2 text-sm rounded-xl p-3 mb-2"
        style={{
          background: 'var(--color-primary-light, #ede9fe)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>1️⃣</span>
        <span>Tap the <strong>Share</strong> button <ShareIcon size={14} color="var(--color-primary)" /> at the bottom of Safari</span>
      </div>
      <div
        className="flex items-center gap-2 text-sm rounded-xl p-3"
        style={{
          background: 'var(--color-primary-light, #ede9fe)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>2️⃣</span>
        <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
      </div>
    </div>
  )
}
