-- Support private local filesystem attachments while preserving legacy Cloudinary rows.
ALTER TABLE `chat_attachments`
  MODIFY COLUMN `provider` VARCHAR(32) NOT NULL DEFAULT 'local',
  MODIFY COLUMN `public_id` VARCHAR(500) NULL,
  MODIFY COLUMN `delivery_type` VARCHAR(32) NOT NULL DEFAULT 'private',
  ADD COLUMN `storage_path` VARCHAR(700) NULL;

CREATE UNIQUE INDEX `chat_attachments_storage_path_key` ON `chat_attachments`(`storage_path`);
