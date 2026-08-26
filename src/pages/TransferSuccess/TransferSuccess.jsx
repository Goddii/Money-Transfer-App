import { useNavigate, useLocation, Navigate } from 'react-router-dom'

function TransferSuccess() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const {
    beneficiaryName,
    amount,
    fee = 0,
    currency = 'KES',
    reference,
    timestamp,
  } = state || {}

  // Only reachable as the result of a real transfer. Landing here directly
  // (refresh / deep link) must not fabricate a confirmation.
  if (!reference) {
    return <Navigate to="/home" replace />
  }

  const displayTime = timestamp
    ? new Date(timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : '—'

  function money(value) {
    return `${currency} ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div style={styles.container}>
      <div style={styles.successIcon}>✓</div>
      <h2 style={styles.title}>Transfer Successful!</h2>
      <p style={styles.subtitle}>Your funds have been sent successfully.</p>

      <div style={styles.detailsCard}>
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Sent To</p>
          <p style={styles.detailValue}>{beneficiaryName || 'Beneficiary'}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Amount Sent</p>
          <p style={styles.detailValue}>{money(amount)}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Transaction Fee</p>
          <p style={styles.detailValue}>{money(fee)}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Transaction ID</p>
          {/* Backend-issued tx_code, so it matches the record in history */}
          <p style={styles.detailValue}>{reference}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Timestamp</p>
          <p style={styles.detailValue}>{displayTime}</p>
        </div>
      </div>

      <div style={styles.actions}>
        <button onClick={() => navigate('/send')} style={styles.primaryBtn}>Send Another</button>
        <button onClick={() => navigate('/home')} style={styles.secondaryBtn}>Back to Home</button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f8f9fa', maxWidth: '430px', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  successIcon: { width: '80px', height: '80px', background: '#00c896', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.5rem', marginBottom: '1.5rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#0a0a1a', margin: '0 0 0.5rem', textAlign: 'center' },
  subtitle: { color: '#666', margin: '0 0 2rem', textAlign: 'center' },
  detailsCard: { background: '#fff', borderRadius: '16px', padding: '1.5rem', width: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '2rem' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' },
  detailLabel: { margin: 0, color: '#666', fontSize: '0.9rem' },
  detailValue: { margin: 0, color: '#0a0a1a', fontSize: '0.9rem', fontWeight: '600', textAlign: 'right', maxWidth: '60%' },
  divider: { height: '1px', background: '#f0f0f0', margin: '0.25rem 0' },
  actions: { display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' },
  primaryBtn: { padding: '1rem', background: '#00c896', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  secondaryBtn: { padding: '1rem', background: '#fff', color: '#0a0a1a', border: '1px solid #ddd', borderRadius: '50px', fontSize: '1rem', cursor: 'pointer' }
}

export default TransferSuccess
