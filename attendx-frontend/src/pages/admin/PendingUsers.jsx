import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

export function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const data = await adminService.getUsers(null, 'pending_approval');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load pending users');
    }
  };

  const handleApprove = async (uid) => {
    setBusy(true);
    try {
      await adminService.approveUser(uid);
      toast.success('User approved and email dispatched.');
      setUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Approval failed');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (uid) => {
    setBusy(true);
    try {
      await adminService.rejectUser(uid);
      toast.success('User rejected and email dispatched.');
      setUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Rejection failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-[Fraunces] font-bold mb-6">Pending Approvals</h1>
      
      {users.length === 0 ? (
        <div className="bg-surface border border-border p-12 rounded-2xl text-center text-text-secondary">
          No users are currently awaiting approval.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-header border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Requested Org</th>
                <th className="px-6 py-4 font-medium">Requested Role</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.uid} className="hover:bg-bg/30">
                  <td className="px-6 py-4 font-bold">{u.name}</td>
                  <td className="px-6 py-4 text-text-secondary">{u.email}</td>
                  <td className="px-6 py-4 text-accent">{u.org_name} <span className="text-[10px] text-text-secondary break-all">({u.org_id})</span></td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-1 uppercase tracking-wider bg-bg border border-border rounded text-[10px] font-bold">
                        {u.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                      onClick={() => handleReject(u.uid)}
                      disabled={busy}
                      className="px-4 py-2 text-xs font-bold text-red-500 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(u.uid)}
                      disabled={busy}
                      className="px-4 py-2 text-xs font-bold text-bg bg-accent hover:brightness-110 rounded disabled:opacity-50 transition-colors"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
