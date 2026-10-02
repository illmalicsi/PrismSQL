import React from 'react'
import {
  Play,
  AlignLeft,
  Trash2,
  Bookmark,
  Plus,
  X,
  FileSearch,
} from 'lucide-react'
import type { EditorTab } from '../../types/sql'

interface EditorToolbarProps {
  tabs: EditorTab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onNewTab: () => void
  onCloseTab: (id: string, e: React.MouseEvent) => void
  onRunQuery: () => void
  onExplainPlan: () => void
  onFormatSql: () => void
  onClearSql: () => void
  onSaveQuery: () => void
  isRunning?: boolean
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onNewTab,
  onCloseTab,
  onRunQuery,
  onExplainPlan,
  onFormatSql,
  onClearSql,
  onSaveQuery,
  isRunning,
}) => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  const cmdKey = isMac ? '⌘' : 'Ctrl'

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c0e14] select-none shrink-0 transition-colors">
      {/* Top: Tabs Row */}
      <div className="flex items-center justify-between px-3 pt-1.5 pb-0 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs cursor-pointer border-t border-x transition-colors ${
                  isActive
                    ? 'bg-white dark:bg-[#141724] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium shadow-sm'
                    : 'bg-slate-100 dark:bg-[#090a0f] border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-neutral-900/60'
                }`}
              >
                <span className="truncate max-w-[130px]">{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => onCloseTab(tab.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-white text-slate-400 dark:text-neutral-500 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}

          <button
            onClick={onNewTab}
            title="Open new query tab"
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors ml-0.5 mb-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom: Action Buttons Bar */}
      <div className="h-10 px-3 bg-white dark:bg-[#0c0e14] flex items-center justify-between gap-2">
        {/* Left side actions: Run & Explain */}
        <div className="flex items-center gap-2">
          {/* RUN QUERY BUTTON */}
          <button
            onClick={onRunQuery}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-sm shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>Run Query</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 ml-1 text-[10px] font-normal opacity-90 px-1 py-0.2 rounded bg-black/20">
              <span>{cmdKey}</span>
              <span>↵</span>
            </span>
          </button>

          {/* Explain Plan */}
          <button
            onClick={onExplainPlan}
            className="h-7 flex items-center gap-1.5 px-2.5 rounded-md bg-slate-100 dark:bg-[#141724] hover:bg-slate-200/80 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs transition-colors shadow-xs"
          >
            <FileSearch className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="hidden md:inline font-medium">Explain Plan</span>
          </button>
        </div>

        {/* Right side actions: Format, Save, Clear */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onFormatSql}
            title={`Format SQL query (${cmdKey}+Shift+F)`}
            className="h-7 flex items-center gap-1.5 px-2.5 rounded-md bg-slate-100 dark:bg-[#141724] hover:bg-slate-200/80 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs transition-colors shadow-xs"
          >
            <AlignLeft className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline font-medium">Format</span>
          </button>

          <button
            onClick={onSaveQuery}
            title="Bookmark active query"
            className="h-7 flex items-center gap-1.5 px-2.5 rounded-md bg-slate-100 dark:bg-[#141724] hover:bg-slate-200/80 dark:hover:bg-[#1c2032] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white text-xs transition-colors shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline font-medium">Save</span>
          </button>

          <button
            onClick={onClearSql}
            title="Clear editor"
            className="h-7 w-7 rounded-md bg-slate-100 dark:bg-[#141724] hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
