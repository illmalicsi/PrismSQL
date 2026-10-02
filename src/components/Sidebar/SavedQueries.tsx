import React from 'react'
import { Bookmark, Trash2, ArrowUpRight, Plus } from 'lucide-react'
import type { SavedQuery } from '../../types/sql'

interface SavedQueriesProps {
  savedQueries: SavedQuery[]
  onSelectQuery: (sql: string) => void
  onDeleteQuery: (id: string) => void
  onOpenSaveModal: () => void
}

export const SavedQueries: React.FC<SavedQueriesProps> = ({
  savedQueries,
  onSelectQuery,
  onDeleteQuery,
  onOpenSaveModal,
}) => {
  return (
    <div className="flex flex-col h-full text-xs bg-white dark:bg-[#0c0e14]">
      {/* Top Header */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-slate-500 dark:text-neutral-400 font-medium text-[11px]">
          {savedQueries.length} {savedQueries.length === 1 ? 'bookmark' : 'bookmarks'}
        </span>
        <button
          onClick={onOpenSaveModal}
          className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save Active</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
        {savedQueries.length === 0 ? (
          <div className="p-6 text-center text-slate-400 dark:text-neutral-500">
            <Bookmark className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>No saved queries yet</p>
            <p className="text-[11px] mt-1 text-slate-500 dark:text-neutral-600">
              Click &quot;Save Query&quot; above the editor to bookmark frequently used queries.
            </p>
          </div>
        ) : (
          savedQueries.map((item) => (
            <div
              key={item.id}
              className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    onClick={() => onSelectQuery(item.query)}
                    className="font-semibold text-slate-800 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer truncate"
                  >
                    {item.title}
                  </span>
                  <button
                    onClick={() => onDeleteQuery(item.id)}
                    title="Delete saved query"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.description && (
                  <p className="text-[11px] text-slate-600 dark:text-neutral-400 line-clamp-1 mb-1.5">
                    {item.description}
                  </p>
                )}

                <div
                  onClick={() => onSelectQuery(item.query)}
                  className="font-mono text-[10px] text-slate-700 dark:text-neutral-400 bg-slate-100 dark:bg-[#0d0e12] p-1.5 rounded border border-slate-200 dark:border-neutral-800/60 line-clamp-2 cursor-pointer group-hover:border-slate-300 dark:group-hover:border-neutral-700 transition-colors"
                >
                  {item.query}
                </div>
              </div>

              <div className="flex items-center justify-end pt-1.5">
                <button
                  onClick={() => onSelectQuery(item.query)}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                >
                  <span>Insert</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
