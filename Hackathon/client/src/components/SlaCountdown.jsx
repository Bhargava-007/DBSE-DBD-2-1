import React from 'react';
import { formatFullDate } from '../utils/format';

export default function SlaCountdown({ slaDueAt, slaBreached, status }) {
  if (['resolved', 'closed'].includes(status)) {
    return (
      <span
        title={slaDueAt ? `SLA target was: ${formatFullDate(slaDueAt)}` : ''}
        className="text-xs text-gray-400 font-normal"
      >
        {slaBreached ? (
          <span className="text-rose-500">Breached (Resolved)</span>
        ) : (
          <span>Met SLA</span>
        )}
      </span>
    );
  }

  if (!slaDueAt) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const now = new Date();
  const due = new Date(slaDueAt);
  const diffMs = due.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  const isBreached = slaBreached || diffMinutes <= 0;
  const isUrgentWarning = diffMinutes > 0 && diffMinutes <= 60;

  let label = '';
  if (isBreached) {
    label = 'Breached';
  } else if (diffMinutes < 60) {
    label = `${diffMinutes}m left`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    label = mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
  } else {
    const days = Math.floor(diffMinutes / 1440);
    label = `${days}d left`;
  }

  // Red text ONLY when under 1h or breached
  const isRed = isBreached || isUrgentWarning;

  return (
    <span
      title={`SLA Target: ${formatFullDate(due)}`}
      className={`text-xs ${isRed ? 'text-rose-600 font-medium' : 'text-gray-500'}`}
    >
      {label}
    </span>
  );
}

