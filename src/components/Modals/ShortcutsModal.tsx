import React from 'react'
import { X, Keyboard } from 'lucide-react'

interface ShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  const cmd = isMac ? '⌘' : 'Ctrl'

  const shortcuts = [
    {
      keys: [`${cmd}`, 'Enter'],
      action: 'Run SQL Query',
      description: 'Executes the active query in the editor',
    },
    {
      keys: [`${cmd}`, 'Shift', 'F'],
      action: 'Format SQL',
      description: 'Cleans up and automatically indents SQL keywords and clauses',
    },
    {
      keys: [`${cmd}`, 'Space'],
      action: 'Trigger Autocomplete',
      description: 'Suggestions for SQL keywords, table names, and column names',
    },
    {
      keys: [`${cmd}`, 'F'],
      action: 'Search in Editor',
      description: 'Find and replace within the current query',
    },
    {
      keys: [`${cmd}`, '/'],
      action: 'Toggle Comment',
      description: 'Comments or uncomments the active line (--)',
    },
    {
      keys: ['Esc'],
      action: 'Close Modals / Menus',
      description: 'Closes any open overlay or dropdown',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#14161f] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 px-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-[#0e1017]">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
            <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 space-y-2">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0e1017] border border-slate-200 dark:border-neutral-800/80"
            >
              <div>
                <div className="font-semibold text-slate-800 dark:text-neutral-200">{sc.action}</div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">{sc.description}</div>
              </div>

              <div className="flex items-center gap-1">
                {sc.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-1 rounded bg-white dark:bg-[#1c1f2b] border border-slate-300 dark:border-neutral-700 text-slate-800 dark:text-neutral-200 font-mono text-[11px] shadow-xs font-semibold"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="h-11 px-4 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-end bg-slate-50 dark:bg-[#0e1017]">
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-md bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
