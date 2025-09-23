import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  if (checking) return <div style={{ padding: 24 }}>Checking session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
