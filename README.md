# ⚡ SQL Playground

A high-performance in-browser SQL playground powered by WebAssembly SQLite (`sql.js`), React 19, TypeScript, Tailwind CSS, and CodeMirror 6. 

No backend or database setup required — 100% client-side, zero latency, offline capable, and completely private.

---

## ✨ Features

- **🚀 In-Browser SQLite WASM Engine**: Full SQLite 3 capability including Window Functions (`ROW_NUMBER()`, `RANK()`, `SUM() OVER`), Common Table Expressions (CTEs), Recursive Queries, Aggregates, Views, and Triggers.
- **🎨 Sharp & Clean Design**: High-density developer-centric interface inspired by Linear, Raycast, and Supabase Studio, with Dark and Light mode support.
- **📚 Curated Datasets**:
  - **E-Commerce Store**: Customers, Products, Categories, Orders, Order Items, and Reviews.
  - **SaaS & Subscriptions**: Subscription Plans, Organizations, Users, MRR metrics, Invoices, and Audit Logs.
  - **Tech HR & Compensation**: Departments, Employees with hierarchical manager relationships, Salaries, and Project Assignments.
  - **Clean Empty Canvas**: Start fresh with custom DDL or imported data.
- **💻 Pro CodeMirror 6 Editor**:
  - Full syntax highlighting & auto-closing brackets.
  - Contextual autocompletion of SQLite keywords and active database table/column names.
  - Multi-tab query workflow (create, rename, close tabs).
  - Shortcuts: `Ctrl+Enter` (`⌘+Enter`) to run, `Ctrl+Shift+F` (`⌘+Shift+F`) to auto-format SQL.
  - Integrated SQL Formatter (`sql-formatter`).
- **📊 Interactive Data Grid**:
  - Sort columns ascending/descending.
  - Real-time full-text search across all returned rows.
  - Instant click-to-copy cell value.
  - Highlighting for `NULL` values.
  - Customizable pagination (10, 25, 50, 100, or All).
- **📈 Chart & Visualization View**:
  - Convert query results into interactive charts (Bar Chart, Line Chart, Donut, and Pie).
  - Auto-detection of numeric and categorical dimensions with manual axis overrides.
- **🔍 Query Plan Inspector (`EXPLAIN QUERY PLAN`)**:
  - Analyzes SQLite execution steps, flagging full table scans vs. indexed searches.
- **📂 CSV & File Operations**:
  - **Import CSV**: Drag-and-drop any CSV to auto-detect data types, generate schema, and batch insert records.
  - **Import / Execute .sql script**: Run DDL/DML batches.
  - **Load SQLite .db/.sqlite**: Open existing binary databases directly.
  - **Export .sqlite binary**: Download database state to disk.
  - **Export SQL Dump**: Generate full `CREATE TABLE` and `INSERT` dump scripts.
  - **Export Results**: Download query results as `.csv`, `.json`, or copy as Markdown Table or SQL `INSERT` statements.
- **⭐ Bookmarks & Query History**:
  - Save frequently used queries with custom titles and descriptions.
  - Automatic execution history tracking with duration (ms) and row counts.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application runs at `http://localhost:5173/`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + Enter` / `⌘ + Enter` | Run active query |
| `Ctrl + Shift + F` / `⌘ + Shift + F` | Format SQL query |
| `Ctrl + Space` / `⌘ + Space` | Trigger table/column autocomplete |
| `Ctrl + /` / `⌘ + /` | Toggle comment line (`--`) |
| `Esc` | Close open modal or dropdown |
