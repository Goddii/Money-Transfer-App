import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/transactions').then(res => setTransactions(res.data)).catch(err => console.log(err))
  }, [])

  const filtered = transactions.filter(tx => {
    if (filter === 'sent') return tx.type === 'TRANSFER' && tx.amount < 0
    if (filter === 'received') return tx.type === 'TRANSFER' && tx.amount > 0
    if (filter === 'deposits') return tx.type === 'DEPOSIT'
    return true
  })

  function groupByDate(txs) {
    const groups = {}
    txs.forEach(tx => {
      const date = new Date(tx.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      if (!groups[date]) groups[date] = []
      groups[date].push(tx)
    })
    return groups
  }

  const grouped = groupByDate(filtered)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>←</button>
        <h2 style={styles.title}>Transactions</h2>
        <div />
      </div>

      <div style={styles.filters}>
        {['all', 'sent', 'received', 'deposits'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={filter === f ? styles.filterActive : styles.filter}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.list}>
        {Object.keys(grouped).length === 0 ? (
          <p style={styles.empty}>No transactions found.</p>
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p style={styles.dateLabel}>{date}</p>
              {txs.map(tx => (
                <div key={tx.id} style={styles.txRow}>
                  <div style={styles.txAvatar}>{tx.name?.[0] || 'T'}</div>
                  <div style={styles.txInfo}>
                    <p style={styles.txName}>{tx.name || tx.type}</p>
                    <p style={styles.txType}>{tx.type} • {new Date(tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <p style={tx.amount > 0 ? styles.txAmountPos : styles.txAmountNeg}>
                    {tx.amount > 0 ? '+' : ''}KES {Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div style={styles.bottomNav}>
        <button onClick={() => navigate('/home')} style={styles.navBtn}>🏠<br/>Home</button>
        <button onClick={() => navigate('/send')} style={styles.navBtn}>↗<br/>Send</button>
        <button style={styles.navBtnActive}>🕐<br/>History</button>
        <button onClick={() => navigate('/profile')} style={styles.navBtn}>👤<br/>Profile</button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f8f9fa', maxWidth: '430px', margin: '0 auto', paddingBottom: '80px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0a0a1a' },
  filters: { display: 'flex', gap: '0.5rem', padding: '0 1.5rem 1rem', overflowX: 'auto' },
  filter: { padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap' },
  filterActive: { padding: '0.5rem 1rem', border: '1px solid #00c896', borderRadius: '20px', background: '#00c896', cursor: 'pointer', fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap' },
  list: { padding: '0 1.5rem' },
  dateLabel: { fontSize: '0.85rem', color: '#666', fontWeight: '600', margin: '1rem 0 0.5rem', textTransform: 'uppercase' },
  txRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' },
  txAvatar: { width: '40px', height: '40px', background: '#e8f8f3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#00c896', flexShrink: 0 },
  txInfo: { flex: 1 },
  txName: { margin: 0, fontWeight: '600', fontSize: '0.95rem', color: '#0a0a1a' },
  txType: { margin: 0, fontSize: '0.8rem', color: '#666' },
  txAmountPos: { color: '#00c896', fontWeight: '700', fontSize: '0.95rem' },
  txAmountNeg: { color: '#e74c3c', fontWeight: '700', fontSize: '0.95rem' },
  empty: { color: '#666', textAlign: 'center', padding: '2rem 0' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#fff', display: 'flex', justifyContent: 'space-around', padding: '0.75rem 0', borderTop: '1px solid #f0f0f0', zIndex: 100 },
  navBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#999', textAlign: 'center', lineHeight: '1.4' },
  navBtnActive: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#00c896', textAlign: 'center', lineHeight: '1.4', fontWeight: '600' }
}

export default Transactions
