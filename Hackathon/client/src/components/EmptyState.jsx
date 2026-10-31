import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No tickets found',
  description = 'There are no support tickets matching your current criteria.',
  actionLabel = 'Create ticket',
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-200 rounded-md">
      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
