import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'
import { parseMoney, formatKES } from '../../utils/format'
import StatusPill from '../../components/StatusPill'
import UserShell from '../../components/UserShell'

const SERVICE_ICONS = {
  ELECTRICITY: '⚡',
  WATER: '💧',
  AIRTIME: '📱',
}

function ServicePaymentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reconciling, setReconciling] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const res = await api.get(`/service-payments/${id}`)
        if (!active) return
        setPayment(res.data.data.payment)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load payment details.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [id])

  async function handleReconcile() {
    if (reconciling) return
    setReconciling(true)
    setError('')

    try {
      const res = await api.post(`/service-payments/${id}/reconcile`)
      setPayment(res.data.data.payment)
    } catch (err) {
      setError(err.response?.data?.message || 'Reconciliation failed. Please try again.')
    } finally {
      setReconciling(false)
    }
  }

  function maskAccount(num) {
    if (!num || num.length < 4) return num
    return '****' + num.slice(-4)
  }

  function mapStatus(status) {
    if (!status) return 'Pending'
    const s = String(status)
    // Backend returns Title-case strings already matching the pill vocabulary.
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

  if (loading) {
    return (
      <UserShell variant="narrow" style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.back}>←</button>
          <h2 style={styles.title}>Payment Details</h2>
          <div />
        </div>
        <p style={styles.empty}>Loading…</p>
      </UserShell>
    )
  }

  if (error && !payment) {
    return (
      <UserShell variant="narrow" style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.back}>←</button>
          <h2 style={styles.title}>Payment Details</h2>
          <div />
        </div>
        <p style={styles.error}>{error}</p>
        <div style={styles.actions}>
          <button onClick={() => navigate('/services')} style={styles.secondaryBtn}>
            Back to Services
          </button>
        </div>
      </UserShell>
    )
  }

  const serviceType = payment.service_type
  const serviceName = serviceType
    ? serviceType.charAt(0) + serviceType.slice(1).toLowerCase()
    : 'Service'
  const serviceIcon = SERVICE_ICONS[serviceType] || '📦'
  const status = payment.status
  const meta = payment.result_metadata || {}
  const isPending = status === 'Pending'
  const isProcessing = status === 'Initiated' || status === 'Processing'
  const isCompleted = status === 'Completed'
  const isFailed = status === 'Failed'
  const isRefunded = status === 'Refunded'
  // Backend reconciliation is permitted for non-terminal (recoverable) states.
  const canReconcile = isPending || isProcessing

  return (
    <UserShell variant="narrow" style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>←</button>
        <h2 style={styles.title}>Payment Details</h2>
        <div />
      </div>

      {/* Status banner */}
      <div style={styles.statusBanner}>
        <span style={styles.statusIcon}>{serviceIcon}</span>
        <StatusPill status={mapStatus(status)} />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.detailsCard}>
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Service</p>
          <p style={styles.detailValue}>{serviceName}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Amount</p>
          <p style={styles.detailValue}>{formatKES(parseMoney(payment.amount))}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Account</p>
          <p style={styles.detailValue}>{maskAccount(payment.account_number)}</p>
        </div>
        {payment.payment_reference && (
          <>
            <div style={styles.divider} />
            <div style={styles.detailRow}>
              <p style={styles.detailLabel}>Reference</p>
              <p style={styles.detailValue}>{payment.payment_reference}</p>
            </div>
          </>
        )}
        {/* Electricity-specific (nested in result_metadata) */}
        {meta.token && (
          <>
            <div style={styles.divider} />
            <div style={styles.detailRow}>
              <p style={styles.detailLabel}>Token</p>
              <p style={{ ...styles.detailValue, ...styles.tokenValue }}>{meta.token}</p>
            </div>
          </>
        )}
        {meta.units != null && (
          <>
            <div style={styles.divider} />
            <div style={styles.detailRow}>
              <p style={styles.detailLabel}>Units</p>
              <p style={styles.detailValue}>{meta.units} kWh</p>
            </div>
          </>
        )}
        {/* Water-specific */}
        {meta.receipt_number && (
          <>
            <div style={styles.divider} />
            <div style={styles.detailRow}>
              <p style={styles.detailLabel}>Receipt</p>
              <p style={styles.detailValue}>{meta.receipt_number}</p>
            </div>
          </>
        )}
        {/* Airtime-specific */}
        {meta.confirmation_reference && (
          <>
            <div style={styles.divider} />
            <div style={styles.detailRow}>
              <p style={styles.detailLabel}>Confirmation</p>
              <p style={styles.detailValue}>{meta.confirmation_reference}</p>
            </div>
          </>
        )}
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Status</p>
          <p style={styles.detailValue}>{mapStatus(status)}</p>
        </div>
        {payment.created_at && (
          <>
            <div style={styles.divider} />
            <div style={styles.detailRow}>
              <p style={styles.detailLabel}>Created</p>
              <p style={styles.detailValue}>
                {new Date(payment.created_at).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </>
        )}
        {payment.updated_at && payment.updated_at !== payment.created_at && (
          <>
            <div style={styles.divider} />
            <div style={styles.detailRow}>
              <p style={styles.detailLabel}>Updated</p>
              <p style={styles.detailValue}>
                {new Date(payment.updated_at).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </>
        )}
      </div>

      <div style={styles.actions}>
        {canReconcile && (
          <button
            onClick={handleReconcile}
            style={styles.primaryBtn}
            disabled={reconciling}
          >
            {reconciling ? 'Reconciling…' : 'Complete Payment'}
          </button>
        )}
        {isCompleted && (
          <button onClick={() => navigate('/services')} style={styles.secondaryBtn}>
            Pay Another Service
          </button>
        )}
        {(isFailed || isRefunded) && (
          <button onClick={() => navigate('/services')} style={styles.secondaryBtn}>
            Back to Services
          </button>
        )}
        <button onClick={() => navigate('/service-payments')} style={styles.textBtn}>
          View Payment History
        </button>
      </div>
    </UserShell>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--surface)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--ink-900)' },
  statusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 1.5rem 1rem',
  },
  statusIcon: { fontSize: '1.5rem' },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', margin: '0 1.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' },
  detailsCard: {
    background: 'var(--white)',
    borderRadius: '16px',
    padding: '1.5rem',
    margin: '0 1.5rem 1.5rem',
    boxShadow: '0 2px 8px rgba(15,18,38,0.06)',
  },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' },
  detailLabel: { margin: 0, color: 'var(--ink-500)', fontSize: '0.9rem' },
  detailValue: { margin: 0, color: 'var(--ink-900)', fontSize: '0.9rem', fontWeight: '600', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' },
  tokenValue: { fontSize: '0.85rem', fontFamily: 'monospace', letterSpacing: '0.5px' },
  divider: { height: '1px', background: 'var(--line)', margin: '0.25rem 0' },
  actions: { padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  primaryBtn: {
    padding: '1rem',
    background: 'var(--emerald-500)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  secondaryBtn: {
    padding: '1rem',
    background: 'var(--white)',
    color: 'var(--ink-900)',
    border: '1px solid var(--line)',
    borderRadius: '50px',
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
  },
  textBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--emerald-500)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0.5rem',
    width: '100%',
    textAlign: 'center',
  },
  empty: { color: 'var(--ink-500)', textAlign: 'center', padding: '2rem 1.5rem' },
}

export default ServicePaymentDetail
