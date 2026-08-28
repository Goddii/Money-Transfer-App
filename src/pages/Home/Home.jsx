import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../utils/api'
import { parseMoney, formatKES } from '../../utils/format'
import UserMenu from '../../components/UserMenu'
import UserShell from '../../components/UserShell'

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
    <UserShell nav style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>Good morning,</p>
          <h2 style={styles.username}>{user?.first_name || 'User'}</h2>
        </div>
        <UserMenu size={45} />
      </div>

      <div style={styles.walletCard}>
        <p style={styles.walletLabel}>Available Balance</p>
        <h1 style={styles.balance}>
          {formatKES(balance)}
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
            <div className="u-stat-grid">
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
                  <i style={{ ...styles.dot, background: 'var(--green-600)' }} /> In
                  <i style={{ ...styles.dot, background: 'var(--red-600)', marginLeft: 8 }} /> Out
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
                          <span style={{ ...styles.trendBar, height: `${(inflow / maxTrend) * 56}px`, background: 'var(--green-600)' }} />
                          <span style={{ ...styles.trendBar, height: `${(outflow / maxTrend) * 56}px`, background: 'var(--red-600)' }} />
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
                  {signed > 0 ? '+' : ''}{formatKES(Math.abs(signed))}
                </p>
              </div>
            )
          })
        )}
      </div>

      <div className="u-actions">
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
    </UserShell>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--surface)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  greeting: { color: 'var(--ink-500)', margin: 0, fontSize: '0.9rem' },
  username: { margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--ink-900)' },
  walletCard: { background: 'var(--emerald-500)', borderRadius: '16px', padding: '1.5rem', margin: '0 1.5rem 1.5rem', color: '#fff' },
  walletLabel: { color: 'rgba(255,255,255,0.85)', margin: '0 0 0.5rem', fontSize: '0.9rem' },
  balance: { fontSize: '2.2rem', fontWeight: '700', margin: '0 0 1rem' },
  walletFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  walletName: { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' },
  walletStatus: { background: 'var(--emerald-500)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', margin: '0 1.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' },
  section: { padding: '0 1.5rem', marginBottom: '1.25rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--ink-900)' },
  seeAll: { background: 'none', border: 'none', color: 'var(--emerald-500)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  statBox: { background: 'var(--white)', borderRadius: '12px', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', boxShadow: '0 2px 8px rgba(15,18,38,0.06)' },
  statLabel: { color: 'var(--ink-500)', fontSize: '0.75rem' },
  statValue: { color: 'var(--ink-900)', fontSize: '1rem', fontWeight: '700' },
  trendCard: { background: 'var(--white)', borderRadius: '12px', padding: '1rem', marginTop: '0.75rem', boxShadow: '0 2px 8px rgba(15,18,38,0.06)' },
  trendHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  trendTitle: { fontSize: '0.85rem', fontWeight: '700', color: 'var(--ink-900)' },
  trendLegend: { fontSize: '0.7rem', color: 'var(--ink-500)', display: 'flex', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 4 },
  trendRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '80px' },
  trendCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1 },
  trendBars: { display: 'flex', alignItems: 'flex-end', gap: '3px', height: '56px' },
  trendBar: { width: '7px', borderRadius: '3px', minHeight: '2px' },
  trendMonth: { fontSize: '0.65rem', color: 'var(--ink-500)' },
  txRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--line)' },
  txAvatar: { width: '40px', height: '40px', background: 'var(--emerald-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--emerald-600)', flexShrink: 0 },
  txInfo: { flex: 1 },
  txName: { margin: 0, fontWeight: '600', fontSize: '0.95rem', color: 'var(--ink-900)' },
  txType: { margin: 0, fontSize: '0.8rem', color: 'var(--ink-500)' },
  txAmountPos: { color: 'var(--green-600)', fontWeight: '700', fontSize: '0.95rem' },
  txAmountNeg: { color: 'var(--red-600)', fontWeight: '700', fontSize: '0.95rem' },
  empty: { color: 'var(--ink-500)', textAlign: 'center', padding: '2rem 0' },
  actionBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', background: 'var(--white)', border: 'none', borderRadius: '12px', padding: '1rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--ink-700)', boxShadow: '0 2px 8px rgba(15,18,38,0.06)', width: '70px' },
  actionIcon: { fontSize: '1.2rem' }
}

export default Home
