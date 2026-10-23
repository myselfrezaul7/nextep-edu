-- ==============================================================================
-- NexTep Edu: Supabase Production Schema, Indexes & Security Policies
-- Idempotent setup for public.applications table and storage.buckets.documents
-- ==============================================================================

-- 1. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    email VARCHAR(255),
    destination VARCHAR(100),
    current_step INT NOT NULL DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 7),
    notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Performance & Query Optimization Indexes
-- Fast lookup by tracking code (Tracker page, document uploads, Realtime channels)
CREATE INDEX IF NOT EXISTS idx_applications_tracking_code 
    ON public.applications (tracking_code);

-- Fast lookup by phone number (Duplicate check during registration & student login)
CREATE INDEX IF NOT EXISTS idx_applications_phone 
    ON public.applications (phone);

-- Combined index for 24-hour rate limiting across serverless instances
CREATE INDEX IF NOT EXISTS idx_applications_email_created 
    ON public.applications (lower(email), created_at DESC);

-- Composite index for admin pagination, step filtering, and sorting
CREATE INDEX IF NOT EXISTS idx_applications_step_updated 
    ON public.applications (current_step, updated_at DESC);

-- Index for newest/oldest global sort order
CREATE INDEX IF NOT EXISTS idx_applications_updated_at 
    ON public.applications (updated_at DESC);

-- 3. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_applications_updated_at ON public.applications;
CREATE TRIGGER set_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security (RLS)
-- Applications table contains student PII (phone, email, consultation notes).
-- All access is mediated securely through Next.js server route handlers using the service role key.
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Allow full access to service_role (used by Next.js API routes)
DROP POLICY IF EXISTS "Service role full access on applications" ON public.applications;
CREATE POLICY "Service role full access on applications"
    ON public.applications
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Explicitly deny direct anon/public table access to prevent data scraping
DROP POLICY IF EXISTS "Deny direct public table reads" ON public.applications;
CREATE POLICY "Deny direct public table reads"
    ON public.applications
    FOR SELECT
    TO anon
    USING (false);

DROP POLICY IF EXISTS "Deny direct public table mutations" ON public.applications;
CREATE POLICY "Deny direct public table mutations"
    ON public.applications
    FOR INSERT
    TO anon
    WITH CHECK (false);

-- 5. Storage Bucket Configuration (Private Documents Bucket)
-- Bucket: documents (5 MB per file, allowed: PDF, JPG, PNG)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    5242880,
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

-- Storage RLS: Ensure service_role can manage all documents
DROP POLICY IF EXISTS "Service role access on documents bucket" ON storage.objects;
CREATE POLICY "Service role access on documents bucket"
    ON storage.objects
    FOR ALL
    TO service_role
    USING (bucket_id = 'documents')
    WITH CHECK (bucket_id = 'documents');
