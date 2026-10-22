BEGIN;

-- 1. Add the ownership columns
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE gmail_tokens
    ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;

-- 2. Backfill existing rows to the first registered user.
--    Change this if the data belongs to someone else.
UPDATE applications SET user_id = (SELECT MIN(id) FROM users) WHERE user_id IS NULL;
UPDATE gmail_tokens SET user_id = (SELECT MIN(id) FROM users) WHERE user_id IS NULL;

-- 3. Make ownership mandatory
ALTER TABLE applications ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE gmail_tokens ALTER COLUMN user_id SET NOT NULL;

-- 4. One Gmail connection per user (the callback uses ON CONFLICT (user_id))
ALTER TABLE gmail_tokens DROP CONSTRAINT IF EXISTS gmail_tokens_user_id_key;
ALTER TABLE gmail_tokens ADD CONSTRAINT gmail_tokens_user_id_key UNIQUE (user_id);

-- 5. Dedupe synced emails per user (the sync uses ON CONFLICT (user_id, gmail_message_id))
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_gmail_message_id_key;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_user_gmail_key;
ALTER TABLE applications
    ADD CONSTRAINT applications_user_gmail_key UNIQUE (user_id, gmail_message_id);

-- 6. Every query filters by user_id, so index it
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);

COMMIT;