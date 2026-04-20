import { useState, useEffect, useMemo } from 'react';
import { useSheet } from '../hooks/useSheet';
import { attendanceService } from '../services/attendanceService';
import { SummaryCards } from '../components/analytics/SummaryCards';
import { groupStudentsBy, detectGroupableColumns } from '../utils/groupBy';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function Analytics() {
  const { sheets, fetchSheets } = useSheet();
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters for Student Table
  const [percentFilter, setPercentFilter] = useState("all"); // 'all', 'high', 'avg', 'low'
  const [groupBy, setGroupBy] = useState("");
  
  // Column Selection specific state
  const [showColSelector, setShowColSelector] = useState(false);
  const [selectedColsLocal, setSelectedColsLocal] = useState([]);

  useEffect(() => {
    if (sheets.length === 0) fetchSheets();
  }, [sheets, fetchSheets]);

  const handleSheetSelect = async (e) => {
    const id = e.target.value;
    setSelectedSheetId(id);
    if (!id) return;

    setIsLoading(true);
    toast.loading("Crunching analytics...", { id: "analytics_fetch" });
    try {
      // By default pass empty array so backend auto-detects
      const result = await attendanceService.getAnalytics(id);
      setData(result);
      setSelectedColsLocal(result.selected_columns || []);
      toast.success("Analytics loaded!", { id: "analytics_fetch" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics data", { id: "analytics_fetch" });
    } finally {
      setIsLoading(false);
    }
  };

  const applyCustomColumns = async () => {
    if (!selectedSheetId) return;
    if (selectedColsLocal.length === 0) {
      toast.error("Please select at least one column to track.");
      return;
    }
    
    setIsLoading(true);
    setShowColSelector(false);
    toast.loading("Re-calculating...", { id: "recalc" });
    try {
      const result = await attendanceService.getAnalytics(selectedSheetId, selectedColsLocal);
      setData(result);
      setSelectedColsLocal(result.selected_columns || []);
      toast.success("Custom view applied!", { id: "recalc" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to re-calculate data", { id: "recalc" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxToggle = (col) => {
    setSelectedColsLocal(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  // Grouping options detection
  const groupableCols = useMemo(() => {
    if (!data || !data.student_summary || data.student_summary.length === 0) return [];
    const allCols = Object.keys(data.student_summary[0]);
    // Ignore internal keys
    const exclude = ['pk_value', 'percentage', 'positive_count', 'total_sessions'];
    const candidates = allCols.filter(c => !exclude.includes(c));
    return detectGroupableColumns(data.student_summary, candidates);
  }, [data]);

  // Derived filtered/grouped student data
  const { filteredStudents, groupedStudents } = useMemo(() => {
    if (!data || !data.student_summary) return { filteredStudents: [], groupedStudents: {} };
    
    let filtered = [...data.student_summary];
    if (percentFilter === 'high') filtered = filtered.filter(s => s.percentage >= 85);
    else if (percentFilter === 'low') filtered = filtered.filter(s => s.percentage < 75);
    else if (percentFilter === 'avg') filtered = filtered.filter(s => s.percentage >= 75 && s.percentage < 85);

    const grouped = groupStudentsBy(filtered, groupBy);
    return { filteredStudents: filtered, groupedStudents: grouped };
  }, [data, percentFilter, groupBy]);

  // Donut chart formatted data
  const pieData = useMemo(() => {
    if (!data || !data.overall_value_totals) return [];
    return Object.entries(data.overall_value_totals).map(([key, value]) => {
      const config = data.attendance_values.find(v => v.value === key);
      return {
        name: config ? config.label : key,
        value: value,
        color: config ? config.color : "#999999"
      };
    }).filter(d => d.value > 0);
  }, [data]);

  if (!data && !isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
          <h1 className="text-3xl font-[Fraunces] font-bold text-text-primary mb-6">Attendance Analytics</h1>
          
          <div className="bg-surface border border-border p-5 rounded-xl max-w-md">
            <h3 className="text-sm font-bold text-text-primary mb-4">Select a sheet to view analytics</h3>
            <select 
              value={selectedSheetId} 
              onChange={handleSheetSelect}
              className="w-full bg-bg border border-border text-sm p-3 rounded-lg text-text-primary focus:ring-1 focus:ring-accent outline-none"
            >
              <option value="" disabled>Select a sheet...</option>
              {sheets.map(sheet => (
                <option key={sheet.sheet_id} value={sheet.sheet_id}>{sheet.display_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8 flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-[Fraunces] font-bold text-text-primary mb-2">Analytics</h1>
           <p className="text-text-secondary text-sm">Real-time attendance insights</p>
        </div>
        
        <div className="w-64">
           <select 
             value={selectedSheetId} 
             onChange={handleSheetSelect}
             className="w-full bg-surface border border-border text-sm p-2 rounded-lg text-text-primary focus:ring-1 focus:ring-accent outline-none"
           >
             <option value="" disabled>Select a sheet...</option>
             {sheets.map(sheet => (
               <option key={sheet.sheet_id} value={sheet.sheet_id}>{sheet.display_name}</option>
             ))}
           </select>
        </div>
      </div>
      
      {isLoading && <div className="text-center py-20 animate-pulse text-text-secondary">Loading metrics...</div>}

      {data && !isLoading && (
        <div className="max-w-7xl mx-auto px-4 pb-24 space-y-8 fade-in">
          
          {/* Settings & Config Bar */}
          {data.available_columns && data.available_columns.length > 0 && (
             <div className="bg-surface border border-border p-4 rounded-xl flex flex-col items-end">
               <div className="flex items-center gap-3">
                 <span className="text-sm text-text-secondary">Tracking <strong className="text-accent">{data.selected_columns.length}</strong> parameters</span>
                 <button 
                   onClick={() => setShowColSelector(!showColSelector)}
                   className="text-xs font-bold border border-border bg-bg hover:bg-surface-header px-4 py-2 rounded-lg transition-colors"
                 >
                   Customize Details Tracked
                 </button>
               </div>
               
               {showColSelector && (
                 <div className="w-full mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
                   <p className="text-sm font-bold mb-3">Select columns to include in the analytics calculation:</p>
                   <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto p-1">
                     {data.available_columns.map(col => (
                       <label 
                         key={col} 
                         className={`flex items-center gap-2 text-xs px-3 py-2 rounded border cursor-pointer transition-colors ${selectedColsLocal.includes(col) ? 'bg-accent/10 border-accent/50 text-accent' : 'bg-bg border-border text-text-secondary hover:border-[#555]'}`}
                       >
                         <input 
                           type="checkbox" 
                           className="hidden" 
                           checked={selectedColsLocal.includes(col)} 
                           onChange={() => handleCheckboxToggle(col)} 
                         />
                         {col}
                       </label>
                     ))}
                   </div>
                   <div className="flex justify-end gap-2">
                      <button 
                         onClick={() => {
                           setSelectedColsLocal(data.selected_columns);
                           setShowColSelector(false);
                         }}
                         className="text-xs px-4 py-2 text-text-secondary hover:text-text-primary"
                      >
                         Cancel
                      </button>
                      <button 
                         onClick={applyCustomColumns}
                         className="text-xs font-bold bg-accent text-bg px-4 py-2 rounded hover:brightness-110"
                      >
                         Apply & Re-calculate
                      </button>
                   </div>
                 </div>
               )}
             </div>
          )}
          
          {/* Top Metric Cards */}
          <SummaryCards 
            totalSessions={data.sessions.length}
            totalStudents={data.student_summary.length}
            averageAttendance={
              data.student_summary.length 
                ? data.student_summary.reduce((acc, s) => acc + s.percentage, 0) / data.student_summary.length 
                : 0
            }
            topPerformanceCount={data.student_summary.filter(s => s.percentage >= 85).length}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Bar Chart */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-6">Session Breakdown</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sessions} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                    <XAxis dataKey="date" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
                    <YAxis stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
                    <RechartsTooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    
                    {data.attendance_values.map((v, i) => (
                       <Bar 
                         key={v.value} 
                         dataKey={`value_counts.${v.value}`} 
                         name={v.label} 
                         stackId="a" 
                         fill={v.color === 'green' ? '#10b981' : v.color === 'red' ? '#ef4444' : v.color === 'yellow' ? '#f59e0b' : '#6b7280'} 
                         radius={i === data.attendance_values.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                       />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Donut */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-6">Overall Distribution</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color === 'green' ? '#10b981' : entry.color === 'red' ? '#ef4444' : entry.color === 'yellow' ? '#f59e0b' : '#6b7280'} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {pieData.map(entry => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color === 'green' ? '#10b981' : entry.color === 'red' ? '#ef4444' : entry.color === 'yellow' ? '#f59e0b' : '#6b7280' }}></div>
                      <span className="text-text-secondary">{entry.name}</span>
                    </span>
                    <span className="font-bold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Student Detailed Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden mt-8">
             <div className="p-6 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="font-bold text-lg">Student Performance</h3>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   
                   {/* Filtering */}
                   <select 
                     value={percentFilter}
                     onChange={(e) => setPercentFilter(e.target.value)}
                     className="bg-bg border border-border text-xs px-3 py-2 rounded-lg outline-none focus:border-accent"
                   >
                      <option value="all">All Students</option>
                      <option value="high">High Achievers (≥85%)</option>
                      <option value="avg">At Risk (75% - 84%)</option>
                      <option value="low">Critical (&lt;75%)</option>
                   </select>

                   {/* Grouping */}
                   {groupableCols.length > 0 && (
                     <select 
                       value={groupBy}
                       onChange={(e) => setGroupBy(e.target.value)}
                       className="bg-bg border border-border text-xs px-3 py-2 rounded-lg outline-none focus:border-accent flex-1"
                     >
                       <option value="">No Grouping</option>
                       {groupableCols.map(col => (
                          <option key={col} value={col}>Group by {col}</option>
                       ))}
                     </select>
                   )}
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className="bg-surface-header border-b border-border text-text-secondary">
                      <tr>
                         <th className="px-6 py-4 font-medium">Identifier</th>
                         <th className="px-6 py-4 font-medium">Name</th>
                         <th className="px-6 py-4 font-medium text-right">Classes Attended</th>
                         <th className="px-6 py-4 font-medium text-right">Percentage</th>
                         <th className="px-6 py-4 font-medium text-center">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                      {Object.keys(groupedStudents).map(groupName => (
                         <div key={groupName} className="contents">
                            {groupBy && (
                               <tr className="bg-bg/50">
                                  <td colSpan="5" className="px-6 py-2 text-xs font-bold text-accent uppercase tracking-wider border-border border-b">
                                     {groupName} <span className="text-text-secondary ml-2">({groupedStudents[groupName].length})</span>
                                  </td>
                                </tr>
                            )}
                            {groupedStudents[groupName].map(student => (
                               <tr key={student.pk_value} className="hover:bg-bg/30 transition-colors">
                                  <td className="px-6 py-4 font-mono text-xs">{student.pk_value}</td>
                                  <td className="px-6 py-4 font-medium text-text-primary">{student.name}</td>
                                  <td className="px-6 py-4 text-right tabular-nums">
                                     {student.positive_count} <span className="text-text-secondary text-xs">/ {student.total_sessions}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right tabular-nums font-bold">
                                     {student.percentage}%
                                  </td>
                                  <td className="px-6 py-4">
                                     <div className="flex justify-center">
                                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                          student.percentage >= 85 ? 'bg-green-500/10 text-green-500' :
                                          student.percentage >= 75 ? 'bg-yellow-500/10 text-yellow-500' :
                                          'bg-red-500/10 text-red-500'
                                       }`}>
                                          {student.percentage >= 85 ? 'Good' : student.percentage >= 75 ? 'Warning' : 'Critical'}
                                       </span>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </div>
                      ))}
                      {filteredStudents.length === 0 && (
                         <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-text-secondary">
                               No students match your selected filters.
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>

        </div>
      )}
    </div>
  );
}
