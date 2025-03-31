
-- Create a new storage bucket for course assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true);

-- Allow any authenticated user to upload files to the course-assets bucket
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Allow authenticated users to upload',
  '(auth.role() = ''authenticated'')',
  'course-assets'
);
