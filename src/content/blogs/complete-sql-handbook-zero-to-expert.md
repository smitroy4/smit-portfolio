## From Absolute Zero to SQL Expert — For Developers, Analysts & AI/ML Engineers

> *SQL is 50 years old. It will outlive every framework you learn this year. Every backend developer, every data analyst, every ML engineer pulling training data — all of them eventually sit down in front of a database and need to ask it a question. This handbook teaches you to ask better questions than anyone else in the room.*

This is a reference handbook, not a single sitting read. Bookmark it. Come back to it. Every concept builds on the one before it — work through it in order the first time, then use the table of contents to jump back in later.

---

<!-- ### Table of Contents

**Foundations**

1. [What Is a Database, Really?](#ch1)
2. [Tables, Rows, and Columns — The Building Blocks](#ch2)
3. [Your First Query: SELECT](#ch3)
4. [Filtering Data: WHERE](#ch4)
5. [Sorting Data: ORDER BY](#ch5)

**Core Querying**

6. [Data Types in SQL](#ch6)
7. [NULL — The Most Misunderstood Concept in SQL](#ch7)
8. [Aggregate Functions & GROUP BY](#ch8)
9. [Filtering Groups: HAVING](#ch9)

**Relationships**

10. [Keys: Primary Keys & Foreign Keys](#ch10)
11. [JOINs — Combining Tables](#ch11)
12. [Set Operations: UNION, INTERSECT, EXCEPT](#ch12)

**Intermediate Mastery**

13. [Subqueries](#ch13)
14. [Common Table Expressions (CTEs)](#ch14)
15. [Window Functions — The Analyst's Superpower](#ch15)
16. [String, Date & Math Functions](#ch16)
17. [CASE Expressions — Conditional Logic in SQL](#ch17)

**Modifying Data**

18. [INSERT, UPDATE, DELETE](#ch18)
19. [Transactions & ACID](#ch19)

**Database Design**

20. [Database Design & Normalization](#ch20)
21. [Indexes — Why Queries Are Fast (or Slow)](#ch21)
22. [Constraints — Protecting Data Integrity](#ch22)

**Advanced Objects**

23. [Views](#ch23)
24. [Stored Procedures & Functions](#ch24)
25. [Triggers](#ch25)

**Performance & Internals**

26. [How a Query Actually Executes](#ch26)
27. [Query Optimization & EXPLAIN](#ch27)

**Specialized Tracks**

28. [SQL for Data Analysts](#ch28)
29. [SQL for AI/ML Engineers](#ch29)
30. [Common Mistakes & How to Avoid Them](#ch30)

**Choosing Your Database**

31. [MySQL vs PostgreSQL vs NoSQL — Choosing the Right Database](#ch31)
32. [PostgreSQL for Spring Boot Developers — The Complete Guide](#ch32)

**Reference**

33. [The Complete Cheat Sheet](#ch33) -->

---

---

<a id="ch1"></a>
## Chapter 1 — What Is a Database, Really?

A **database** is an organized collection of data, stored so it can be efficiently accessed, managed, and updated. A **DBMS** (Database Management System) is the software that lets you interact with that data — MySQL, PostgreSQL, SQL Server, Oracle, and SQLite are all DBMS software.

**SQL** (Structured Query Language) is the language you use to talk to a relational DBMS. It's not a programming language like Java or Python — it's a **declarative** language. You don't tell SQL *how* to get data step-by-step; you tell it *what* you want, and the database figures out how.

```sql
-- You say WHAT you want:
SELECT name FROM users WHERE age > 18;

-- You do NOT say HOW to get it (loop through rows, check age, collect matches...)
-- The database's internal "query optimizer" decides the most efficient HOW.
```

### Relational vs Non-Relational Databases

| | Relational (SQL) | Non-Relational (NoSQL) |
|---|---|---|
| Structure | Tables with fixed rows/columns | Documents, key-value, graphs, wide-column |
| Examples | PostgreSQL, MySQL, Oracle, SQL Server | MongoDB, Redis, Cassandra, DynamoDB |
| Schema | Strict, defined upfront | Flexible, can vary per record |
| Relationships | Native, via foreign keys + JOINs | Usually denormalized or app-managed |
| Best for | Structured data, complex relationships, transactions | High-velocity, unstructured/semi-structured data, horizontal scale |

This handbook is entirely about **relational databases** and SQL — the foundation that almost every data system, regardless of its NoSQL layer on top, still touches somewhere in its stack.

---

<a id="ch2"></a>
## Chapter 2 — Tables, Rows, and Columns

Everything in a relational database lives inside **tables**. Think of a table exactly like a spreadsheet:

| employee_id | first_name | last_name | department | salary |
|---|---|---|---|---|
| 1 | Smit | Roy | Engineering | 85000 |
| 2 | Ananya | Sen | Marketing | 72000 |
| 3 | Rohan | Das | Engineering | 91000 |

- A **row** (also called a *record* or *tuple*) is one entry — one employee.
- A **column** (also called a *field* or *attribute*) is one property — `salary`, `department`, etc.
- A **table** is a named collection of rows sharing the same columns.

### Creating a Table

```sql
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    first_name  VARCHAR(50) NOT NULL,
    last_name   VARCHAR(50) NOT NULL,
    department  VARCHAR(50),
    salary      DECIMAL(10, 2),
    hire_date   DATE
);
```

Read this line by line:
- `CREATE TABLE employees` — make a new table named `employees`
- `employee_id INT PRIMARY KEY` — a whole number column that uniquely identifies each row
- `VARCHAR(50)` — variable-length text, up to 50 characters
- `NOT NULL` — this column can never be left empty
- `DECIMAL(10, 2)` — a precise number with up to 10 total digits, 2 after the decimal point

---

<a id="ch3"></a>
## Chapter 3 — Your First Query: SELECT

`SELECT` is how you **read** data. It's the most-used SQL command by far.

```sql
-- Select everything (all columns, all rows)
SELECT * FROM employees;

-- Select specific columns
SELECT first_name, last_name FROM employees;

-- Rename a column in the output (alias)
SELECT first_name AS "First Name", salary AS monthly_salary FROM employees;

-- Remove duplicate rows from results
SELECT DISTINCT department FROM employees;

-- Limit how many rows come back
SELECT * FROM employees LIMIT 5;
```

> 💡 **Tip for beginners:** `SELECT *` is fine while exploring data, but avoid it in real application code — explicitly naming columns is faster, clearer, and won't silently break when someone adds a new column to the table later.

### The Logical Order SQL Actually Processes a Query

This trips up almost everyone at some point. You **write** SQL in this order:

```sql
SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT ...
```

But the database **executes** it in a completely different order:

```
1. FROM       → figure out which table(s) we're working with
2. WHERE      → filter individual rows
3. GROUP BY   → group remaining rows
4. HAVING     → filter the groups
5. SELECT     → pick which columns/expressions to return
6. ORDER BY   → sort the final result
7. LIMIT      → cut down to N rows
```

This is *why* you can't use a column alias from `SELECT` inside a `WHERE` clause — `WHERE` runs before `SELECT` even exists yet. Understanding this order alone will save you hours of confusion later.

---

<a id="ch4"></a>
## Chapter 4 — Filtering Data: WHERE

```sql
SELECT * FROM employees WHERE department = 'Engineering';

SELECT * FROM employees WHERE salary > 80000;

SELECT * FROM employees WHERE salary BETWEEN 70000 AND 90000;

SELECT * FROM employees WHERE department IN ('Engineering', 'Marketing');

SELECT * FROM employees WHERE first_name LIKE 'A%';   -- starts with 'A'
SELECT * FROM employees WHERE first_name LIKE '%a';   -- ends with 'a'
SELECT * FROM employees WHERE first_name LIKE '%an%'; -- contains 'an'

-- Combining conditions
SELECT * FROM employees
WHERE department = 'Engineering' AND salary > 80000;

SELECT * FROM employees
WHERE department = 'Engineering' OR department = 'Marketing';

SELECT * FROM employees WHERE NOT department = 'Sales';
```

| Operator | Meaning |
|---|---|
| `=` | Equal to |
| `!=` or `<>` | Not equal to |
| `>`, `<`, `>=`, `<=` | Comparison |
| `BETWEEN x AND y` | Inclusive range |
| `IN (a, b, c)` | Matches any value in a list |
| `LIKE` | Pattern matching (`%` = any characters, `_` = exactly one character) |
| `IS NULL` / `IS NOT NULL` | Checking for missing values (never use `= NULL`, see Chapter 7) |
| `AND` / `OR` / `NOT` | Combine multiple conditions |

---

<a id="ch5"></a>
## Chapter 5 — Sorting Data: ORDER BY

```sql
SELECT first_name, salary FROM employees ORDER BY salary;        -- ascending (default)
SELECT first_name, salary FROM employees ORDER BY salary DESC;   -- descending

-- Multi-level sort: department first, then salary highest-to-lowest within each
SELECT * FROM employees ORDER BY department ASC, salary DESC;

-- Sort by column position (works, but avoid — fragile if columns reorder)
SELECT first_name, salary FROM employees ORDER BY 2 DESC;
```

---

<a id="ch6"></a>
## Chapter 6 — Data Types in SQL

Choosing the right data type isn't a formality — it affects storage size, query speed, and what kind of mistakes the database will catch for you automatically.

| Category | Type | Use For |
|---|---|---|
| **Numbers** | `INT` / `INTEGER` | Whole numbers (IDs, counts) |
| | `BIGINT` | Very large whole numbers |
| | `DECIMAL(p, s)` / `NUMERIC(p, s)` | Exact precision — **always use for money** |
| | `FLOAT` / `DOUBLE` | Approximate decimals — never use for money (rounding errors) |
| **Text** | `VARCHAR(n)` | Variable-length text, up to n characters |
| | `CHAR(n)` | Fixed-length text, padded with spaces |
| | `TEXT` | Long-form, unbounded text |
| **Date/Time** | `DATE` | Just a date (2026-06-20) |
| | `TIME` | Just a time (14:30:00) |
| | `TIMESTAMP` / `DATETIME` | Date + time together |
| **Boolean** | `BOOLEAN` | True/false values |
| **Other** | `JSON` / `JSONB` | Semi-structured data inside a relational column (Postgres especially) |
| | `UUID` | Universally unique identifiers, common for distributed-system primary keys |

> ⚠️ **Golden Rule:** Never store money as `FLOAT`. Floating-point numbers can't represent decimals like `0.1` exactly in binary, and repeated arithmetic compounds tiny errors — fine for scientific data, dangerous for currency. Always use `DECIMAL`.

---

<a id="ch7"></a>
## Chapter 7 — NULL: The Most Misunderstood Concept in SQL

`NULL` means **"unknown" or "absence of a value"** — it is fundamentally *not* the same as zero, an empty string, or false. This single idea breaks more beginner queries than anything else in SQL.

```sql
-- This will NEVER return rows, even if a column genuinely has no value!
SELECT * FROM employees WHERE department = NULL;   -- ❌ WRONG

-- This is the correct way to check for NULL
SELECT * FROM employees WHERE department IS NULL;  -- ✅ CORRECT
SELECT * FROM employees WHERE department IS NOT NULL;
```

**Why?** In SQL's three-valued logic, any comparison involving `NULL` returns `NULL` (meaning "unknown"), not `TRUE` or `FALSE`. `NULL = NULL` evaluates to `NULL`, not `TRUE` — because SQL is essentially saying "I don't know if two unknown things are equal."

### NULL in Aggregates and Arithmetic

```sql
SELECT AVG(salary) FROM employees;        -- NULL values are IGNORED, not treated as 0
SELECT COUNT(*) FROM employees;            -- counts ALL rows, including NULLs
SELECT COUNT(department) FROM employees;   -- counts only NON-NULL department values

SELECT salary + NULL FROM employees;       -- always returns NULL — "unknown + 5 = unknown"

-- Replace NULL with a default value
SELECT COALESCE(department, 'Unassigned') FROM employees;
```

---

<a id="ch8"></a>
## Chapter 8 — Aggregate Functions & GROUP BY

Aggregate functions collapse many rows into a single summary value.

```sql
SELECT COUNT(*) FROM employees;                    -- total rows
SELECT AVG(salary) FROM employees;                  -- average
SELECT SUM(salary) FROM employees;                  -- total
SELECT MIN(salary), MAX(salary) FROM employees;     -- range
```

`GROUP BY` is where aggregates become genuinely powerful — it lets you compute a summary **per category**, instead of for the whole table.

```sql
-- Average salary, broken down by department
SELECT department, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;
```

| department | avg_salary |
|---|---|
| Engineering | 88000.00 |
| Marketing | 72000.00 |

> ⚠️ **Golden Rule:** every column in your `SELECT` list must either be inside an aggregate function (`AVG()`, `COUNT()`, etc.) or listed in `GROUP BY`. If you select a column that's neither grouped nor aggregated, the database doesn't know which row's value to show — most databases will throw an error (some, like older MySQL configs, will silently pick an arbitrary row — avoid relying on that).

---

<a id="ch9"></a>
## Chapter 9 — Filtering Groups: HAVING

`WHERE` filters individual rows **before** grouping. `HAVING` filters groups **after** aggregation. This is a direct consequence of the execution order from Chapter 3.

```sql
-- WRONG: WHERE cannot reference an aggregate — it runs before grouping exists
SELECT department, AVG(salary)
FROM employees
WHERE AVG(salary) > 80000   -- ❌ ERROR
GROUP BY department;

-- CORRECT: use HAVING to filter on aggregated values
SELECT department, AVG(salary) AS avg_salary
FROM employees
GROUP BY department
HAVING AVG(salary) > 80000;  -- ✅ only departments averaging over 80k
```

You can combine both — `WHERE` to cut down rows early (cheap, efficient), `HAVING` to filter the resulting groups:

```sql
SELECT department, AVG(salary) AS avg_salary
FROM employees
WHERE hire_date >= '2024-01-01'   -- filter rows first
GROUP BY department
HAVING AVG(salary) > 80000;        -- then filter groups
```

---

<a id="ch10"></a>
## Chapter 10 — Keys: Primary Keys & Foreign Keys

This is the concept that makes "relational" databases relational.

### Primary Key

A **primary key** uniquely identifies every row in a table. No two rows can share one, and it can never be `NULL`.

```sql
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(50)
);
```

### Foreign Key

A **foreign key** is a column in one table that points to the primary key of another table — this is how relationships between tables are actually built.

```sql
CREATE TABLE departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(50)
);

CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    name VARCHAR(50),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
```

This means: every value in `employees.department_id` must correspond to a real, existing `department_id` in the `departments` table. The database **enforces this automatically** — you cannot insert an employee with a department that doesn't exist, and (depending on configuration) you can't delete a department that still has employees pointing to it.

### Visualizing the Relationship

```
departments                       employees
┌───────────────┬──────────────┐  ┌─────────────┬──────┬───────────────┐
│ department_id │ department_  │  │ employee_id │ name │ department_id │
│   (PK)        │ name         │  │   (PK)      │      │   (FK) ───────┼──┐
├───────────────┼──────────────┤  ├─────────────┼──────┼───────────────┤  │
│ 1             │ Engineering  │◄─┼─────────────┼──────┼── 1            │  │
│ 2             │ Marketing    │  │ 1           │ Smit │ 1             │◄─┘
└───────────────┴──────────────┘  │ 2           │ Rohan│ 1             │
                                   │ 3           │ Ananya│ 2            │
                                   └─────────────┴──────┴───────────────┘
```

This Foreign Key relationship is the foundation everything in Chapter 11 (JOINs) is built on.

---

<a id="ch11"></a>
## Chapter 11 — JOINs: Combining Tables

JOINs let you query data that's spread across multiple related tables, stitched together via key relationships.

### INNER JOIN — Only Matching Rows From Both Sides

```sql
SELECT e.name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;
```

```
employees                departments              RESULT (INNER JOIN)
┌─────┬─────┐            ┌─────┬─────────┐         ┌──────┬─────────────┐
│ id  │dept │            │ id  │ name    │         │ name │ department  │
├─────┼─────┤            ├─────┼─────────┤         ├──────┼─────────────┤
│ Smit│  1  │──────┐  ┌──│  1  │Eng      │         │ Smit │ Eng         │
│ Raj │  2  │      │  │  │  2  │Marketing│         │ Raj  │ Marketing   │
│ Ana │NULL │      └──┼──┤  3  │Sales    │         └──────┴─────────────┘
└─────┴─────┘         └──┴─────┴─────────┘    (Ana excluded — NULL dept_id;
                                                Sales excluded — no employee)
```

### LEFT JOIN — All Rows From the Left Table, Matched or Not

```sql
SELECT e.name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;
```

Every employee appears, even ones with no matching department — unmatched columns from the right table simply show as `NULL`. This is the most common JOIN in real-world reporting, because you usually don't want to silently lose rows.

### RIGHT JOIN — All Rows From the Right Table, Matched or Not

The mirror image of `LEFT JOIN`. Rarely used in practice — most people just rewrite the query with `LEFT JOIN` and swap table order, for consistency.

### FULL OUTER JOIN — Everything From Both Sides

```sql
SELECT e.name, d.department_name
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.department_id;
```

Returns all employees AND all departments — `NULL`-filled wherever there's no match on either side. Useful for finding mismatches/orphaned data on either table.

### Visual Summary

| JOIN Type | Returns |
|---|---|
| `INNER JOIN` | Only rows that match in **both** tables |
| `LEFT JOIN` | **All** left rows + matches from right (NULL if none) |
| `RIGHT JOIN` | **All** right rows + matches from left (NULL if none) |
| `FULL OUTER JOIN` | **All** rows from both, matched or not |
| `CROSS JOIN` | Every row from table A paired with every row from table B (Cartesian product) |

```sql
-- CROSS JOIN example — rarely needed, but useful for generating combinations
SELECT * FROM colors CROSS JOIN sizes;
-- 3 colors × 4 sizes = 12 result rows (every combination)
```

### Self JOIN

A table can be joined to itself — common for hierarchical data like "employee → manager":

```sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id;
```

---

<a id="ch12"></a>
## Chapter 12 — Set Operations: UNION, INTERSECT, EXCEPT

These combine the **results** of two separate queries (as opposed to JOINs, which combine columns from related tables).

```sql
-- UNION: combines rows from both queries, removes duplicates
SELECT name FROM current_employees
UNION
SELECT name FROM former_employees;

-- UNION ALL: same, but KEEPS duplicates — much faster, since no dedup work needed
SELECT name FROM current_employees
UNION ALL
SELECT name FROM former_employees;

-- INTERSECT: only rows present in BOTH result sets
SELECT email FROM newsletter_subscribers
INTERSECT
SELECT email FROM premium_customers;

-- EXCEPT (MINUS in Oracle): rows in the first query, NOT in the second
SELECT email FROM all_users
EXCEPT
SELECT email FROM unsubscribed_users;
```

> 💡 **Rule:** every query combined with a set operation must return the **same number of columns**, in the **same order**, with **compatible data types**.

---

<a id="ch13"></a>
## Chapter 13 — Subqueries

A subquery is a query nested inside another query.

```sql
-- Subquery in WHERE — find employees earning above the company average
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);

-- Subquery with IN — find employees in departments located in 'Kolkata'
SELECT name FROM employees
WHERE department_id IN (
    SELECT department_id FROM departments WHERE city = 'Kolkata'
);

-- Correlated subquery — references the OUTER query, runs once PER ROW
SELECT name, salary, department_id
FROM employees e1
WHERE salary > (
    SELECT AVG(salary) FROM employees e2
    WHERE e2.department_id = e1.department_id  -- correlated reference
);
-- "Show employees earning more than THEIR OWN department's average"

-- Subquery in FROM (derived table) — must be aliased
SELECT dept_avg.department_id, dept_avg.avg_salary
FROM (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
) AS dept_avg
WHERE dept_avg.avg_salary > 80000;

-- EXISTS — checks only whether ANY matching row exists, often faster than IN
SELECT name FROM departments d
WHERE EXISTS (
    SELECT 1 FROM employees e WHERE e.department_id = d.department_id
);
```

> ⚠️ **Performance note:** a correlated subquery re-runs once for every row in the outer query — on large tables this can be dramatically slower than an equivalent JOIN or window function (Chapter 15). Use it when logic genuinely requires per-row comparison; otherwise prefer a JOIN.

---

<a id="ch14"></a>
## Chapter 14 — Common Table Expressions (CTEs)

A CTE is a named, temporary result set defined with `WITH`, that you can reference like a table within the rest of the query. They exist purely to make complex queries **readable** — they don't change performance characteristics much in most modern databases.

```sql
WITH dept_averages AS (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT e.name, e.salary, d.avg_salary
FROM employees e
JOIN dept_averages d ON e.department_id = d.department_id
WHERE e.salary > d.avg_salary;
```

Compare that readability to the equivalent nested subquery — CTEs read top-to-bottom like a story, instead of inside-out.

### Multiple CTEs

```sql
WITH high_earners AS (
    SELECT * FROM employees WHERE salary > 80000
),
engineering_only AS (
    SELECT * FROM high_earners WHERE department_id = 1
)
SELECT * FROM engineering_only;
```

### Recursive CTEs — Walking Hierarchies

```sql
-- Find an employee and their entire management chain upward
WITH RECURSIVE management_chain AS (
    -- Base case: start with the employee
    SELECT employee_id, name, manager_id, 1 AS level
    FROM employees
    WHERE employee_id = 5

    UNION ALL

    -- Recursive case: walk up to each manager
    SELECT e.employee_id, e.name, e.manager_id, mc.level + 1
    FROM employees e
    JOIN management_chain mc ON e.employee_id = mc.manager_id
)
SELECT * FROM management_chain;
```

Recursive CTEs are the standard SQL tool for hierarchical or graph-like data — org charts, category trees, bill-of-materials structures.

---

<a id="ch15"></a>
## Chapter 15 — Window Functions: The Analyst's Superpower

This is the single highest-leverage chapter for data analysts and ML engineers. Window functions let you perform calculations **across a set of rows related to the current row**, without collapsing those rows into a single output (unlike `GROUP BY`).

```sql
-- Rank employees by salary WITHIN each department, without losing any rows
SELECT
    name,
    department_id,
    salary,
    RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dept_rank
FROM employees;
```

| name | department_id | salary | dept_rank |
|---|---|---|---|
| Rohan | 1 | 91000 | 1 |
| Smit | 1 | 85000 | 2 |
| Ananya | 2 | 72000 | 1 |

Notice: unlike `GROUP BY`, every original row is still present — we just added a calculated column alongside it.

### The Anatomy of `OVER()`

```sql
function_name() OVER (
    PARTITION BY column   -- optional: reset the calculation per group
    ORDER BY column        -- optional: defines the order for ranking/running calcs
    ROWS/RANGE BETWEEN ... -- optional: defines the exact "window" of rows
)
```

### Ranking Functions

```sql
ROW_NUMBER() OVER (ORDER BY salary DESC)  -- 1, 2, 3, 4, 5... no ties
RANK()       OVER (ORDER BY salary DESC)  -- 1, 2, 2, 4, 5... ties share rank, gaps after
DENSE_RANK() OVER (ORDER BY salary DESC)  -- 1, 2, 2, 3, 4... ties share rank, no gaps
```

### Running Totals & Moving Averages

```sql
-- Running total of sales, ordered by date
SELECT
    sale_date,
    amount,
    SUM(amount) OVER (ORDER BY sale_date) AS running_total
FROM sales;

-- 7-day moving average
SELECT
    sale_date,
    amount,
    AVG(amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_avg_7day
FROM sales;
```

### LAG and LEAD — Comparing to Previous/Next Rows

```sql
-- Compare each month's revenue to the previous month
SELECT
    month,
    revenue,
    LAG(revenue, 1) OVER (ORDER BY month) AS prev_month_revenue,
    revenue - LAG(revenue, 1) OVER (ORDER BY month) AS change
FROM monthly_revenue;

LEAD(revenue, 1) OVER (ORDER BY month)  -- looks FORWARD instead of backward
```

This single pattern (`LAG`/`LEAD`) replaces what would otherwise require complex self-joins, and is one of the most common patterns in financial and growth analytics.

### `FIRST_VALUE` / `LAST_VALUE`

```sql
SELECT
    name, department_id, salary,
    FIRST_VALUE(name) OVER (PARTITION BY department_id ORDER BY salary DESC) AS top_earner
FROM employees;
```

---

<a id="ch16"></a>
## Chapter 16 — String, Date & Math Functions

### String Functions

```sql
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM employees;
SELECT UPPER(name), LOWER(name) FROM employees;
SELECT LENGTH(name) FROM employees;
SELECT TRIM(name) FROM employees;              -- removes leading/trailing whitespace
SELECT SUBSTRING(name, 1, 3) FROM employees;    -- first 3 characters
SELECT REPLACE(email, '@old.com', '@new.com') FROM employees;
```

### Date Functions

```sql
SELECT CURRENT_DATE;
SELECT NOW();                                    -- current date + time

SELECT DATEDIFF(NOW(), hire_date) FROM employees; -- days since hire (MySQL syntax)
SELECT EXTRACT(YEAR FROM hire_date) FROM employees;
SELECT DATE_TRUNC('month', sale_date) FROM sales; -- round down to start of month (Postgres)

-- Add/subtract intervals
SELECT hire_date + INTERVAL '90 days' FROM employees;  -- Postgres syntax
```

### Math Functions

```sql
SELECT ROUND(salary, -3) FROM employees;   -- round to nearest 1000
SELECT CEIL(4.1), FLOOR(4.9);               -- 5, 4
SELECT ABS(-25);                             -- 25
SELECT POWER(2, 10);                         -- 1024
SELECT MOD(10, 3);                           -- 1
```

---

<a id="ch17"></a>
## Chapter 17 — CASE Expressions: Conditional Logic in SQL

`CASE` is SQL's `if/else` — it lets you compute values conditionally, directly inside a query.

```sql
SELECT
    name,
    salary,
    CASE
        WHEN salary >= 90000 THEN 'Senior'
        WHEN salary >= 70000 THEN 'Mid'
        ELSE 'Junior'
    END AS salary_band
FROM employees;
```

This is enormously useful for building reporting buckets, pivoting data, or conditional aggregation:

```sql
-- "Pivot" a single column into multiple summary columns
SELECT
    department_id,
    SUM(CASE WHEN salary >= 90000 THEN 1 ELSE 0 END) AS senior_count,
    SUM(CASE WHEN salary < 90000 THEN 1 ELSE 0 END) AS non_senior_count
FROM employees
GROUP BY department_id;
```

---

<a id="ch18"></a>
## Chapter 18 — INSERT, UPDATE, DELETE

```sql
-- INSERT: add new rows
INSERT INTO employees (employee_id, name, department_id, salary)
VALUES (4, 'Priya', 1, 78000);

-- Insert multiple rows at once
INSERT INTO employees (employee_id, name, department_id, salary)
VALUES
    (5, 'Karan', 2, 65000),
    (6, 'Neha', 1, 95000);

-- UPDATE: modify existing rows
UPDATE employees
SET salary = 95000
WHERE employee_id = 1;

-- DELETE: remove rows
DELETE FROM employees
WHERE employee_id = 6;
```

> ⚠️ **The single most dangerous mistake in SQL:** running `UPDATE` or `DELETE` without a `WHERE` clause. Without it, the statement applies to **every single row** in the table.

```sql
UPDATE employees SET salary = 50000;  -- 💥 Sets EVERY employee's salary to 50000
DELETE FROM employees;                -- 💥 Deletes the ENTIRE table's contents
```

> 💡 **Safety habit:** always write and test the `SELECT` version of your `WHERE` clause first, confirm it returns exactly the rows you intend, then convert it to `UPDATE`/`DELETE`.

```sql
-- Step 1: confirm the target rows
SELECT * FROM employees WHERE department_id = 99;

-- Step 2: only then run the destructive statement
DELETE FROM employees WHERE department_id = 99;
```

---

<a id="ch19"></a>
## Chapter 19 — Transactions & ACID

A **transaction** groups multiple statements into a single, all-or-nothing unit of work.

```sql
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 500 WHERE account_id = 2;

COMMIT;   -- both changes are permanently applied together
-- or:
ROLLBACK; -- undo everything since BEGIN, as if it never happened
```

Why does this matter? Imagine transferring money between two accounts. If the database crashes **between** the two `UPDATE` statements, money would simply vanish — deducted from one account, never credited to the other. Transactions guarantee this can't happen: either both updates succeed, or neither does.

### ACID — The Four Guarantees

| Property | Meaning |
|---|---|
| **Atomicity** | All statements in a transaction succeed together, or all fail together — no partial state |
| **Consistency** | A transaction can only bring the database from one valid state to another, never violating constraints |
| **Isolation** | Concurrent transactions don't interfere with each other's intermediate states |
| **Durability** | Once committed, changes survive even a crash immediately afterward |

### Isolation Levels — Trading Consistency for Speed

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

| Level | Prevents | Allows |
|---|---|---|
| `READ UNCOMMITTED` | Nothing | Dirty reads (seeing another transaction's uncommitted changes) |
| `READ COMMITTED` | Dirty reads | Non-repeatable reads (re-reading a row mid-transaction gives a different value) |
| `REPEATABLE READ` | Dirty + non-repeatable reads | Phantom reads (new rows appearing on re-query) |
| `SERIALIZABLE` | All of the above | Strictest — transactions behave as if run one at a time |

Stricter isolation = stronger correctness guarantees, but more locking and lower concurrency. Most applications default to `READ COMMITTED` as a practical middle ground.

---

<a id="ch20"></a>
## Chapter 20 — Database Design & Normalization

Normalization is the process of organizing tables to **eliminate redundancy** and **prevent data anomalies**.

### The Problem: An Unnormalized Table

| order_id | customer_name | customer_email | product | price |
|---|---|---|---|---|
| 1 | Smit Roy | smit@mail.com | Laptop | 75000 |
| 2 | Smit Roy | smit@mail.com | Mouse | 800 |

Smit's name and email are duplicated across every order. If his email changes, you must update it in **every single row** — miss one, and your data is now inconsistent (an "update anomaly").

### First Normal Form (1NF) — Atomic Values

Every column must hold a single, indivisible value — no comma-separated lists crammed into one field.

```sql
-- ❌ Violates 1NF
| order_id | products            |
| 1        | "Laptop, Mouse, Pad"|

-- ✅ Satisfies 1NF — one product per row
| order_id | product |
| 1        | Laptop  |
| 1        | Mouse   |
| 1        | Pad     |
```

### Second Normal Form (2NF) — No Partial Dependency

Every non-key column must depend on the **entire** primary key, not just part of it (relevant for composite keys).

### Third Normal Form (3NF) — No Transitive Dependency

Non-key columns shouldn't depend on **other non-key columns**. Customer email depends on customer, not on the order — so it belongs in a separate `customers` table.

### The Normalized Design

```sql
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    order_date DATE
);

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY,
    order_id INT REFERENCES orders(order_id),
    product VARCHAR(100),
    price DECIMAL(10,2)
);
```

Now Smit's email exists in exactly **one place**. Update it once, and every order automatically reflects the correct value via the relationship.

### When to Deliberately Break the Rules: Denormalization

Normalization optimizes for data integrity, but every JOIN costs query time. In read-heavy analytics systems (data warehouses, reporting dashboards), it's often a deliberate, informed trade-off to **denormalize** — duplicate some data — to avoid expensive JOINs at query time. This is the foundation of **star schema** design, common in data warehousing for analytics and BI.

---

<a id="ch21"></a>
## Chapter 21 — Indexes: Why Queries Are Fast (or Slow)

Without an index, finding a row means scanning the **entire table**, row by row — a "full table scan." On a table with 50 million rows, that's catastrophic for performance.

An **index** is a separate, sorted data structure that lets the database jump almost directly to the rows it needs — conceptually identical to a book's index letting you skip straight to a page instead of reading cover to cover.

```sql
CREATE INDEX idx_employees_department ON employees(department_id);

CREATE UNIQUE INDEX idx_employees_email ON employees(email);

-- Composite index — useful when queries filter on BOTH columns together
CREATE INDEX idx_dept_salary ON employees(department_id, salary);
```

### How Indexes Work Internally (B-Trees)

Most relational database indexes use a **B-Tree** (balanced tree) structure. Instead of scanning every row linearly (O(n)), the database can traverse the tree in O(log n) time:

```
                  [50]
                 /    \
            [25]        [75]
           /    \       /    \
        [10]  [35]   [60]   [90]
```

To find `salary = 60`, the database compares against the root, branches left or right, and narrows down in just a few hops — instead of checking every single row.

> ⚠️ **The trade-off:** indexes dramatically speed up `SELECT` queries, but they slow down `INSERT`/`UPDATE`/`DELETE`, because the index structure must be updated alongside the actual data, every single time. Don't index every column "just in case" — index columns that are actually used in `WHERE`, `JOIN`, and `ORDER BY` clauses frequently.

### When an Index Won't Help

```sql
-- A leading wildcard prevents the index from being used efficiently
SELECT * FROM employees WHERE name LIKE '%Roy';   -- can't use a standard B-Tree index well

-- Applying a function to an indexed column often defeats the index
SELECT * FROM employees WHERE UPPER(name) = 'SMIT';  -- index on `name` won't be used
-- (unless you create a function-based/expression index specifically for this)
```

---

<a id="ch22"></a>
## Chapter 22 — Constraints: Protecting Data Integrity

Constraints are rules the database enforces automatically, so invalid data can never even be inserted in the first place.

```sql
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,                          -- unique, not null, identifies the row
    email VARCHAR(100) UNIQUE NOT NULL,                     -- no two rows can share this value
    age INT CHECK (age >= 18),                               -- custom validation rule
    department_id INT,
    salary DECIMAL(10,2) DEFAULT 50000,                      -- value used when none is provided
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON DELETE CASCADE                                     -- delete employees if their dept is deleted
        ON UPDATE CASCADE
);
```

| Constraint | Purpose |
|---|---|
| `PRIMARY KEY` | Uniquely identifies each row; implies `UNIQUE` + `NOT NULL` |
| `FOREIGN KEY` | Enforces that a value must exist in another table's primary key |
| `UNIQUE` | No duplicate values allowed in this column |
| `NOT NULL` | Column must always have a value |
| `CHECK` | Custom condition every row must satisfy |
| `DEFAULT` | Value used automatically if none is provided on insert |

### Foreign Key Actions

```sql
ON DELETE CASCADE     -- deleting the parent automatically deletes children
ON DELETE SET NULL    -- deleting the parent sets the child's FK column to NULL
ON DELETE RESTRICT    -- prevents deleting the parent if children still reference it (default-like behavior)
```

---

<a id="ch23"></a>
## Chapter 23 — Views

A **view** is a saved, named query that behaves like a virtual table. It doesn't store data itself — every time you query it, it re-runs the underlying query.

```sql
CREATE VIEW high_earners AS
SELECT name, department_id, salary
FROM employees
WHERE salary > 85000;

-- Query it exactly like a table
SELECT * FROM high_earners WHERE department_id = 1;
```

**Why use views?**
- Simplify repeated complex queries into a clean, reusable name
- Restrict access — give analysts a view that exposes only certain columns, hiding sensitive ones
- Provide a stable interface even if underlying table structure changes

### Materialized Views

Unlike a regular view, a **materialized view** actually stores the computed result physically on disk, and must be manually or periodically refreshed. This trades freshness for speed — ideal for expensive aggregations that don't need to be real-time.

```sql
CREATE MATERIALIZED VIEW monthly_revenue_summary AS
SELECT DATE_TRUNC('month', sale_date) AS month, SUM(amount) AS total_revenue
FROM sales
GROUP BY DATE_TRUNC('month', sale_date);

REFRESH MATERIALIZED VIEW monthly_revenue_summary;  -- manually update the stored snapshot
```

---

<a id="ch24"></a>
## Chapter 24 — Stored Procedures & Functions

These let you save reusable, parameterized logic **inside** the database itself.

```sql
-- A function — returns a value, usable inside a SELECT
CREATE FUNCTION get_employee_bonus(emp_salary DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN emp_salary * 0.10;
END;
$$ LANGUAGE plpgsql;

SELECT name, get_employee_bonus(salary) AS bonus FROM employees;
```

```sql
-- A stored procedure — performs an action, doesn't necessarily return a value
CREATE PROCEDURE give_raise(emp_id INT, raise_amount DECIMAL)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE employees SET salary = salary + raise_amount WHERE employee_id = emp_id;
    COMMIT;
END;
$$;

CALL give_raise(1, 5000);
```

**When to use these:** complex multi-step business logic that should live close to the data (often for consistency or performance reasons), or logic that needs to run as a single atomic database-side operation. Modern application architecture often pushes this logic into the application layer instead — but in data-heavy systems and legacy enterprise databases, this is still common and powerful.

---

<a id="ch25"></a>
## Chapter 25 — Triggers

A **trigger** automatically executes in response to an event (`INSERT`, `UPDATE`, `DELETE`) on a table — without anyone explicitly calling it.

```sql
CREATE TABLE salary_audit (
    audit_id SERIAL PRIMARY KEY,
    employee_id INT,
    old_salary DECIMAL,
    new_salary DECIMAL,
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE FUNCTION log_salary_change() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO salary_audit (employee_id, old_salary, new_salary)
    VALUES (OLD.employee_id, OLD.salary, NEW.salary);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER salary_change_trigger
AFTER UPDATE OF salary ON employees
FOR EACH ROW
EXECUTE FUNCTION log_salary_change();
```

Now, every time someone updates an employee's salary, a permanent audit log entry is created automatically — no application code needs to remember to do this manually.

> 💡 Use triggers sparingly. They're powerful for auditing and enforcing invariants, but overuse makes system behavior harder to trace, since logic fires invisibly outside your application code.

---

<a id="ch26"></a>
## Chapter 26 — How a Query Actually Executes

Understanding this layer is what separates someone who writes SQL that *works* from someone who writes SQL that *scales*.

```
Your SQL Query
      │
      ▼
┌─────────────┐
│   Parser    │  → Checks syntax, builds a query tree
└─────────────┘
      │
      ▼
┌─────────────┐
│  Optimizer  │  → Considers multiple possible execution strategies,
└─────────────┘     estimates cost of each (using table statistics),
      │              picks the cheapest plan
      ▼
┌─────────────┐
│  Execution  │  → Actually runs the chosen plan: scans, joins,
│   Engine    │     filters, sorts, returns rows
└─────────────┘
      │
      ▼
   Results
```

The **query optimizer** is the most important piece of "magic" in any DBMS. Given a query, it might choose between a full table scan vs. an index lookup, a hash join vs. a nested loop join, and dozens of other strategies — all based on estimated cost, derived from statistics the database keeps about your table sizes and data distribution.

This is exactly why writing declarative SQL (Chapter 1) is powerful: the same query can get dramatically faster over time as the optimizer improves, indexes get added, or data statistics update — without you rewriting a single line.

---

<a id="ch27"></a>
## Chapter 27 — Query Optimization & EXPLAIN

`EXPLAIN` shows you the actual execution plan the database chose for your query — the single most useful debugging tool for slow SQL.

```sql
EXPLAIN SELECT * FROM employees WHERE department_id = 1;

-- EXPLAIN ANALYZE actually runs the query and shows real timing, not just estimates
EXPLAIN ANALYZE SELECT * FROM employees WHERE department_id = 1;
```

Example output (Postgres-style):

```
Seq Scan on employees  (cost=0.00..18.50 rows=5 width=64) (actual time=0.02..0.15 rows=5 loops=1)
  Filter: (department_id = 1)
```

`Seq Scan` (sequential scan) means the database read the **entire table** row by row — a red flag on a large table without a relevant index. After adding `CREATE INDEX idx_dept ON employees(department_id);`, you'd likely see:

```
Index Scan using idx_dept on employees  (cost=0.15..8.17 rows=5 width=64)
  Index Cond: (department_id = 1)
```

### Practical Optimization Checklist

- Index columns used heavily in `WHERE`, `JOIN`, and `ORDER BY`
- Avoid `SELECT *` in production code — fetch only needed columns
- Avoid wrapping indexed columns in functions inside `WHERE` (`WHERE YEAR(date_col) = 2026` defeats an index on `date_col`)
- Filter as early as possible — push `WHERE` conditions before expensive `JOIN`s where logically possible (modern optimizers often do this automatically, but it's worth verifying)
- Use `LIMIT` when you don't need the full result set
- Watch for implicit type conversions in `WHERE` clauses — comparing a string column to a number can silently disable an index
- Prefer `EXISTS` over `IN` with large subqueries in many databases
- Periodically update table statistics (`ANALYZE` in Postgres) so the optimizer's cost estimates stay accurate

---

<a id="ch28"></a>
## Chapter 28 — SQL for Data Analysts

Beyond the core language, analysts lean heavily on a specific subset of patterns:

### Cohort & Funnel Analysis Pattern

```sql
WITH first_purchase AS (
    SELECT customer_id, MIN(order_date) AS cohort_month
    FROM orders
    GROUP BY customer_id
)
SELECT
    DATE_TRUNC('month', fp.cohort_month) AS cohort,
    DATE_TRUNC('month', o.order_date) AS activity_month,
    COUNT(DISTINCT o.customer_id) AS active_customers
FROM orders o
JOIN first_purchase fp ON o.customer_id = fp.customer_id
GROUP BY 1, 2
ORDER BY 1, 2;
```

### Percentile & Distribution Analysis

```sql
SELECT
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) AS median_salary,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY salary) AS p90_salary
FROM employees;
```

### Pivoting Data for Dashboards

```sql
SELECT
    department_id,
    SUM(CASE WHEN EXTRACT(MONTH FROM hire_date) = 1 THEN 1 ELSE 0 END) AS jan_hires,
    SUM(CASE WHEN EXTRACT(MONTH FROM hire_date) = 2 THEN 1 ELSE 0 END) AS feb_hires
FROM employees
GROUP BY department_id;
```

### Year-over-Year Growth

```sql
WITH yearly AS (
    SELECT EXTRACT(YEAR FROM order_date) AS yr, SUM(amount) AS revenue
    FROM orders GROUP BY 1
)
SELECT
    yr, revenue,
    LAG(revenue) OVER (ORDER BY yr) AS prev_year_revenue,
    ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY yr)) / LAG(revenue) OVER (ORDER BY yr), 2) AS yoy_growth_pct
FROM yearly;
```

---

<a id="ch29"></a>
## Chapter 29 — SQL for AI/ML Engineers

ML practitioners use SQL constantly — for feature engineering, dataset construction, and pulling training data straight from a warehouse.

### Building a Feature Table

```sql
WITH customer_features AS (
    SELECT
        customer_id,
        COUNT(*) AS total_orders,
        AVG(amount) AS avg_order_value,
        MAX(order_date) AS last_order_date,
        DATEDIFF(CURRENT_DATE, MAX(order_date)) AS days_since_last_order,
        STDDEV(amount) AS order_value_volatility
    FROM orders
    GROUP BY customer_id
)
SELECT * FROM customer_features;
```

This single query produces a clean, ready-to-export feature table for a churn prediction model — exactly the kind of work that happens before any Python or scikit-learn code is even touched.

### Train/Test Splitting via SQL

```sql
-- Deterministic, reproducible split using a hash of the ID
SELECT *,
    CASE WHEN MOD(ABS(HASHTEXT(customer_id::TEXT)), 10) < 8 THEN 'train' ELSE 'test' END AS split
FROM customer_features;
```

### Label Generation (Supervised Learning Targets)

```sql
-- Did the customer churn (no order in the last 90 days)?
SELECT
    customer_id,
    CASE WHEN days_since_last_order > 90 THEN 1 ELSE 0 END AS churned
FROM customer_features;
```

### Avoiding Data Leakage — A Critical ML-Specific SQL Pattern

```sql
-- WRONG: using data from AFTER the prediction point as a feature
SELECT customer_id, total_lifetime_orders  -- includes future orders! leaks the answer
FROM customer_features;

-- CORRECT: only use data available AS OF the prediction date
SELECT
    customer_id,
    COUNT(*) AS orders_before_cutoff
FROM orders
WHERE order_date < '2026-01-01'   -- strict cutoff — mirrors real-world prediction timing
GROUP BY customer_id;
```

This single discipline — respecting **time-based cutoffs** when building features — is one of the most common, costly mistakes in real-world ML pipelines, and it's enforced entirely at the SQL layer, before a model ever sees the data.

---

<a id="ch30"></a>
## Chapter 30 — Common Mistakes & How to Avoid Them

| Mistake | Why It's Wrong | Fix |
|---|---|---|
| `WHERE column = NULL` | `NULL` comparisons always evaluate to unknown | Use `IS NULL` / `IS NOT NULL` |
| `UPDATE`/`DELETE` without `WHERE` | Affects every row in the table | Always `SELECT` first to verify, then convert |
| `SELECT *` in production code | Breaks silently when schema changes, wastes bandwidth | Name columns explicitly |
| Using `HAVING` instead of `WHERE` for row-level filters | `HAVING` runs after grouping — wastes work filtering rows that should've been excluded earlier | Use `WHERE` for row filters, `HAVING` only for aggregate filters |
| Storing money as `FLOAT` | Floating-point rounding errors compound | Use `DECIMAL`/`NUMERIC` |
| Forgetting `GROUP BY` columns must be aggregated or grouped | Ambiguous — which row's value should show? | Every selected column must be aggregated or in `GROUP BY` |
| Leading wildcard in `LIKE '%text'` | Index can't be used efficiently | Avoid where possible, or use full-text search features instead |
| Not indexing foreign key columns | JOINs silently become full table scans | Index every foreign key column used in JOINs |
| Assuming JOIN order changes correctness | (For simple INNER JOINs, order rarely matters for correctness — but understanding LEFT JOIN order absolutely does) | Test `LEFT` vs `RIGHT` JOIN behavior explicitly when unsure |
| Comparing different data types implicitly | Can silently disable index usage or cause unexpected coercion | Match types explicitly; cast when necessary |

---

<a id="ch31"></a>
## Chapter 31 — MySQL vs PostgreSQL vs NoSQL: Choosing the Right Database

Every chapter so far taught you the *language*. This chapter teaches you the *decision* — which database engine to actually point that language at. This is one of the most consequential architecture decisions you'll make, and it's usually made too quickly, based on familiarity rather than fit.

### MySQL vs PostgreSQL — Both Are "SQL," But They're Not the Same

These are the two most popular open-source relational databases, and developers often treat them as interchangeable. They're not.

| | MySQL | PostgreSQL |
|---|---|---|
| **Philosophy** | Speed and simplicity first | Standards compliance and correctness first |
| **SQL standard compliance** | Looser — historically allowed some non-standard shortcuts | Very strict — closely follows the SQL standard |
| **Data types** | Solid basics | Far richer: native arrays, `JSONB`, `HSTORE`, range types, geometric types, custom types |
| **Concurrency model** | Row-level locking via InnoDB engine | MVCC (Multi-Version Concurrency Control) — readers never block writers |
| **JSON support** | `JSON` type, decent but fewer indexing/query options | `JSONB` — binary, indexable, queryable almost like a NoSQL document store |
| **Extensibility** | Limited | Hugely extensible — custom functions, operators, and extensions (e.g., `PostGIS` for geospatial, `pgvector` for AI embeddings) |
| **Full-text search** | Basic | More powerful native full-text search |
| **Replication** | Mature, widely supported by managed hosts | Mature, plus logical replication flexibility |
| **Performance on simple reads** | Historically faster for simple read-heavy workloads | Historically slightly heavier per-query, but closes the gap significantly with proper indexing/tuning |
| **Best known for** | WordPress, traditional LAMP-stack web apps, simple CRUD-heavy systems | Complex queries, data integrity-critical systems, analytics, geospatial, AI/vector workloads |

> 💡 **The honest modern answer:** for the vast majority of applications, both are "fast enough" — query design and indexing matter far more than engine choice at typical application scale. The deciding factor is usually **feature needs**, not raw speed.

**Choose MySQL when:**
- You're building a straightforward CRUD application with simple relational needs
- Your hosting/ecosystem already standardizes on MySQL (e.g., many shared hosting and WordPress-centric environments)
- Your team already has deep MySQL operational experience

**Choose PostgreSQL when:**
- You need rich data types (arrays, JSON documents, ranges) inside a relational table
- You're building anything analytics-adjacent — window functions, advanced aggregations, CTEs are generally more mature and performant
- You need geospatial data (`PostGIS`) or vector embeddings for AI/RAG applications (`pgvector`)
- Strict data integrity and standards compliance matter more than raw simplicity
- You want a single database that can comfortably grow from a simple app into a more sophisticated data platform without switching engines

For a modern Java/Spring Boot backend specifically — almost always **PostgreSQL**. It pairs cleanly with Hibernate/JPA, has best-in-class support across every major managed cloud (Neon, Supabase, AWS RDS, Railway, Render), and its strictness tends to surface data-modeling mistakes early instead of letting them silently corrupt data in production.

---

### When to Step Outside SQL Entirely: NoSQL

NoSQL isn't "the new SQL" or a strict upgrade — it's a different set of trade-offs, optimized for different problems. The core trade-off: relational databases optimize for **data integrity and complex relationships**; most NoSQL databases optimize for **horizontal scale and schema flexibility**, often at the cost of some consistency guarantees.

```
                    Strong consistency,            Eventual consistency,
                    complex relationships    ◄────────────────────────►   massive horizontal scale
                    PostgreSQL/MySQL                                      Cassandra/DynamoDB
```

### The Decision Framework

| Your Situation | Likely Best Fit | Why |
|---|---|---|
| Data has clear relationships (orders → customers → products) | Relational (Postgres/MySQL) | JOINs and foreign keys exist exactly for this |
| You need ACID transactions (banking, inventory, bookings) | Relational | NoSQL often trades strict consistency for availability/speed |
| Your schema changes constantly, per-record | Document store (MongoDB) | No rigid schema to migrate every time |
| You need sub-millisecond lookups of simple key-value data (sessions, caching) | Key-value store (Redis) | Purpose-built for exactly this access pattern |
| You're storing and querying time-series or event/log data at huge volume | Wide-column / time-series (Cassandra, InfluxDB) | Optimized for massive sequential writes |
| You need graph traversal (social networks, recommendation engines, fraud rings) | Graph database (Neo4j) | Relationship traversal is the native operation, not an expensive JOIN |
| You're doing full-text search at scale (product search, log search) | Search engine (Elasticsearch) | Purpose-built inverted-index search, not a general database |
| You need to scale writes horizontally across many servers, globally | Distributed NoSQL (DynamoDB, Cassandra, MongoDB sharded) | Relational databases scale vertically more naturally than horizontally |

### Why MongoDB, Specifically

MongoDB is a **document database** — each record is a flexible JSON-like document (`BSON`), not a row in a fixed-schema table.

```javascript
// A MongoDB document — note the nested structure and lack of a fixed schema
{
  "_id": "u123",
  "name": "Smit Roy",
  "addresses": [
    { "type": "home", "city": "Kolkata" },
    { "type": "work", "city": "Bangalore" }
  ],
  "preferences": { "newsletter": true }
}
```

**Choose MongoDB when:**
- Your data is naturally hierarchical/nested and doesn't map cleanly to flat rows (product catalogs with wildly varying attributes, content management systems, user profiles with optional fields)
- Different records genuinely need different shapes, and a rigid schema would mean constant `ALTER TABLE` migrations
- You're prototyping fast and don't want schema design to block early iteration
- You need to scale horizontally across many servers relatively easily (built-in sharding)

**Think twice about MongoDB when:**
- Your data is genuinely relational (lots of cross-references between entities) — you'll end up either doing application-side JOINs (slow, error-prone) or denormalizing heavily and fighting update-consistency problems
- You need strict multi-document ACID transactions across many records (supported since MongoDB 4.0, but it's not the engine's natural strength)

### Why Redis, Specifically

Redis is an **in-memory key-value store** — blisteringly fast because data lives in RAM, not on disk, by default.

```bash
SET session:abc123 "{user_id: 42, role: admin}" EX 3600   # expires in 1 hour
GET session:abc123
INCR page_views:homepage
ZADD leaderboard 1500 "player1"   # sorted set — instant leaderboard queries
```

**Choose Redis when:**
- You need a **cache** in front of a slower primary database (the single most common use case — cache expensive query results, reduce database load)
- You're storing **session data** for a web application — fast reads/writes, automatic expiry (`TTL`) built in
- You need **rate limiting** (API throttling counters)
- You need a **pub/sub message broker** for lightweight real-time features (chat presence, live notifications)
- You need **leaderboards or counters** — Redis's sorted sets and atomic increments are purpose-built for this
- You need a fast **job queue** (often paired with libraries like BullMQ, Sidekiq, or Spring's integration with Redis-backed queues)

**Think twice about Redis when:**
- You need Redis as your **primary, durable system of record** for critical business data — it's possible (Redis does support persistence via RDB snapshots and AOF logs), but it's not what it's optimized for, and most teams use it as a complement to a relational database, not a replacement

### A Realistic Modern Architecture

Most production systems aren't "SQL vs NoSQL" — they're **SQL AND NoSQL, used for what each is best at**:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Client     │────▶│  Spring Boot │────▶│   PostgreSQL     │
└─────────────┘     │   Backend    │     │ (source of truth,│
                     └──────┬───────┘     │  relational data)│
                            │              └─────────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    Redis      │
                     │ (sessions,    │
                     │  caching,     │
                     │  rate limits) │
                     └──────────────┘
```

A typical Spring Boot system: PostgreSQL as the relational source of truth, Redis in front of it for caching and sessions, and perhaps Elasticsearch bolted on separately if full-text product search becomes a real requirement. This is a far more common real-world pattern than picking a single database engine to do everything.

---

<a id="ch32"></a>
## Chapter 32 — PostgreSQL for Spring Boot Developers: The Complete Guide

Everything in this chapter assumes you're building a Spring Boot application backed by PostgreSQL — the most common pairing in modern Java backend development, and likely the exact stack you'll use professionally.

### Setting Up the Connection

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: postgres
    password: secret
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate   # NEVER use 'update' or 'create' in production — see below
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
    show-sql: false          # true only for local debugging — never in prod logs
```

> ⚠️ **Golden Rule on `ddl-auto`:** `create`, `create-drop`, and `update` are convenient for local prototyping, but dangerous in any shared or production environment — Hibernate can silently alter or even drop columns based on entity changes. Use `validate` (Hibernate checks your entities match the schema but never modifies it) and manage actual schema changes through a migration tool instead.

### Schema Migrations: Flyway or Liquibase, Not `ddl-auto`

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

```sql
-- src/main/resources/db/migration/V1__create_employees_table.sql
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

```sql
-- V2__add_department_to_employees.sql
ALTER TABLE employees ADD COLUMN department VARCHAR(100);
```

Flyway runs these versioned scripts automatically on application startup, in order, tracking what's already been applied in a `flyway_schema_history` table. This gives you a reviewable, version-controlled history of every schema change — exactly what you want for a team working on a shared production database.

### Entity Mapping: JPA/Hibernate Meets PostgreSQL Types

```java
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // maps to Postgres BIGSERIAL/SERIAL
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Department department;          // Java enum → stored as readable text, not magic numbers

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

> 💡 **`IDENTITY` vs `SEQUENCE`:** `GenerationType.IDENTITY` maps directly to PostgreSQL's auto-incrementing `BIGSERIAL`, but disables Hibernate's JDBC batch inserts (each insert must round-trip to get its generated ID). For high-throughput batch insert scenarios, `GenerationType.SEQUENCE` with an explicit `@SequenceGenerator` allows Hibernate to pre-allocate IDs and batch the actual inserts — a meaningful performance difference at scale.

### Using PostgreSQL's `JSONB` From Spring Boot

This is one of PostgreSQL's standout features over MySQL, and genuinely useful in real applications — storing flexible, semi-structured data inside an otherwise strict relational row.

```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @JdbcTypeCode(SqlTypes.JSON)         // Hibernate 6+ native JSON support
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> attributes;  // e.g., {"color": "red", "size": "L"}
}
```

```sql
-- And you can still query INTO the JSONB column with real SQL when needed
SELECT name FROM product WHERE attributes->>'color' = 'red';
CREATE INDEX idx_product_attrs ON product USING GIN (attributes);  -- index INTO the JSON itself
```

### Repository Layer: Spring Data JPA + Native Postgres Queries

```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Derived query — Spring Data generates the SQL automatically
    List<Employee> findByDepartment(Department department);

    // JPQL — database-agnostic query language
    @Query("SELECT e FROM Employee e WHERE e.salary > :minSalary")
    List<Employee> findHighEarners(@Param("minSalary") BigDecimal minSalary);

    // Native query — when you need Postgres-specific syntax/functions
    @Query(value = """
        SELECT * FROM employees
        WHERE department = :dept
        ORDER BY salary DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Employee> findTopEarnersByDept(@Param("dept") String dept, @Param("limit") int limit);
}
```

### Connection Pooling: HikariCP Tuning

Spring Boot ships with HikariCP by default — but the default pool size is rarely correct for production.

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10        # rule of thumb: (core_count * 2) + effective_spindle_count, tune via load testing
      minimum-idle: 5
      connection-timeout: 30000    # ms to wait for a connection before failing
      idle-timeout: 600000         # ms before an idle connection is closed
      max-lifetime: 1800000        # ms before a connection is recycled (should be less than Postgres's own timeout)
```

> ⚠️ **Common production mistake:** setting `maximum-pool-size` too high. PostgreSQL has a `max_connections` limit (default 100), and every Spring Boot instance you deploy competes for that same pool. A bloated per-instance pool size doesn't make your app faster — it just lets one instance exhaust connections meant for others, especially under horizontal scaling with multiple app replicas.

### Transactions in Spring Boot — `@Transactional` Meets Postgres Isolation

```java
@Service
public class TransferService {

    @Transactional
    public void transferFunds(Long fromId, Long toId, BigDecimal amount) {
        Account from = accountRepository.findById(fromId).orElseThrow();
        Account to = accountRepository.findById(toId).orElseThrow();

        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));

        // Both saves commit together, or both roll back — Postgres's actual transaction
        // is being driven underneath this Spring abstraction
        accountRepository.save(from);
        accountRepository.save(to);
    }
}
```

```java
// Setting isolation level explicitly when the default isn't strict enough
@Transactional(isolation = Isolation.SERIALIZABLE)
public void criticalInventoryUpdate(Long productId, int quantity) {
    // Prevents race conditions on concurrent stock updates
}
```

> 💡 **Why `@Transactional` can silently fail to work:** Spring's transaction management is proxy-based — it only takes effect on calls made **through the Spring-managed bean from outside the class**. A method calling another `@Transactional` method on `this` (self-invocation) bypasses the proxy entirely, and the transaction boundary silently doesn't apply. This is one of the most common "why isn't my transaction rolling back" bugs in real Spring Boot codebases.

### Optimistic Locking for Concurrent Updates

```java
@Entity
public class Room {
    @Id
    private Long id;

    private boolean booked;

    @Version   // Hibernate auto-manages this — maps to an integer column in Postgres
    private Long version;
}
```

When two requests try to update the same row concurrently, Hibernate checks the `version` column on save — if it's changed since the row was read, an `OptimisticLockException` is thrown instead of silently overwriting someone else's concurrent change. This is the standard pattern for things like hotel room booking or ticket inventory, where a `SELECT` then `UPDATE` race condition would otherwise double-book a resource.

### Pagination Done Right

```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Page<Employee> findByDepartment(Department department, Pageable pageable);
}
```

```java
Pageable pageable = PageRequest.of(0, 20, Sort.by("salary").descending());
Page<Employee> result = employeeRepository.findByDepartment(Department.ENGINEERING, pageable);
```

Under the hood, Spring Data translates this into a Postgres `LIMIT`/`OFFSET` query. For very large tables, `OFFSET` becomes slow at high page numbers (the database still has to scan and discard all skipped rows) — for genuinely large datasets, consider **keyset pagination** instead (filtering `WHERE id > :lastSeenId ORDER BY id LIMIT 20`), which stays fast regardless of how deep you page.

### Health Checks & Observability

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics
  health:
    db:
      enabled: true
```

Spring Boot Actuator automatically wires up a database health check against your PostgreSQL connection — useful for container orchestration (Kubernetes liveness/readiness probes) to know whether your app instance can actually reach its database.

### A Production Checklist for Postgres + Spring Boot

- Use Flyway or Liquibase for schema changes — never `ddl-auto: update` in production
- Tune HikariCP pool size based on actual load testing, not defaults — and account for multiple app replicas sharing Postgres's `max_connections`
- Index every foreign key column referenced in JOIN-heavy queries — Hibernate won't do this for you automatically
- Use `@Version` optimistic locking for any resource with realistic concurrent-update risk (bookings, inventory, payments)
- Be deliberate about isolation levels for financial or inventory-critical transactions — don't just accept the default everywhere
- Watch for N+1 query problems — use `@EntityGraph` or explicit `JOIN FETCH` in JPQL to eager-load relationships you know you'll need, instead of letting Hibernate lazy-load them one row at a time
- Use native queries or `JSONB` when JPQL/Hibernate abstractions get in the way of genuinely Postgres-specific features — don't fight the ORM when raw SQL is clearer and faster



### Query Skeleton (Execution Order)

```sql
SELECT columns
FROM table
JOIN other_table ON condition
WHERE row_filter
GROUP BY columns
HAVING group_filter
ORDER BY columns
LIMIT n;
```

### JOIN Quick Reference

```
INNER JOIN        → only matches
LEFT JOIN          → all left + matches
RIGHT JOIN         → all right + matches
FULL OUTER JOIN    → everything, matched or not
CROSS JOIN         → every combination
```

### Window Function Quick Reference

```sql
ROW_NUMBER() OVER (PARTITION BY x ORDER BY y)
RANK()       OVER (PARTITION BY x ORDER BY y)
DENSE_RANK() OVER (PARTITION BY x ORDER BY y)
SUM()/AVG()  OVER (PARTITION BY x ORDER BY y ROWS BETWEEN ... AND ...)
LAG(col, n)  OVER (ORDER BY y)
LEAD(col, n) OVER (ORDER BY y)
```

### Data Definition Quick Reference

```sql
CREATE TABLE name (col TYPE constraints, ...);
ALTER TABLE name ADD COLUMN col TYPE;
ALTER TABLE name DROP COLUMN col;
DROP TABLE name;
CREATE INDEX idx_name ON table(column);
```

### Transaction Quick Reference

```sql
BEGIN;
  -- statements
COMMIT;   -- or ROLLBACK;
```

---

## Closing Thoughts

You now have, in one place, what most engineers piece together over years of scattered Stack Overflow searches: the fundamentals, the relational theory, the performance internals, and the specialized patterns that analysts and ML engineers actually use day-to-day.

The fastest way to actually internalize this isn't rereading it — it's opening a real database (PostgreSQL is free and excellent to start with), loading in a sample dataset, and rewriting every example here against your own data until the patterns become reflexive.

SQL rewards exactly this kind of hands-on repetition. Go write some queries.