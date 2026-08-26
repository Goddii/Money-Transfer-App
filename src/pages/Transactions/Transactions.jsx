import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { parseMoney } from '../../utils/format'

// Backend transaction type vocabulary (app/models/transaction.py TransactionType).
const TYPE_TRANSFER = 'Transfer'
const TYPE_DEPOSIT = 'Deposit'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sent', label: 'Sent' },
  { key: 'received', label: 'Received' },
  { key: 'deposits', label: 'Deposits' },
]

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [currency, setCurrency] = useState('KES')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function load() {
      try {
        // per_page is capped at 100 by the backend (validate_history_query).
        const [txRes, walletRes] = await Promise.all([
          api.get('/transactions', { params: { per_page: 100 } }),
          api.get('/wallet'),
        ])
        if (!active) return
        setTransactions(txRes.data.data.transactions || [])
        setCurrency(walletRes.data.data.wallet?.currency || 'KES')
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load your transactions. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [])

  // The backend always returns a positive amount plus a `direction` field
  // ('in' | 'out') relative to the authenticated user, so direction — not the
  // sign of the amount — decides sent vs received.
  const filtered = useMemo(() => transactions.filter(tx => {
    if (filter === 'sent') return tx.tx_type === TYPE_TRANSFER && tx.direction === 'out'
    if (filter === 'received') return tx.tx_type === TYPE_TRANSFER && tx.direction === 'in'
    if (filter === 'deposits') return tx.tx_type === TYPE_DEPOSIT
    return true
  }), [transactions, filter])

  const grouped = useMemo(() => {
    const groups = new Map()
    filtered.forEach(tx => {
      const date = tx.timestamp
        ? new Date(tx.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        : 'Unknown date'
      if (!groups.has(date)) groups.set(date, [])
      groups.get(date).push(tx)
    })
    return Array.from(groups.entries())
  }, [filtered])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>←</button>
        <h2 style={styles.title}>Transactions</h2>
        <div />
      </div>

      <div style={styles.filters}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={filter === f.key ? styles.filterActive : styles.filter}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.list}>
        {loading ? (
          <p style={styles.empty}>Loading…</p>
        ) : grouped.length === 0 ? (
          <p style={styles.empty}>No transactions found.</p>
        ) : (
          grouped.map(([date, txs]) => (
            <div key={date}>
              <p style={styles.dateLabel}>{date}</p>
              {txs.map(tx => {
                const isIncoming = tx.direction === 'in'
                // Show the counterparty: who received it if we sent, who sent
                // it if we received.
                const counterparty = isIncoming ? tx.sender : tx.receiver
                const name = counterparty?.name || tx.tx_type || 'Transaction'
                const amount = parseMoney(tx.amount)
                const time = tx.timestamp
                  ? new Date(tx.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : ''
                return (
                  <div key={tx.id} style={styles.txRow}>
                    <div style={styles.txAvatar}>{name?.[0] || 'T'}</div>
                    <div style={styles.txInfo}>
                      <p style={styles.txName}>{name}</p>
                      <p style={styles.txType}>
                        {tx.tx_type}{time ? ` • ${time}` : ''}
                        {tx.status && tx.status !== 'Completed' ? ` • ${tx.status}` : ''}
                      </p>
                    </div>
                    <p style={isIncoming ? styles.txAmountPos : styles.txAmountNeg}>
                      {isIncoming ? '+' : '-'}{currency} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                )
              })}
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
  error: { color: '#e74c3c', background: '#ffeaea', padding: '0.75rem', margin: '0 1.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' },
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
