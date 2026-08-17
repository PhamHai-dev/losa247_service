-- DropForeignKey
ALTER TABLE `chat_messages` DROP FOREIGN KEY `chat_messages_session_id_fkey`;

-- DropIndex
DROP INDEX `chat_messages_session_id_created_at_idx` ON `chat_messages`;

-- DropIndex
DROP INDEX `chat_sessions_status_updated_at_idx` ON `chat_sessions`;

-- AlterTable
ALTER TABLE `chat_messages` ADD COLUMN `batch_id` VARCHAR(24) NULL,
    ADD COLUMN `client_message_id` VARCHAR(64) NULL,
    ADD COLUMN `message_type` VARCHAR(24) NOT NULL DEFAULT 'text',
    ADD COLUMN `metadata` JSON NULL,
    ADD COLUMN `processed_at` DATETIME(3) NULL,
    ADD COLUMN `reply_to_id` VARCHAR(24) NULL,
    ADD COLUMN `status` VARCHAR(24) NOT NULL DEFAULT 'sent';

-- AlterTable
ALTER TABLE `chat_sessions` ADD COLUMN `automation_status` ENUM('idle', 'debouncing', 'queued', 'processing', 'failed') NOT NULL DEFAULT 'idle',
    ADD COLUMN `bot_resumed_at` DATETIME(3) NULL,
    ADD COLUMN `channel` VARCHAR(24) NOT NULL DEFAULT 'web',
    ADD COLUMN `closed_at` DATETIME(3) NULL,
    ADD COLUMN `context` JSON NULL,
    ADD COLUMN `handoff_at` DATETIME(3) NULL,
    ADD COLUMN `last_customer_message_at` DATETIME(3) NULL,
    ADD COLUMN `last_reply_at` DATETIME(3) NULL,
    ADD COLUMN `summary` LONGTEXT NULL,
    ADD COLUMN `version` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    ADD COLUMN `visitor_id` VARCHAR(64) NULL;

-- AlterTable
ALTER TABLE `leads` ADD COLUMN `chat_session_id` VARCHAR(24) NULL,
    ADD COLUMN `detected_by` VARCHAR(16) NULL,
    ADD COLUMN `email_normalized` VARCHAR(320) NULL,
    ADD COLUMN `phone_normalized` VARCHAR(32) NULL,
    ADD COLUMN `score` TINYINT UNSIGNED NULL,
    ADD COLUMN `source_message_id` VARCHAR(24) NULL,
    ADD COLUMN `temperature` VARCHAR(16) NULL;

-- CreateTable
CREATE TABLE `chat_batches` (
    `id` VARCHAR(24) NOT NULL,
    `session_id` VARCHAR(24) NOT NULL,
    `session_version` INTEGER UNSIGNED NOT NULL,
    `event_id` VARCHAR(64) NOT NULL,
    `status` ENUM('pending', 'queued', 'processing', 'completed', 'failed', 'ignored') NOT NULL DEFAULT 'pending',
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `last_error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `chat_batches_event_id_key`(`event_id`),
    INDEX `chat_batches_session_id_status_created_at_idx`(`session_id`, `status`, `created_at`),
    INDEX `chat_batches_status_updated_at_idx`(`status`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_attachments` (
    `id` VARCHAR(24) NOT NULL,
    `session_id` VARCHAR(24) NOT NULL,
    `message_id` VARCHAR(24) NULL,
    `provider` VARCHAR(32) NOT NULL DEFAULT 'cloudinary',
    `public_id` VARCHAR(500) NOT NULL,
    `resource_type` VARCHAR(32) NOT NULL DEFAULT 'image',
    `delivery_type` VARCHAR(32) NOT NULL DEFAULT 'authenticated',
    `format` VARCHAR(32) NULL,
    `original_name` VARCHAR(500) NULL,
    `mime_type` VARCHAR(120) NOT NULL,
    `size` BIGINT UNSIGNED NOT NULL,
    `sha256` CHAR(64) NOT NULL,
    `width` INTEGER UNSIGNED NULL,
    `height` INTEGER UNSIGNED NULL,
    `scan_status` VARCHAR(24) NOT NULL DEFAULT 'pending',
    `vision_status` VARCHAR(24) NOT NULL DEFAULT 'pending',
    `vision_result` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `chat_attachments_public_id_key`(`public_id`),
    INDEX `chat_attachments_session_id_created_at_idx`(`session_id`, `created_at`),
    INDEX `chat_attachments_message_id_idx`(`message_id`),
    INDEX `chat_attachments_sha256_idx`(`sha256`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_handoffs` (
    `id` VARCHAR(24) NOT NULL,
    `session_id` VARCHAR(24) NOT NULL,
    `from_mode` ENUM('bot', 'human') NOT NULL,
    `to_mode` ENUM('bot', 'human') NOT NULL,
    `from_version` INTEGER UNSIGNED NOT NULL,
    `to_version` INTEGER UNSIGNED NOT NULL,
    `reason` VARCHAR(64) NOT NULL,
    `actor_type` VARCHAR(24) NOT NULL,
    `actor_id` VARCHAR(24) NULL,
    `note` TEXT NULL,
    `metadata` JSON NULL,
    `ended_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_handoffs_session_id_created_at_idx`(`session_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `automation_outbox` (
    `id` VARCHAR(24) NOT NULL,
    `event_id` VARCHAR(64) NOT NULL,
    `event_type` VARCHAR(100) NOT NULL,
    `aggregate_type` VARCHAR(64) NOT NULL,
    `aggregate_id` VARCHAR(64) NOT NULL,
    `session_id` VARCHAR(24) NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('pending', 'dispatching', 'dispatched', 'failed') NOT NULL DEFAULT 'pending',
    `attempts` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `available_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `locked_at` DATETIME(3) NULL,
    `locked_by` VARCHAR(100) NULL,
    `last_error` TEXT NULL,
    `dispatched_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `automation_outbox_event_id_key`(`event_id`),
    INDEX `automation_outbox_status_available_at_created_at_idx`(`status`, `available_at`, `created_at`),
    INDEX `automation_outbox_session_id_created_at_idx`(`session_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_inbox` (
    `id` VARCHAR(24) NOT NULL,
    `event_id` VARCHAR(64) NOT NULL,
    `correlation_id` VARCHAR(64) NULL,
    `direction` VARCHAR(16) NOT NULL,
    `command` VARCHAR(100) NOT NULL,
    `status` ENUM('processing', 'completed', 'failed') NOT NULL DEFAULT 'processing',
    `response_code` INTEGER NULL,
    `response_body` JSON NULL,
    `last_error` TEXT NULL,
    `received_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,

    UNIQUE INDEX `webhook_inbox_event_id_key`(`event_id`),
    INDEX `webhook_inbox_correlation_id_idx`(`correlation_id`),
    INDEX `webhook_inbox_status_received_at_idx`(`status`, `received_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `chat_messages_session_id_created_at_id_idx` ON `chat_messages`(`session_id`, `created_at`, `id`);

-- CreateIndex
CREATE INDEX `chat_messages_session_id_batch_id_sender_created_at_id_idx` ON `chat_messages`(`session_id`, `batch_id`, `sender`, `created_at`, `id`);

-- CreateIndex
CREATE INDEX `chat_messages_batch_id_created_at_idx` ON `chat_messages`(`batch_id`, `created_at`);

-- CreateIndex
CREATE UNIQUE INDEX `chat_messages_session_id_client_message_id_key` ON `chat_messages`(`session_id`, `client_message_id`);

-- CreateIndex
CREATE INDEX `chat_sessions_status_last_message_at_idx` ON `chat_sessions`(`status`, `last_message_at`);

-- CreateIndex
CREATE INDEX `chat_sessions_customer_id_status_idx` ON `chat_sessions`(`customer_id`, `status`);

-- CreateIndex
CREATE INDEX `chat_sessions_visitor_id_status_idx` ON `chat_sessions`(`visitor_id`, `status`);

-- CreateIndex
CREATE INDEX `chat_sessions_mode_automation_status_updated_at_idx` ON `chat_sessions`(`mode`, `automation_status`, `updated_at`);

-- CreateIndex
CREATE INDEX `leads_phone_normalized_idx` ON `leads`(`phone_normalized`);

-- CreateIndex
CREATE INDEX `leads_email_normalized_idx` ON `leads`(`email_normalized`);

-- CreateIndex
CREATE INDEX `leads_chat_session_id_idx` ON `leads`(`chat_session_id`);

-- CreateIndex
CREATE INDEX `leads_source_message_id_idx` ON `leads`(`source_message_id`);

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `chat_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_batches` ADD CONSTRAINT `chat_batches_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_attachments` ADD CONSTRAINT `chat_attachments_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_attachments` ADD CONSTRAINT `chat_attachments_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_handoffs` ADD CONSTRAINT `chat_handoffs_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `automation_outbox` ADD CONSTRAINT `automation_outbox_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
