export interface QueryTemplate {
  id: string
  title: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  datasetId: 'ecommerce' | 'saas' | 'hr_tech' | 'any'
  description: string
  sql: string
}

export const QUERY_TEMPLATES: QueryTemplate[] = [
  {
    id: 'top-rated-products',
    title: 'Top Rated In-Stock Products',
    level: 'Beginner',
    datasetId: 'ecommerce',
    description: 'Find products with rating >= 4.7 sorted by price descending',
    sql: `-- Top Rated In-Stock Products
SELECT 
    p.name AS product_name,
    c.name AS category_name,
    p.price,
    p.rating,
    p.stock_quantity
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = 1 AND p.rating >= 4.7
ORDER BY p.price DESC;`
  },
  {
    id: 'customer-revenue-summary',
    title: 'Customer Lifetime Spend & Orders',
    level: 'Intermediate',
    datasetId: 'ecommerce',
    description: 'Calculate total spend, order count, and average order value per customer',
    sql: `-- Customer Lifetime Spend & Order Metrics
SELECT 
    c.id AS customer_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.city,
    c.loyalty_tier,
    COUNT(o.id) AS total_orders,
    ROUND(SUM(o.total_amount), 2) AS total_spent,
    ROUND(AVG(o.total_amount), 2) AS avg_order_value
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.first_name, c.last_name, c.city, c.loyalty_tier
ORDER BY total_spent DESC;`
  },
  {
    id: 'category-breakdown',
    title: 'Sales & Inventory by Category',
    level: 'Intermediate',
    datasetId: 'ecommerce',
    description: 'Aggregate revenue and inventory counts by department and category',
    sql: `-- Department & Category Sales Performance
SELECT 
    c.department,
    c.name AS category,
    COUNT(DISTINCT p.id) AS total_products,
    SUM(p.stock_quantity) AS total_inventory_units,
    ROUND(AVG(p.price), 2) AS avg_product_price,
    ROUND(COALESCE(SUM(oi.quantity * oi.unit_price), 0), 2) AS gross_sales_revenue
FROM categories c
JOIN products p ON c.id = p.category_id
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY c.id, c.department, c.name
ORDER BY gross_sales_revenue DESC;`
  },
  {
    id: 'top-products-per-category-window',
    title: 'Top 2 Products per Category (ROW_NUMBER)',
    level: 'Advanced',
    datasetId: 'ecommerce',
    description: 'Use ROW_NUMBER() window function to find top products by rating within each category',
    sql: `-- Top 2 Products per Category using Window Functions
WITH RankedProducts AS (
    SELECT 
        p.id,
        p.name AS product_name,
        c.name AS category_name,
        p.price,
        p.rating,
        ROW_NUMBER() OVER (
            PARTITION BY p.category_id 
            ORDER BY p.rating DESC, p.price DESC
        ) AS rank_in_category
    FROM products p
    JOIN categories c ON p.category_id = c.id
)
SELECT 
    rank_in_category,
    category_name,
    product_name,
    price,
    rating
FROM RankedProducts
WHERE rank_in_category <= 2
ORDER BY category_name, rank_in_category;`
  },
  {
    id: 'running-order-revenue',
    title: 'Running Total & Cumulative Revenue',
    level: 'Advanced',
    datasetId: 'ecommerce',
    description: 'Calculate cumulative revenue timeline using SUM() OVER (ORDER BY date)',
    sql: `-- Daily Revenue & Cumulative Running Total
SELECT 
    o.order_date,
    o.id AS order_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    o.total_amount AS order_amount,
    ROUND(SUM(o.total_amount) OVER (ORDER BY o.order_date, o.id), 2) AS running_cumulative_revenue,
    ROUND(AVG(o.total_amount) OVER (
        ORDER BY o.order_date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS moving_avg_3_orders
FROM orders o
JOIN customers c ON o.customer_id = c.id
ORDER BY o.order_date, o.id;`
  },
  {
    id: 'saas-mrr-breakdown',
    title: 'SaaS MRR by Plan & Organization',
    level: 'Intermediate',
    datasetId: 'saas',
    description: 'Analyze subscription revenue and seat allocation per plan tier',
    sql: `-- SaaS Subscription & MRR Analysis
SELECT 
    p.name AS plan_name,
    p.price_usd,
    COUNT(o.id) AS total_organizations,
    SUM(CASE WHEN o.status = 'active' THEN 1 ELSE 0 END) AS active_orgs,
    SUM(CASE WHEN o.status = 'past_due' THEN 1 ELSE 0 END) AS past_due_orgs,
    ROUND(SUM(o.mrr_usd), 2) AS total_plan_mrr,
    ROUND(AVG(o.mrr_usd), 2) AS avg_mrr_per_client
FROM plans p
LEFT JOIN organizations o ON p.id = o.plan_id
GROUP BY p.id, p.name, p.price_usd
ORDER BY total_plan_mrr DESC;`
  },
  {
    id: 'hr-salary-benchmarks',
    title: 'Salary Benchmarking vs Dept Average',
    level: 'Advanced',
    datasetId: 'hr_tech',
    description: 'Compare employee salary with department average using AVG() OVER (PARTITION BY)',
    sql: `-- Employee Salary vs Department Average Benchmark
SELECT 
    e.id,
    e.first_name || ' ' || e.last_name AS employee_name,
    d.name AS department,
    e.job_title,
    e.salary,
    ROUND(AVG(e.salary) OVER (PARTITION BY e.department_id), 2) AS dept_avg_salary,
    ROUND(e.salary - AVG(e.salary) OVER (PARTITION BY e.department_id), 2) AS diff_from_dept_avg,
    DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) AS salary_rank_in_dept
FROM employees e
JOIN departments d ON e.department_id = d.id
ORDER BY d.name, e.salary DESC;`
  },
  {
    id: 'hr-recursive-hierarchy',
    title: 'Management Hierarchy (Recursive CTE)',
    level: 'Advanced',
    datasetId: 'hr_tech',
    description: 'Traverse management reporting hierarchy from VP down to individual contributors',
    sql: `-- Org Hierarchy Traversal with Recursive Common Table Expression
WITH RECURSIVE OrgHierarchy AS (
    -- Anchor member: Leadership (managers with no manager)
    SELECT 
        id,
        first_name || ' ' || last_name AS employee_name,
        job_title,
        manager_id,
        0 AS depth_level,
        first_name || ' ' || last_name AS hierarchy_path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive member: Direct reports
    SELECT 
        e.id,
        e.first_name || ' ' || e.last_name,
        e.job_title,
        e.manager_id,
        oh.depth_level + 1,
        oh.hierarchy_path || ' -> ' || (e.first_name || ' ' || e.last_name)
    FROM employees e
    INNER JOIN OrgHierarchy oh ON e.manager_id = oh.id
)
SELECT 
    depth_level,
    employee_name,
    job_title,
    hierarchy_path
FROM OrgHierarchy
ORDER BY depth_level, employee_name;`
  }
]
