-- Add a hashed capability token for session-scoped chat REST/SSE access.
ALTER TABLE `chat_sessions` ADD COLUMN `session_token_hash` CHAR(64) NULL;
