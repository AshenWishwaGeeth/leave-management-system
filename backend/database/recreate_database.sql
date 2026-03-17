-- Recreate Leave Management database from scratch.
-- Run this script with a superuser (e.g., postgres) using psql.

-- Connect to default admin database first.
\connect postgres

-- Close active sessions so DROP DATABASE can succeed.
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'leave_management'
  AND pid <> pg_backend_pid();

-- Drop and recreate app database and role.
DROP DATABASE IF EXISTS leave_management;
DROP ROLE IF EXISTS leave_admin;

CREATE ROLE leave_admin WITH LOGIN PASSWORD '1234';
CREATE DATABASE leave_management OWNER leave_admin;

-- Switch to the new database.
\connect leave_management

-- Core tables expected by the Go backend models.
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT DEFAULT '',
    role TEXT NOT NULL CHECK (role IN ('employee', 'manager')),
    status TEXT NOT NULL DEFAULT 'active',
    password_hash TEXT NOT NULL DEFAULT '',
    leave_balance INTEGER NOT NULL DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leaves (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reason TEXT,
    manager_comment TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- App permissions.
GRANT USAGE ON SCHEMA public TO leave_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO leave_admin;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO leave_admin;

-- Future-proof grants for any new tables/sequences created later.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO leave_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO leave_admin;
