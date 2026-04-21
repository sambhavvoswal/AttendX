import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

export function OrgList() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrgs();
      setOrgs(data);
    } catch (err) {
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-[Fraunces] font-bold">Organizations</h1>
        <button 
           className="bg-bg border border-border px-4 py-2 text-sm font-bold rounded-lg text-text-secondary cursor-not-allowed"
           disabled
        >
           + New Organization
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-10 animate-pulse text-text-secondary">Loading organizations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orgs.map(org => (
            <div key={org.org_id} className="bg-surface border border-border p-6 rounded-2xl flex flex-col hover:border-accent/40 transition-colors">
              <h3 className="font-bold text-lg text-text-primary">{org.name}</h3>
              <p className="font-mono text-[10px] text-text-secondary break-all mb-4">{org.org_id}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-4 text-sm bg-bg p-3 rounded-xl border border-border">
                <div>
                   <p className="text-[10px] uppercase font-bold text-text-secondary mb-1">Sheets</p>
                   <p className="font-bold">{org.sheet_count || 0}</p>
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold text-text-secondary mb-1">Owner UID</p>
                   <p className="font-mono text-[10px] truncate" title={org.owner_uid}>{org.owner_uid}</p>
                </div>
              </div>
            </div>
          ))}
          {orgs.length === 0 && (
            <p className="col-span-full text-center py-12 text-text-secondary">No organizations have been mapped to the platform yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
