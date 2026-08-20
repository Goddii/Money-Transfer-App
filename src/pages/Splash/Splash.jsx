import { useNavigate } from 'react-router-dom'

function Splash() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>⚡</div>
        <h1 style={styles.appName}>Vyloc</h1>
        <p style={styles.tagline}>Fast. Secure. Effortless.</p>
      </div>
      <button onClick={() => navigate('/login')} style={styles.button}>
        Get Started
      </button>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1f2d 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '4rem 2rem', maxWidth: '430px', margin: '0 auto' },
  logoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '6rem' },
  logoIcon: { width: '80px', height: '80px', background: '#00c896', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '1.5rem' },
  appName: { color: '#fff', fontSize: '2.5rem', fontWeight: '700', margin: '0 0 0.5rem' },
  tagline: { color: '#8899aa', fontSize: '1rem', margin: 0 },
  button: { width: '100%', padding: '1rem', background: '#00c896', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' }
}

export default Splash
