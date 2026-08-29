import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { formatKES } from '../../utils/format'
import UserShell from '../../components/UserShell'

const POLL_INTERVAL_MS = 5000
// Only nudge server-side reconciliation at most this often while a deposit is
// still pending, so a stuck deposit (callback never arrived / arrived while
// Daraja was still finalising) is actively retried without hammering Daraja.
const RECONCILE_INTERVAL_MS = 15000
// Survives backgrounding / reload / navigating away and back, so polling always
// resumes for an in-flight deposit regardless of what the mobile OS does to the
// tab while the user is entering their M-Pesa PIN.
const STORAGE_KEY = 'vyloc_mpesa_deposit_id'

function readStoredDepositId() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? Number(stored) : null
  } catch {
    return null
  }
}

function clearStoredDepositId() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // sessionStorage may be unavailable (private mode); ignore.
  }
}

function Deposit() {
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // The internal M-Pesa transaction id returned by the STK push. Used to poll
  // the user-facing status endpoint; never the Daraja checkout_request_id.
  // Initialised from sessionStorage so a deposit in flight survives a reload or
  // the user switching to the M-Pesa app and back.
  const [depositId, setDepositId] = useState(() => readStoredDepositId())
  const pollRef = useRef(null)
  const lastReconcileRef = useRef(0)
  const depositIdRef = useRef(depositId)
  depositIdRef.current = depositId

  // Persist the in-flight deposit id so polling can resume after the component
  // unmounts/remounts (backgrounding, reload, navigation).
  useEffect(() => {
    if (depositId) {
      try {
        sessionStorage.setItem(STORAGE_KEY, String(depositId))
      } catch {
        // ignore unavailable storage
      }
    } else {
      clearStoredDepositId()
    }
  }, [depositId])

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
        const id = depositIdRef.current
        const res = await api.get(`/mpesa/transactions/${id}`)
        if (!active) return
        const t = res.data.data.transaction

        // FRONTEND_STATUS_CHECK: traceable via the internal transaction id.
        console.info(
          `FRONTEND_STATUS_CHECK depositId=${id} status=${t.status}`
        )

        if (t.status === 'Completed') {
          // FRONTEND_SUCCESS_DETECTED
          console.info(`FRONTEND_SUCCESS_DETECTED depositId=${id}`)
          setMessage(`${formatKES(t.amount)} added to your wallet.`)
          setError('')
          setDepositId(null) // clears sessionStorage so polling won't resume
          api.get('/wallet')
            .then(r => setWallet(r.data.data.wallet))
            .catch(() => {})
          api.get('/transactions').catch(() => {})
          clearInterval(pollRef.current)
        } else if (t.status === 'Failed') {
          // Genuine terminal failure. Anything else (Pending /
          // ReconciliationPending) is temporary uncertainty and must never be
          // surfaced as failure, because a real M-Pesa payment may still be
          // confirming.
          setError('Your M-Pesa deposit failed. Please try again.')
          setMessage('')
          setDepositId(null) // clear so we don't re-show this on next mount
          clearInterval(pollRef.current)
        } else {
          // Temporary / non-final state. Keep polling, and actively nudge
          // server-side reconciliation so a stuck deposit (callback never
          // arrived, or arrived before Daraja finalised) gets resolved without
          // waiting for the backend sweep interval.
          if (t.status === 'ReconciliationPending') {
            setMessage('Confirming your payment...')
          } else {
            setMessage('Waiting for M-Pesa confirmation...')
          }

          const now = Date.now()
          if (now - lastReconcileRef.current >= RECONCILE_INTERVAL_MS) {
            lastReconcileRef.current = now
            api.post(`/mpesa/transactions/${id}/reconcile`).catch(() => {})
          }
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
      lastReconcileRef.current = 0
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
    <UserShell nav variant="narrow" style={styles.container}>
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
    </UserShell>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--surface)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--ink-900)' },
  balanceCard: { background: 'var(--white)', borderRadius: '16px', padding: '1.5rem', margin: '0 1.5rem 1.5rem', boxShadow: '0 2px 8px rgba(15,18,38,0.06)' },
  balanceLabel: { color: 'var(--ink-500)', margin: '0 0 0.25rem', fontSize: '0.85rem' },
  balance: { margin: 0, fontSize: '1.8rem', fontWeight: '700', color: 'var(--ink-900)' },
  form: { padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.9rem', color: 'var(--ink-700)', fontWeight: '500' },
  amountWrapper: { display: 'flex', alignItems: 'center', background: 'var(--white)', borderRadius: '12px', padding: '1rem 1.5rem', boxShadow: '0 2px 8px rgba(15,18,38,0.06)' },
  currency: { color: 'var(--ink-500)', fontSize: '1.2rem', marginRight: '0.5rem' },
  amountInput: { flex: 1, border: 'none', outline: 'none', fontSize: '2rem', fontWeight: '700', color: 'var(--ink-900)', background: 'transparent' },
  textInput: { padding: '1rem 1.5rem', border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--ink-900)', background: 'var(--white)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(15,18,38,0.06)' },
  quickAmounts: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  quickBtn: { padding: '0.5rem 1rem', border: '1px solid var(--line)', borderRadius: '20px', background: 'var(--white)', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--ink-700)' },
  quickBtnActive: { padding: '0.5rem 1rem', border: '1px solid var(--emerald-500)', borderRadius: '20px', background: 'var(--emerald-500)', cursor: 'pointer', fontSize: '0.9rem', color: '#fff' },
  button: { padding: '1rem', background: 'var(--emerald-500)', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  success: { color: 'var(--green-600)', background: 'var(--green-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }
}

export default Deposit
