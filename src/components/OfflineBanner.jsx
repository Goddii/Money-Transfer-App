import useOnlineStatus from '../hooks/useOnlineStatus'

// A fixed banner shown whenever the browser reports no connection. Rendered on
// every screen that shows or moves money, so the user is never left to assume
// a stale balance or a submitted transfer is current/successful while offline.
//
// `message` lets an action screen (deposit, transfer) say something stronger
// than the default read-only warning.
export default function OfflineBanner({ message }) {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div role="alert" style={styles.banner}>
      <span aria-hidden="true" style={styles.dot} />
      <span>
        {message ||
          "You're offline. Balances and transactions can't be refreshed until your connection is back."}
      </span>
    </div>
  )
}

const styles = {
  banner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: 'calc(0.6rem + env(safe-area-inset-top)) 1rem 0.6rem',
    background: 'var(--amber-600)',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 600,
    lineHeight: 1.3,
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(15,18,38,0.25)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#fff',
    flexShrink: 0,
  },
}
