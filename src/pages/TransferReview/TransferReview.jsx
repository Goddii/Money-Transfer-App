import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import api from '../../utils/api'
import { parseMoney } from '../../utils/format'

// Matches TransactionService.TRANSFER_FEE on the backend (no P2P fee in the MVP).
const TRANSFER_FEE = 0

function TransferReview() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { receiverId, beneficiaryName, amount, currency = 'KES' } = state || {}

  // Reached directly (e.g. refresh) without transfer details: go back to the
  // send form instead of crashing on parseFloat(undefined).
  if (!receiverId || !amount) {
    return <Navigate to="/send" replace />
  }

  const numericAmount = Number(amount)
  const total = numericAmount + TRANSFER_FEE

  function money(value) {
    return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  async function handleConfirm() {
    setError('')
    setSubmitting(true)
    try {
      // Backend contract: POST /api/transactions/transfer
      // body { receiver_id, amount, note? } -> 201
      // { success, message, data: { transaction, wallet } }
      const response = await api.post('/transactions/transfer', {
        receiver_id: receiverId,
        amount: numericAmount,
      })

      const { transaction, wallet } = response.data.data

      navigate('/transfer-success', {
        replace: true,
        state: {
          beneficiaryName,
          amount: parseMoney(transaction.amount),
          fee: parseMoney(transaction.fee),
          currency: wallet?.currency || currency,
          // Authoritative reference and time from the backend, not generated
          // in the browser.
          reference: transaction.tx_code,
          timestamp: transaction.timestamp,
        },
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>←</button>
        <h2 style={styles.title}>Review Transfer</h2>
        <div />
      </div>

      <div style={styles.avatarRow}>
        <div style={styles.avatarGroup}>
          <div style={styles.avatar}>You</div>
          <div style={styles.arrow}>→<br/><span style={styles.instant}>Instant</span></div>
          <div style={styles.avatarGroup}>
            <div style={styles.avatar}>{beneficiaryName?.[0] || 'B'}</div>
            <p style={styles.avatarName}>{beneficiaryName || 'Beneficiary'}</p>
          </div>
        </div>
      </div>

      <div style={styles.detailsCard}>
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Transfer Amount</p>
          <p style={styles.detailValue}>{money(numericAmount)}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Transaction Fee</p>
          <p style={styles.detailValue}>{money(TRANSFER_FEE)}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabelBold}>Total Debit</p>
          <p style={styles.totalValue}>{money(total)}</p>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.actions}>
        <button onClick={handleConfirm} style={styles.confirmBtn} disabled={submitting}>
          {submitting ? 'Sending…' : 'Confirm and Send'}
        </button>
        <button onClick={() => navigate(-1)} style={styles.cancelBtn} disabled={submitting}>Cancel</button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f8f9fa', maxWidth: '430px', margin: '0 auto', padding: '0 0 2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0a0a1a' },
  avatarRow: { display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' },
  avatarGroup: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  avatar: { width: '60px', height: '60px', background: '#e8f8f3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#00c896', fontSize: '1rem' },
  avatarName: { margin: '0.5rem 0 0', textAlign: 'center', fontSize: '0.85rem', color: '#333' },
  arrow: { textAlign: 'center', color: '#00c896', fontWeight: '700', fontSize: '1.2rem', lineHeight: '1.2' },
  instant: { fontSize: '0.7rem', color: '#666', fontWeight: '400' },
  detailsCard: { background: '#fff', borderRadius: '16px', padding: '1.5rem', margin: '0 1.5rem 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' },
  detailLabel: { margin: 0, color: '#666', fontSize: '0.95rem' },
  detailLabelBold: { margin: 0, color: '#0a0a1a', fontSize: '0.95rem', fontWeight: '600' },
  detailValue: { margin: 0, color: '#0a0a1a', fontSize: '0.95rem' },
  totalValue: { margin: 0, color: '#00c896', fontSize: '1.1rem', fontWeight: '700' },
  divider: { height: '1px', background: '#f0f0f0', margin: '0.5rem 0' },
  error: { color: '#e74c3c', background: '#ffeaea', padding: '0.75rem', margin: '0 1.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' },
  actions: { padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  confirmBtn: { padding: '1rem', background: '#00c896', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '1rem', background: 'transparent', color: '#666', border: 'none', borderRadius: '50px', fontSize: '1rem', cursor: 'pointer', textAlign: 'center' }
}

export default TransferReview
