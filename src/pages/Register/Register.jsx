import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'
import UserShell from '../../components/UserShell'

function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service')
      return
    }
    setError('')
    try {
      await api.post('/auth/register', {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        password
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.')
    }
  }

  return (
    <UserShell variant="narrow" style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>←</button>
      <h2 style={styles.title}>Create Account</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>First Name</label>
          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Alex" style={styles.input} required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Last Name</label>
          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Carter" style={styles.input} required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@vyloc.com" style={styles.input} required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Phone Number</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 700 000 000" style={styles.input} required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <div style={styles.passwordWrapper}>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={styles.passwordInput} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>{showPassword ? '🙈' : '👁️'}</button>
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirm Password</label>
          <div style={styles.passwordWrapper}>
            <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={styles.passwordInput} required />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>{showConfirm ? '🙈' : '👁️'}</button>
          </div>
        </div>
        <div style={styles.checkboxRow}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} id="terms" />
          <label htmlFor="terms" style={styles.checkboxLabel}>
            I agree to the <span style={styles.link}>Terms of Service</span> & <span style={styles.link}>Privacy Policy</span>
          </label>
        </div>
        <button type="submit" style={styles.button}>Create Account</button>
      </form>
      <p style={styles.footer}>Already have an account? <Link to="/login" style={styles.link}>Sign In</Link></p>
    </UserShell>
  )
}

const styles = {
  container: { minHeight: '100vh', background: 'var(--white)', padding: '2rem 1.5rem' },
  back: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', marginBottom: '1rem', padding: 0 },
  title: { fontSize: '1.8rem', fontWeight: '700', margin: '0 0 1.5rem', color: 'var(--ink-900)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.9rem', color: 'var(--ink-700)', fontWeight: '500' },
  input: { padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '1rem', outline: 'none' },
  passwordWrapper: { display: 'flex', alignItems: 'center', border: '1px solid var(--line)', borderRadius: '10px', overflow: 'hidden' },
  passwordInput: { flex: 1, padding: '0.9rem 1rem', border: 'none', fontSize: '1rem', outline: 'none' },
  eyeBtn: { background: 'none', border: 'none', padding: '0.9rem', cursor: 'pointer', fontSize: '1rem' },
  checkboxRow: { display: 'flex', alignItems: 'flex-start', gap: '0.5rem' },
  checkboxLabel: { fontSize: '0.85rem', color: 'var(--ink-500)', lineHeight: '1.4' },
  button: { padding: '1rem', background: 'var(--emerald-500)', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  error: { color: 'var(--red-600)', background: 'var(--red-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' },
  footer: { textAlign: 'center', marginTop: '1.5rem', color: 'var(--ink-500)', fontSize: '0.9rem' },
  link: { color: 'var(--emerald-500)', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' }
}

export default Register
