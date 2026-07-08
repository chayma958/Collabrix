import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { authApi } from '@/features/auth/api';
import { DemoAccountsNote } from '@/features/auth/components/DemoAccountsNote';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorCode, getErrorMessage } from '@/lib/error';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to="/workspaces" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResendStatus(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/workspaces');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password'));
      setNeedsVerification(getErrorCode(err) === 'EMAIL_NOT_VERIFIED');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendVerification() {
    setResendStatus(null);
    const { message } = await authApi.resendVerification(email);
    setResendStatus(message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-8 shadow-xl shadow-black/5"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-hover font-bold text-white shadow-sm shadow-primary/30">
            C
          </span>
          <span className="text-lg font-semibold tracking-tight text-text">Collabrix</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-text">Welcome back</h1>
        <DemoAccountsNote />
        {error && (
          <div className="space-y-1">
            <p className="text-sm text-priority-urgent">{error}</p>
            {needsVerification && (
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-sm text-primary hover:underline"
              >
                Resend verification email
              </button>
            )}
          </div>
        )}
        {resendStatus && <p className="text-sm text-muted">{resendStatus}</p>}
        <div className="space-y-1">
          <label className="text-sm text-muted">Email</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted">Password</label>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            window.location.href = `${API_BASE_URL}/auth/google`;
          }}
        >
          Continue with Google
        </Button>
        <p className="text-center text-sm text-muted">
          No account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
