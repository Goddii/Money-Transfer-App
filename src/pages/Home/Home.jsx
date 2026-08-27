import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../utils/api'
import { parseMoney, formatKES } from '../../utils/format'

function Home() {
  const { user } = useSelector(state => state.auth)
  const [analytics, setAnalytics] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState('')
  const [txError, setTxError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const res = await api.get('/wallet/analytics')
        if (!active) return
        setAnalytics(res.data.data.analytics)
      } catch (err) {
        if (!active) return
        setAnalyticsError(err.response?.data?.message || 'Unable to load your wallet analytics. Please try again.')
      }

      try {
        const res = await api.get('/transactions')
        if (!active) return
        setTransactions(res.data.data.transactions || [])
      } catch (err) {
        if (!active) return
        setTxError(err.response?.data?.message || 'Unable to load recent transactions.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [])

  const currency = 'KES'
  const balance = analytics ? Number(analytics.current_balance) || 0 : 0
  const trend = analytics?.monthly_trend || []
  const maxTrend = Math.max(
    1,
    ...trend.map(t => Math.max(parseMoney(t.inflow), parseMoney(t.outflow)))
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>Good morning,</p>
          <h2 style={styles.username}>{user?.first_name || 'User'}</h2>
        </div>
        <div style={styles.avatar}>{user?.first_name?.[0] || 'U'}</div>
      </div>

      <div style={styles.walletCard}>
        <p style={styles.walletLabel}>Available Balance</p>
        <h1 style={styles.balance}>
          {currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div style={styles.walletFooter}>
          <span style={styles.walletName}>Vyloc Wallet</span>
          <span style={styles.walletStatus}>{currency} • Active</span>
        </div>
      </div>

      {analyticsError && <p style={styles.error}>{analyticsError}</p>}

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Wallet Analytics</h3>
        </div>
        {loading ? (
          <p style={styles.empty}>Loading analytics…</p>
        ) : analyticsError ? (
          <p style={styles.empty}>Analytics unavailable.</p>
        ) : (
          <>
            <div style={styles.statGrid}>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Total Received</span>
                <span style={styles.statValue}>{formatKES(analytics.total_received)}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Total Sent</span>
                <span style={styles.statValue}>{formatKES(analytics.total_sent)}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Total Deposits</span>
                <span style={styles.statValue}>{formatKES(analytics.total_deposits)}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Transfers</span>
                <span style={styles.statValue}>{analytics.total_transfers}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Transactions</span>
                <span style={styles.statValue}>{analytics.transaction_count}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Wallet Balance</span>
                <span style={styles.statValue}>{formatKES(analytics.current_balance)}</span>
              </div>
            </div>

            <div style={styles.trendCard}>
              <div style={styles.trendHeader}>
                <span style={styles.trendTitle}>6-Month Inflow / Outflow</span>
                <span style={styles.trendLegend}>
                  <i style={{ ...styles.dot, background: '#00c896' }} /> In
                  <i style={{ ...styles.dot, background: '#e74c3c', marginLeft: 8 }} /> Out
                </span>
              </div>
              {trend.length === 0 ? (
                <p style={styles.empty}>No trend data yet.</p>
              ) : (
                <div style={styles.trendRow}>
                  {trend.map((t) => {
                    const inflow = parseMoney(t.inflow)
                    const outflow = parseMoney(t.outflow)
                    return (
                      <div key={t.month} style={styles.trendCol}>
                        <div style={styles.trendBars}>
                          <span style={{ ...styles.trendBar, height: `${(inflow / maxTrend) * 56}px`, background: '#00c896' }} />
                          <span style={{ ...styles.trendBar, height: `${(outflow / maxTrend) * 56}px`, background: '#e74c3c' }} />
                        </div>
                        <span style={styles.trendMonth}>{t.label ? t.label.split(' ')[0] : t.month}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Recent Transactions</h3>
          <button onClick={() => navigate('/transactions')} style={styles.seeAll}>See All</button>
        </div>
        {loading ? (
          <p style={styles.empty}>Loading…</p>
        ) : txError ? (
          <p style={styles.empty}>{txError}</p>
        ) : transactions.length === 0 ? (
          <p style={styles.empty}>No transactions yet.</p>
        ) : (
          transactions.slice(0, 5).map(tx => {
            const counterparty = tx.direction === 'out' ? tx.receiver : tx.sender
            const name = counterparty?.name || 'Transaction'
            const txType = tx.tx_type || 'Transaction'
            const createdAt = tx.timestamp || ''
            const amount = parseMoney(tx.amount) || 0
            const signed = tx.direction === 'out' ? -Math.abs(amount) : Math.abs(amount)
            return (
              <div key={tx.id} style={styles.txRow}>
                <div style={styles.txAvatar}>{name?.[0] || 'T'}</div>
                <div style={styles.txInfo}>
                  <p style={styles.txName}>{name}</p>
                  <p style={styles.txType}>{txType} • {createdAt}</p>
                </div>
                <p style={signed >= 0 ? styles.txAmountPos : styles.txAmountNeg}>
                  {signed > 0 ? '+' : ''}{currency} {Math.abs(signed).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )
          })
        )}
      </div>

      <div style={styles.actions}>
        <button onClick={() => navigate('/send')} style={styles.actionBtn}>
          <span style={styles.actionIcon}>↗</span>
          <span>Send</span>
        </button>
        <button onClick={() => navigate('/deposit')} style={styles.actionBtn}>
          <span style={styles.actionIcon}>+</span>
          <span>Deposit</span>
        </button>
        <button onClick={() => navigate('/transactions')} style={styles.actionBtn}>
          <span style={styles.actionIcon}>🕐</span>
          <span>History</span>
        </button>
        <button onClick={() => navigate('/beneficiaries')} style={styles.actionBtn}>
          <span style={styles.actionIcon}>👥</span>
          <span>Beneficiary</span>
        </button>
      </div>

      <div style={styles.bottomNav}>
        <button onClick={() => navigate('/home')} style={styles.navBtnActive}>🏠<br/>Home</button>
        <button onClick={() => navigate('/send')} style={styles.navBtn}>↗<br/>Send</button>
        <button onClick={() => navigate('/transactions')} style={styles.navBtn}>🕐<br/>History</button>
        <button onClick={() => navigate('/profile')} style={styles.navBtn}>👤<br/>Profile</button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f8f9fa', maxWidth: '430px', margin: '0 auto', paddingBottom: '80px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  greeting: { color: '#666', margin: 0, fontSize: '0.9rem' },
  username: { margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0a0a1a' },
  avatar: { width: '45px', height: '45px', background: '#00c896', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '1.2rem' },
  walletCard: { background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1f2d 100%)', borderRadius: '16px', padding: '1.5rem', margin: '0 1.5rem 1.5rem', color: '#fff' },
  walletLabel: { color: '#8899aa', margin: '0 0 0.5rem', fontSize: '0.9rem' },
  balance: { fontSize: '2.2rem', fontWeight: '700', margin: '0 0 1rem' },
  walletFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  walletName: { color: '#8899aa', fontSize: '0.85rem' },
  walletStatus: { background: '#00c896', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' },
  error: { color: '#e74c3c', background: '#ffeaea', padding: '0.75rem', margin: '0 1.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' },
  section: { padding: '0 1.5rem', marginBottom: '1.25rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#0a0a1a' },
  seeAll: { background: 'none', border: 'none', color: '#00c896', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  statBox: { background: '#fff', borderRadius: '12px', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statLabel: { color: '#666', fontSize: '0.75rem' },
  statValue: { color: '#0a0a1a', fontSize: '1rem', fontWeight: '700' },
  trendCard: { background: '#fff', borderRadius: '12px', padding: '1rem', marginTop: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  trendHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  trendTitle: { fontSize: '0.85rem', fontWeight: '700', color: '#0a0a1a' },
  trendLegend: { fontSize: '0.7rem', color: '#666', display: 'flex', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 4 },
  trendRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '80px' },
  trendCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1 },
  trendBars: { display: 'flex', alignItems: 'flex-end', gap: '3px', height: '56px' },
  trendBar: { width: '7px', borderRadius: '3px', minHeight: '2px' },
  trendMonth: { fontSize: '0.65rem', color: '#666' },
  txRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' },
  txAvatar: { width: '40px', height: '40px', background: '#e8f8f3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#00c896', flexShrink: 0 },
  txInfo: { flex: 1 },
  txName: { margin: 0, fontWeight: '600', fontSize: '0.95rem', color: '#0a0a1a' },
  txType: { margin: 0, fontSize: '0.8rem', color: '#666' },
  txAmountPos: { color: '#00c896', fontWeight: '700', fontSize: '0.95rem' },
  txAmountNeg: { color: '#e74c3c', fontWeight: '700', fontSize: '0.95rem' },
  empty: { color: '#666', textAlign: 'center', padding: '2rem 0' },
  actions: { display: 'flex', justifyContent: 'space-around', padding: '0 1.5rem 1.5rem' },
  actionBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', background: '#fff', border: 'none', borderRadius: '12px', padding: '1rem', cursor: 'pointer', fontSize: '0.8rem', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '70px' },
  actionIcon: { fontSize: '1.2rem' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#fff', display: 'flex', justifyContent: 'space-around', padding: '0.75rem 0', borderTop: '1px solid #f0f0f0', zIndex: 100 },
  navBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#999', textAlign: 'center', lineHeight: '1.4' },
  navBtnActive: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#00c896', textAlign: 'center', lineHeight: '1.4', fontWeight: '600' }
}

export default Home
