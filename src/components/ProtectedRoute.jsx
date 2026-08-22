import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Wraps authenticated routes. The backend (@admin_required) remains the real
// authorization boundary; this is a UX guard so unauthenticated users and
// non-admins are redirected instead of seeing an empty admin shell.
export default function ProtectedRoute({ adminOnly = false, children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Intended landing route for authenticated non-admin users is /home
    // (see Login.jsx). That page is owned by another teammate and is not
    // implemented yet, so we preserve the intended redirect.
    return <Navigate to="/home" replace />;
  }

  return children;
}
