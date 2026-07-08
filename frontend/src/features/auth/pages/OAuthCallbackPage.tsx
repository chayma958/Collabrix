import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

export function OAuthCallbackPage() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (!token) {
      setError(true);
      return;
    }
    loginWithToken(token)
      .then(() => navigate('/workspaces', { replace: true }))
      .catch(() => setError(true));
  }, [loginWithToken, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold text-text">Google sign-in failed</h1>
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <p className="text-sm text-muted">Signing you in…</p>
    </div>
  );
}
