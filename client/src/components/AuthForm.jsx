import { useState } from 'react';
import { postJSON } from '../api.js';

// Text for each mode, so one form serves both Sign Up and Log In
const COPY = {
  signup: {
    title: 'Sign Up',
    prompt: 'Already a member?',
    switchLabel: 'Log In',
    submitLabel: 'Sign Up',
    endpoint: '/api/auth/signup',
    successText: 'Account created! You can now log in.',
  },
  login: {
    title: 'Log In',
    prompt: 'New here?',
    switchLabel: 'Sign Up',
    submitLabel: 'Log In',
    endpoint: '/api/auth/login',
    successText: 'Welcome back!',
  },
};

export default function AuthForm({ mode, onSwitch }) {
  const copy = COPY[mode];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  function switchMode() {
    setStatus({ type: '', text: '' });
    setPassword('');
    onSwitch(mode === 'signup' ? 'login' : 'signup');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: '', text: '' });

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setStatus({ type: 'error', text: 'Please fill in both fields.' });
      return;
    }

    setLoading(true);
    try {
      await postJSON(copy.endpoint, { email: trimmedEmail, password });
      setStatus({ type: 'success', text: copy.successText });
      setPassword('');
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="auth">
        <h1>{copy.title}</h1>
        <p className="switch">
          {copy.prompt}{' '}
          <button type="button" className="link" onClick={switchMode}>
            {copy.switchLabel}
          </button>
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <p className={`status ${status.type}`} role="alert" aria-live="polite">
            {status.text}
          </p>

          <button type="submit" className="submit" disabled={loading}>
            {loading ? 'Please wait…' : copy.submitLabel}
          </button>
        </form>
      </div>
    </main>
  );
}
