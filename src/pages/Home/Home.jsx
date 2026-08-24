import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../utils/api'

function Home() {
  const { user } = useSelector(state => state.auth)
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/wallet').then(res => setWallet(res.data)).catch(err => console.log(err))
    api.get('/transactions').then(res => setTransactions(res.data)).catch(err => console.log(err))
  }, [])

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
          KES {wallet?.balance?.toLocaleString() || '0.00'}
        </h1>
        <div style={styles.walletFooter}>
          <span style={styles.walletName}>Vyloc Wallet</span>
          <span style={styles.walletStatus}>USD • Active</span>
        </div>
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

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Recent Transactions</h3>
          <button onClick={() => navigate('/transactions')} style={styles.seeAll}>See All</button>
        </div>
        {transactions.length === 0 ? (
          <p style={styles.empty}>No transactions yet.</p>
        ) : (
          transactions.slice(0, 5).map(tx => (
            <div key={tx.id} style={styles.txRow}>
              <div style={styles.txAvatar}>{tx.name?.[0] || 'T'}</div>
              <div style={styles.txInfo}>
                <p style={styles.txName}>{tx.name || 'Transaction'}</p>
                <p style={styles.txType}>{tx.type} • {tx.created_at}</p>
              </div>
              <p style={tx.amount > 0 ? styles.txAmountPos : styles.txAmountNeg}>
                {tx.amount > 0 ? '+' : ''}KES {Math.abs(tx.amount).toLocaleString()}
              </p>
            </div>
          ))
        )}
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
  actions: { display: 'flex', justifyContent: 'space-around', padding: '0 1.5rem 1.5rem' },
  actionBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', background: '#fff', border: 'none', borderRadius: '12px', padding: '1rem', cursor: 'pointer', fontSize: '0.8rem', color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '70px' },
  actionIcon: { fontSize: '1.2rem' },
  section: { padding: '0 1.5rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#0a0a1a' },
  seeAll: { background: 'none', border: 'none', color: '#00c896', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
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

export default Home
