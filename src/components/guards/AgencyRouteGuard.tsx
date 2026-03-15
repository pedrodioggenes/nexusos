import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * AgencyRouteGuard — Blocks agency users from navigating outside /app/marketing.
 * Placed at app root level, redirects imperatively via useEffect.
 */
export function AgencyRouteGuard() {
  const { user, loading, isAgency } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;
    if (!isAgency()) return;

    const path = location.pathname;
    // Allow /auth and /app/marketing/*
    if (path === '/auth' || path.startsWith('/app/marketing')) return;

    navigate('/app/marketing', { replace: true });
  }, [loading, user, isAgency, location.pathname, navigate]);

  return null;
}
