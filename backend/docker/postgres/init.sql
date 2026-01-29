-- PostgreSQL initialization script
-- Enable required extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE axtech_wheelchair TO axtech;
