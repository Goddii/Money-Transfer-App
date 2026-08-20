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
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1f2d 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4rem 2rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '10rem'
  },
  logoIcon: {
    width: '100px',
    height: '100px',
    background: '#00c896',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    marginBottom: '1.5rem'
  },
  appName: {
    color: '#fff',
    fontSize: '3rem',
    fontWeight: '700',
    margin: '0 0 0.5rem'
  },
  tagline: {
    color: '#8899aa',
    fontSize: '1.1rem',
    margin: 0
  },
  button: {
    width: '100%',
    maxWidth: '400px',
    padding: '1.2rem',
    background: '#00c896',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '1.2rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '2rem'
  }
}

export default Splash
