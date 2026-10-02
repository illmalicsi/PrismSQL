import React, { useState } from 'react'
import { X, Database, Plus, Check } from 'lucide-react'

interface CreateDatabaseModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, starterSql?: string) => void
}

const STARTER_TEMPLATES = [
  {
    id: 'starter',
    title: 'Starter Database (Recommended)',
    description: 'Includes a sample items catalog table with sample data ready to query.',
    sql: `CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    quantity INTEGER DEFAULT 1,
    price REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO items (name, category, quantity, price) VALUES
('MacBook Pro M3', 'Hardware', 5, 1999.00),
('Mechanical Keyboard', 'Accessories', 14, 129.50),
('UltraWide Monitor 34"', 'Displays', 8, 649.00),
('Noise Cancelling Headphones', 'Audio', 12, 279.00);
`,
  },
  {
    id: 'users',
    title: 'User Accounts & Profiles',
    description: 'Includes users, roles, and profiles schema with sample seed data.',
    sql: `CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER REFERENCES roles(id),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name) VALUES ('Admin'), ('Editor'), ('Viewer');
INSERT INTO users (role_id, username, email) VALUES 
(1, 'alex_dev', 'alex@example.com'),
(2, 'sarah_m', 'sarah@example.com'),
(3, 'chris_p', 'chris@example.com');
`,
  },
  {
    id: 'tasks',
    title: 'Project Tasks & Sprints',
    description: 'Task board with statuses, priorities, and assignments.',
    sql: `CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT
);

CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    title TEXT NOT NULL,
    status TEXT CHECK(status IN ('Todo', 'In Progress', 'Done')),
    priority TEXT CHECK(priority IN ('Low', 'Medium', 'High')),
    due_date DATE
);

INSERT INTO projects (title, description) VALUES ('Mobile App v2', 'Redesign cross-platform app');
INSERT INTO tasks (project_id, title, status, priority, due_date) VALUES
(1, 'Setup Authentication Flow', 'Done', 'High', '2024-04-10'),
(1, 'Build Payment Integration', 'In Progress', 'High', '2024-04-18'),
(1, 'Polish Dark Mode UI', 'Todo', 'Medium', '2024-04-25');
`,
  },
  {
    id: 'empty',
    title: 'Empty Database (0 Tables)',
    description: 'Completely blank canvas ready for your custom CREATE TABLE statements.',
    sql: '',
  },
]

export const CreateDatabaseModal: React.FC<CreateDatabaseModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [dbName, setDbName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('starter')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!dbName.trim()) return

    const tpl = STARTER_TEMPLATES.find((t) => t.id === selectedTemplate)
    onCreate(dbName.trim(), tpl?.sql)
    setDbName('')
    setSelectedTemplate('starter')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#14161f] border border-slate-200 dark:border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-14 px-4 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-[#0e1017]">
          <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900 dark:text-white">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div>Create New Database</div>
              <p className="text-[11px] font-normal text-slate-500 dark:text-neutral-400">
                Partition a fresh in-browser SQLite database workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-slate-700 dark:text-neutral-300 block mb-1 text-xs font-semibold">
              Database Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. My_Project_DB or SchoolSystem"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#181a24] border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="text-slate-700 dark:text-neutral-300 block mb-2 text-xs font-semibold">
              Select Starter Template
            </label>
            <div className="space-y-2">
              {STARTER_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedTemplate === tpl.id
                      ? 'bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-400 dark:border-indigo-500/50 shadow-xs'
                      : 'bg-slate-50 dark:bg-[#10121a] border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {selectedTemplate === tpl.id ? (
                      <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-neutral-700" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">
                      {tpl.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                      {tpl.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#0f1118] border border-slate-200 dark:border-neutral-800 text-[11px] text-slate-600 dark:text-neutral-400">
            💡 <span className="font-semibold text-slate-800 dark:text-neutral-200">Tip:</span> You can also create databases directly in the editor anytime by writing <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-neutral-800 font-mono text-indigo-600 dark:text-indigo-400">CREATE DATABASE my_db;</code>!
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!dbName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-md shadow-indigo-950/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
