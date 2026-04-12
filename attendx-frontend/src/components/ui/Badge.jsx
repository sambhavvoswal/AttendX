import { BADGE_THRESHOLDS } from '../../constants';

export function Badge({ percentage }) {
  if (percentage == null || isNaN(percentage)) {
    return <span className="px-2 py-0.5 text-xs rounded-full bg-surface text-text-secondary font-medium">--</span>;
  }
  
  let colorClass = "bg-danger text-white";
  if (percentage >= BADGE_THRESHOLDS.green) colorClass = "bg-[#4ADE80] text-black";
  else if (percentage >= BADGE_THRESHOLDS.amber) colorClass = "bg-warning text-black";

  return <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${colorClass}`}>{percentage}%</span>;
}
