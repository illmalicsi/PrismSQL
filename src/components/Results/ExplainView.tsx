import React from 'react'
import { FileSearch, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import type { QueryResult } from '../../types/sql'

interface ExplainViewProps {
  result: QueryResult | null
  originalQuery: string
}

export const ExplainView: React.FC<ExplainViewProps> = ({ result, originalQuery }) => {
  if (!result || !result.values.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-xs p-6 text-center">
        <FileSearch className="w-8 h-8 mb-2 text-indigo-400/50" />
        <p className="font-medium text-neutral-300">No Query Plan Generated Yet</p>
        <p className="mt-1 max-w-sm text-neutral-500">
          Click the &quot;Explain Plan&quot; button in the editor toolbar to analyze SQLite&apos;s execution plan.
        </p>
      </div>
    )
  }

  // Parse rows
  // Typical SQLite EXPLAIN QUERY PLAN columns: [id, parent, notused, detail]
  const rows = result.values.map((row) => {
    const detail = String(row[row.length - 1] || '')
    const id = Number(row[0])
    const parent = Number(row[1])
    return { id, parent, detail }
  })

  return (
    <div className="flex flex-col h-full bg-[#0d0e12] select-text overflow-y-auto p-4 space-y-4 text-xs">
      {/* Top Banner */}
      <div className="p-3 rounded-lg bg-[#14161f] border border-neutral-800 flex items-start gap-3">
        <Zap className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
        <div>
          <div className="font-medium text-white text-xs">
            SQLite Query Plan Analysis
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Shows how SQLite executes your query, including table scans, subquery resolution, and index usage.
          </p>
        </div>
      </div>

      {/* Plan Steps */}
      <div className="space-y-2">
        <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
          Execution Steps
        </div>

        <div className="space-y-2">
          {rows.map((step, idx) => {
            const isScan = step.detail.includes('SCAN TABLE')
            const isSearch = step.detail.includes('SEARCH TABLE')
            const isCompound = step.detail.includes('COMPOUND') || step.detail.includes('SUBQUERY')

            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#111218] border border-neutral-800/80 hover:border-neutral-700 transition-colors flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center font-mono text-[11px] font-semibold text-neutral-300 shrink-0">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {isScan && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                        <AlertCircle className="w-2.5 h-2.5" /> Full Table Scan
                      </span>
                    )}
                    {isSearch && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        <CheckCircle className="w-2.5 h-2.5" /> Indexed Search
                      </span>
                    )}
                    {isCompound && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                        Subquery / CTE
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-xs text-neutral-200">
                    {step.detail}
                  </div>

                  {/* Educational notes */}
                  {isScan && (
                    <p className="mt-1 text-[11px] text-neutral-400">
                      Reading every row in the table sequentially. For large tables, adding an INDEX on filtered columns will speed this up dramatically.
                    </p>
                  )}
                  {isSearch && (
                    <p className="mt-1 text-[11px] text-neutral-400">
                      Fast lookup leveraging primary keys or secondary indices.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Raw Query Preview */}
      <div className="pt-2">
        <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
          Analyzed Query
        </div>
        <pre className="p-3 rounded-lg bg-[#08090c] border border-neutral-800 font-mono text-[11px] text-neutral-300 overflow-x-auto">
          {originalQuery}
        </pre>
      </div>
    </div>
  )
}
