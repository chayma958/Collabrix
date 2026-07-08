import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { DemoAccountsNote } from '@/features/auth/components/DemoAccountsNote';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/error';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export function RegisterPage() {
  const { user, isLoading, register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  if (!isLoading && user) {
    return <Navigate to="/workspaces" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, firstName, lastName);
      setRegistered(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create your account'));
    } finally {
      setSubmitting(false);
    }
  }

  if (registered) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-xl shadow-black/5">
          <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-priority-low/10 text-2xl ring-1 ring-inset ring-priority-low/25">
            ✓
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-text">Check your inbox</h1>
          <p className="text-sm text-muted">
            We sent a verification link to <span className="text-text">{email}</span>. Click it to
            activate your account, then log in.
          </p>
          <Link to="/login" className="text-sm text-primary hover:underline">
            Back to log in
          </Link>
        </div>
      </div>
    );
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
        <h1 className="text-xl font-semibold tracking-tight text-text">Create your account</h1>
        <DemoAccountsNote />
        {error && <p className="text-sm text-priority-urgent">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-muted">First name</label>
            <Input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted">Last name</label>
            <Input required value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted">Email</label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted">Password</label>
          <Input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creating account…' : 'Register'}
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
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
