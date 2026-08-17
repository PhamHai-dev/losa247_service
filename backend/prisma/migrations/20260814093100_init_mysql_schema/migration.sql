-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(24) NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `permissions` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(24) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(320) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'customer',
    `status` ENUM('active', 'locked') NOT NULL DEFAULT 'active',
    `avatar_url` VARCHAR(2048) NULL,
    `reset_password_token` VARCHAR(255) NULL,
    `reset_password_expires` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_sessions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(24) NOT NULL,
    `token_hash` VARCHAR(255) NOT NULL,
    `jti` VARCHAR(255) NOT NULL,
    `family_id` VARCHAR(255) NOT NULL,
    `audience` ENUM('admin', 'client') NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_agent` VARCHAR(1024) NULL,
    `ip` VARCHAR(64) NULL,

    INDEX `refresh_sessions_expires_at_idx`(`expires_at`),
    INDEX `refresh_sessions_user_id_family_id_idx`(`user_id`, `family_id`),
    UNIQUE INDEX `refresh_sessions_user_id_token_hash_key`(`user_id`, `token_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leads` (
    `id` VARCHAR(24) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(32) NOT NULL,
    `email` VARCHAR(320) NULL,
    `source` ENUM('form', 'chat', 'facebook', 'zalo', 'other') NOT NULL,
    `status` ENUM('new', 'contacted', 'qualified', 'converted', 'lost') NOT NULL DEFAULT 'new',
    `notes` JSON NOT NULL,
    `assigned_to_id` VARCHAR(24) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leads_status_created_at_idx`(`status`, `created_at`),
    INDEX `leads_assigned_to_id_idx`(`assigned_to_id`),
    INDEX `leads_source_idx`(`source`),
    INDEX `leads_phone_idx`(`phone`),
    INDEX `leads_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_categories` (
    `id` VARCHAR(24) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_tags` (
    `id` VARCHAR(24) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_tags_name_key`(`name`),
    UNIQUE INDEX `blog_tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blogs` (
    `id` VARCHAR(24) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NULL,
    `meta_description` TEXT NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `allow_comments` BOOLEAN NOT NULL DEFAULT true,
    `allow_indexing` BOOLEAN NOT NULL DEFAULT true,
    `show_toc` BOOLEAN NOT NULL DEFAULT true,
    `content` LONGTEXT NOT NULL,
    `cover_image_url` VARCHAR(2048) NULL,
    `category_id` VARCHAR(24) NULL,
    `status` ENUM('draft', 'pending', 'published', 'rejected') NOT NULL DEFAULT 'draft',
    `source` ENUM('writer', 'other') NOT NULL DEFAULT 'writer',
    `published_at` DATETIME(3) NULL,
    `author_id` VARCHAR(24) NULL,
    `views` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blogs_slug_key`(`slug`),
    INDEX `blogs_status_published_at_idx`(`status`, `published_at`),
    INDEX `blogs_category_id_idx`(`category_id`),
    INDEX `blogs_author_id_idx`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_tag_relations` (
    `blog_id` VARCHAR(24) NOT NULL,
    `tag_id` VARCHAR(24) NOT NULL,

    INDEX `blog_tag_relations_tag_id_idx`(`tag_id`),
    PRIMARY KEY (`blog_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_sessions` (
    `id` VARCHAR(24) NOT NULL,
    `customer_name` VARCHAR(255) NULL,
    `customer_phone` VARCHAR(32) NULL,
    `customer_id` VARCHAR(24) NULL,
    `mode` ENUM('bot', 'human') NOT NULL DEFAULT 'bot',
    `status` ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    `assigned_admin_id` VARCHAR(24) NULL,
    `last_message_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `chat_sessions_status_updated_at_idx`(`status`, `updated_at`),
    INDEX `chat_sessions_customer_id_idx`(`customer_id`),
    INDEX `chat_sessions_assigned_admin_id_idx`(`assigned_admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` VARCHAR(24) NOT NULL,
    `session_id` VARCHAR(24) NOT NULL,
    `sender` ENUM('customer', 'bot', 'admin') NOT NULL,
    `content` LONGTEXT NOT NULL,
    `attachments` JSON NOT NULL,
    `feedback` ENUM('up', 'down') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_messages_session_id_created_at_idx`(`session_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqs` (
    `id` VARCHAR(24) NOT NULL,
    `question` VARCHAR(300) NOT NULL,
    `answer` TEXT NOT NULL,
    `page` ENUM('home', 'solutions', 'pricing', 'blog') NOT NULL DEFAULT 'home',
    `category_id` VARCHAR(24) NULL,
    `service_detail` ENUM('chatbot', 'crm', 'marketing') NULL,
    `order` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `faqs_page_service_detail_order_created_at_idx`(`page`, `service_detail`, `order`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing_plans` (
    `id` VARCHAR(24) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `price_amount` BIGINT NULL,
    `price_label` VARCHAR(120) NOT NULL DEFAULT '',
    `subtitle` JSON NOT NULL,
    `badge` VARCHAR(80) NOT NULL DEFAULT '',
    `button_text` VARCHAR(80) NOT NULL DEFAULT '',
    `order` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pricing_plans_is_active_order_created_at_idx`(`is_active`, `order`, `created_at`),
    INDEX `pricing_plans_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing_plan_features` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `plan_id` VARCHAR(24) NOT NULL,
    `content` TEXT NOT NULL,
    `sort_order` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `pricing_plan_features_plan_id_sort_order_key`(`plan_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing_comparisons` (
    `id` VARCHAR(24) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `values` JSON NOT NULL,
    `order` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pricing_comparisons_order_created_at_idx`(`order`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(24) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('lead', 'alert', 'system') NOT NULL DEFAULT 'alert',
    `link` VARCHAR(2048) NOT NULL DEFAULT '',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `recipient_id` VARCHAR(24) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_recipient_id_is_read_created_at_idx`(`recipient_id`, `is_read`, `created_at`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `id` VARCHAR(24) NOT NULL,
    `actor_id` VARCHAR(24) NULL,
    `action` VARCHAR(255) NOT NULL,
    `module` VARCHAR(255) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `payload` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `logs_actor_id_created_at_idx`(`actor_id`, `created_at`),
    INDEX `logs_action_created_at_idx`(`action`, `created_at`),
    INDEX `logs_module_created_at_idx`(`module`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(24) NOT NULL,
    `theme_mode` ENUM('light', 'dark') NOT NULL DEFAULT 'light',
    `accent_color` VARCHAR(32) NOT NULL DEFAULT '#0284C7',
    `site_name` VARCHAR(255) NULL,
    `slogan` VARCHAR(500) NULL,
    `logo_url` VARCHAR(2048) NULL,
    `favicon_url` VARCHAR(2048) NULL,
    `hotline` VARCHAR(32) NULL,
    `email` VARCHAR(320) NULL,
    `address` VARCHAR(1000) NULL,
    `facebook_url` VARCHAR(2048) NULL,
    `zalo_url` VARCHAR(2048) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_configs` (
    `id` VARCHAR(24) NOT NULL,
    `provider` ENUM('facebook', 'zalo', 'anthropic', 'openai', 'n8n') NOT NULL,
    `api_key` TEXT NULL,
    `extra` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `api_configs_provider_key`(`provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_fkey` FOREIGN KEY (`role`) REFERENCES `roles`(`name`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_sessions` ADD CONSTRAINT `refresh_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogs` ADD CONSTRAINT `blogs_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blogs` ADD CONSTRAINT `blogs_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_tag_relations` ADD CONSTRAINT `blog_tag_relations_blog_id_fkey` FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_tag_relations` ADD CONSTRAINT `blog_tag_relations_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_sessions` ADD CONSTRAINT `chat_sessions_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_sessions` ADD CONSTRAINT `chat_sessions_assigned_admin_id_fkey` FOREIGN KEY (`assigned_admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pricing_plan_features` ADD CONSTRAINT `pricing_plan_features_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `pricing_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
