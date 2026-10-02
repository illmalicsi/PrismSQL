import React, { useState } from 'react'
import { Play, Search, Code, BookOpen } from 'lucide-react'
import { QUERY_TEMPLATES } from '../../data/queryTemplates'

interface QueryLibraryProps {
  currentDataset?: string
  onSelectTemplate: (sql: string, runImmediately?: boolean) => void
}

export const QueryLibrary: React.FC<QueryLibraryProps> = ({
  onSelectTemplate,
}) => {
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All')
  const [search, setSearch] = useState('')

  const filtered = QUERY_TEMPLATES.filter((tpl) => {
    if (levelFilter !== 'All' && tpl.level !== levelFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const matchesTitle = tpl.title.toLowerCase().includes(q)
      const matchesDesc = tpl.description.toLowerCase().includes(q)
      const matchesSql = tpl.sql.toLowerCase().includes(q)
      if (!matchesTitle && !matchesDesc && !matchesSql) return false
    }
    return true
  })

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'Intermediate':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'Advanced':
        return 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20'
      default:
        return 'text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800'
    }
  }

  return (
    <div className="flex flex-col h-full text-xs bg-white dark:bg-[#0c0e14]">
      {/* Search & Level Filter */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800/80 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-800 dark:text-neutral-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Level pills */}
        <div className="flex items-center gap-1">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                levelFilter === lvl
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 border border-slate-200 dark:border-neutral-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-400 dark:text-neutral-500">
            <BookOpen className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>No queries match your filter</p>
          </div>
        ) : (
          filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#12141e] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-neutral-700 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-semibold text-slate-800 dark:text-neutral-200 text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tpl.title}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${getLevelBadgeClass(
                      tpl.level
                    )}`}
                  >
                    {tpl.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed mb-2.5">
                  {tpl.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-neutral-800/60">
                <button
                  onClick={() => onSelectTemplate(tpl.sql, false)}
                  className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200 transition-colors"
                >
                  <Code className="w-3 h-3" />
                  <span>Insert in Editor</span>
                </button>

                <button
                  onClick={() => onSelectTemplate(tpl.sql, true)}
                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
