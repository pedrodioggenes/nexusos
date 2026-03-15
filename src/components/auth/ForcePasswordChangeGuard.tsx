import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ForcePasswordChangeOverlay } from './ForcePasswordChangeOverlay';

/**
 * Renders the force-password-change overlay when the user
 * has must_change_password = true. Placed at the app root level.
 * 
 * For agency users, ensures they are on /app/marketing before
 * showing the overlay, so the marketing module is visible behind it.
 */
export function ForcePasswordChangeGuard() {
  const { user, mustChangePassword, loading, isAgency } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect agency users to marketing if they're not already there
  useEffect(() => {
    if (loading || !user || !mustChangePassword) return;
    if (isAgency() && !location.pathname.startsWith('/app/marketing')) {
      navigate('/app/marketing', { replace: true });
    }
  }, [loading, user, mustChangePassword, isAgency, location.pathname, navigate]);

  if (loading || !user || !mustChangePassword) return null;

  // For agency users, wait until they're on /app/marketing before showing overlay
  if (isAgency() && !location.pathname.startsWith('/app/marketing')) return null;

  return <ForcePasswordChangeOverlay />;
}
