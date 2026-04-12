-- Contact Messages table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  message    text        NOT NULL,
  read       boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (re-runnable)
DROP POLICY IF EXISTS "anyone can insert contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "auth read contact_messages"         ON contact_messages;
DROP POLICY IF EXISTS "auth update contact_messages"       ON contact_messages;
DROP POLICY IF EXISTS "auth delete contact_messages"       ON contact_messages;

CREATE POLICY "anyone can insert contact_messages"
  ON contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "admin read contact_messages"
  ON contact_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "admin update contact_messages"
  ON contact_messages FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin delete contact_messages"
  ON contact_messages FOR DELETE
  USING (public.is_admin());
