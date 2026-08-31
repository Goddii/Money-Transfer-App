import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { formatKES } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import UserShell from '../../components/UserShell'

const SERVICE_ICONS = {
  ELECTRICITY: '⚡',
  WATER: '💧',
  AIRTIME: '📱',
}

function ServicePaymentHistory() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      try {
        const res = await api.get('/service-payments', { params: { page, per_page: 20 } })
        if (!active) return
        const data = res.data.data
        setPayments(data.payments || [])
        setHasMore(data.pagination?.has_next || false)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load payment history.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [page])

  return (
    <UserShell nav variant="narrow" style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>←</button>
        <h2 style={styles.title}>Payment History</h2>
        <div />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.list}>
        {loading ? (
          <p style={styles.empty}>Loading…</p>
        ) : payments.length === 0 ? (
          <p style={styles.empty}>No service payments yet.</p>
        ) : (
          payments.map(payment => {
            const icon = SERVICE_ICONS[payment.service_type] || '📦'
            const serviceName = payment.service_type
              ? payment.service_type.charAt(0) + payment.service_type.slice(1).toLowerCase()
              : 'Service'
            const created = payment.created_at
              ? new Date(payment.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })
              : ''
            const amount = parseMoney(payment.amount)

            return (
              <div
                key={payment.id}
                onClick={() => navigate(`/service-payments/${payment.id}`)}
                style={styles.paymentRow}
              >
                <div style={styles.paymentIcon}>{icon}</div>
                <div style={styles.paymentInfo}>
                  <p style={styles.paymentName}>{serviceName}</p>
                  <p style={styles.paymentMeta}>
                    {payment.payment_reference || '—'} · {created}
                  </p>
                </div>
                <div style={styles.paymentRight}>
                  <p style={styles.paymentAmount}>{formatKES(amount)}</p>
                  <StatusPill status={mapStatus(payment.status)} />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && payments.length > 0 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
            disabled={page === 1}
          >
            ← Previous
          </button>
          <span style={styles.pageNum}>Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            style={!hasMore ? styles.pageBtnDisabled : styles.pageBtn}
            disabled={!hasMore}
          >
            Next →
          </button>
        </div>
      )}
    </UserShell>
  )
}

function parseMoney(v) {
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : n
}

// Map backend statuses to display-friendly labels for StatusPill. The API
// returns Title-case strings that already match the pill vocabulary; this also
// tolerates any uppercase variants.
function mapStatus(status) {
  if (!status) return 'Pending'
  const s = String(status)
  if (['Completed', 'Pending', 'Failed', 'Refunded', 'Active', 'Frozen'].includes(s)) {
    return s
  }
  const up = s.toUpperCase()
  if (up === 'COMPLETED') return 'Completed'
  if (up === 'PENDING' || up === 'PROCESSING' || up === 'INITIATED') return 'Pending'
  if (up === 'FAILED') return 'Failed'
  if (up === 'REFUNDED') return 'Refunded'
  return s
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--surface)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--ink-900)' },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', margin: '0 1.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' },
  list: { padding: '0 1.5rem' },
  paymentRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.85rem 0',
    borderBottom: '1px solid var(--line)',
    cursor: 'pointer',
  },
  paymentIcon: {
    width: '40px',
    height: '40px',
    background: 'var(--emerald-100)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  paymentInfo: { flex: 1, minWidth: 0 },
  paymentName: { margin: 0, fontWeight: '600', fontSize: '0.95rem', color: 'var(--ink-900)' },
  paymentMeta: { margin: 0, fontSize: '0.8rem', color: 'var(--ink-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  paymentRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 },
  paymentAmount: { margin: 0, fontWeight: '700', fontSize: '0.95rem', color: 'var(--ink-900)' },
  empty: { color: 'var(--ink-500)', textAlign: 'center', padding: '2rem 0' },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
  },
  pageBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: '1px solid var(--line)',
    background: 'var(--white)',
    color: 'var(--ink-700)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  pageBtnDisabled: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: '1px solid var(--line)',
    background: 'var(--white)',
    color: 'var(--ink-300)',
    fontSize: '0.85rem',
    cursor: 'not-allowed',
  },
  pageNum: { fontSize: '0.85rem', color: 'var(--ink-500)' },
}

export default ServicePaymentHistory
