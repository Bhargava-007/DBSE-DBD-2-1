import React from 'react';
import { formatRelativeTime, formatFullDate } from '../utils/format';

export default function RelativeTime({ date, className = 'text-xs text-gray-400' }) {
  if (!date) return null;
  return (
    <time
      dateTime={new Date(date).toISOString()}
      title={formatFullDate(date)}
      className={`cursor-default ${className}`}
    >
      {formatRelativeTime(date)}
    </time>
  );
}

