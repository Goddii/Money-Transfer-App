import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'

// Clickable authenticated-user avatar shown at the top of the application.
// It mirrors the existing Home avatar styling (teal circle, white initials) and
// opens a small menu with the user's identity, a Profile link and Logout.
// Logout reuses the single shared authSlice `logout` action so the avatar menu
// and the Profile page produce identical authentication results.
export default function UserMenu({ size = 38 }) {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onPointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  function handleLogout() {
    dispatch(logout())
    // replace: true so Back cannot return to an authenticated screen.
    navigate('/login', { replace: true })
  }

  const name = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : 'User'
  const email = user?.email || ''
  const initials = (name || 'U')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#00c896',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: size * 0.4,
          flexShrink: 0,
          padding: 0,
        }}
      >
        {initials || 'U'}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: size + 8,
            right: 0,
            minWidth: 200,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: 8,
            zIndex: 200,
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: 4,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0a0a1a' }}>
              {name}
            </div>
            <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email}
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              navigate('/profile')
            }}
            style={menuItemStyle}
          >
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            style={{ ...menuItemStyle, color: '#e74c3c', fontWeight: 600 }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

const menuItemStyle = {
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: '10px 12px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 14,
  color: '#0a0a1a',
}

export { UserMenu }
