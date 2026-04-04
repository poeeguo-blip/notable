CREATE TABLE public.note_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own note versions"
  ON public.note_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own note versions"
  ON public.note_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_note_versions_note_id ON public.note_versions(note_id);
CREATE INDEX idx_note_versions_created_at ON public.note_versions(created_at DESC);