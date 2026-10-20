-- Forward-only cleanup for the retired ak_id profile field.
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS ak_id;
