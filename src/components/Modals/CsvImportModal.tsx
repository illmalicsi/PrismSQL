import React, { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'
import { importCsvToTable } from '../../lib/db'

interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (tableName: string) => void
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')
  const [tableName, setTableName] = useState<string>('')
  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([])
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFile = (selectedFile: File) => {
    setError(null)
    setFile(selectedFile)
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    setTableName(baseName || 'imported_data')

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCsvContent(text)

      // Preview first 5 rows
      const parsed = Papa.parse(text, {
        header: true,
        preview: 5,
        skipEmptyLines: true,
        dynamicTyping: true,
      })

      if (parsed.data.length > 0) {
        setPreviewHeaders(Object.keys(parsed.data[0] as any))
        setPreviewRows(parsed.data as any[])
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleImport = async () => {
    if (!csvContent || !tableName.trim()) return

    setIsImporting(true)
    setError(null)

    try {
      await new Promise((r) => setTimeout(r, 50))
      importCsvToTable(tableName, csvContent)
      onSuccess(tableName)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to import CSV')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#14161f] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 px-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-[#0e1017]">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Import CSV into SQLite</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-neutral-700 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-[#0f1118]/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5"
            >
              <Upload className="w-8 h-8 text-slate-400 dark:text-neutral-500 mb-2" />
              <p className="font-semibold text-slate-800 dark:text-neutral-200 text-sm">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-slate-500 dark:text-neutral-500 text-[11px] mt-1">
                Headers will automatically be inferred as table columns
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                accept=".csv,text/csv"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info & Target Table Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-[#0d0e14] p-3 rounded-lg border border-slate-200 dark:border-neutral-800">
                <div>
                  <label className="text-slate-500 dark:text-neutral-400 text-[11px] block mb-1">
                    Selected File:
                  </label>
                  <div className="font-mono text-slate-900 dark:text-neutral-200 truncate font-semibold">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 dark:text-neutral-400 text-[11px] block mb-1">
                    Target Table Name:
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full bg-white dark:bg-[#181a24] border border-slate-300 dark:border-neutral-700 rounded px-2.5 py-1 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. sales_data"
                  />
                </div>
              </div>

              {/* Table Preview */}
              {previewRows.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-neutral-400 mb-1.5 flex items-center justify-between">
                    <span>Preview (First 5 Rows)</span>
                    <span className="text-[10px] text-slate-400">
                      {previewHeaders.length} columns detected
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-neutral-800 rounded-lg overflow-x-auto bg-white dark:bg-[#0b0c11]">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-slate-100 dark:bg-[#12141c] text-slate-700 dark:text-neutral-300 border-b border-slate-200 dark:border-neutral-800">
                        <tr>
                          {previewHeaders.map((header) => (
                            <th key={header} className="px-3 py-1.5 border-r border-slate-200 dark:border-neutral-800/60 font-semibold">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/40 text-slate-800 dark:text-neutral-300">
                        {previewRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-neutral-800/30">
                            {previewHeaders.map((header) => (
                              <td key={header} className="px-3 py-1 border-r border-slate-200 dark:border-neutral-800/40 truncate max-w-[150px]">
                                {row[header] !== null && row[header] !== undefined
                                  ? String(row[header])
                                  : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 px-4 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-[#0e1017]">
          {file ? (
            <button
              onClick={() => {
                setFile(null)
                setCsvContent('')
                setPreviewRows([])
              }}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Choose different file
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || !tableName.trim() || isImporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Importing...' : 'Create Table & Import'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
