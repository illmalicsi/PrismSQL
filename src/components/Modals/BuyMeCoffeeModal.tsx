import React, { useState, useEffect } from 'react'
import { X, Coffee, ExternalLink, Loader2, Heart } from 'lucide-react'

interface BuyMeCoffeeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BuyMeCoffeeModal: React.FC<BuyMeCoffeeModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    setIsLoading(true)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const bmcUrl = 'https://buymeacoffee.com/widget/page/ivanlouiemq'
  const directUrl = 'https://buymeacoffee.com/ivanlouiemq'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] bg-white dark:bg-[#121520] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs relative max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-500/5 dark:bg-[#171b2b] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Coffee className="w-4 h-4 fill-amber-500/20" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span>Buy Me a Coffee</span>
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Support Ivan Louie Malicsi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open full page in new tab"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              title="Close modal (Esc)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe Body */}
        <div className="relative w-full h-[580px] max-h-[75vh] bg-white dark:bg-[#0c0e14] overflow-hidden flex flex-col items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-white dark:bg-[#0c0e14] z-10">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Loading Buy Me a Coffee...
              </span>
            </div>
          )}

          <iframe
            src={bmcUrl}
            title="Buy Me a Coffee for Ivan Louie Malicsi"
            allow="publickey-credentials-get *; payment *"
            className="w-full h-full border-0 rounded-b-none"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Modal Footer Note */}
        <div className="px-3.5 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0f111a] flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
          <span>🔒 Secure checkout via Buy Me a Coffee</span>
          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
          >
            Direct Link ↗
          </a>
        </div>
      </div>
    </div>
  )
}
