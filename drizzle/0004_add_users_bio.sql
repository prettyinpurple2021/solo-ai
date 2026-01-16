-- Add user bio field for Settings/Profile
-- Safe to run multiple times.

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "bio" text;