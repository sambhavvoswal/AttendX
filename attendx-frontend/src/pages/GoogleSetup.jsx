import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { auth } from '../services/firebase';

export function GoogleSetup() {
  const navigate = useNavigate();
  const defaultName = useMemo(() => auth.currentUser?.displayName || '', []);
  const [name, setName] = useState(defaultName);
  const [orgName, setOrgName] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !orgName.trim()) {
      toast.error('Name and organization are required');
      return;
    }
    setBusy(true);
    try {
      await api.post('/api/auth/google-setup', {
        name: name.trim(),
        org_name: orgName.trim(),
      });
      toast.success('Welcome to AttendX! Your account is ready.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.detail || err?.message || 'Setup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="font-[Fraunces] text-3xl tracking-tight">Finish setup</h1>
          <p className="mt-2 text-sm text-text-secondary">
            One-time step for Google sign-in users.
          </p>

          <div className="mt-6 space-y-3">
            <label className="block text-sm">
              <div className="mb-1 text-xs text-text-secondary">Your name</div>
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

            <button
              type="button"
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-bg hover:bg-accent-hover"
              onClick={onSubmit}
              disabled={busy}
            >
              {busy ? 'Saving…' : 'Get started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

