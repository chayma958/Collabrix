import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/features/auth/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/error';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { message: responseMessage } = await authApi.forgotPassword(email);
      setMessage(responseMessage);
    } catch (err) {
      setError(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-text">Forgot your password?</h1>
        <p className="text-sm text-muted">
          Enter your email and we'll send you a link to reset your password.
        </p>
        {error && <p className="text-sm text-priority-urgent">{error}</p>}
        {message && <p className="text-sm text-muted">{message}</p>}
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
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Sending…' : 'Send reset link'}
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
