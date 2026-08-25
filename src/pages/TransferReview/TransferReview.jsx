import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../utils/api'

function TransferReview() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { beneficiary, amount, wallet } = state || {}
  const fee = 0.25
  const total = (parseFloat(amount) + fee).toFixed(2)

  async function handleConfirm() {
    try {
      await api.post('/wallet/transfer', {
        beneficiary_id: beneficiary.id,
        amount: parseFloat(amount)
      })
      navigate('/transfer-success', {
        state: { beneficiary, amount, total }
      })
    } catch (err) {
      alert(err.response?.data?.error || 'Transfer failed. Try again.')
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
            <div style={styles.avatar}>{beneficiary?.name?.[0] || 'B'}</div>
            <p style={styles.avatarName}>{beneficiary?.name || 'Beneficiary'}</p>
          </div>
        </div>
      </div>

      <div style={styles.detailsCard}>
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Transfer Amount</p>
          <p style={styles.detailValue}>KES {parseFloat(amount).toFixed(2)}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabel}>Transaction Fee</p>
          <p style={styles.detailValue}>KES {fee.toFixed(2)}</p>
        </div>
        <div style={styles.divider} />
        <div style={styles.detailRow}>
          <p style={styles.detailLabelBold}>Total Debit</p>
          <p style={styles.totalValue}>KES {total}</p>
        </div>
      </div>

      <div style={styles.actions}>
        <button onClick={handleConfirm} style={styles.confirmBtn}>Confirm and Send</button>
        <button onClick={() => navigate(-1)} style={styles.cancelBtn}>Cancel</button>
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
  actions: { padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  confirmBtn: { padding: '1rem', background: '#00c896', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '1rem', background: 'transparent', color: '#666', border: 'none', borderRadius: '50px', fontSize: '1rem', cursor: 'pointer', textAlign: 'center' }
}

export default TransferReview
