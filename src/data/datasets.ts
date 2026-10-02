import type { Dataset } from '../types/sql'

export const DATASETS: Dataset[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Customers, products, orders, order items, categories, and reviews',
    badge: 'Popular',
    sql: `
-- =============================================
-- E-COMMERCE SAMPLE DATABASE
-- =============================================

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    city TEXT,
    country TEXT DEFAULT 'USA',
    loyalty_tier TEXT CHECK(loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER REFERENCES categories(id),
    name TEXT NOT NULL,
    price REAL NOT NULL CHECK(price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    rating REAL DEFAULT 5.0,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES customers(id),
    order_date DATE NOT NULL,
    status TEXT CHECK(status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
    total_amount REAL NOT NULL,
    shipping_fee REAL DEFAULT 0.00,
    payment_method TEXT
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL,
    discount REAL DEFAULT 0.00
);

CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id),
    customer_id INTEGER REFERENCES customers(id),
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    review_date DATE
);

-- Seed Categories
INSERT INTO categories (id, name, department) VALUES
(1, 'Laptops & Computers', 'Electronics'),
(2, 'Smartphones & Tablets', 'Electronics'),
(3, 'Audio & Headphones', 'Electronics'),
(4, 'Footwear & Sneakers', 'Fashion'),
(5, 'Apparel & Outerwear', 'Fashion'),
(6, 'Smart Home & IoT', 'Home & Living');

-- Seed Customers
INSERT INTO customers (id, first_name, last_name, email, city, country, loyalty_tier, created_at) VALUES
(1, 'Alice', 'Chen', 'alice.chen@example.com', 'San Francisco', 'USA', 'Platinum', '2023-01-15 10:20:00'),
(2, 'Marcus', 'Vance', 'marcus.v@example.com', 'Seattle', 'USA', 'Gold', '2023-02-10 14:32:00'),
(3, 'Sophia', 'Rodriguez', 'sophia.r@example.com', 'Austin', 'USA', 'Gold', '2023-03-01 09:15:00'),
(4, 'Liam', 'O''Connor', 'liam.oc@example.com', 'Dublin', 'Ireland', 'Silver', '2023-03-12 11:45:00'),
(5, 'Emma', 'Watson', 'emma.w@example.com', 'London', 'UK', 'Platinum', '2023-04-05 16:20:00'),
(6, 'Kenji', 'Sato', 'kenji.sato@example.com', 'Tokyo', 'Japan', 'Gold', '2023-05-18 08:00:00'),
(7, 'Elena', 'Rostova', 'elena.r@example.com', 'Berlin', 'Germany', 'Bronze', '2023-06-22 13:10:00'),
(8, 'David', 'Kim', 'david.kim@example.com', 'Toronto', 'Canada', 'Silver', '2023-07-04 18:30:00'),
(9, 'Amira', 'Hassan', 'amira.h@example.com', 'Dubai', 'UAE', 'Platinum', '2023-08-11 12:00:00'),
(10, 'Lucas', 'Silva', 'lucas.silva@example.com', 'Sao Paulo', 'Brazil', 'Bronze', '2023-09-03 15:40:00'),
(11, 'Chloe', 'Dupont', 'chloe.d@example.com', 'Paris', 'France', 'Silver', '2023-09-20 17:15:00'),
(12, 'Noah', 'Miller', 'noah.m@example.com', 'Chicago', 'USA', 'Gold', '2023-10-15 10:50:00');

-- Seed Products
INSERT INTO products (id, category_id, name, price, stock_quantity, rating, is_active) VALUES
(1, 1, 'MacBook Pro 16" M3 Max', 3499.00, 18, 4.9, 1),
(2, 1, 'Dell XPS 15 OLED', 1999.50, 25, 4.6, 1),
(3, 1, 'ThinkPad X1 Carbon Gen 11', 1749.00, 32, 4.7, 1),
(4, 2, 'iPhone 15 Pro Max 256GB', 1199.00, 45, 4.8, 1),
(5, 2, 'Samsung Galaxy S24 Ultra', 1299.99, 38, 4.7, 1),
(6, 2, 'Google Pixel 8 Pro', 999.00, 22, 4.5, 1),
(7, 3, 'Sony WH-1000XM5 Noise-Canceling', 398.00, 50, 4.8, 1),
(8, 3, 'Bose QuietComfort Ultra', 429.00, 40, 4.7, 1),
(9, 3, 'Apple AirPods Pro (2nd Gen)', 249.00, 85, 4.8, 1),
(10, 4, 'Nike Air Zoom Pegasus 40', 130.00, 60, 4.6, 1),
(11, 4, 'Adidas Ultraboost Light', 190.00, 42, 4.5, 1),
(12, 4, 'On Cloudmonster Running Shoes', 170.00, 35, 4.7, 1),
(13, 5, 'Arc''teryx Beta AR Waterproof Jacket', 600.00, 14, 4.9, 1),
(14, 5, 'Patagonia Nano Puff Jacket', 239.00, 28, 4.8, 1),
(15, 6, 'Philips Hue Smart Bridge & Bulb Starter', 159.99, 55, 4.6, 1),
(16, 6, 'Sonos Era 300 Spatial Audio Speaker', 449.00, 20, 4.8, 1);

-- Seed Orders
INSERT INTO orders (id, customer_id, order_date, status, total_amount, shipping_fee, payment_method) VALUES
(101, 1, '2024-01-10', 'Delivered', 3748.00, 0.00, 'Credit Card'),
(102, 2, '2024-01-14', 'Delivered', 1299.99, 15.00, 'PayPal'),
(103, 3, '2024-01-22', 'Delivered', 647.00, 0.00, 'Apple Pay'),
(104, 5, '2024-02-05', 'Delivered', 3499.00, 0.00, 'Credit Card'),
(105, 4, '2024-02-12', 'Delivered', 398.00, 12.00, 'Credit Card'),
(106, 6, '2024-02-18', 'Delivered', 1429.00, 25.00, 'Credit Card'),
(107, 1, '2024-02-25', 'Delivered', 429.00, 0.00, 'Apple Pay'),
(108, 7, '2024-03-01', 'Delivered', 190.00, 10.00, 'Bank Transfer'),
(109, 8, '2024-03-10', 'Delivered', 2149.00, 0.00, 'PayPal'),
(110, 9, '2024-03-15', 'Delivered', 4099.00, 0.00, 'Credit Card'),
(111, 2, '2024-03-20', 'Shipped', 478.00, 15.00, 'PayPal'),
(112, 10, '2024-03-22', 'Processing', 170.00, 15.00, 'Credit Card'),
(113, 11, '2024-03-24', 'Shipped', 839.00, 0.00, 'Apple Pay'),
(114, 12, '2024-03-26', 'Processing', 1999.50, 0.00, 'Credit Card'),
(115, 3, '2024-03-28', 'Pending', 999.00, 0.00, 'Apple Pay'),
(116, 5, '2024-03-29', 'Cancelled', 130.00, 10.00, 'Credit Card');

-- Seed Order Items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, discount) VALUES
(1, 101, 1, 1, 3499.00, 0.00),
(2, 101, 9, 1, 249.00, 0.00),
(3, 102, 5, 1, 1299.99, 0.00),
(4, 103, 7, 1, 398.00, 0.00),
(5, 103, 9, 1, 249.00, 0.00),
(6, 104, 1, 1, 3499.00, 0.00),
(7, 105, 7, 1, 398.00, 0.00),
(8, 106, 4, 1, 1199.00, 0.00),
(9, 106, 14, 1, 230.00, 9.00),
(10, 107, 8, 1, 429.00, 0.00),
(11, 108, 11, 1, 190.00, 0.00),
(12, 109, 3, 1, 1749.00, 0.00),
(13, 109, 7, 1, 400.00, 0.00),
(14, 110, 1, 1, 3499.00, 0.00),
(15, 110, 13, 1, 600.00, 0.00),
(16, 111, 9, 1, 249.00, 0.00),
(17, 111, 14, 1, 229.00, 10.00),
(18, 112, 12, 1, 170.00, 0.00),
(19, 113, 13, 1, 600.00, 0.00),
(20, 113, 14, 1, 239.00, 0.00),
(21, 114, 2, 1, 1999.50, 0.00),
(22, 115, 6, 1, 999.00, 0.00),
(23, 116, 10, 1, 130.00, 0.00);

-- Seed Reviews
INSERT INTO reviews (id, product_id, customer_id, rating, comment, review_date) VALUES
(1, 1, 1, 5, 'Unbelievable performance and battery life. Best machine ever.', '2024-01-20'),
(2, 5, 2, 5, 'The screen and camera zoom are mind-blowing.', '2024-01-28'),
(3, 7, 3, 4, 'Noise cancelling is the best in class, but earcups feel a bit snug.', '2024-02-01'),
(4, 9, 1, 5, 'Seamless ecosystem integration with Mac and iPhone.', '2024-02-05'),
(5, 1, 5, 5, 'Handles 8K video timelines without spinning fans.', '2024-02-15'),
(6, 13, 9, 5, 'Totally bombproof in alpine rain and wind.', '2024-03-20'),
(7, 11, 7, 4, 'Great comfort for daily 5k runs.', '2024-03-12');
`
  },
  {
    id: 'saas',
    name: 'SaaS & Subscriptions',
    description: 'B2B subscription tiers, organizations, invoices, MRR, and audit logs',
    badge: 'Business',
    sql: `
-- =============================================
-- SAAS METRICS & BILLING DATABASE
-- =============================================

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS plans;

CREATE TABLE plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_usd REAL NOT NULL,
    billing_interval TEXT DEFAULT 'monthly',
    max_seats INTEGER NOT NULL,
    features_json TEXT
);

CREATE TABLE organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan_id TEXT REFERENCES plans(id),
    status TEXT CHECK(status IN ('active', 'trialing', 'past_due', 'canceled')),
    mrr_usd REAL NOT NULL DEFAULT 0.00,
    created_at DATE NOT NULL
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('owner', 'admin', 'member', 'billing')),
    is_active INTEGER DEFAULT 1,
    last_login_at DATETIME
);

CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    org_id INTEGER REFERENCES organizations(id),
    amount_usd REAL NOT NULL,
    status TEXT CHECK(status IN ('paid', 'open', 'void', 'uncollectible')),
    invoice_date DATE NOT NULL,
    paid_at DATETIME
);

CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id INTEGER REFERENCES organizations(id),
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Plans
INSERT INTO plans (id, name, price_usd, billing_interval, max_seats, features_json) VALUES
('free', 'Hobby Free', 0.00, 'monthly', 3, '{"sso": false, "api_access": false, "retention_days": 7}'),
('team', 'Team Growth', 49.00, 'monthly', 15, '{"sso": false, "api_access": true, "retention_days": 30}'),
('business', 'Business Pro', 199.00, 'monthly', 50, '{"sso": true, "api_access": true, "retention_days": 90}'),
('enterprise', 'Enterprise Custom', 899.00, 'monthly', 500, '{"sso": true, "api_access": true, "retention_days": 365, "dedicated_support": true}');

-- Seed Organizations
INSERT INTO organizations (id, name, slug, plan_id, status, mrr_usd, created_at) VALUES
(1, 'Acme AI Systems', 'acme-ai', 'enterprise', 'active', 899.00, '2023-01-10'),
(2, 'Nexus Financial', 'nexus-fin', 'enterprise', 'active', 899.00, '2023-02-14'),
(3, 'Vortex Cloud Labs', 'vortex-labs', 'business', 'active', 199.00, '2023-03-20'),
(4, 'Starlight Media', 'starlight', 'team', 'active', 49.00, '2023-05-12'),
(5, 'Apex Logistics', 'apex-logistics', 'business', 'active', 199.00, '2023-06-01'),
(6, 'Pulse HealthTech', 'pulse-health', 'enterprise', 'active', 899.00, '2023-07-15'),
(7, 'Hyperion Games', 'hyperion-games', 'team', 'trialing', 0.00, '2024-02-01'),
(8, 'Zenith Robotics', 'zenith-robotics', 'business', 'past_due', 199.00, '2023-08-19'),
(9, 'Breeze Studios', 'breeze-studios', 'free', 'active', 0.00, '2023-09-05'),
(10, 'Quantum Dynamics', 'quantum-dyn', 'enterprise', 'active', 899.00, '2023-11-22'),
(11, 'Solaris Solar', 'solaris', 'team', 'canceled', 0.00, '2023-04-10');

-- Seed Users
INSERT INTO users (id, org_id, email, full_name, role, is_active, last_login_at) VALUES
(1, 1, 'sarah.connor@acme.ai', 'Sarah Connor', 'owner', 1, '2024-03-29 11:20:00'),
(2, 1, 'john.smith@acme.ai', 'John Smith', 'admin', 1, '2024-03-28 14:15:00'),
(3, 1, 'tim.drake@acme.ai', 'Tim Drake', 'member', 1, '2024-03-25 09:00:00'),
(4, 2, 'bruce.wayne@nexusfin.com', 'Bruce Wayne', 'owner', 1, '2024-03-29 08:30:00'),
(5, 2, 'lucius.fox@nexusfin.com', 'Lucius Fox', 'billing', 1, '2024-03-27 16:45:00'),
(6, 3, 'clark.kent@vortex.dev', 'Clark Kent', 'owner', 1, '2024-03-29 10:10:00'),
(7, 3, 'lois.lane@vortex.dev', 'Lois Lane', 'admin', 1, '2024-03-28 17:30:00'),
(8, 4, 'barry.allen@starlight.co', 'Barry Allen', 'owner', 1, '2024-03-26 12:00:00'),
(9, 5, 'diana.prince@apexlog.com', 'Diana Prince', 'owner', 1, '2024-03-29 07:15:00'),
(10, 6, 'victor.stone@pulseht.com', 'Victor Stone', 'owner', 1, '2024-03-28 19:20:00'),
(11, 8, 'arthur.curry@zenith.ai', 'Arthur Curry', 'owner', 1, '2024-03-10 13:40:00');

-- Seed Invoices
INSERT INTO invoices (id, org_id, amount_usd, status, invoice_date, paid_at) VALUES
('INV-2024-001', 1, 899.00, 'paid', '2024-01-01', '2024-01-01 10:00:00'),
('INV-2024-002', 2, 899.00, 'paid', '2024-01-01', '2024-01-02 11:20:00'),
('INV-2024-003', 3, 199.00, 'paid', '2024-01-01', '2024-01-01 15:00:00'),
('INV-2024-004', 5, 199.00, 'paid', '2024-01-01', '2024-01-03 09:10:00'),
('INV-2024-005', 6, 899.00, 'paid', '2024-01-01', '2024-01-01 12:00:00'),
('INV-2024-006', 1, 899.00, 'paid', '2024-02-01', '2024-02-01 10:15:00'),
('INV-2024-007', 2, 899.00, 'paid', '2024-02-01', '2024-02-02 08:45:00'),
('INV-2024-008', 3, 199.00, 'paid', '2024-02-01', '2024-02-01 14:00:00'),
('INV-2024-009', 8, 199.00, 'open', '2024-02-01', NULL),
('INV-2024-010', 1, 899.00, 'paid', '2024-03-01', '2024-03-01 10:00:00'),
('INV-2024-011', 2, 899.00, 'paid', '2024-03-01', '2024-03-01 11:00:00'),
('INV-2024-012', 6, 899.00, 'paid', '2024-03-01', '2024-03-01 13:00:00'),
('INV-2024-013', 10, 899.00, 'paid', '2024-03-01', '2024-03-02 09:30:00'),
('INV-2024-014', 8, 199.00, 'uncollectible', '2024-03-01', NULL);

-- Seed Audit Logs
INSERT INTO audit_logs (id, org_id, user_id, action, ip_address, created_at) VALUES
(1, 1, 1, 'user.invite_member', '192.168.1.10', '2024-03-25 09:00:00'),
(2, 1, 2, 'api_key.created', '192.168.1.15', '2024-03-26 14:22:00'),
(3, 2, 5, 'billing.updated_payment_method', '10.0.0.4', '2024-03-27 16:45:00'),
(4, 3, 6, 'org.updated_settings', '172.16.0.2', '2024-03-28 10:10:00'),
(5, 6, 10, 'security.sso_configured', '198.51.100.25', '2024-03-28 19:20:00');
`
  },
  {
    id: 'hr_tech',
    name: 'Tech Company HR & Compensation',
    description: 'Departments, employees, manager hierarchies, salary distributions, and projects',
    badge: 'Analytics',
    sql: `
-- =============================================
-- HR & SALARY ANALYTICS DATABASE
-- =============================================

DROP TABLE IF EXISTS project_assignments;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    budget REAL NOT NULL,
    location TEXT NOT NULL
);

CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_id INTEGER REFERENCES departments(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    job_title TEXT NOT NULL,
    hire_date DATE NOT NULL,
    salary REAL NOT NULL CHECK(salary > 0),
    manager_id INTEGER REFERENCES employees(id),
    performance_score REAL CHECK(performance_score BETWEEN 1.0 AND 5.0)
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    budget REAL NOT NULL,
    status TEXT CHECK(status IN ('Planning', 'Active', 'Completed', 'On Hold')),
    start_date DATE NOT NULL,
    end_date DATE
);

CREATE TABLE project_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    employee_id INTEGER REFERENCES employees(id),
    role TEXT NOT NULL,
    allocated_hours_week INTEGER DEFAULT 20
);

-- Seed Departments
INSERT INTO departments (id, name, budget, location) VALUES
(1, 'Engineering', 2500000.00, 'San Francisco, CA'),
(2, 'Product Design', 850000.00, 'New York, NY'),
(3, 'Data Science & AI', 1800000.00, 'Seattle, WA'),
(4, 'Marketing & Growth', 1200000.00, 'Austin, TX'),
(5, 'Human Resources', 450000.00, 'Chicago, IL');

-- Seed Employees (Hierarchical)
INSERT INTO employees (id, department_id, first_name, last_name, email, job_title, hire_date, salary, manager_id, performance_score) VALUES
(1, 1, 'Jonathan', 'Ives', 'j.ives@company.io', 'VP of Engineering', '2020-01-15', 260000.00, NULL, 4.9),
(2, 1, 'Seraphina', 'Valdez', 's.valdez@company.io', 'Principal Architect', '2020-03-01', 215000.00, 1, 4.8),
(3, 1, 'Alexander', 'Wright', 'a.wright@company.io', 'Senior Backend Engineer', '2021-04-12', 165000.00, 2, 4.6),
(4, 1, 'Maya', 'Patel', 'm.patel@company.io', 'Staff Frontend Engineer', '2021-06-20', 170000.00, 2, 4.7),
(5, 1, 'Leo', 'Nakamura', 'l.nakamura@company.io', 'DevOps Specialist', '2022-02-10', 145000.00, 2, 4.5),
(6, 1, 'Zoe', 'Kovacs', 'z.kovacs@company.io', 'Junior Software Engineer', '2023-08-01', 98000.00, 3, 4.2),

(7, 3, 'Dr. Aris', 'Thorne', 'a.thorne@company.io', 'Director of AI Research', '2020-06-01', 240000.00, NULL, 4.9),
(8, 3, 'Cassandra', 'Blake', 'c.blake@company.io', 'Lead ML Engineer', '2021-01-10', 195000.00, 7, 4.8),
(9, 3, 'Tariq', 'Mansoor', 't.mansoor@company.io', 'Data Scientist', '2022-05-18', 140000.00, 8, 4.4),
(10, 3, 'Hannah', 'Abbott', 'h.abbott@company.io', 'Data Analyst', '2023-03-15', 105000.00, 8, 4.3),

(11, 2, 'Elena', 'Moreau', 'e.moreau@company.io', 'Head of Design', '2020-09-01', 190000.00, NULL, 4.8),
(12, 2, 'Caleb', 'Rivers', 'c.rivers@company.io', 'Senior Product Designer', '2021-11-05', 142000.00, 11, 4.6),
(13, 2, 'Mia', 'Lindqvist', 'm.lindqvist@company.io', 'UI/UX Designer', '2022-09-20', 115000.00, 11, 4.5),

(14, 4, 'Gabriel', 'Santos', 'g.santos@company.io', 'Chief Marketing Officer', '2021-02-01', 210000.00, NULL, 4.7),
(15, 4, 'Rachel', 'Green', 'r.green@company.io', 'Growth Product Manager', '2022-04-10', 135000.00, 14, 4.4),
(16, 4, 'Dmitri', 'Volkov', 'd.volkov@company.io', 'Performance Marketing Lead', '2022-07-22', 125000.00, 14, 4.3),

(17, 5, 'Grace', 'Hopper', 'g.hopper@company.io', 'Director of People Ops', '2020-04-15', 175000.00, NULL, 4.9),
(18, 5, 'Samira', 'Khan', 's.khan@company.io', 'Technical Recruiter', '2021-08-30', 95000.00, 17, 4.5);

-- Seed Projects
INSERT INTO projects (id, name, department_id, budget, status, start_date, end_date) VALUES
(1, 'Project Quantum (Distributed Engine)', 1, 750000.00, 'Active', '2023-01-10', '2024-06-30'),
(2, 'Neural Semantic Search Engine', 3, 600000.00, 'Active', '2023-04-01', '2024-05-15'),
(3, 'Design System v3.0 (Raycast UI)', 2, 220000.00, 'Completed', '2023-02-15', '2023-11-30'),
(4, 'Global Brand Refresh & Web Launch', 4, 350000.00, 'Active', '2023-09-01', '2024-04-30'),
(5, 'Autonomous Agent Workflow Pipeline', 3, 450000.00, 'Planning', '2024-04-01', '2024-12-31');

-- Seed Project Assignments
INSERT INTO project_assignments (id, project_id, employee_id, role, allocated_hours_week) VALUES
(1, 1, 2, 'Tech Lead Architect', 30),
(2, 1, 3, 'Core Engine Developer', 35),
(3, 1, 5, 'Infrastructure Automation', 20),
(4, 2, 8, 'Principal ML Scientist', 35),
(5, 2, 9, 'Data Pipeline Specialist', 30),
(6, 3, 12, 'Lead System Designer', 40),
(7, 3, 4, 'Frontend Integration Lead', 25),
(8, 4, 15, 'Campaign Lead', 35),
(9, 4, 16, 'Ad Ops Analyst', 30),
(10, 5, 8, 'Research Advisor', 15),
(11, 5, 9, 'Model Engineer', 25);
`
  },
  {
    id: 'empty',
    name: 'Clean Empty Canvas',
    description: 'Create your own tables, import custom data, or write DDL scripts from scratch',
    badge: 'Blank',
    sql: `
-- Clean SQLite Database
-- You can write CREATE TABLE statements or import a CSV file directly!

CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notes (title, content) VALUES
('Welcome to SQL Playground!', 'Write your own SQL queries here or test custom tables.'),
('Tip', 'Press Ctrl+Enter or Cmd+Enter to execute queries.');
`
  }
]
