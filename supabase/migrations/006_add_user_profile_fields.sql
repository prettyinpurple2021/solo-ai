-- Migration: Add additional user profile fields for enhanced sign-up
-- This migration adds first_name, last_name, date_of_birth, and username fields to the profiles table

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update the handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        first_name,
        last_name,
        date_of_birth,
        username
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
        NEW.raw_user_meta_data->>'username'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add constraint to ensure username is not empty if provided
ALTER TABLE public.profiles 
ADD CONSTRAINT check_username_not_empty 
CHECK (username IS NULL OR LENGTH(TRIM(username)) > 0);

-- Add constraint to ensure date_of_birth is not in the future
ALTER TABLE public.profiles 
ADD CONSTRAINT check_date_of_birth_not_future 
CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE);

-- Add constraint to ensure user is at least 18 years old
ALTER TABLE public.profiles 
ADD CONSTRAINT check_user_age_18_plus 
CHECK (date_of_birth IS NULL OR date_of_birth <= (CURRENT_DATE - INTERVAL '18 years'));
