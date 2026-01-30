-- Add 'both' role support to users table
-- This allows users to access Guest, Celebrant, AND Vendor features

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'celebrant', 'vendor', 'both'));
