-- Add cycle counters used to enforce AI context limits without deleting chat history.
ALTER TABLE `chat_sessions`
  ADD COLUMN `bot_cycle` INTEGER UNSIGNED NOT NULL DEFAULT 1,
  ADD COLUMN `bot_cycle_started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `cycle_customer_message_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN `cycle_customer_units` INTEGER UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN `cycle_limit_reached_at` DATETIME(3) NULL;

ALTER TABLE `chat_messages`
  ADD COLUMN `bot_cycle` INTEGER UNSIGNED NOT NULL DEFAULT 1;

ALTER TABLE `chat_batches`
  ADD COLUMN `bot_cycle` INTEGER UNSIGNED NOT NULL DEFAULT 1;
