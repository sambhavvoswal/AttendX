import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="min-h-screen bg-bg px-4 py-10 text-text-primary">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-border bg-surface p-6 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1 text-xs text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Mobile-first QR attendance system
          </div>

          <h1 className="mt-6 font-[Fraunces] text-4xl tracking-tight md:text-6xl">
            AttendX
          </h1>
          <p className="mt-4 max-w-2xl text-base text-text-secondary md:text-lg">
            Scan QR → mark attendance instantly in your existing Google Sheet. Fast,
            fraud-resistant, and designed for real-world classrooms and teams.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-bg px-5 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-raised"
            >
              Sign in
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { k: 'Zero migration', v: 'Uses the Google Sheet you already have.' },
              { k: 'Flexible statuses', v: 'Present / Absent / Late / On Duty…' },
              { k: 'Fast analytics', v: 'Per student and per session visibility.' },
            ].map((f) => (
              <div
                key={f.k}
                className="rounded-2xl border border-border bg-bg p-4"
              >
                <div className="text-sm font-semibold text-text-primary">{f.k}</div>
                <div className="mt-1 text-sm text-text-secondary">{f.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-text-secondary">
          By continuing, you agree to your organization’s data staying in Google Sheets.
        </div>
      </div>
    </div>
  );
}

