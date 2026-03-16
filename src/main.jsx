import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#c00' }}>
            {this.state.error.toString()}
          </pre>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      // Check for a waiting worker on page load
      if (reg.waiting) {
        window.dispatchEvent(new CustomEvent('sw-update', { detail: reg.waiting }))
      }
      // Detect when a new worker is installed and waiting
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent('sw-update', { detail: newWorker }))
          }
        })
      })
    }).catch(console.error)
  })
}
