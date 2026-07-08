import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { authApi } from '@/features/auth/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/error';

export function ResetPasswordPage() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError('Missing reset token.');
      return;
    }
    setSubmitting(true);
    try {
      const { accessToken } = await authApi.resetPassword(token, password);
      await loginWithToken(accessToken);
      navigate('/workspaces', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'This reset link is invalid or expired.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-text">Reset your password</h1>
        {error && <p className="text-sm text-priority-urgent">{error}</p>}
        <div className="space-y-1">
          <label className="text-sm text-muted">New password</label>
          <Input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Resetting…' : 'Reset password'}
        </Button>
        <p className="text-center text-sm text-muted">
          <Link to="/login" className="text-primary hover:underline">
            Back to log in
          </Link>
        </p>
      </form>
    </div>
  );
}
