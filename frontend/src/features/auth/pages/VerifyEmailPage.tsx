import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { authApi } from '@/features/auth/api';
import { getErrorMessage } from '@/lib/error';

export function VerifyEmailPage() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setError('Missing verification token.');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(({ accessToken }) => loginWithToken(accessToken))
      .then(() => navigate('/workspaces', { replace: true }))
      .catch((err) => setError(getErrorMessage(err, 'This verification link is invalid or expired.')));
  }, [searchParams, loginWithToken, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-xl font-semibold text-text">Verification failed</h1>
          <p className="text-sm text-priority-urgent">{error}</p>
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <p className="text-sm text-muted">Verifying your email…</p>
    </div>
  );
}
