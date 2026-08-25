-- Create translation tables before removing legacy content columns.
CREATE TABLE `blog_category_translations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` VARCHAR(24) NOT NULL,
  `locale` ENUM('vi', 'en') NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `blog_category_translations_category_id_locale_key` (`category_id`, `locale`),
  UNIQUE INDEX `blog_category_translations_locale_slug_key` (`locale`, `slug`),
  INDEX `blog_category_translations_locale_name_idx` (`locale`, `name`),
  CONSTRAINT `blog_category_translations_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `blog_tag_translations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, `tag_id` VARCHAR(24) NOT NULL,
  `locale` ENUM('vi', 'en') NOT NULL, `name` VARCHAR(255) NOT NULL, `slug` VARCHAR(255) NOT NULL,
  `description` TEXT NULL, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE INDEX `blog_tag_translations_tag_id_locale_key` (`tag_id`, `locale`),
  UNIQUE INDEX `blog_tag_translations_locale_slug_key` (`locale`, `slug`), INDEX `blog_tag_translations_locale_name_idx` (`locale`, `name`),
  CONSTRAINT `blog_tag_translations_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `blog_translations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, `blog_id` VARCHAR(24) NOT NULL, `locale` ENUM('vi', 'en') NOT NULL,
  `title` VARCHAR(500) NOT NULL, `slug` VARCHAR(255) NOT NULL, `excerpt` TEXT NULL, `meta_description` TEXT NULL,
  `content` LONGTEXT NOT NULL, `status` ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME(3) NULL, `allow_indexing` BOOLEAN NOT NULL DEFAULT true, `show_toc` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE INDEX `blog_translations_blog_id_locale_key` (`blog_id`, `locale`),
  UNIQUE INDEX `blog_translations_locale_slug_key` (`locale`, `slug`), INDEX `blog_translations_locale_status_published_at_idx` (`locale`, `status`, `published_at`),
  INDEX `blog_translations_locale_title_idx` (`locale`, `title`), CONSTRAINT `blog_translations_blog_id_fkey` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO `blog_category_translations` (`category_id`, `locale`, `name`, `slug`, `created_at`, `updated_at`) SELECT `id`, 'vi', `name`, `slug`, `created_at`, `updated_at` FROM `blog_categories`;
INSERT INTO `blog_tag_translations` (`tag_id`, `locale`, `name`, `slug`, `description`, `created_at`, `updated_at`) SELECT `id`, 'vi', `name`, `slug`, `description`, `created_at`, `updated_at` FROM `blog_tags`;
INSERT INTO `blog_translations` (`blog_id`, `locale`, `title`, `slug`, `excerpt`, `meta_description`, `content`, `status`, `published_at`, `allow_indexing`, `show_toc`, `created_at`, `updated_at`)
SELECT `id`, 'vi', `title`, `slug`, `excerpt`, `meta_description`, `content`, CASE WHEN `status` = 'published' THEN 'published' ELSE 'draft' END,
CASE WHEN `status` = 'published' THEN COALESCE(`published_at`, `created_at`) ELSE NULL END, `allow_indexing`, `show_toc`, `created_at`, `updated_at` FROM `blogs`;
ALTER TABLE `blogs` DROP INDEX `blogs_slug_key`, DROP INDEX `blogs_status_published_at_idx`;
ALTER TABLE `blog_categories` DROP INDEX `blog_categories_slug_key`;
ALTER TABLE `blog_tags` DROP INDEX `blog_tags_name_key`, DROP INDEX `blog_tags_slug_key`;
ALTER TABLE `blogs` DROP COLUMN `title`, DROP COLUMN `slug`, DROP COLUMN `excerpt`, DROP COLUMN `meta_description`, DROP COLUMN `allow_indexing`, DROP COLUMN `show_toc`, DROP COLUMN `content`, DROP COLUMN `status`, DROP COLUMN `published_at`;
ALTER TABLE `blog_categories` DROP COLUMN `name`, DROP COLUMN `slug`;
ALTER TABLE `blog_tags` DROP COLUMN `name`, DROP COLUMN `slug`, DROP COLUMN `description`;
