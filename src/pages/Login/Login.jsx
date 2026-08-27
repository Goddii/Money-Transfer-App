import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../../store/authSlice'
import api from '../../utils/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token, user } = response.data.data
      dispatch(loginSuccess({
        user: user,
        token: access_token
      }))
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/home')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Enter your credentials to access your account</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@vyloc.com" style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={styles.passwordInput} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>{showPassword ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
          <button type="submit" style={styles.button}>Sign In</button>
        </form>
        <p style={styles.footer}>Don't have an account? <Link to="/register" style={styles.link}>Sign Up</Link></p>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--white)', maxWidth: '430px', margin: '0 auto', padding: '2rem 1.5rem' },
  content: { paddingTop: '1rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', margin: '0 0 0.5rem', color: 'var(--ink-900)' },
  subtitle: { color: 'var(--ink-500)', margin: '0 0 2rem', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.9rem', color: 'var(--ink-700)', fontWeight: '500' },
  input: { padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '1rem', outline: 'none' },
  passwordWrapper: { display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden' },
  passwordInput: { flex: 1, padding: '0.9rem 1rem', border: 'none', fontSize: '1rem', outline: 'none' },
  eyeBtn: { background: 'none', border: 'none', padding: '0.9rem', cursor: 'pointer', fontSize: '1rem' },
  forgotLink: { color: 'var(--emerald-500)', fontSize: '0.9rem', textDecoration: 'none', textAlign: 'right' },
  button: { padding: '1rem', background: 'var(--emerald-500)', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: 'var(--ink-500)', fontSize: '0.9rem' },
  link: { color: 'var(--emerald-500)', textDecoration: 'none', fontWeight: '600' }
}

export default Login
