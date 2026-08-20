import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const response = await api.post('/forgot-password', { email })
      setToken(response.data.reset_token)
      setMessage('Reset token generated successfully.')
    } catch (err) {
      setError('Email not found. Please try again.')
    }
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>←</button>
      <h2 style={styles.title}>Forgot Password</h2>
      <p style={styles.subtitle}>Enter your email to receive a reset token</p>
      {message && (
        <div style={styles.success}>
          <p>{message}</p>
          <div style={styles.tokenBox}>
            <p style={styles.tokenLabel}>Your reset token:</p>
            <p style={styles.token}>{token}</p>
          </div>
          <Link to="/reset-password" style={styles.resetLink}>Reset Password →</Link>
        </div>
      )}
      {error && <p style={styles.error}>{error}</p>}
      {!token && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@vyloc.com" style={styles.input} required />
          </div>
          <button type="submit" style={styles.button}>Send Reset Token</button>
        </form>
      )}
      <p style={styles.footer}>Remember your password? <Link to="/login" style={styles.link}>Sign In</Link></p>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#fff', maxWidth: '430px', margin: '0 auto', padding: '2rem 1.5rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', marginBottom: '1rem', padding: 0 },
  title: { fontSize: '1.8rem', fontWeight: '700', margin: '0 0 0.5rem', color: '#0a0a1a' },
  subtitle: { color: '#666', margin: '0 0 2rem', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.9rem', color: '#333', fontWeight: '500' },
  input: { padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' },
  button: { padding: '1rem', background: '#00c896', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  success: { background: '#f0fff8', border: '1px solid #00c896', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' },
  tokenBox: { background: '#e8f8f3', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' },
  tokenLabel: { fontSize: '0.8rem', color: '#666', margin: '0 0 0.25rem' },
  token: { fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all', margin: 0, color: '#0a0a1a' },
  resetLink: { display: 'inline-block', marginTop: '0.75rem', color: '#00c896', fontWeight: '600', textDecoration: 'none' },
  error: { color: '#e74c3c', background: '#ffeaea', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '0.9rem' },
  link: { color: '#00c896', textDecoration: 'none', fontWeight: '600' }
}

export default ForgotPassword
