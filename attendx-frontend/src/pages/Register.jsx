import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { auth, createUserWithEmailAndPassword } from '../services/firebase';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const validate = () => {
    if (!name.trim() || !orgName.trim() || !email.trim() || !password || !confirm) {
      toast.error('All fields are required');
      return false;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      toast.error('Password must be 8+ chars, include 1 uppercase and 1 number');
      return false;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const onRegister = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await api.post('/api/auth/register', {
        name: name.trim(),
        org_name: orgName.trim(),
        email: email.trim(),
      });
      toast.success('Welcome to AttendX! Your account is ready.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="font-[Fraunces] text-3xl tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">
            In v1.0, accounts are active immediately after registration.
          </p>

          <div className="mt-6 space-y-3">
            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Full name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Organization name</div>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
              />
              <div className="mt-2 text-xs text-text-secondary">
                Password must be at least 8 characters, include 1 uppercase letter and 1
                number.
              </div>
            </label>

            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Confirm password</div>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3 py-3 text-sm outline-none focus:border-accent/60"
              />
            </label>

            <button
              type="button"
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-bg hover:bg-accent-hover"
              onClick={onRegister}
              disabled={busy}
            >
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-accent">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

