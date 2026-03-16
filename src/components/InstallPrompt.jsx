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

      {/* Step 1 */}
      <div
        className="flex items-center gap-2 text-sm rounded-xl p-3 mb-2"
        style={{
          background: 'var(--color-primary-light, #ede9fe)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>1️⃣</span>
        <span>Tap the <strong>Share</strong> button <ShareIcon size={14} color="var(--color-primary)" /> in the Safari toolbar</span>
      </div>

      {/* Step 2 + mock share sheet */}
      <div
        className="flex items-center gap-2 text-sm rounded-xl p-3 mb-2"
        style={{
          background: 'var(--color-primary-light, #ede9fe)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>2️⃣</span>
        <span>Scroll down in the menu and tap <strong>"Add to Home Screen"</strong></span>
      </div>

      {/* Mock iOS share sheet */}
      <div
        className="rounded-2xl overflow-hidden text-sm"
        style={{
          background: 'rgba(40,40,50,0.92)',
          color: 'white',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {['Add Bookmark to…', 'Add to Favorites', 'Add to Quick Note', 'Find on Page'].map(label => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            <span style={{ fontSize: 18 }}>
              {label === 'Add Bookmark to…' ? '📖' : label === 'Add to Favorites' ? '⭐' : label === 'Add to Quick Note' ? '🗒️' : '🔍'}
            </span>
            {label}
          </div>
        ))}
        {/* Highlighted row */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-b-2xl"
          style={{
            background: 'rgba(168,85,247,0.35)',
            border: '2px solid #a855f7',
            color: 'white',
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: 18 }}>➕</span>
          Add to Home Screen
          <span style={{ marginLeft: 'auto', fontSize: 16 }}>←</span>
        </div>
      </div>
    </div>
  )
}
