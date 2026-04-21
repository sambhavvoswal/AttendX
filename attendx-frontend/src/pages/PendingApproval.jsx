import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { auth } from '../services/firebase';

export function PendingApproval() {
  const navigate = useNavigate();
  const { user, status } = useAuthStore((s) => ({
    user: s.user,
    status: s.status,
  }));

  if (status !== 'pending_approval') {
    navigate('/dashboard');
    return null;
  }

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-4 text-text-primary text-center">
      <div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
        </div>
        
        <h1 className="mb-2 font-[Fraunces] text-2xl font-bold">Pending Approval</h1>
        <p className="mb-8 text-sm text-text-secondary">
          Thank you for joining AttendX! Your account is currently under review by an administrator.
          You will receive an email once your access has been granted.
        </p>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-bg border border-border px-4 py-3 text-sm font-semibold hover:bg-surface-raised transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
