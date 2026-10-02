import type { Challenge } from '../types/challenges'

export const CHALLENGES: Challenge[] = [
  // ==========================================
  // TIER 1: EASY (APPRENTICE)
  // ==========================================
  {
    id: 'easy-1',
    tier: 'easy',
    tierOrder: 1,
    title: 'The Engineering Roster',
    subtitle: 'Basic SELECT, WHERE Filtering & Sorting',
    difficulty: 'Easy',
    xp: 50,
    badge: 'Apprentice',
    story: 'The VP of Engineering needs a list of senior technical personnel to allocate for an upcoming infrastructure upgrade.',
    description: 'Retrieve the `name`, `role`, and `salary` of all staff who work in the `Engineering` department and have a `salary` of at least 80,000. Sort the results by `salary` in descending order.',
    requirements: [
      'Select only `name`, `role`, and `salary`',
      "Filter for `department = 'Engineering'`",
      'Filter for `salary >= 80000`',
      'Order by `salary DESC`',
    ],
    tables: [
      {
        name: 'employees',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Employee primary ID' },
          { name: 'name', type: 'TEXT', desc: 'Full name' },
          { name: 'department', type: 'TEXT', desc: 'Department name' },
          { name: 'role', type: 'TEXT', desc: 'Job role' },
          { name: 'salary', type: 'INTEGER', desc: 'Annual base salary' },
          { name: 'hire_date', type: 'TEXT', desc: 'Date of hire (YYYY-MM-DD)' },
        ],
        sampleRows: [
          { id: 1, name: 'Alice Walker', department: 'Engineering', role: 'Backend Engineer', salary: 95000, hire_date: '2021-03-15' },
          { id: 2, name: 'Bob Chen', department: 'Marketing', role: 'Content Lead', salary: 65000, hire_date: '2022-06-01' },
          { id: 3, name: 'Carla Gomez', department: 'Engineering', role: 'Systems Architect', salary: 125000, hire_date: '2019-11-20' },
          { id: 4, name: 'David Kim', department: 'Engineering', role: 'QA Engineer', salary: 72000, hire_date: '2023-01-10' },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        role TEXT NOT NULL,
        salary INTEGER NOT NULL,
        hire_date TEXT NOT NULL
      );
      INSERT INTO employees VALUES
      (1, 'Alice Walker', 'Engineering', 'Backend Engineer', 95000, '2021-03-15'),
      (2, 'Bob Chen', 'Marketing', 'Content Lead', 65000, '2022-06-01'),
      (3, 'Carla Gomez', 'Engineering', 'Systems Architect', 125000, '2019-11-20'),
      (4, 'David Kim', 'Engineering', 'QA Engineer', 72000, '2023-01-10'),
      (5, 'Elena Rostova', 'Design', 'UI/UX Designer', 78000, '2022-04-12'),
      (6, 'Frank Vance', 'Engineering', 'DevOps Specialist', 88000, '2020-08-30');
    `,
    starterSql: `-- Select name, role, salary from employees
-- Filter for Engineering department with salary >= 80000
-- Order by salary descending

SELECT 
`,
    solutionSql: `
      SELECT name, role, salary
      FROM employees
      WHERE department = 'Engineering' AND salary >= 80000
      ORDER BY salary DESC;
    `,
    hints: [
      'Use the WHERE clause with the AND operator to combine the department and salary conditions.',
      'Check the string casing: department should match "Engineering".',
      'Add ORDER BY salary DESC at the very end of your query.',
    ],
    orderMatters: true,
  },
  {
    id: 'easy-2',
    tier: 'easy',
    tierOrder: 2,
    title: 'Low Stock Emergency',
    subtitle: 'Boolean Filtering, Ascending Order & LIMIT',
    difficulty: 'Easy',
    xp: 50,
    badge: 'Apprentice',
    story: 'The warehouse inventory is running critically low on certain high-demand hardware items. Identify items urgently needing a restock.',
    description: 'Find all currently active products (`is_active = 1`) that have a `stock_quantity` strictly less than 15. Return the product `name`, `category`, and `stock_quantity`. Order by `stock_quantity` ascending, and limit the result to the 5 most urgent items.',
    requirements: [
      'Select `name`, `category`, and `stock_quantity`',
      'Filter for `is_active = 1`',
      'Filter for `stock_quantity < 15`',
      'Order by `stock_quantity ASC`',
      'Limit the output to 5 rows',
    ],
    tables: [
      {
        name: 'products',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Product primary ID' },
          { name: 'name', type: 'TEXT', desc: 'Product name' },
          { name: 'category', type: 'TEXT', desc: 'Product category' },
          { name: 'price', type: 'REAL', desc: 'Retail price' },
          { name: 'stock_quantity', type: 'INTEGER', desc: 'Units currently in warehouse' },
          { name: 'is_active', type: 'INTEGER', desc: '1 = active in store, 0 = discontinued' },
        ],
        sampleRows: [
          { id: 101, name: 'Mechanical Keyboard', category: 'Electronics', price: 119.99, stock_quantity: 8, is_active: 1 },
          { id: 102, name: 'Ergonomic Mouse', category: 'Electronics', price: 49.99, stock_quantity: 25, is_active: 1 },
          { id: 103, name: 'USB-C Cable Pack', category: 'Accessories', price: 14.50, stock_quantity: 4, is_active: 1 },
          { id: 105, name: 'Legacy VGA Adapter', category: 'Accessories', price: 9.99, stock_quantity: 2, is_active: 0 },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock_quantity INTEGER NOT NULL,
        is_active INTEGER NOT NULL
      );
      INSERT INTO products VALUES
      (101, 'Mechanical Keyboard', 'Electronics', 119.99, 8, 1),
      (102, 'Ergonomic Mouse', 'Electronics', 49.99, 25, 1),
      (103, 'USB-C Cable Pack', 'Accessories', 14.50, 4, 1),
      (104, 'Monitor Stand', 'Furniture', 39.99, 12, 1),
      (105, 'Legacy VGA Adapter', 'Accessories', 9.99, 2, 0),
      (106, 'Desk Lamp', 'Furniture', 29.99, 7, 1),
      (107, 'Webcam 1080p', 'Electronics', 69.99, 3, 1),
      (108, 'Wireless Earbuds', 'Audio', 89.99, 18, 1);
    `,
    starterSql: `-- Select name, category, stock_quantity from products
-- Filter for is_active = 1 and stock_quantity < 15
-- Order by stock_quantity ASC LIMIT 5

SELECT 
`,
    solutionSql: `
      SELECT name, category, stock_quantity
      FROM products
      WHERE is_active = 1 AND stock_quantity < 15
      ORDER BY stock_quantity ASC
      LIMIT 5;
    `,
    hints: [
      'Remember that discontinued products with is_active = 0 should be excluded.',
      'To order from lowest stock to highest, use ORDER BY stock_quantity ASC.',
      'Append LIMIT 5 to the end of the query to cap results.',
    ],
    orderMatters: true,
  },
  {
    id: 'easy-3',
    tier: 'easy',
    tierOrder: 3,
    title: 'High-Value Order Lines',
    subtitle: 'Calculated Expressions & Aliasing',
    difficulty: 'Easy',
    xp: 50,
    badge: 'Apprentice',
    story: 'The fulfillment team needs to identify premium basket items that exceed a 100 threshold for prioritized insured packaging.',
    description: 'For each line item in `order_items`, calculate the total price by multiplying `quantity` by `unit_price`, aliased as `total_price` (rounded to 2 decimal places using `ROUND()`). Select `order_id`, `product_name`, and `total_price` for all items where the calculated total exceeds 100. Order by `total_price` descending.',
    requirements: [
      'Select `order_id`, `product_name`, and calculated `total_price`',
      'Compute `ROUND(quantity * unit_price, 2) AS total_price`',
      'Filter where `quantity * unit_price > 100`',
      'Order by `total_price DESC`',
    ],
    tables: [
      {
        name: 'order_items',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Item line ID' },
          { name: 'order_id', type: 'INTEGER', desc: 'Parent order reference ID' },
          { name: 'product_name', type: 'TEXT', desc: 'Item description' },
          { name: 'quantity', type: 'INTEGER', desc: 'Units purchased' },
          { name: 'unit_price', type: 'REAL', desc: 'Price per individual unit' },
        ],
        sampleRows: [
          { id: 1, order_id: 1001, product_name: '4K Monitor', quantity: 2, unit_price: 299.99 },
          { id: 2, order_id: 1001, product_name: 'HDMI Cable', quantity: 3, unit_price: 12.00 },
          { id: 3, order_id: 1002, product_name: 'Standing Desk', quantity: 1, unit_price: 450.00 },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE order_items (
        id INTEGER PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL
      );
      INSERT INTO order_items VALUES
      (1, 1001, '4K Monitor', 2, 299.99),
      (2, 1001, 'HDMI Cable', 3, 12.00),
      (3, 1002, 'Standing Desk', 1, 450.00),
      (4, 1003, 'Mousepad XL', 4, 15.00),
      (5, 1004, 'Bluetooth Headset', 2, 75.00),
      (6, 1005, 'Ergonomic Chair', 1, 320.00),
      (7, 1005, 'Screen Cleaner Kit', 2, 9.99);
    `,
    starterSql: `-- Select order_id, product_name, and total_price (quantity * unit_price)
-- Filter for line items > 100
-- Order by total_price DESC

SELECT 
`,
    solutionSql: `
      SELECT order_id, product_name, ROUND(quantity * unit_price, 2) AS total_price
      FROM order_items
      WHERE quantity * unit_price > 100
      ORDER BY total_price DESC;
    `,
    hints: [
      'In standard SQL, you can filter on the mathematical expression `quantity * unit_price > 100` in the WHERE clause.',
      'Use `ROUND(quantity * unit_price, 2) AS total_price` in the SELECT clause.',
    ],
    orderMatters: true,
  },

  // ==========================================
  // TIER 2: MEDIUM (JOURNEYMAN)
  // ==========================================
  {
    id: 'medium-1',
    tier: 'medium',
    tierOrder: 1,
    title: 'Department Headcount & Payroll',
    subtitle: 'INNER JOIN, GROUP BY, Aggregates & HAVING',
    difficulty: 'Medium',
    xp: 100,
    badge: 'Journeyman',
    story: 'The Chief Financial Officer requires a departmental breakdown to evaluate budget distributions across primary branches.',
    description: 'Join `departments` and `employees`. For every department that employs at least 2 people, return the department name (`dept_name`), total number of employees as `employee_count`, and their average salary rounded to 2 decimal places as `avg_salary`. Sort results by `avg_salary` in descending order.',
    requirements: [
      'Perform an INNER JOIN between `departments` and `employees` on `departments.id = employees.department_id`',
      'Select `dept_name`, `COUNT(employees.id) AS employee_count`, and `ROUND(AVG(employees.salary), 2) AS avg_salary`',
      'Group by department ID and department name',
      'Filter with `HAVING COUNT(employees.id) >= 2`',
      'Order by `avg_salary DESC`',
    ],
    tables: [
      {
        name: 'departments',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Department ID' },
          { name: 'dept_name', type: 'TEXT', desc: 'Department title' },
          { name: 'location', type: 'TEXT', desc: 'Office location' },
        ],
        sampleRows: [
          { id: 1, dept_name: 'Engineering', location: 'San Francisco' },
          { id: 2, dept_name: 'Marketing', location: 'New York' },
          { id: 3, dept_name: 'Sales', location: 'Chicago' },
        ],
      },
      {
        name: 'employees',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Employee ID' },
          { name: 'name', type: 'TEXT', desc: 'Employee name' },
          { name: 'department_id', type: 'INTEGER', desc: 'Foreign key referencing departments(id)' },
          { name: 'salary', type: 'INTEGER', desc: 'Base annual compensation' },
        ],
        sampleRows: [
          { id: 1, name: 'Sarah Connor', department_id: 1, salary: 120000 },
          { id: 2, name: 'John Smith', department_id: 1, salary: 95000 },
          { id: 3, name: 'Grace Hopper', department_id: 1, salary: 135000 },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE departments (
        id INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL,
        location TEXT NOT NULL
      );
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        salary INTEGER NOT NULL,
        FOREIGN KEY(department_id) REFERENCES departments(id)
      );
      INSERT INTO departments VALUES
      (1, 'Engineering', 'San Francisco'),
      (2, 'Marketing', 'New York'),
      (3, 'Sales', 'Chicago'),
      (4, 'Human Resources', 'Austin');

      INSERT INTO employees VALUES
      (1, 'Sarah Connor', 1, 120000),
      (2, 'John Smith', 1, 95000),
      (3, 'Grace Hopper', 1, 135000),
      (4, 'Emily Watson', 2, 82000),
      (5, 'Liam Davis', 2, 78000),
      (6, 'Sophia Taylor', 3, 90000),
      (7, 'Noah Martinez', 4, 65000);
    `,
    starterSql: `-- Join departments and employees
-- Aggregate headcount as employee_count and rounded average salary as avg_salary
-- Filter for departments with >= 2 employees
-- Order by avg_salary DESC

SELECT 
`,
    solutionSql: `
      SELECT 
        d.dept_name,
        COUNT(e.id) AS employee_count,
        ROUND(AVG(e.salary), 2) AS avg_salary
      FROM departments d
      JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.dept_name
      HAVING COUNT(e.id) >= 2
      ORDER BY avg_salary DESC;
    `,
    hints: [
      'Connect the two tables using `FROM departments d JOIN employees e ON d.id = e.department_id`.',
      'Use GROUP BY d.id, d.dept_name so you can aggregate per department.',
      'Remember to filter aggregated groups using HAVING COUNT(e.id) >= 2 rather than WHERE.',
    ],
    orderMatters: true,
  },
  {
    id: 'medium-2',
    tier: 'medium',
    tierOrder: 2,
    title: 'Customer Loyalty Tiers',
    subtitle: 'LEFT JOIN, Conditional Aggregations & CASE WHEN',
    difficulty: 'Medium',
    xp: 100,
    badge: 'Journeyman',
    story: 'The marketing director wants to launch a tiered rewards campaign. We must categorize customers by their lifetime completed purchase total.',
    description: 'Perform a `LEFT JOIN` from `customers` to `orders`. Calculate each customer\'s total spend on completed orders (`status = \'completed\'`), aliased as `total_spent` (default to 0 for customers with no orders or no completed orders). Assign a `loyalty_tier` using a `CASE` expression:\n- `total_spent >= 500`: `\'VIP\'`\n- `total_spent >= 200`: `\'Gold\'`\n- Otherwise: `\'Standard\'`\n\nReturn `name`, `total_spent`, and `loyalty_tier`. Sort by `total_spent` in descending order, then by `name` ascending.',
    requirements: [
      'Preserve all customers (including those with 0 orders) via LEFT JOIN',
      "Only sum amounts where `orders.status = 'completed'`",
      'Use `COALESCE(SUM(...), 0) AS total_spent`',
      "Assign 'VIP', 'Gold', or 'Standard' via CASE WHEN",
      'Order by `total_spent DESC, name ASC`',
    ],
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Customer primary key' },
          { name: 'name', type: 'TEXT', desc: 'Customer full name' },
          { name: 'email', type: 'TEXT', desc: 'Contact email' },
        ],
        sampleRows: [
          { id: 1, name: 'Marcus Vance', email: 'marcus@example.com' },
          { id: 2, name: 'Chloe Bennet', email: 'chloe@example.com' },
          { id: 4, name: 'Beatrice Portinari', email: 'beatrice@example.com' },
        ],
      },
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Order ID' },
          { name: 'customer_id', type: 'INTEGER', desc: 'Foreign key to customers(id)' },
          { name: 'amount', type: 'REAL', desc: 'Order checkout total' },
          { name: 'status', type: 'TEXT', desc: "'completed' or 'cancelled'" },
        ],
        sampleRows: [
          { id: 101, customer_id: 1, amount: 350.00, status: 'completed' },
          { id: 102, customer_id: 1, amount: 280.00, status: 'completed' },
          { id: 104, customer_id: 3, amount: 50.00, status: 'cancelled' },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(customer_id) REFERENCES customers(id)
      );
      INSERT INTO customers VALUES
      (1, 'Marcus Vance', 'marcus@example.com'),
      (2, 'Chloe Bennet', 'chloe@example.com'),
      (3, 'Dante Alighieri', 'dante@example.com'),
      (4, 'Beatrice Portinari', 'beatrice@example.com'),
      (5, 'Logan Roy', 'logan@example.com');

      INSERT INTO orders VALUES
      (101, 1, 350.00, 'completed'),
      (102, 1, 280.00, 'completed'),
      (103, 2, 220.00, 'completed'),
      (104, 3, 50.00, 'cancelled'),
      (105, 3, 40.00, 'completed'),
      (106, 5, 800.00, 'completed');
    `,
    starterSql: `-- Left join customers to orders
-- Sum completed order amounts as total_spent (defaulting to 0)
-- Categorize into loyalty_tier ('VIP', 'Gold', 'Standard')
-- Order by total_spent DESC, name ASC

SELECT 
`,
    solutionSql: `
      SELECT 
        c.name,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.amount ELSE 0 END), 0) AS total_spent,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.amount ELSE 0 END), 0) >= 500 THEN 'VIP'
          WHEN COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.amount ELSE 0 END), 0) >= 200 THEN 'Gold'
          ELSE 'Standard'
        END AS loyalty_tier
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id, c.name
      ORDER BY total_spent DESC, c.name ASC;
    `,
    hints: [
      'In a LEFT JOIN, filtering `status = "completed"` inside the WHERE clause would drop customers with zero orders. Instead, check the status inside the SUM: `SUM(CASE WHEN o.status = "completed" THEN o.amount ELSE 0 END)`.',
      'Wrap your sum with `COALESCE(..., 0)` so customers without orders have 0 rather than NULL.',
    ],
    orderMatters: true,
  },
  {
    id: 'medium-3',
    tier: 'medium',
    tierOrder: 3,
    title: 'Monthly Revenue Audit',
    subtitle: 'Date Slicing & Periodic Aggregation',
    difficulty: 'Medium',
    xp: 100,
    badge: 'Journeyman',
    story: 'Audit team requires a monthly sales breakdown to chart gross volume and transaction count across Q1.',
    description: 'Filter the `sales` table for transactions where `status = \'completed\'`. Extract the year and month in `YYYY-MM` format as `month` (e.g. using `substr(order_date, 1, 7)`). Calculate the number of completed sales as `order_count`, and the total revenue rounded to 2 decimal places as `total_revenue`. Order the results chronologically by `month` in ascending order.',
    requirements: [
      "Filter for `status = 'completed'`",
      'Extract `month` using `substr(order_date, 1, 7)`',
      'Aggregate `COUNT(*) AS order_count`',
      'Aggregate `ROUND(SUM(total_amount), 2) AS total_revenue`',
      'Order by `month ASC`',
    ],
    tables: [
      {
        name: 'sales',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Sale transaction ID' },
          { name: 'order_date', type: 'TEXT', desc: 'Date of order (YYYY-MM-DD)' },
          { name: 'total_amount', type: 'REAL', desc: 'Transaction value' },
          { name: 'status', type: 'TEXT', desc: "'completed', 'refunded', or 'pending'" },
        ],
        sampleRows: [
          { id: 1, order_date: '2024-01-15', total_amount: 120.00, status: 'completed' },
          { id: 2, order_date: '2024-01-20', total_amount: 350.50, status: 'completed' },
          { id: 3, order_date: '2024-01-28', total_amount: 95.00, status: 'refunded' },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE sales (
        id INTEGER PRIMARY KEY,
        order_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL
      );
      INSERT INTO sales VALUES
      (1, '2024-01-15', 120.00, 'completed'),
      (2, '2024-01-20', 350.50, 'completed'),
      (3, '2024-01-28', 95.00, 'refunded'),
      (4, '2024-02-05', 410.00, 'completed'),
      (5, '2024-02-14', 180.25, 'completed'),
      (6, '2024-02-22', 290.00, 'completed'),
      (7, '2024-03-02', 550.00, 'completed'),
      (8, '2024-03-18', 215.00, 'pending'),
      (9, '2024-03-29', 310.50, 'completed');
    `,
    starterSql: `-- Select month, order_count, and total_revenue from sales
-- Filter for status = 'completed'
-- Group by month
-- Order by month ASC

SELECT 
`,
    solutionSql: `
      SELECT 
        substr(order_date, 1, 7) AS month,
        COUNT(*) AS order_count,
        ROUND(SUM(total_amount), 2) AS total_revenue
      FROM sales
      WHERE status = 'completed'
      GROUP BY substr(order_date, 1, 7)
      ORDER BY month ASC;
    `,
    hints: [
      'In SQLite, `substr(order_date, 1, 7)` returns the first 7 characters (e.g. "2024-01").',
      'Remember to put `WHERE status = "completed"` before your `GROUP BY`.',
      'Use `ROUND(SUM(total_amount), 2) AS total_revenue`.',
    ],
    orderMatters: true,
  },

  // ==========================================
  // TIER 3: HARD (GRANDMASTER)
  // ==========================================
  {
    id: 'hard-1',
    tier: 'hard',
    tierOrder: 1,
    title: 'Top 2 Earners per Department',
    subtitle: 'Window Functions (DENSE_RANK) & Partitioning',
    difficulty: 'Hard',
    xp: 200,
    badge: 'Grandmaster',
    story: 'Compensation Committee requires the top 2 highest-paid members within each branch to audit competitive pay banding.',
    description: 'Use a window function (`DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)`) within a CTE or subquery to rank employees by salary within each department. Select `dept_name`, `name` as `employee_name`, `salary`, and their rank within the department as `dept_rank`. Filter for only the top 2 ranks (`dept_rank <= 2`). Order the results by `dept_name` ascending, `dept_rank` ascending, and `employee_name` ascending.',
    requirements: [
      'Join `departments` and `employees`',
      'Compute `DENSE_RANK() OVER (PARTITION BY employees.department_id ORDER BY salary DESC) AS dept_rank`',
      'Filter for `dept_rank <= 2` using a CTE or derived table',
      'Select `dept_name`, `employee_name`, `salary`, `dept_rank`',
      'Order by `dept_name ASC, dept_rank ASC, employee_name ASC`',
    ],
    tables: [
      {
        name: 'departments',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Department ID' },
          { name: 'dept_name', type: 'TEXT', desc: 'Department name' },
        ],
        sampleRows: [
          { id: 1, dept_name: 'Engineering' },
          { id: 2, dept_name: 'Design' },
          { id: 3, dept_name: 'Operations' },
        ],
      },
      {
        name: 'employees',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Employee ID' },
          { name: 'name', type: 'TEXT', desc: 'Employee full name' },
          { name: 'department_id', type: 'INTEGER', desc: 'Department reference' },
          { name: 'salary', type: 'INTEGER', desc: 'Annual base salary' },
        ],
        sampleRows: [
          { id: 101, name: 'Alex Mercer', department_id: 1, salary: 140000 },
          { id: 102, name: 'Brenda Vance', department_id: 1, salary: 130000 },
          { id: 103, name: 'Charlie Fox', department_id: 1, salary: 110000 },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE departments (
        id INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL
      );
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        salary INTEGER NOT NULL
      );
      INSERT INTO departments VALUES
      (1, 'Engineering'),
      (2, 'Design'),
      (3, 'Operations');

      INSERT INTO employees VALUES
      (101, 'Alex Mercer', 1, 140000),
      (102, 'Brenda Vance', 1, 130000),
      (103, 'Charlie Fox', 1, 110000),
      (104, 'Diana Prince', 2, 98000),
      (105, 'Edward Nygma', 2, 105000),
      (106, 'Fiona Gallagher', 2, 85000),
      (107, 'George Clark', 3, 75000),
      (108, 'Hannah Abbott', 3, 82000),
      (109, 'Ian Malcolm', 3, 91000);
    `,
    starterSql: `-- Use a CTE (WITH RankedStaff AS (...))
-- Partition by department_id and order by salary DESC
-- Filter for dept_rank <= 2
-- Order by dept_name ASC, dept_rank ASC, employee_name ASC

WITH RankedStaff AS (
  SELECT 
)
SELECT 
`,
    solutionSql: `
      WITH RankedStaff AS (
        SELECT 
          d.dept_name,
          e.name AS employee_name,
          e.salary,
          DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS dept_rank
        FROM employees e
        JOIN departments d ON e.department_id = d.id
      )
      SELECT dept_name, employee_name, salary, dept_rank
      FROM RankedStaff
      WHERE dept_rank <= 2
      ORDER BY dept_name ASC, dept_rank ASC, employee_name ASC;
    `,
    hints: [
      'Window functions cannot be filtered directly in a WHERE clause in the same query block; wrap them in a Common Table Expression (`WITH ... AS (...)`) or a subquery.',
      'Partition by `e.department_id` so the ranking restarts for each department.',
    ],
    orderMatters: true,
  },
  {
    id: 'hard-2',
    tier: 'hard',
    tierOrder: 2,
    title: 'Cumulative Running Revenue',
    subtitle: 'Window Aggregations & Trailing Frames',
    difficulty: 'Hard',
    xp: 200,
    badge: 'Grandmaster',
    story: 'Track financial momentum by generating a running trajectory of company daily receipts and short-term smoothed moving averages.',
    description: 'For each record in `daily_metrics` sorted by `metric_date` ascending, calculate:\n1. `metric_date` and `revenue`\n2. The cumulative running total of revenue from the beginning up to the current day as `running_total` (`ROUND(SUM(revenue) OVER (...), 2)`)\n3. A 3-day trailing moving average as `moving_avg_3d` (`ROUND(AVG(revenue) OVER (ORDER BY metric_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2)`)\n\nOrder by `metric_date` in ascending order.',
    requirements: [
      'Select `metric_date`, `revenue`',
      'Compute `ROUND(SUM(revenue) OVER (ORDER BY metric_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS running_total`',
      'Compute `ROUND(AVG(revenue) OVER (ORDER BY metric_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3d`',
      'Order by `metric_date ASC`',
    ],
    tables: [
      {
        name: 'daily_metrics',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Metric row ID' },
          { name: 'metric_date', type: 'TEXT', desc: 'Date of metric (YYYY-MM-DD)' },
          { name: 'revenue', type: 'REAL', desc: 'Net revenue booked that day' },
        ],
        sampleRows: [
          { id: 1, metric_date: '2024-04-01', revenue: 1200.00 },
          { id: 2, metric_date: '2024-04-02', revenue: 1500.00 },
          { id: 3, metric_date: '2024-04-03', revenue: 1800.00 },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE daily_metrics (
        id INTEGER PRIMARY KEY,
        metric_date TEXT NOT NULL,
        revenue REAL NOT NULL
      );
      INSERT INTO daily_metrics VALUES
      (1, '2024-04-01', 1200.00),
      (2, '2024-04-02', 1500.00),
      (3, '2024-04-03', 1800.00),
      (4, '2024-04-04', 1100.00),
      (5, '2024-04-05', 2400.00),
      (6, '2024-04-06', 2000.00),
      (7, '2024-04-07', 3100.00);
    `,
    starterSql: `-- Select metric_date, revenue
-- Compute running_total using SUM() OVER ()
-- Compute moving_avg_3d using AVG() OVER (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
-- Order by metric_date ASC

SELECT 
`,
    solutionSql: `
      SELECT 
        metric_date,
        revenue,
        ROUND(SUM(revenue) OVER (ORDER BY metric_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS running_total,
        ROUND(AVG(revenue) OVER (ORDER BY metric_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3d
      FROM daily_metrics
      ORDER BY metric_date ASC;
    `,
    hints: [
      'The frame for a cumulative sum from the start is `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.',
      'For a 3-day window including today and the two prior days, use `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`.',
    ],
    orderMatters: true,
  },
  {
    id: 'hard-3',
    tier: 'hard',
    tierOrder: 3,
    title: 'Repeat Buyer Cohort (CTE)',
    subtitle: 'Common Table Expressions & Cohort Analysis',
    difficulty: 'Hard',
    xp: 200,
    badge: 'Grandmaster',
    story: 'Identify brand loyalists who return to place multiple orders over time to establish repeat customer retention benchmarks.',
    description: 'Use a Common Table Expression (`WITH`) to aggregate orders per customer. Identify customers who have placed at least 2 orders. Return the customer `name`, their earliest order date as `first_order_date` (`MIN(order_date)`), their most recent order date as `latest_order_date` (`MAX(order_date)`), and the total number of orders placed as `total_orders`. Order by `total_orders` in descending order, then by `name` ascending.',
    requirements: [
      'Use a Common Table Expression (CTE) to calculate order statistics per customer',
      'Filter for customers with `COUNT(*) >= 2`',
      'Join with `customers` table to get the customer name',
      'Select `name`, `first_order_date`, `latest_order_date`, `total_orders`',
      'Order by `total_orders DESC, name ASC`',
    ],
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Customer primary key' },
          { name: 'name', type: 'TEXT', desc: 'Customer name' },
          { name: 'signup_date', type: 'TEXT', desc: 'Date joined' },
        ],
        sampleRows: [
          { id: 1, name: 'Alice Kingsley', signup_date: '2024-01-01' },
          { id: 2, name: 'Bruce Wayne', signup_date: '2024-01-10' },
          { id: 3, name: 'Clark Kent', signup_date: '2024-01-15' },
        ],
      },
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Order ID' },
          { name: 'customer_id', type: 'INTEGER', desc: 'Customer reference' },
          { name: 'order_date', type: 'TEXT', desc: 'Date order was placed' },
          { name: 'amount', type: 'REAL', desc: 'Order amount' },
        ],
        sampleRows: [
          { id: 101, customer_id: 1, order_date: '2024-01-12', amount: 150.00 },
          { id: 102, customer_id: 1, order_date: '2024-02-05', amount: 200.00 },
          { id: 104, customer_id: 2, order_date: '2024-01-20', amount: 800.00 },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        signup_date TEXT NOT NULL
      );
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        order_date TEXT NOT NULL,
        amount REAL NOT NULL,
        FOREIGN KEY(customer_id) REFERENCES customers(id)
      );
      INSERT INTO customers VALUES
      (1, 'Alice Kingsley', '2024-01-01'),
      (2, 'Bruce Wayne', '2024-01-10'),
      (3, 'Clark Kent', '2024-01-15'),
      (4, 'Diana Troy', '2024-02-01'),
      (5, 'Ethan Hunt', '2024-02-10');

      INSERT INTO orders VALUES
      (101, 1, '2024-01-12', 150.00),
      (102, 1, '2024-02-05', 200.00),
      (103, 1, '2024-03-01', 310.00),
      (104, 2, '2024-01-20', 800.00),
      (105, 3, '2024-02-10', 95.00),
      (106, 3, '2024-02-28', 120.00),
      (107, 4, '2024-02-05', 450.00),
      (108, 5, '2024-02-15', 60.00),
      (109, 5, '2024-02-18', 75.00),
      (110, 5, '2024-03-04', 110.00);
    `,
    starterSql: `-- Define a CTE for customer order metrics
-- Filter for customers with >= 2 orders
-- Join with customers table
-- Order by total_orders DESC, name ASC

WITH CustomerOrderStats AS (
  SELECT 
)
SELECT 
`,
    solutionSql: `
      WITH CustomerOrderStats AS (
        SELECT 
          customer_id,
          MIN(order_date) AS first_order_date,
          MAX(order_date) AS latest_order_date,
          COUNT(*) AS total_orders
        FROM orders
        GROUP BY customer_id
        HAVING COUNT(*) >= 2
      )
      SELECT 
        c.name,
        s.first_order_date,
        s.latest_order_date,
        s.total_orders
      FROM CustomerOrderStats s
      JOIN customers c ON s.customer_id = c.id
      ORDER BY s.total_orders DESC, c.name ASC;
    `,
    hints: [
      'In the CTE, compute `MIN(order_date)` and `MAX(order_date)` grouped by `customer_id`.',
      'Filter within the CTE using `HAVING COUNT(*) >= 2`.',
      'Join the CTE with the `customers` table to pull the `name`.',
    ],
    orderMatters: true,
  },

  // ==========================================
  // TIER 4: BOSS ROUND 👑 (THE ARCH-ARCHITECT)
  // ==========================================
  {
    id: 'boss-1',
    tier: 'boss',
    tierOrder: 1,
    title: 'Chronos, The Corrupted Ledger',
    subtitle: 'The Grandmaster Final Exam: Multi-Table Financial Reconciliation',
    difficulty: 'Boss',
    xp: 500,
    badge: 'Master Architect',
    bossName: 'Chronos, Arch-Demon of Unreconciled Balances',
    bossHp: 1000,
    bossAvatar: '👑',
    story:
      'Tremble, mortal query-writer! I am Chronos, ancient demon of race conditions and dirty reads. I have flooded your banking system with phantom pending transfers, voided payments, and fraudulent disputed charges! Deliver a flawless reconciled balance audit for all corporate accounts, or your entire database will be purged into the void!',
    description:
      'Audit all corporate accounts across 3 tables (`accounts`, `transactions`, and `disputes`).\n\n' +
      '### Accounting Rules:\n' +
      '1. **Valid Transactions Only**: Only consider transactions where `status = \'settled\'`.\n' +
      '2. **Dispute Reversals**: If a transaction appears in the `disputes` table with `dispute_outcome = \'refunded\'`, it has been reversed by customer service. You must **completely exclude** it from credits and debits!\n' +
      '3. **Calculations per Account**:\n' +
      '   - `account_holder`: Account name\n' +
      '   - `account_type`: Type of account\n' +
      '   - `opening_balance`: Initial starting balance\n' +
      '   - `total_credits`: Sum of valid settled credit deposits (default 0 if none)\n' +
      '   - `total_debits`: Sum of valid settled debit withdrawals (default 0 if none)\n' +
      '   - `final_balance`: `ROUND(opening_balance + total_credits - total_debits, 2)`\n' +
      '   - `financial_health`:\n' +
      '     - `\'Surplus\'` if `final_balance > opening_balance`\n' +
      '     - `\'Deficit\'` if `final_balance < opening_balance`\n' +
      '     - `\'Neutral\'` if `final_balance = opening_balance`\n\n' +
      'Order by `final_balance DESC`, then `account_holder ASC`.',
    requirements: [
      'Preserve all accounts even if they have 0 valid transactions (LEFT JOIN)',
      "Exclude all transactions with `status != 'settled'`",
      "Exclude any transaction whose ID is in `disputes` with `dispute_outcome = 'refunded'`",
      'Compute `total_credits` and `total_debits` with COALESCE',
      'Compute `final_balance` as `ROUND(opening_balance + total_credits - total_debits, 2)`',
      "Assign `financial_health` as 'Surplus', 'Deficit', or 'Neutral'",
      'Order by `final_balance DESC, account_holder ASC`',
    ],
    tables: [
      {
        name: 'accounts',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Account primary ID' },
          { name: 'account_holder', type: 'TEXT', desc: 'Entity name' },
          { name: 'account_type', type: 'TEXT', desc: 'Type of banking account' },
          { name: 'opening_balance', type: 'REAL', desc: 'Opening balance before period' },
        ],
        sampleRows: [
          { id: 1, account_holder: 'Astraea Capital', account_type: 'Corporate', opening_balance: 10000.00 },
          { id: 2, account_holder: 'Bifrost Logistics', account_type: 'Merchant', opening_balance: 4500.00 },
          { id: 3, account_holder: 'Caelum Tech', account_type: 'Startup', opening_balance: 2500.00 },
          { id: 4, account_holder: 'Daedalus Foundry', account_type: 'Manufacturer', opening_balance: 18000.00 },
        ],
      },
      {
        name: 'transactions',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Transaction reference ID' },
          { name: 'account_id', type: 'INTEGER', desc: 'Target account' },
          { name: 'txn_type', type: 'TEXT', desc: "'credit' (inflow) or 'debit' (outflow)" },
          { name: 'amount', type: 'REAL', desc: 'Monetary sum' },
          { name: 'status', type: 'TEXT', desc: "'settled', 'pending', or 'voided'" },
          { name: 'txn_date', type: 'TEXT', desc: 'Date executed' },
        ],
        sampleRows: [
          { id: 101, account_id: 1, txn_type: 'credit', amount: 5000.00, status: 'settled', txn_date: '2024-05-01' },
          { id: 102, account_id: 1, txn_type: 'debit', amount: 2000.00, status: 'settled', txn_date: '2024-05-02' },
          { id: 103, account_id: 1, txn_type: 'credit', amount: 3000.00, status: 'pending', txn_date: '2024-05-03' },
          { id: 104, account_id: 1, txn_type: 'debit', amount: 1500.00, status: 'settled', txn_date: '2024-05-04' },
        ],
      },
      {
        name: 'disputes',
        columns: [
          { name: 'id', type: 'INTEGER', desc: 'Dispute ticket ID' },
          { name: 'transaction_id', type: 'INTEGER', desc: 'Associated transaction' },
          { name: 'dispute_outcome', type: 'TEXT', desc: "'refunded' or 'rejected'" },
        ],
        sampleRows: [
          { id: 1, transaction_id: 104, dispute_outcome: 'refunded' },
          { id: 2, transaction_id: 303, dispute_outcome: 'rejected' },
        ],
      },
    ],
    setupSql: `
      CREATE TABLE accounts (
        id INTEGER PRIMARY KEY,
        account_holder TEXT NOT NULL,
        account_type TEXT NOT NULL,
        opening_balance REAL NOT NULL
      );
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY,
        account_id INTEGER NOT NULL,
        txn_type TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        txn_date TEXT NOT NULL,
        FOREIGN KEY(account_id) REFERENCES accounts(id)
      );
      CREATE TABLE disputes (
        id INTEGER PRIMARY KEY,
        transaction_id INTEGER NOT NULL,
        dispute_outcome TEXT NOT NULL,
        FOREIGN KEY(transaction_id) REFERENCES transactions(id)
      );

      INSERT INTO accounts VALUES
      (1, 'Astraea Capital', 'Corporate', 10000.00),
      (2, 'Bifrost Logistics', 'Merchant', 4500.00),
      (3, 'Caelum Tech', 'Startup', 2500.00),
      (4, 'Daedalus Foundry', 'Manufacturer', 18000.00);

      INSERT INTO transactions VALUES
      -- Astraea Capital (id: 1)
      (101, 1, 'credit', 5000.00, 'settled', '2024-05-01'),
      (102, 1, 'debit', 2000.00, 'settled', '2024-05-02'),
      (103, 1, 'credit', 3000.00, 'pending', '2024-05-03'),
      (104, 1, 'debit', 1500.00, 'settled', '2024-05-04'),

      -- Bifrost Logistics (id: 2)
      (201, 2, 'credit', 1200.00, 'settled', '2024-05-01'),
      (202, 2, 'debit', 3500.00, 'settled', '2024-05-03'),
      (203, 2, 'debit', 800.00, 'voided', '2024-05-04'),

      -- Caelum Tech (id: 3)
      (301, 3, 'credit', 4000.00, 'settled', '2024-05-02'),
      (302, 3, 'debit', 1200.00, 'settled', '2024-05-03'),
      (303, 3, 'debit', 600.00, 'settled', '2024-05-05'),

      -- Daedalus Foundry (id: 4)
      (401, 4, 'credit', 2500.00, 'settled', '2024-05-01'),
      (402, 4, 'debit', 7000.00, 'settled', '2024-05-02');

      INSERT INTO disputes VALUES
      (1, 104, 'refunded'),
      (2, 303, 'rejected');
    `,
    starterSql: `-- Defeat Chronos by reconciling the ledger!
-- 1. Create a CTE for ValidTransactions (status = 'settled', exclude refunded disputes)
-- 2. Aggregate total_credits, total_debits, final_balance, and financial_health
-- 3. Order by final_balance DESC, account_holder ASC

WITH ValidTransactions AS (
  SELECT 
)
SELECT 
`,
    solutionSql: `
      WITH ValidTransactions AS (
        SELECT 
          t.account_id,
          t.txn_type,
          t.amount
        FROM transactions t
        LEFT JOIN disputes d ON t.id = d.transaction_id AND d.dispute_outcome = 'refunded'
        WHERE t.status = 'settled' AND d.id IS NULL
      )
      SELECT 
        a.account_holder,
        a.account_type,
        a.opening_balance,
        COALESCE(SUM(CASE WHEN vt.txn_type = 'credit' THEN vt.amount ELSE 0 END), 0) AS total_credits,
        COALESCE(SUM(CASE WHEN vt.txn_type = 'debit' THEN vt.amount ELSE 0 END), 0) AS total_debits,
        ROUND(a.opening_balance + 
          COALESCE(SUM(CASE WHEN vt.txn_type = 'credit' THEN vt.amount ELSE 0 END), 0) - 
          COALESCE(SUM(CASE WHEN vt.txn_type = 'debit' THEN vt.amount ELSE 0 END), 0), 2) AS final_balance,
        CASE 
          WHEN (a.opening_balance + 
            COALESCE(SUM(CASE WHEN vt.txn_type = 'credit' THEN vt.amount ELSE 0 END), 0) - 
            COALESCE(SUM(CASE WHEN vt.txn_type = 'debit' THEN vt.amount ELSE 0 END), 0)) > a.opening_balance THEN 'Surplus'
          WHEN (a.opening_balance + 
            COALESCE(SUM(CASE WHEN vt.txn_type = 'credit' THEN vt.amount ELSE 0 END), 0) - 
            COALESCE(SUM(CASE WHEN vt.txn_type = 'debit' THEN vt.amount ELSE 0 END), 0)) < a.opening_balance THEN 'Deficit'
          ELSE 'Neutral'
        END AS financial_health
      FROM accounts a
      LEFT JOIN ValidTransactions vt ON a.id = vt.account_id
      GROUP BY a.id, a.account_holder, a.account_type, a.opening_balance
      ORDER BY final_balance DESC, a.account_holder ASC;
    `,
    hints: [
      'To exclude refunded transactions, LEFT JOIN `transactions` with `disputes` ON `t.id = d.transaction_id AND d.dispute_outcome = "refunded"`, and check `WHERE d.id IS NULL`.',
      'Remember to only include `t.status = "settled"`.',
      'LEFT JOIN accounts to your filtered transactions CTE so accounts without transactions still show up with their opening balance.',
    ],
    orderMatters: true,
  },
]
