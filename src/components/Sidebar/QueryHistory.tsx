import React from 'react'
import { Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import type { HistoryItem } from '../../types/sql'

interface QueryHistoryProps {
  history: HistoryItem[]
  onSelectQuery: (sql: string) => void
  onClearHistory: () => void
}

export const QueryHistory: React.FC<QueryHistoryProps> = ({
  history,
  onSelectQuery,
  onClearHistory,
}) => {
  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full text-xs bg-white dark:bg-[#0c0e14]">
      {/* Top Header */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-slate-500 dark:text-neutral-400 font-medium text-[11px]">
          {history.length} {history.length === 1 ? 'execution' : 'executions'}
        </span>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
        {history.length === 0 ? (
          <div className="p-6 text-center text-slate-400 dark:text-neutral-500">
            <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>No queries executed yet</p>
          </div>
        ) : (
          history.map((item) => {
            const isSuccess = item.status === 'success'
            return (
              <div
                key={item.id}
                onClick={() => onSelectQuery(item.query)}
                className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 dark:text-neutral-500">
                    <span>{item.durationMs}ms</span>
                    {isSuccess && <span>• {item.rowCount} rows</span>}
                  </div>
                </div>

                <div className="font-mono text-[11px] text-slate-800 dark:text-neutral-300 bg-slate-100 dark:bg-[#0d0e12] p-1.5 rounded border border-slate-200 dark:border-neutral-800/60 line-clamp-2 group-hover:border-slate-300 dark:group-hover:border-neutral-700 transition-colors">
                  {item.query}
                </div>

                {item.error && (
                  <div className="mt-1 text-[10px] text-rose-600 dark:text-rose-400 line-clamp-1">
                    {item.error}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
