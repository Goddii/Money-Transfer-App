import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { serviceTypeOf } from '../../utils/serviceTypes'
import UserShell from '../../components/UserShell'
import OfflineBanner from '../../components/OfflineBanner'

const SERVICE_ICONS = {
  ELECTRICITY: '⚡',
  WATER: '💧',
  AIRTIME: '📱',
}

function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const res = await api.get('/services')
        if (!active) return
        setServices(res.data.data.services || [])
      } catch (err) {
        if (!active) return
        setError(err.response?.data?.message || 'Unable to load services. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [])

  return (
    <UserShell nav variant="narrow" style={styles.container}>
      <OfflineBanner />
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.back}>←</button>
        <h2 style={styles.title}>Services</h2>
        <div />
      </div>

      <p style={styles.subtitle}>
        Pay for utilities and services directly from your Vyloc wallet.
      </p>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        {loading ? (
          <p style={styles.empty}>Loading services…</p>
        ) : services.length === 0 ? (
          <p style={styles.empty}>No services available right now.</p>
        ) : (
          services.map(service => (
            <button
              key={service.id || serviceTypeOf(service)}
              onClick={() => navigate('/service-payment', { state: { service } })}
              style={styles.card}
              type="button"
            >
              <span style={styles.cardIcon}>
                {SERVICE_ICONS[serviceTypeOf(service)] || '📦'}
              </span>
              <h3 style={styles.cardTitle}>{service.display_name || service.name}</h3>
              <p style={styles.cardDesc}>
                {serviceTypeOf(service) === 'ELECTRICITY' && 'Purchase simulated prepaid electricity'}
                {serviceTypeOf(service) === 'WATER' && 'Make a simulated water payment'}
                {serviceTypeOf(service) === 'AIRTIME' && 'Purchase simulated airtime'}
              </p>
            </button>
          ))
        )}
      </div>

      <div style={styles.historyLink}>
        <button
          onClick={() => navigate('/service-payments')}
          style={styles.historyBtn}
          type="button"
        >
          View Payment History →
        </button>
      </div>
    </UserShell>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--surface)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 1.5rem 0.5rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--ink-900)' },
  subtitle: { color: 'var(--ink-500)', fontSize: '0.9rem', margin: '0.5rem 1.5rem 1.5rem' },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', margin: '0 1.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', padding: '0 1.5rem' },
  card: {
    background: 'var(--white)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(15,18,38,0.06)',
    border: '1px solid var(--line)',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  cardIcon: { fontSize: '2rem', lineHeight: 1 },
  cardTitle: { margin: 0, fontSize: '1.05rem', fontWeight: '600', color: 'var(--ink-900)' },
  cardDesc: { margin: 0, fontSize: '0.85rem', color: 'var(--ink-500)' },
  empty: { color: 'var(--ink-500)', textAlign: 'center', padding: '2rem 0', gridColumn: '1 / -1' },
  historyLink: { padding: '2rem 1.5rem', textAlign: 'center' },
  historyBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--emerald-500)',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
  },
}

export default Services
