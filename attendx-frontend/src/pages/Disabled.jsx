import { Link } from 'react-router-dom';

export function Disabled() {
  return (
    <div className="min-h-screen bg-bg px-4 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="font-[Fraunces] text-3xl tracking-tight">Account disabled</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Your account has been disabled. If you think this is a mistake, contact
            support.
          </p>

          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-bg px-4 py-3 text-sm font-semibold text-text-primary hover:bg-surface-raised"
            >
              Sign out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

