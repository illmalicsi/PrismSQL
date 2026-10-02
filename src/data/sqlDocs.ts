export interface DocQueryItem {
  id: string
  title: string
  category:
    | 'DDL (Schema & Tables)'
    | 'DML (Insert, Update, Delete)'
    | 'Querying & Filtering'
    | 'Aggregations & Grouping'
    | 'Joins & Relationships'
    | 'Advanced & Window Functions'
    | 'Database Introspection'
    | 'Sample Dataset Queries'
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  description: string
  syntax: string
  exampleSql: string
  explanation: string
  tips?: string
}

export const DOC_CATEGORIES = [
  'All',
  'DDL (Schema & Tables)',
  'DML (Insert, Update, Delete)',
  'Querying & Filtering',
  'Aggregations & Grouping',
  'Joins & Relationships',
  'Advanced & Window Functions',
  'Database Introspection',
  'Sample Dataset Queries',
] as const

export const SQL_DOCUMENTATION: DocQueryItem[] = [
  // ==========================================
  // DDL (Schema & Tables)
  // ==========================================
  {
    id: 'ddl-create-table',
    title: 'CREATE TABLE (Basic Table)',
    category: 'DDL (Schema & Tables)',
    level: 'Beginner',
    description: 'Defines a new table schema with column names, data types, and primary key.',
    syntax: 'CREATE TABLE table_name (\n    column1 datatype PRIMARY KEY,\n    column2 datatype NOT NULL\n);',
    exampleSql: `CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    stock_quantity INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`,
    explanation: 'Creates a products table where id automatically increments for each new record. price has a CHECK constraint ensuring non-negative values.',
    tips: 'Use AUTOINCREMENT on INTEGER PRIMARY KEY columns when you want sequentially increasing unique IDs.',
  },
  {
    id: 'ddl-create-foreign-key',
    title: 'CREATE TABLE with Foreign Keys',
    category: 'DDL (Schema & Tables)',
    level: 'Intermediate',
    description: 'Creates a relational table referencing a parent table with cascade deletion.',
    syntax: 'CREATE TABLE child (\n    id INTEGER PRIMARY KEY,\n    parent_id INTEGER REFERENCES parent(id) ON DELETE CASCADE\n);',
    exampleSql: `CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL
);`,
    explanation: 'Defines order_items with foreign keys linking to orders and products. ON DELETE CASCADE automatically removes order items when their parent order is deleted.',
    tips: 'In SQLite, enable foreign key checks with PRAGMA foreign_keys = ON; if enforced constraints are required.',
  },
  {
    id: 'ddl-alter-add-column',
    title: 'ALTER TABLE (Add Column)',
    category: 'DDL (Schema & Tables)',
    level: 'Beginner',
    description: 'Adds a new column to an existing table without dropping data.',
    syntax: 'ALTER TABLE table_name ADD COLUMN column_name datatype default_value;',
    exampleSql: `ALTER TABLE products ADD COLUMN is_featured INTEGER DEFAULT 0;`,
    explanation: 'Appends a new integer column named is_featured with a default value of 0 to the products table.',
    tips: 'In SQLite, you can add columns with DEFAULT values, but cannot add columns with UNIQUE constraints in an ALTER statement.',
  },
  {
    id: 'ddl-alter-rename',
    title: 'ALTER TABLE (Rename Table or Column)',
    category: 'DDL (Schema & Tables)',
    level: 'Beginner',
    description: 'Renames an existing table or column.',
    syntax: 'ALTER TABLE table_name RENAME TO new_name;\nALTER TABLE table_name RENAME COLUMN old_col TO new_col;',
    exampleSql: `-- Rename a column
ALTER TABLE products RENAME COLUMN name TO title;

-- Rename the table
ALTER TABLE products RENAME TO items;`,
    explanation: 'Demonstrates renaming both an individual column and an entire table in SQLite.',
  },
  {
    id: 'ddl-create-index',
    title: 'CREATE INDEX (Speed Up Lookups)',
    category: 'DDL (Schema & Tables)',
    level: 'Intermediate',
    description: 'Creates a B-Tree index on one or more columns to dramatically speed up WHERE and JOIN lookups.',
    syntax: 'CREATE INDEX idx_name ON table_name(column1, column2);',
    exampleSql: `CREATE INDEX idx_products_price_rating ON products(price, rating);
CREATE UNIQUE INDEX idx_users_email ON users(email);`,
    explanation: 'Creates a composite index for queries filtering or sorting by price and rating simultaneously, and a unique index on email.',
    tips: 'Use EXPLAIN QUERY PLAN to verify if your queries are using the index.',
  },
  {
    id: 'ddl-create-view',
    title: 'CREATE VIEW (Reusable Virtual Table)',
    category: 'DDL (Schema & Tables)',
    level: 'Intermediate',
    description: 'Saves a query as a virtual table that can be queried like any normal table.',
    syntax: 'CREATE VIEW view_name AS SELECT ...;',
    exampleSql: `CREATE VIEW active_in_stock_products AS
SELECT id, name, price, rating
FROM products
WHERE is_active = 1 AND stock_quantity > 0;`,
    explanation: 'Creates a virtual view named active_in_stock_products. Query it anytime using: SELECT * FROM active_in_stock_products;',
  },
  {
    id: 'ddl-drop-table',
    title: 'DROP TABLE & DROP VIEW',
    category: 'DDL (Schema & Tables)',
    level: 'Beginner',
    description: 'Removes a table or view and all associated schema and data.',
    syntax: 'DROP TABLE IF EXISTS table_name;\nDROP VIEW IF EXISTS view_name;',
    exampleSql: `DROP TABLE IF EXISTS temporary_logs;
DROP VIEW IF EXISTS active_in_stock_products;`,
    explanation: 'Safely deletes tables or views only if they exist, avoiding runtime errors.',
  },

  // ==========================================
  // DML (Insert, Update, Delete)
  // ==========================================
  {
    id: 'dml-insert-single-multi',
    title: 'INSERT INTO (Single & Bulk Rows)',
    category: 'DML (Insert, Update, Delete)',
    level: 'Beginner',
    description: 'Inserts one or multiple records into a table.',
    syntax: 'INSERT INTO table_name (col1, col2) VALUES (val1, val2), (val3, val4);',
    exampleSql: `INSERT INTO products (name, price, stock_quantity) VALUES
('Noise Cancelling Headphones', 249.99, 15),
('Ergonomic Wireless Mouse', 79.50, 40),
('Mechanical RGB Keyboard', 129.00, 25);`,
    explanation: 'Inserts three separate product rows in a single atomic SQL statement.',
    tips: 'Multi-row inserts are significantly faster than individual single-row inserts in SQLite.',
  },
  {
    id: 'dml-insert-or-replace',
    title: 'INSERT OR REPLACE (Upsert)',
    category: 'DML (Insert, Update, Delete)',
    level: 'Intermediate',
    description: 'Inserts a new record or replaces an existing record if a primary or unique key conflict occurs.',
    syntax: 'INSERT OR REPLACE INTO table_name (id, col1) VALUES (1, "val");',
    exampleSql: `INSERT OR REPLACE INTO products (id, name, price, stock_quantity)
VALUES (1, 'Updated Laptop Pro', 1499.00, 10);`,
    explanation: 'If a product with id = 1 exists, SQLite deletes the old record and inserts the new row. Otherwise, it performs a normal insert.',
  },
  {
    id: 'dml-update-rows',
    title: 'UPDATE Rows with Conditions',
    category: 'DML (Insert, Update, Delete)',
    level: 'Beginner',
    description: 'Modifies existing values in one or more columns based on a WHERE condition.',
    syntax: 'UPDATE table_name SET col1 = val1, col2 = val2 WHERE condition;',
    exampleSql: `UPDATE products
SET price = ROUND(price * 0.9, 2),
    stock_quantity = stock_quantity + 5
WHERE rating >= 4.8;`,
    explanation: 'Applies a 10% discount and adds 5 units of stock for all products with a customer rating of 4.8 or higher.',
    tips: 'Always include a WHERE clause unless you explicitly intend to modify every single row in the table.',
  },
  {
    id: 'dml-delete-rows',
    title: 'DELETE Rows with Conditions',
    category: 'DML (Insert, Update, Delete)',
    level: 'Beginner',
    description: 'Removes rows that match a specific filter condition.',
    syntax: 'DELETE FROM table_name WHERE condition;',
    exampleSql: `DELETE FROM products
WHERE is_active = 0 AND stock_quantity = 0;`,
    explanation: 'Deletes obsolete products that are both inactive and have zero remaining inventory.',
    tips: 'To delete all rows while keeping the table schema intact, omit the WHERE clause: DELETE FROM products;',
  },

  // ==========================================
  // Querying & Filtering
  // ==========================================
  {
    id: 'dql-select-where-order',
    title: 'SELECT with WHERE, ORDER BY, and LIMIT',
    category: 'Querying & Filtering',
    level: 'Beginner',
    description: 'The foundation of SQL: selecting specific columns, filtering rows, sorting, and limiting results.',
    syntax: 'SELECT col1, col2 FROM table WHERE condition ORDER BY col1 DESC LIMIT 10;',
    exampleSql: `SELECT 
    name,
    price,
    stock_quantity,
    rating
FROM products
WHERE is_active = 1 AND price BETWEEN 50 AND 500
ORDER BY price DESC
LIMIT 10;`,
    explanation: 'Retrieves active products priced between $50 and $500, ordered from most expensive to least, taking the top 10.',
  },
  {
    id: 'dql-like-pattern-matching',
    title: 'LIKE & Wildcard Pattern Matching',
    category: 'Querying & Filtering',
    level: 'Beginner',
    description: 'Filters strings using wildcards: % matches any sequence of characters, _ matches any single character.',
    syntax: 'SELECT * FROM table WHERE column LIKE "%pattern%";',
    exampleSql: `SELECT name, price 
FROM products 
WHERE name LIKE '%wireless%' OR name LIKE '%bluetooth%';`,
    explanation: 'Finds all products whose names contain either "wireless" or "bluetooth", regardless of case in SQLite.',
    tips: 'In SQLite, the LIKE operator is case-insensitive for standard ASCII characters.',
  },
  {
    id: 'dql-in-and-between',
    title: 'IN & BETWEEN Range Filters',
    category: 'Querying & Filtering',
    level: 'Beginner',
    description: 'Matches values against a discrete set (IN) or a continuous range (BETWEEN).',
    syntax: 'SELECT * FROM table WHERE col IN (1, 2, 3);\nSELECT * FROM table WHERE col BETWEEN 10 AND 50;',
    exampleSql: `SELECT id, name, category_id, price
FROM products
WHERE category_id IN (1, 3, 5)
  AND price BETWEEN 25.00 AND 150.00;`,
    explanation: 'Selects items that belong to categories 1, 3, or 5 and fall within the price range of $25 to $150 inclusive.',
  },
  {
    id: 'dql-null-handling',
    title: 'Handling NULL Values (IS NULL, COALESCE)',
    category: 'Querying & Filtering',
    level: 'Beginner',
    description: 'Safely testing and substituting null values.',
    syntax: 'SELECT * FROM table WHERE col IS NULL;\nSELECT COALESCE(col, "Default") FROM table;',
    exampleSql: `SELECT 
    name,
    price,
    COALESCE(rating, 0.0) AS display_rating,
    CASE WHEN city IS NULL THEN 'Unknown' ELSE city END AS customer_city
FROM customers
WHERE country IS NOT NULL;`,
    explanation: 'Uses IS NOT NULL to filter rows, and COALESCE to replace missing ratings with 0.0.',
    tips: 'Never use "= NULL" because NULL = NULL evaluates to NULL (unknown) in SQL. Always use "IS NULL" or "IS NOT NULL".',
  },
  {
    id: 'dql-distinct-values',
    title: 'DISTINCT (Deduplicate Values)',
    category: 'Querying & Filtering',
    level: 'Beginner',
    description: 'Eliminates duplicate rows from the query output.',
    syntax: 'SELECT DISTINCT col1, col2 FROM table;',
    exampleSql: `SELECT DISTINCT country, city 
FROM customers 
ORDER BY country, city;`,
    explanation: 'Lists every unique country and city combination present in the customer records without repeats.',
  },

  // ==========================================
  // Aggregations & Grouping
  // ==========================================
  {
    id: 'agg-group-by-having',
    title: 'GROUP BY with HAVING Filter',
    category: 'Aggregations & Grouping',
    level: 'Intermediate',
    description: 'Aggregates data by groups and filters aggregated results using HAVING.',
    syntax: 'SELECT group_col, COUNT(*), AVG(val) FROM table GROUP BY group_col HAVING COUNT(*) > 5;',
    exampleSql: `SELECT 
    category_id,
    COUNT(id) AS total_products,
    ROUND(AVG(price), 2) AS average_price,
    ROUND(SUM(price * stock_quantity), 2) AS total_inventory_value
FROM products
GROUP BY category_id
HAVING COUNT(id) >= 3
ORDER BY total_inventory_value DESC;`,
    explanation: 'Groups products by category, computes counts and averages, and filters only categories with at least 3 products.',
    tips: 'WHERE filters individual rows BEFORE grouping. HAVING filters groups AFTER aggregation.',
  },
  {
    id: 'agg-conditional-case',
    title: 'Conditional Aggregation with CASE WHEN',
    category: 'Aggregations & Grouping',
    level: 'Intermediate',
    description: 'Pivots categories into columns using CASE WHEN expressions inside aggregate functions.',
    syntax: 'SELECT SUM(CASE WHEN cond THEN 1 ELSE 0 END) FROM table;',
    exampleSql: `SELECT 
    category_id,
    COUNT(id) AS total_items,
    SUM(CASE WHEN price < 50 THEN 1 ELSE 0 END) AS budget_tier,
    SUM(CASE WHEN price BETWEEN 50 AND 200 THEN 1 ELSE 0 END) AS mid_tier,
    SUM(CASE WHEN price > 200 THEN 1 ELSE 0 END) AS premium_tier
FROM products
GROUP BY category_id;`,
    explanation: 'Counts how many products fall into budget, mid, and premium tiers for every category in a single query.',
  },

  // ==========================================
  // Joins & Relationships
  // ==========================================
  {
    id: 'join-inner',
    title: 'INNER JOIN (Matching Rows)',
    category: 'Joins & Relationships',
    level: 'Beginner',
    description: 'Combines rows from two tables whenever the specified join condition is met in both.',
    syntax: 'SELECT * FROM table1 t1 INNER JOIN table2 t2 ON t1.id = t2.t1_id;',
    exampleSql: `SELECT 
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    c.department,
    p.price
FROM products p
INNER JOIN categories c ON p.category_id = c.id
ORDER BY c.department, p.name;`,
    explanation: 'Retrieves all products joined with their matching category details.',
  },
  {
    id: 'join-left-outer',
    title: 'LEFT JOIN (Preserve All Left Rows)',
    category: 'Joins & Relationships',
    level: 'Intermediate',
    description: 'Returns all records from the left table, and matching records from the right table (with NULLs for non-matches).',
    syntax: 'SELECT * FROM table1 t1 LEFT JOIN table2 t2 ON t1.id = t2.t1_id;',
    exampleSql: `SELECT 
    c.id AS customer_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0.00) AS total_spend
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.first_name, c.last_name
ORDER BY total_spend DESC;`,
    explanation: 'Lists every customer even if they have placed zero orders (returning 0.00 spend instead of dropping them).',
    tips: 'Use LEFT JOIN when you want to find items with no activity (e.g. WHERE right_table.id IS NULL).',
  },
  {
    id: 'join-self-join',
    title: 'Self-Join (Hierarchy & Comparisons)',
    category: 'Joins & Relationships',
    level: 'Intermediate',
    description: 'Joins a table to itself to model parent-child relationships like employee to manager.',
    syntax: 'SELECT * FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;',
    exampleSql: `SELECT 
    e.first_name || ' ' || e.last_name AS employee_name,
    e.job_title AS employee_title,
    COALESCE(m.first_name || ' ' || m.last_name, 'Top Leadership') AS manager_name
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
ORDER BY manager_name;`,
    explanation: 'Aliases the employees table twice (e for employee, m for manager) to display who reports to whom.',
  },

  // ==========================================
  // Advanced & Window Functions
  // ==========================================
  {
    id: 'adv-cte',
    title: 'Common Table Expressions (WITH cte AS)',
    category: 'Advanced & Window Functions',
    level: 'Intermediate',
    description: 'Defines a temporary named result set that simplifies complex subqueries and multi-step data pipelines.',
    syntax: 'WITH cte_name AS (\n    SELECT ...\n)\nSELECT * FROM cte_name;',
    exampleSql: `WITH HighValueOrders AS (
    SELECT 
        customer_id,
        COUNT(id) AS big_orders_count,
        SUM(total_amount) AS big_orders_total
    FROM orders
    WHERE total_amount > 200.00
    GROUP BY customer_id
)
SELECT 
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email,
    hvo.big_orders_count,
    hvo.big_orders_total
FROM HighValueOrders hvo
JOIN customers c ON hvo.customer_id = c.id
ORDER BY hvo.big_orders_total DESC;`,
    explanation: 'Creates a clean temporary CTE named HighValueOrders and then joins it back to the customers table.',
  },
  {
    id: 'adv-window-row-number',
    title: 'Window Functions: ROW_NUMBER()',
    category: 'Advanced & Window Functions',
    level: 'Advanced',
    description: 'Assigns a sequential unique integer to each row within a partitioned group.',
    syntax: 'ROW_NUMBER() OVER (PARTITION BY group_col ORDER BY sort_col DESC)',
    exampleSql: `WITH RankedProducts AS (
    SELECT 
        id,
        name,
        category_id,
        price,
        rating,
        ROW_NUMBER() OVER (
            PARTITION BY category_id 
            ORDER BY rating DESC, price DESC
        ) AS rank_in_cat
    FROM products
)
SELECT * 
FROM RankedProducts 
WHERE rank_in_cat <= 3;`,
    explanation: 'Partitions products by category_id and finds the top 3 highest-rated items within each category.',
  },
  {
    id: 'adv-window-running-total',
    title: 'Window Functions: Cumulative Running Total',
    category: 'Advanced & Window Functions',
    level: 'Advanced',
    description: 'Computes a running sum or moving average over an ordered sequence of events.',
    syntax: 'SUM(col) OVER (ORDER BY date_col)',
    exampleSql: `SELECT 
    order_date,
    id AS order_id,
    total_amount,
    ROUND(SUM(total_amount) OVER (ORDER BY order_date, id), 2) AS running_total_revenue,
    ROUND(AVG(total_amount) OVER (
        ORDER BY order_date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS moving_avg_3_orders
FROM orders
ORDER BY order_date, id;`,
    explanation: 'Computes running revenue day by day alongside a 3-order moving average.',
  },
  {
    id: 'adv-recursive-cte',
    title: 'Recursive CTE (Hierarchy Traversal)',
    category: 'Advanced & Window Functions',
    level: 'Advanced',
    description: 'Recursively walks a tree or graph structure until the termination condition is met.',
    syntax: 'WITH RECURSIVE cte AS (\n    SELECT ...\n    UNION ALL\n    SELECT ... FROM cte ...\n) SELECT * FROM cte;',
    exampleSql: `WITH RECURSIVE OrgTree AS (
    -- Anchor: CEO / Top Level
    SELECT id, first_name || ' ' || last_name AS name, manager_id, 0 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive Step: Direct Reports
    SELECT e.id, e.first_name || ' ' || e.last_name, e.manager_id, ot.level + 1
    FROM employees e
    JOIN OrgTree ot ON e.manager_id = ot.id
)
SELECT level, name FROM OrgTree ORDER BY level, name;`,
    explanation: 'Traverses an organization tree from level 0 down through all management tiers.',
  },

  // ==========================================
  // Database Introspection
  // ==========================================
  {
    id: 'sys-sqlite-master',
    title: 'List All Tables & Schema (sqlite_master)',
    category: 'Database Introspection',
    level: 'Beginner',
    description: 'Queries the SQLite system catalog to inspect all tables, indexes, and triggers.',
    syntax: 'SELECT * FROM sqlite_master WHERE type="table";',
    exampleSql: `SELECT 
    type,
    name AS object_name,
    tbl_name AS table_name,
    sql
FROM sqlite_master
WHERE type IN ('table', 'view', 'index') AND name NOT LIKE 'sqlite_%'
ORDER BY type, name;`,
    explanation: 'Displays the underlying DDL and metadata for all user-defined database objects.',
  },
  {
    id: 'sys-pragma-table-info',
    title: 'PRAGMA table_info (Inspect Columns)',
    category: 'Database Introspection',
    level: 'Beginner',
    description: 'Returns column names, data types, nullability, default values, and primary key status.',
    syntax: 'PRAGMA table_info(table_name);',
    exampleSql: `PRAGMA table_info(products);`,
    explanation: 'Returns a tabular breakdown of all columns inside the products table.',
  },
  {
    id: 'sys-explain-query-plan',
    title: 'EXPLAIN QUERY PLAN (Performance Analysis)',
    category: 'Database Introspection',
    level: 'Intermediate',
    description: 'Explains the execution strategy chosen by the SQLite query planner.',
    syntax: 'EXPLAIN QUERY PLAN SELECT ...;',
    exampleSql: `EXPLAIN QUERY PLAN
SELECT p.name, c.name 
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price > 100;`,
    explanation: 'Reveals whether SQLite uses a table scan, index search, or temporary sorting B-tree to execute the query.',
  },
]
