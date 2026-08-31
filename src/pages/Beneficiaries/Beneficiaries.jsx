import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import UserShell from '../../components/UserShell'

// Beneficiary management for the authenticated user.
//
// The backend resolves a user-facing account identifier (phone number or email)
// to the internal user id, so the user never has to know or type a Vyloc user
// ID. The internal id is still returned in the beneficiary record and used by
// SendMoney, but it is never shown to or requested from the user here.
function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const res = await api.get('/beneficiaries')
        if (!active) return
        setBeneficiaries(res.data.data.beneficiaries || [])
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

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const value = identifier.trim()
    if (!value) {
      setError("Enter the recipient's phone number or email.")
      return
    }

    // Pick the field the backend expects based on the identifier shape. The
    // server still resolves this to the internal user id on its side.
    const payload = value.includes('@')
      ? { email: value }
      : { phone_number: value }

    setSubmitting(true)
    try {
      const res = await api.post('/beneficiaries', payload)
      const created = res.data.data.beneficiary
      setBeneficiaries(prev => [created, ...prev])
      setSuccess(`${created.name || 'Beneficiary'} added successfully.`)
      setIdentifier('')
    } catch (err) {
      // Backend returns clear messages for self-add (400), unknown user (404)
      // and duplicates (409).
      setError(err.response?.data?.message || 'Could not add that beneficiary.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove(beneficiary) {
    setError('')
    setSuccess('')
    try {
      await api.delete(`/beneficiaries/${beneficiary.id}`)
      setBeneficiaries(prev => prev.filter(b => b.id !== beneficiary.id))
      setSuccess(`${beneficiary.name || 'Beneficiary'} removed.`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove that beneficiary.')
    }
  }

  return (
    <UserShell nav variant="list" style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>←</button>
        <h2 style={styles.title}>Beneficiaries</h2>
        <div />
      </div>

      <form onSubmit={handleAdd} style={styles.addCard}>
        <label style={styles.label}>Add a beneficiary</label>
        <p style={styles.hint}>Enter the recipient&apos;s phone number or email.</p>
        <div style={styles.addRow}>
          <input
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="e.g. 0712 345 678 or name@email.com"
            style={styles.input}
          />
          <button type="submit" style={styles.addBtn} disabled={submitting}>
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </div>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <div style={styles.list}>
        <p style={styles.sectionLabel}>Saved Beneficiaries</p>
        {loading ? (
          <p style={styles.empty}>Loading…</p>
        ) : beneficiaries.length === 0 ? (
          <p style={styles.empty}>No beneficiaries yet.</p>
        ) : (
          beneficiaries.map(b => (
            <div key={b.id} style={styles.row}>
              <div style={styles.avatar}>{b.name?.[0] || 'B'}</div>
              <div style={styles.info}>
                <p style={styles.name}>{b.name || 'Unknown'}</p>
                <p style={styles.meta}>{b.email || b.phone_number || `User #${b.beneficiary_user_id}`}</p>
              </div>
              <button onClick={() => handleRemove(b)} style={styles.removeBtn}>Remove</button>
            </div>
          ))
        )}
      </div>
    </UserShell>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--surface)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 1rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--ink-900)' },
  addCard: { background: 'var(--white)', borderRadius: '16px', padding: '1.25rem', margin: '0 1.5rem 1rem', boxShadow: '0 2px 8px rgba(15,18,38,0.06)' },
  label: { fontSize: '0.95rem', color: 'var(--ink-900)', fontWeight: '600' },
  hint: { fontSize: '0.8rem', color: 'var(--ink-500)', margin: '0.25rem 0 0.75rem' },
  addRow: { display: 'flex', gap: '0.75rem' },
  input: { flex: 1, padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '1rem', outline: 'none', minWidth: 0 },
  addBtn: { padding: '0.8rem 1.5rem', background: 'var(--emerald-500)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', margin: '0 1.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' },
  success: { color: 'var(--green-600)', background: 'var(--green-100)', padding: '0.75rem', margin: '0 1.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' },
  list: { padding: '0 1.5rem' },
  sectionLabel: { fontSize: '0.9rem', color: 'var(--ink-500)', fontWeight: '600', margin: '0 0 0.5rem' },
  row: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--line)' },
  avatar: { width: '40px', height: '40px', background: 'var(--emerald-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--emerald-600)', flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  name: { margin: 0, fontWeight: '600', fontSize: '0.95rem', color: 'var(--ink-900)' },
  meta: { margin: 0, fontSize: '0.8rem', color: 'var(--ink-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  removeBtn: { background: 'none', border: 'none', color: 'var(--red-600)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', flexShrink: 0 },
  empty: { color: 'var(--ink-500)', textAlign: 'center', padding: '2rem 0' }
}

export default Beneficiaries
