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
    <div className="flex flex-col h-full text-xs">
      {/* Top Header */}
      <div className="p-2 border-b border-neutral-800/80 flex items-center justify-between">
        <span className="text-neutral-400 font-medium text-[11px]">
          {savedQueries.length} {savedQueries.length === 1 ? 'bookmark' : 'bookmarks'}
        </span>
        <button
          onClick={onOpenSaveModal}
          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save Active</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40">
        {savedQueries.length === 0 ? (
          <div className="p-6 text-center text-neutral-500">
            <Bookmark className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>No saved queries yet</p>
            <p className="text-[11px] mt-1 text-neutral-600">
              Click &quot;Save Query&quot; above the editor to bookmark frequently used queries.
            </p>
          </div>
        ) : (
          savedQueries.map((item) => (
            <div
              key={item.id}
              className="p-2.5 hover:bg-neutral-800/40 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    onClick={() => onSelectQuery(item.query)}
                    className="font-semibold text-neutral-200 hover:text-indigo-300 cursor-pointer truncate"
                  >
                    {item.title}
                  </span>
                  <button
                    onClick={() => onDeleteQuery(item.id)}
                    title="Delete saved query"
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.description && (
                  <p className="text-[11px] text-neutral-400 line-clamp-1 mb-1.5">
                    {item.description}
                  </p>
                )}

                <div
                  onClick={() => onSelectQuery(item.query)}
                  className="font-mono text-[10px] text-neutral-400 bg-[#0d0e12] p-1.5 rounded border border-neutral-800/60 line-clamp-2 cursor-pointer group-hover:border-neutral-700 transition-colors"
                >
                  {item.query}
                </div>
              </div>

              <div className="flex items-center justify-end pt-1.5">
                <button
                  onClick={() => onSelectQuery(item.query)}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
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
