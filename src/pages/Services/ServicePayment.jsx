import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import api from '../../utils/api'
import { parseMoney, formatKES } from '../../utils/format'
import UserShell from '../../components/UserShell'

// Backend status vocabulary (app/models/service_payment.py ServicePaymentStatus).
// The API returns Title-case strings, not UPPERCASE.
const STATUS = {
  INITIATED: 'Initiated',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
}

// Normalise a Kenyan phone number the same way the backend does
// (app/utils/validators.py normalize_kenyan_phone) so the frontend accepts the
// same input formats the API supports.
function normalizePhone(raw) {
  let s = (raw || '').replace(/[\s\-()+]/g, '')
  if (s.startsWith('+')) s = s.slice(1)
  if (s.startsWith('0')) s = '254' + s.slice(1)
  else if (s.length === 9 && (s[0] === '7' || s[0] === '1')) s = '254' + s
  return s
}

const SERVICE_ICONS = {
  ELECTRICITY: '⚡',
  WATER: '💧',
  AIRTIME: '📱',
}

function ServicePayment() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const service = state?.service

  const [step, setStep] = useState('form') // form | review | processing | result
  const [accountNumber, setAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [wallet, setWallet] = useState(null)
  const [walletLoading, setWalletLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [processing, setProcessing] = useState(false)

  // Stable idempotency key per payment attempt. Generated once per mount and
  // preserved across in-app navigation (review -> edit -> submit) and across
  // error/retry cycles, so a retry of a lost response reuses the same key
  // instead of creating a second debit.
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  // Synchronous guard against duplicate submission (double-click / rapid
  // repeated events) that does not rely solely on React state timing.
  const submittingRef = useRef(false)

  useEffect(() => {
    let active = true

    async function loadWallet() {
      try {
        const res = await api.get('/wallet')
        if (!active) return
        setWallet(res.data.data.wallet)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load wallet balance.')
      } finally {
        if (active) setWalletLoading(false)
      }
    }

    if (service) loadWallet()
    return () => { active = false }
  }, [service])

  const serviceType = service?.service_type || ''
  const serviceName = service?.display_name || service?.name || ''
  const serviceIcon = SERVICE_ICONS[serviceType] || '📦'
  const balance = wallet ? parseMoney(wallet.balance) : 0
  const currency = wallet?.currency || 'KES'

  // Field config per service type. Airtime is validated separately because the
  // backend accepts several Kenyan phone formats (see normalizePhone).
  const fieldConfig = {
    ELECTRICITY: { label: 'Meter number', placeholder: 'e.g. 1234567890', type: 'text', pattern: /^\d{10,15}$/ },
    WATER: { label: 'Account number', placeholder: 'e.g. 1234567890', type: 'text', pattern: /^\d{10,15}$/ },
    AIRTIME: { label: 'Phone number', placeholder: 'e.g. 0712345678', type: 'tel' },
  }

  const field = fieldConfig[serviceType] || fieldConfig.ELECTRICITY

  function validateForm() {
    if (!accountNumber.trim()) {
      setError(`${field.label} is required.`)
      return false
    }

    if (serviceType === 'AIRTIME') {
      if (!/^254[17]\d{8}$/.test(normalizePhone(accountNumber.trim()))) {
        setError('Enter a valid Kenyan phone number (e.g. 0712345678 or 254712345678).')
        return false
      }
    } else if (!field.pattern.test(accountNumber.trim())) {
      setError(`${field.label} must be 10-15 digits.`)
      return false
    }

    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount.')
      return false
    }
    const decimalPlaces = (String(numAmount).split('.')[1] || '').length
    if (decimalPlaces > 2) {
      setError('Amount cannot have more than 2 decimal places.')
      return false
    }
    if (numAmount > balance) {
      setError('Insufficient wallet balance for this payment.')
      return false
    }

    setError('')
    return true
  }

  function handleReview(e) {
    e.preventDefault()
    if (validateForm()) {
      setStep('review')
    }
  }

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return
    submittingRef.current = true

    setStep('processing')
    setProcessing(true)
    setError('')

    try {
      const payload = {
        service_type: serviceType,
        account_number: accountNumber.trim(),
        amount: parseFloat(amount),
        idempotency_key: idempotencyKey,
      }

      const res = await api.post('/service-payments', payload)
      const payment = res.data.data.payment

      setResult(payment)
      setStep('result')
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment failed. Please try again.'
      setError(msg)
      setStep('review')
    } finally {
      setProcessing(false)
      submittingRef.current = false
    }
  }, [serviceType, accountNumber, amount, idempotencyKey])

  function maskAccount(num) {
    if (!num || num.length < 4) return num
    return '****' + num.slice(-4)
  }

  const numericAmount = parseFloat(amount) || 0

  // Redirect if no service passed
  if (!service) {
    return <Navigate to="/services" replace />
  }

  // FORM STEP
  if (step === 'form') {
    return (
      <UserShell variant="narrow" style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.back}>←</button>
          <h2 style={styles.title}>{serviceName}</h2>
          <div />
        </div>

        <div style={styles.balanceCard}>
          <p style={styles.balanceLabel}>Available Balance</p>
          <p style={styles.balanceValue}>{walletLoading ? '…' : formatKES(balance)}</p>
        </div>

        <form onSubmit={handleReview} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="account-number">{field.label}</label>
            <input
              id="account-number"
              type={field.type}
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder={field.placeholder}
              style={styles.input}
              autoComplete="off"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="amount">Amount ({currency})</label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={styles.amountInput}
                step="0.01"
              />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.primaryBtn}>Review Payment</button>
        </form>
      </UserShell>
    )
  }

  // REVIEW STEP
  if (step === 'review') {
    return (
      <UserShell variant="narrow" style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => setStep('form')} style={styles.back}>←</button>
          <h2 style={styles.title}>Review Payment</h2>
          <div />
        </div>

        <div style={styles.reviewCard}>
          <div style={styles.reviewRow}>
            <p style={styles.reviewLabel}>Service</p>
            <p style={styles.reviewValue}>{serviceIcon} {serviceName}</p>
          </div>
          <div style={styles.divider} />
          <div style={styles.reviewRow}>
            <p style={styles.reviewLabel}>{field.label}</p>
            <p style={styles.reviewValue}>{maskAccount(accountNumber.trim())}</p>
          </div>
          <div style={styles.divider} />
          <div style={styles.reviewRow}>
            <p style={styles.reviewLabel}>Amount</p>
            <p style={styles.reviewValue}>{formatKES(numericAmount)}</p>
          </div>
          <div style={styles.divider} />
          <div style={styles.reviewRow}>
            <p style={styles.reviewLabel}>From Wallet</p>
            <p style={styles.reviewValue}>{currency} Balance</p>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.actions}>
          <button
            onClick={handleSubmit}
            style={styles.primaryBtn}
            disabled={processing}
          >
            Pay {formatKES(numericAmount)}
          </button>
          <button
            onClick={() => setStep('form')}
            style={styles.secondaryBtn}
            disabled={processing}
          >
            Edit Payment
          </button>
        </div>
      </UserShell>
    )
  }

  // PROCESSING STEP
  if (step === 'processing') {
    return (
      <UserShell variant="narrow" style={styles.processingContainer}>
        <div style={styles.processingIcon}>⏳</div>
        <h2 style={styles.processingTitle}>Processing Payment</h2>
        <p style={styles.processingText}>
          Please wait while we process your {serviceName.toLowerCase()} payment…
        </p>
      </UserShell>
    )
  }

  // RESULT STEP
  if (step === 'result' && result) {
    const status = result.status
    const meta = result.result_metadata || {}
    const isCompleted = status === STATUS.COMPLETED
    const isPending = status === STATUS.PENDING
    const isFailed = status === STATUS.FAILED
    const isRefunded = status === STATUS.REFUNDED
    const isProcessing = status === STATUS.INITIATED || status === STATUS.PROCESSING

    const resultIcon = isCompleted ? '✓' : (isFailed || isRefunded) ? '✕' : '⏳'
    const resultTitle = isCompleted
      ? 'Payment Successful!'
      : isPending
        ? 'Payment Pending'
        : isProcessing
          ? 'Payment Processing'
          : isRefunded
            ? 'Payment Refunded'
            : 'Payment Failed'
    const resultColor = isCompleted
      ? 'var(--green-600)'
      : (isPending || isProcessing)
        ? 'var(--amber-500)'
        : (isRefunded)
          ? 'var(--amber-500)'
          : 'var(--red-600)'

    return (
      <UserShell variant="narrow" style={styles.resultContainer}>
        <div style={{ ...styles.resultIcon, background: resultColor }}>{resultIcon}</div>
        <h2 style={styles.resultTitle}>{resultTitle}</h2>

        {isCompleted && (
          <p style={styles.resultSubtitle}>Your payment has been processed successfully.</p>
        )}
        {isPending && (
          <p style={styles.resultSubtitle}>
            Your payment is awaiting confirmation. You can check the status from your payment history.
          </p>
        )}
        {isProcessing && (
          <p style={styles.resultSubtitle}>
            Your payment is being processed. You can check the status from your payment history.
          </p>
        )}
        {isFailed && (
          <p style={styles.resultSubtitle}>
            We couldn't complete this payment.
          </p>
        )}
        {isRefunded && (
          <p style={styles.resultSubtitle}>
            This payment could not be completed and your wallet has been refunded.
          </p>
        )}

        <div style={styles.detailsCard}>
          <div style={styles.detailRow}>
            <p style={styles.detailLabel}>Service</p>
            <p style={styles.detailValue}>{serviceIcon} {serviceName}</p>
          </div>
          <div style={styles.divider} />
          <div style={styles.detailRow}>
            <p style={styles.detailLabel}>{field.label}</p>
            <p style={styles.detailValue}>{maskAccount(accountNumber.trim())}</p>
          </div>
          <div style={styles.divider} />
          <div style={styles.detailRow}>
            <p style={styles.detailLabel}>Amount</p>
            <p style={styles.detailValue}>{formatKES(parseMoney(result.amount))}</p>
          </div>
          {result.payment_reference && (
            <>
              <div style={styles.divider} />
              <div style={styles.detailRow}>
                <p style={styles.detailLabel}>Reference</p>
                <p style={styles.detailValue}>{result.payment_reference}</p>
              </div>
            </>
          )}
          {/* Electricity-specific fields (nested in result_metadata) */}
          {meta.token && (
            <>
              <div style={styles.divider} />
              <div style={styles.detailRow}>
                <p style={styles.detailLabel}>Token</p>
                <p style={{ ...styles.detailValue, ...styles.tokenValue }}>{meta.token}</p>
              </div>
            </>
          )}
          {meta.units != null && (
            <>
              <div style={styles.divider} />
              <div style={styles.detailRow}>
                <p style={styles.detailLabel}>Units</p>
                <p style={styles.detailValue}>{meta.units} kWh</p>
              </div>
            </>
          )}
          {/* Water-specific fields */}
          {meta.receipt_number && (
            <>
              <div style={styles.divider} />
              <div style={styles.detailRow}>
                <p style={styles.detailLabel}>Receipt</p>
                <p style={styles.detailValue}>{meta.receipt_number}</p>
              </div>
            </>
          )}
          {/* Airtime-specific fields */}
          {meta.confirmation_reference && (
            <>
              <div style={styles.divider} />
              <div style={styles.detailRow}>
                <p style={styles.detailLabel}>Confirmation</p>
                <p style={styles.detailValue}>{meta.confirmation_reference}</p>
              </div>
            </>
          )}
          <div style={styles.divider} />
          <div style={styles.detailRow}>
            <p style={styles.detailLabel}>Status</p>
            <p style={styles.detailValue}>{status}</p>
          </div>
          {result.created_at && (
            <>
              <div style={styles.divider} />
              <div style={styles.detailRow}>
                <p style={styles.detailLabel}>Date</p>
                <p style={styles.detailValue}>
                  {new Date(result.created_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </>
          )}
        </div>

        <div style={styles.actions}>
          {(isPending || isProcessing) && (
            <button
              onClick={() => navigate(`/service-payments/${result.id}`)}
              style={styles.primaryBtn}
            >
              View Payment Details
            </button>
          )}
          <button onClick={() => navigate('/services')} style={styles.secondaryBtn}>
            {isCompleted ? 'Pay Another Service' : 'Back to Services'}
          </button>
          <button onClick={() => navigate('/service-payments')} style={styles.textBtn}>
            View Payment History
          </button>
        </div>
      </UserShell>
    )
  }

  // Fallback
  return <Navigate to="/services" replace />
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--surface)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--ink-900)' },
  balanceCard: {
    background: 'var(--emerald-500)',
    borderRadius: '16px',
    padding: '1.25rem',
    margin: '0.5rem 1.5rem 1.5rem',
    color: '#fff',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', margin: '0 0 0.35rem', fontSize: '0.85rem' },
  balanceValue: { color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: '700' },
  form: { padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: 'var(--ink-500)', fontSize: '0.85rem', fontWeight: '500' },
  input: {
    padding: '0.9rem 1rem',
    borderRadius: '10px',
    border: '1px solid var(--line)',
    fontSize: '0.95rem',
    outline: 'none',
    background: 'var(--white)',
    color: 'var(--ink-900)',
  },
  amountInput: {
    padding: '0.9rem 1rem',
    borderRadius: '10px',
    border: '1px solid var(--line)',
    fontSize: '1.25rem',
    fontWeight: '700',
    outline: 'none',
    background: 'var(--white)',
    color: 'var(--ink-900)',
    width: '100%',
    boxSizing: 'border-box',
  },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', margin: 0 },
  primaryBtn: {
    padding: '1rem',
    background: 'var(--emerald-500)',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  secondaryBtn: {
    padding: '1rem',
    background: 'var(--white)',
    color: 'var(--ink-900)',
    border: '1px solid var(--line)',
    borderRadius: '50px',
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
  },
  textBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--emerald-500)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0.5rem',
    width: '100%',
    textAlign: 'center',
  },
  // Review styles
  reviewCard: {
    background: 'var(--white)',
    borderRadius: '16px',
    padding: '1.5rem',
    margin: '0.5rem 1.5rem 1.5rem',
    boxShadow: '0 2px 8px rgba(15,18,38,0.06)',
  },
  reviewRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' },
  reviewLabel: { margin: 0, color: 'var(--ink-500)', fontSize: '0.9rem' },
  reviewValue: { margin: 0, color: 'var(--ink-900)', fontSize: '0.95rem', fontWeight: '600' },
  divider: { height: '1px', background: 'var(--line)', margin: '0.25rem 0' },
  actions: { padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  // Processing styles
  processingContainer: {
    minHeight: '100vh',
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
  },
  processingIcon: { fontSize: '3rem', marginBottom: '1.5rem' },
  processingTitle: { fontSize: '1.3rem', fontWeight: '700', color: 'var(--ink-900)', margin: '0 0 0.5rem' },
  processingText: { color: 'var(--ink-500)', textAlign: 'center', margin: 0 },
  // Result styles
  resultContainer: {
    minHeight: '100vh',
    background: 'var(--surface)',
    padding: '2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  resultIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
  },
  resultTitle: { fontSize: '1.6rem', fontWeight: '700', color: 'var(--ink-900)', margin: '0 0 0.5rem', textAlign: 'center' },
  resultSubtitle: { color: 'var(--ink-500)', margin: '0 0 1.5rem', textAlign: 'center', maxWidth: '320px' },
  detailsCard: {
    background: 'var(--white)',
    borderRadius: '16px',
    padding: '1.5rem',
    width: '100%',
    boxShadow: '0 2px 8px rgba(15,18,38,0.06)',
    marginBottom: '1.5rem',
  },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' },
  detailLabel: { margin: 0, color: 'var(--ink-500)', fontSize: '0.9rem' },
  detailValue: { margin: 0, color: 'var(--ink-900)', fontSize: '0.9rem', fontWeight: '600', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' },
  tokenValue: { fontSize: '0.85rem', fontFamily: 'monospace', letterSpacing: '0.5px' },
}

export default ServicePayment
