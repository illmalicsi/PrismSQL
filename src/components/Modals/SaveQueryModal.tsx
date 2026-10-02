import React, { useState } from 'react'
import { X, Bookmark, Check } from 'lucide-react'

interface SaveQueryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, description: string) => void
  currentQuery: string
}

export const SaveQueryModal: React.FC<SaveQueryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentQuery,
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave(title.trim(), description.trim())
    setTitle('')
    setDescription('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#14161f] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 px-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-[#0e1017]">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Bookmark Query</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div>
            <label className="text-slate-600 dark:text-neutral-400 block mb-1 text-[11px] font-semibold">
              Query Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Monthly Revenue Summary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#181a24] border border-slate-300 dark:border-neutral-700 rounded-md px-3 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-neutral-400 block mb-1 text-[11px] font-semibold">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Aggregates gross revenue and order counts by month"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#181a24] border border-slate-300 dark:border-neutral-700 rounded-md px-3 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-600 dark:text-neutral-400 block mb-1 text-[11px] font-semibold">
              SQL Snippet Preview
            </label>
            <pre className="p-2.5 rounded-lg bg-slate-100 dark:bg-[#0b0c11] border border-slate-200 dark:border-neutral-800 font-mono text-[11px] text-slate-800 dark:text-neutral-300 max-h-28 overflow-y-auto whitespace-pre-wrap">
              {currentQuery}
            </pre>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium shadow-md shadow-indigo-950/20 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Bookmark</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
