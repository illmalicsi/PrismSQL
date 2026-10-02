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
    <div className="border-b border-neutral-800 bg-[#0d0e12] select-none">
      {/* Top: Tabs Row */}
      <div className="flex items-center justify-between px-2 pt-1.5 pb-0 border-b border-neutral-800/60 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs cursor-pointer border-t border-x transition-colors ${
                  isActive
                    ? 'bg-[#14161f] border-neutral-700 text-white font-medium shadow-sm'
                    : 'bg-[#090a0d] border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                <span className="truncate max-w-[120px]">{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => onCloseTab(tab.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-800 hover:text-white text-neutral-500 transition-opacity"
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
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom: Action Buttons Bar */}
      <div className="h-10 px-3 flex items-center justify-between gap-2">
        {/* Left side actions: Run & Explain */}
        <div className="flex items-center gap-2">
          {/* RUN QUERY BUTTON */}
          <button
            onClick={onRunQuery}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>Run Query</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 ml-1 text-[10px] font-normal opacity-85 px-1 py-0.2 rounded bg-black/25">
              <span>{cmdKey}</span>
              <span>↵</span>
            </span>
          </button>

          {/* Explain Plan */}
          <button
            onClick={onExplainPlan}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs transition-colors"
          >
            <FileSearch className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Explain Plan</span>
          </button>
        </div>

        {/* Right side actions: Format, Save, Clear */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onFormatSql}
            title={`Format SQL query (${cmdKey}+Shift+F)`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors"
          >
            <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            onClick={onSaveQuery}
            title="Bookmark active query"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={onClearSql}
            title="Clear editor"
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
