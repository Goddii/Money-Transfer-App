import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, updateUser } from '../../store/authSlice'
import api from '../../utils/api'

function Profile() {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  // Backend field is `phone_number` (see User model / validate_user_update).
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleLogout() {
    dispatch(logout())
    // replace: true so Back cannot return to an authenticated screen.
    navigate('/login', { replace: true })
  }

  function startEditing() {
    setFirstName(user?.first_name || '')
    setLastName(user?.last_name || '')
    setPhoneNumber(user?.phone_number || '')
    setError('')
    setSuccess('')
    setEditing(true)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.')
      return
    }

    setSaving(true)
    try {
      // Backend contract: PUT /api/users/me
      // Only first_name, last_name and phone_number are accepted; any other
      // key is rejected with 400 "Invalid fields: ...".
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      }
      // UserService.update_user skips any field sent as null, so it cannot
      // unset a phone number. Only send the key when there is a value, rather
      // than sending null and appearing to clear it while nothing changes.
      const trimmedPhone = phoneNumber.trim()
      if (trimmedPhone) {
        payload.phone_number = trimmedPhone
      }

      const response = await api.put('/users/me', payload)
      dispatch(updateUser(response.data.data.user))
      setSuccess('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Profile</h2>
      </div>
      <div style={styles.avatarSection}>
        <div style={styles.avatar}>{user?.first_name?.[0] || 'U'}</div>
        <h3 style={styles.name}>{user?.first_name} {user?.last_name}</h3>
        <p style={styles.email}>{user?.email}</p>
        <span style={styles.roleBadge}>{user?.role || 'user'}</span>
      </div>
      {success && <p style={styles.success}>{success}</p>}
      {error && <p style={styles.error}>{error}</p>}
      {editing ? (
        <form onSubmit={handleUpdate} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>First Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Last Name</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} style={styles.input} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={styles.input} />
          </div>
          <button type="submit" style={styles.saveBtn} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => setEditing(false)} style={styles.cancelBtn} disabled={saving}>Cancel</button>
        </form>
      ) : (
        <div style={styles.infoSection}>
          <div style={styles.infoRow}>
            <p style={styles.infoLabel}>First Name</p>
            <p style={styles.infoValue}>{user?.first_name || 'Not set'}</p>
          </div>
          <div style={styles.divider} />
          <div style={styles.infoRow}>
            <p style={styles.infoLabel}>Last Name</p>
            <p style={styles.infoValue}>{user?.last_name || 'Not set'}</p>
          </div>
          <div style={styles.divider} />
          <div style={styles.infoRow}>
            <p style={styles.infoLabel}>Email</p>
            <p style={styles.infoValue}>{user?.email}</p>
          </div>
          <div style={styles.divider} />
          <div style={styles.infoRow}>
            <p style={styles.infoLabel}>Phone</p>
            <p style={styles.infoValue}>{user?.phone_number || 'Not set'}</p>
          </div>
          <button onClick={startEditing} style={styles.editBtn}>Edit Profile</button>
        </div>
      )}
      <button onClick={() => navigate('/beneficiaries')} style={styles.linkBtn}>Manage Beneficiaries</button>
      <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      <div style={styles.bottomNav}>
        <button onClick={() => navigate('/home')} style={styles.navBtn}>🏠<br/>Home</button>
        <button onClick={() => navigate('/send')} style={styles.navBtn}>↗<br/>Send</button>
        <button onClick={() => navigate('/transactions')} style={styles.navBtn}>🕐<br/>History</button>
        <button style={styles.navBtnActive}>👤<br/>Profile</button>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f8f9fa', maxWidth: '430px', margin: '0 auto', paddingBottom: '80px' },
  header: { padding: '2rem 1.5rem 1rem' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0a0a1a' },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', background: '#fff', margin: '0 0 1rem' },
  avatar: { width: '80px', height: '80px', background: '#00c896', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' },
  name: { margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: '700', color: '#0a0a1a' },
  email: { margin: '0 0 0.5rem', color: '#666', fontSize: '0.9rem' },
  roleBadge: { background: '#e8f8f3', color: '#00c896', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  form: { padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.9rem', color: '#333', fontWeight: '500' },
  input: { padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' },
  saveBtn: { padding: '1rem', background: '#00c896', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { padding: '1rem', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: '50px', fontSize: '1rem', cursor: 'pointer' },
  infoSection: { background: '#fff', borderRadius: '16px', padding: '1.5rem', margin: '0 1.5rem 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' },
  infoLabel: { margin: 0, color: '#666', fontSize: '0.9rem' },
  infoValue: { margin: 0, color: '#0a0a1a', fontSize: '0.9rem', fontWeight: '600' },
  divider: { height: '1px', background: '#f0f0f0' },
  editBtn: { width: '100%', padding: '0.9rem', background: '#0a0a1a', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '1rem' },
  linkBtn: { width: 'calc(100% - 3rem)', margin: '0 1.5rem 1rem', padding: '0.9rem', background: '#fff', color: '#0a0a1a', border: '1px solid #ddd', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  logoutBtn: { width: 'calc(100% - 3rem)', margin: '0 1.5rem', padding: '0.9rem', background: '#fff', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '50px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  success: { color: '#00c896', background: '#f0fff8', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', margin: '0 1.5rem 1rem' },
  error: { color: '#e74c3c', background: '#ffeaea', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', margin: '0 1.5rem 1rem' },
  bottomNav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', background: '#fff', display: 'flex', justifyContent: 'space-around', padding: '0.75rem 0', borderTop: '1px solid #f0f0f0', zIndex: 100 },
  navBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#999', textAlign: 'center', lineHeight: '1.4' },
  navBtnActive: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#00c896', textAlign: 'center', lineHeight: '1.4', fontWeight: '600' }
}

export default Profile
