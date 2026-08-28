import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { parseMoney } from '../../utils/format'
import UserShell from '../../components/UserShell'

// The Vyloc MVP backend charges no peer-to-peer transfer fee
// (see TransactionService.TRANSFER_FEE). The fee is displayed from this
// constant so the review screen never shows an invented amount.
const TRANSFER_FEE = 0

function SendMoney() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState('')
  const [search, setSearch] = useState('')
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function load() {
      try {
        // Both responses use the standard Vyloc envelope:
        // { success, message, data: { ... } }
        const [beneficiaryRes, walletRes] = await Promise.all([
          api.get('/beneficiaries'),
          api.get('/wallet'),
        ])
        if (!active) return
        setBeneficiaries(beneficiaryRes.data.data.beneficiaries || [])
        setWallet(walletRes.data.data.wallet)
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load your beneficiaries. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [])

  const currency = wallet?.currency || 'KES'
  const balance = wallet ? parseMoney(wallet.balance) : 0

  // Client-side filter over the already-fetched list. The backend has no
  // beneficiary search endpoint, so no extra request is made.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return beneficiaries
    return beneficiaries.filter((b) =>
      [b.name, b.email, b.phone_number]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term))
    )
  }, [beneficiaries, search])

  function handleContinue(e) {
    e.preventDefault()
    setError('')

    if (!selected) {
      setError('Please select a beneficiary')
      return
    }

    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    // The backend rejects amounts with more than 2 decimal places
    // (validate_money_amount), so fail fast here with a clearer message.
    if (Math.round(numericAmount * 100) !== numericAmount * 100) {
      setError('Amount cannot have more than 2 decimal places.')
      return
    }
    if (numericAmount + TRANSFER_FEE > balance) {
      setError('Insufficient balance for this transfer.')
      return
    }

    navigate('/transfer-review', {
      state: {
        // receiverId is the beneficiary's *user* id, which is what
        // POST /transactions/transfer expects. `selected.id` is only the id of
        // the saved-beneficiary row and must not be sent as the receiver.
        receiverId: selected.beneficiary_user_id,
        beneficiaryName: selected.name,
        amount: numericAmount,
        currency,
      },
    })
  }

  return (
    <UserShell nav variant="narrow" style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>←</button>
        <h2 style={styles.title}>Send Money</h2>
        <div />
      </div>

      <div style={styles.searchWrapper}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, phone, or email"
          style={styles.search}
        />
      </div>

      <div style={styles.section}>
        <p style={styles.sectionLabel}>Saved Beneficiaries</p>
        <div style={styles.beneficiaryList}>
          {loading ? (
            <p style={styles.empty}>Loading…</p>
          ) : visible.length === 0 ? (
            <p style={styles.empty}>
              {beneficiaries.length === 0 ? 'No beneficiaries yet.' : 'No matching beneficiaries.'}
            </p>
          ) : (
            visible.map(b => (
              <div
                key={b.id}
                onClick={() => setSelected(b)}
                style={selected?.id === b.id ? styles.beneficiaryActive : styles.beneficiary}
              >
                <div style={selected?.id === b.id ? styles.beneficiaryAvatarActive : styles.beneficiaryAvatar}>
                  {b.name?.[0] || 'B'}
                </div>
                <p style={styles.beneficiaryName}>{b.name}</p>
              </div>
            ))
          )}
        </div>
        {!loading && beneficiaries.length === 0 && (
          <button type="button" onClick={() => navigate('/beneficiaries')} style={styles.addLink}>
            + Add a beneficiary
          </button>
        )}
      </div>

      <form onSubmit={handleContinue} style={styles.form}>
        <div style={styles.amountCard}>
          <p style={styles.amountLabel}>How much to send?</p>
          <div style={styles.amountWrapper}>
            <span style={styles.currency}>{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={styles.amountInput}
              min="1"
              step="0.01"
            />
          </div>
          <p style={styles.fee}>
            Transaction Fee: {currency} {TRANSFER_FEE.toFixed(2)}
          </p>
          <p style={styles.available}>
            Available: {currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.button}>Continue</button>
      </form>
    </UserShell>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--surface)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--ink-900)' },
  searchWrapper: { padding: '0 1.5rem 1rem' },
  // Search field aligned with the rest of the form inputs for consistent
  // contrast and readability.
  search: { width: '100%', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: 'var(--white)', color: 'var(--ink-900)' },
  section: { padding: '0 1.5rem 1rem' },
  sectionLabel: { fontSize: '0.9rem', color: 'var(--ink-500)', fontWeight: '500', marginBottom: '0.75rem' },
  beneficiaryList: { display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' },
  beneficiary: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', minWidth: '60px' },
  beneficiaryActive: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', minWidth: '60px', opacity: 1 },
  beneficiaryAvatar: { width: '50px', height: '50px', background: 'var(--emerald-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--emerald-600)', fontSize: '1.2rem', border: '2px solid transparent' },
  beneficiaryAvatarActive: { width: '50px', height: '50px', background: 'var(--emerald-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--emerald-600)', fontSize: '1.2rem', border: '2px solid var(--emerald-500)' },
  beneficiaryName: { margin: 0, fontSize: '0.75rem', color: 'var(--ink-700)', textAlign: 'center' },
  addLink: { background: 'none', border: 'none', color: 'var(--emerald-500)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', padding: '0.5rem 0' },
  form: { padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  amountCard: { background: 'var(--white)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(15,18,38,0.06)' },
  amountLabel: { color: 'var(--ink-500)', margin: '0 0 1rem', fontSize: '0.9rem' },
  amountWrapper: { display: 'flex', alignItems: 'center', marginBottom: '0.5rem' },
  currency: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--ink-900)', marginRight: '0.5rem' },
  amountInput: { flex: 1, border: 'none', outline: 'none', fontSize: '2.5rem', fontWeight: '700', color: 'var(--ink-900)', background: 'transparent', width: '100%' },
  fee: { color: 'var(--ink-500)', fontSize: '0.85rem', margin: '0.5rem 0 0.25rem' },
  available: { color: 'var(--ink-500)', fontSize: '0.85rem', margin: 0 },
  button: { padding: '1rem', background: 'var(--emerald-500)', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  empty: { color: 'var(--ink-300)', fontSize: '0.9rem' }
}

export default SendMoney
