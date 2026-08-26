import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

const POLL_INTERVAL_MS = 5000

function Deposit() {
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // The internal M-Pesa transaction id returned by the STK push. Used to poll
  // the user-facing status endpoint; never the Daraja checkout_request_id.
  const [depositId, setDepositId] = useState(null)
  const pollRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    api.get('/wallet')
      .then(res => setWallet(res.data.data.wallet))
      .catch(err => setError(err.response?.data?.message || 'Unable to load your wallet.'))
  }, [])

  // Poll the deposit status until it reaches a terminal state. Timers are
  // cleaned up on unmount or when a new deposit starts.
  useEffect(() => {
    if (!depositId) return

    let active = true

    const poll = async () => {
      try {
        // The axios instance already carries the `/api` prefix in its baseURL,
        // so the path must be relative to it, exactly like every other call.
        const res = await api.get(`/mpesa/transactions/${depositId}`)
        if (!active) return
        const t = res.data.data.transaction

        if (t.status === 'Completed') {
          setMessage(`KSh ${t.amount} added to your wallet.`)
          setError('')
          api.get('/wallet')
            .then(r => setWallet(r.data.data.wallet))
            .catch(() => {})
          api.get('/transactions').catch(() => {})
          clearInterval(pollRef.current)
        } else if (t.status === 'Failed') {
          setError('Your M-Pesa deposit failed. Please try again.')
          setMessage('')
          clearInterval(pollRef.current)
        } else if (t.status === 'ReconciliationPending') {
          setMessage('Confirming your payment...')
        } else {
          setMessage('Waiting for M-Pesa confirmation...')
        }
      } catch (err) {
        // A 404 means the deposit is gone/forbidden; stop polling. Otherwise
        // keep retrying so transient network errors don't strand the UI.
        if (err.response && err.response.status === 404) {
          clearInterval(pollRef.current)
        }
      }
    }

    poll()
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      active = false
      clearInterval(pollRef.current)
    }
  }, [depositId])

  const currency = wallet?.currency || 'KES'
  const balance = wallet ? Number(wallet.balance) : 0

  async function handleDeposit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!Number.isInteger(numericAmount)) {
      setError('Amount must be a whole number.')
      return
    }
    if (!phone.trim()) {
      setError('Please enter your M-Pesa phone number.')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/mpesa/stk-push', { amount: numericAmount, phone: phone.trim() })
      // The wallet is NOT credited here. We capture the returned deposit id and
      // poll for Daraja confirmation instead of assuming success.
      const deposit = res.data.data.deposit
      setDepositId(deposit.id)
      setMessage('Waiting for M-Pesa confirmation...')
      setAmount('')
      setPhone('')
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>←</button>
        <h2 style={styles.title}>Add Funds</h2>
        <div />
      </div>

      <div style={styles.balanceCard}>
        <p style={styles.balanceLabel}>Current Balance</p>
        <h2 style={styles.balance}>
          {currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
      </div>

      <form onSubmit={handleDeposit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Enter Amount</label>
          <div style={styles.amountWrapper}>
            <span style={styles.currency}>{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={styles.amountInput}
              min="1"
              step="1"
              required
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>M-Pesa Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="e.g. 0712345678"
            style={styles.textInput}
            required
          />
        </div>

        <div style={styles.quickAmounts}>
          {[500, 1000, 2000, 5000].map(amt => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              style={Number(amount) === amt ? styles.quickBtnActive : styles.quickBtn}
            >
              {amt.toLocaleString()}
            </button>
          ))}
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <button type="submit" style={styles.button} disabled={submitting}>
          {submitting ? 'Sending…' : 'Deposit Funds'}
        </button>
      </form>

      <div style={styles.bottomNav}>
        <button onClick={() => navigate('/home')} style={styles.navBtn}>🏠<br/>Home</button>
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
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0a0a1a' },
  balanceCard: { background: '#fff', borderRadius: '16px', padding: '1.5rem', margin: '0 1.5rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  balanceLabel: { color: '#666', margin: '0 0 0.25rem', fontSize: '0.85rem' },
  balance: { margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#0a0a1a' },
  form: { padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', color: '#333', fontWeight: '500' },
  amountWrapper: { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  currency: { color: '#666', fontSize: '1.2rem', marginRight: '0.5rem' },
  amountInput: { flex: 1, border: 'none', outline: 'none', fontSize: '2rem', fontWeight: '700', color: '#0a0a1a', background: 'transparent' },
  textInput: { padding: '1rem 1.5rem', border: 'none', outline: 'none', fontSize: '1rem', color: '#0a0a1a', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  quickAmounts: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  quickBtn: { padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '0.9rem', color: '#333' },
  quickBtnActive: { padding: '0.5rem 1rem', border: '1px solid #00c896', borderRadius: '20px', background: '#00c896', cursor: 'pointer', fontSize: '0.9rem', color: '#fff' },
  button: { padding: '1rem', background: '#00c896', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  error: { color: '#e74c3c', background: '#ffeaea', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  success: { color: '#00c896', background: '#f0fff8', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#fff', display: 'flex', justifyContent: 'space-around', padding: '0.75rem 0', borderTop: '1px solid #f0f0f0', zIndex: 100 },
  navBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#999', textAlign: 'center', lineHeight: '1.4' }
}

export default Deposit
