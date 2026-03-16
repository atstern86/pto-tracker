export default function UpdateModal({ onRefresh }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-2xl shadow-xl p-6 mx-6 text-center"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid #e9d5ff',
          maxWidth: '320px',
        }}
      >
        <div
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          New Version Available
        </div>
        <p
          className="text-sm mb-5"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}
        >
          A new version of PTO Tracker is ready. Refresh to get the latest updates.
        </p>
        <button
          onClick={onRefresh}
          className="w-full py-3 rounded-xl font-semibold text-white"
          style={{
            background: 'var(--color-primary)',
            fontFamily: 'var(--font-body)',
          }}
        >
          Refresh Now
        </button>
      </div>
    </div>
  )
}
