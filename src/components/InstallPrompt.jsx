import { useState, useEffect } from 'react'
import { isInstallDismissed, dismissInstall } from '../logic/storage'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show on iOS Safari when not already in standalone mode and not dismissed
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    if (isIOS && !isStandalone && !isInstallDismissed()) {
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  function handleDismiss() {
    dismissInstall()
    setShow(false)
  }

  return (
    <div
      className="fixed left-4 right-4 z-40 rounded-2xl shadow-xl p-5 animate-slide-up"
      style={{
        bottom: 'calc(5rem + env(safe-area-inset-bottom))',
        background: 'var(--color-surface)',
        border: '1px solid #e9d5ff',
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div
          className="font-bold"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          Add to Home Screen 📲
        </div>
        <button
          onClick={handleDismiss}
          className="text-lg leading-none px-2 py-1"
          style={{ color: 'var(--color-muted)' }}
          aria-label="Dismiss install prompt"
        >
          ✕
        </button>
      </div>
      <p className="text-sm mb-3" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
        Install this app on your iPhone for the best experience — works like a native app, even offline!
      </p>
      <div
        className="flex items-center gap-2 text-sm rounded-xl p-3 mb-2"
        style={{
          background: 'var(--color-primary-light, #ede9fe)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>1️⃣</span>
        <span>Tap the <strong>Share</strong> button at the bottom of Safari</span>
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
        <span>Select <strong>"Add to Home Screen"</strong></span>
      </div>
      <button
        onClick={handleDismiss}
        className="w-full mt-4 text-sm underline"
        style={{ color: 'var(--color-muted)' }}
      >
        Maybe later
      </button>
    </div>
  )
}
