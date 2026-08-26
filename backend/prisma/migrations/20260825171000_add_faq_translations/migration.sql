CREATE TABLE `faq_translations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `faq_id` VARCHAR(24) NOT NULL,
  `locale` ENUM('vi', 'en') NOT NULL,
  `question` VARCHAR(300) NOT NULL,
  `answer` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `faq_translations_faq_id_locale_key`(`faq_id`, `locale`),
  INDEX `faq_translations_locale_question_idx`(`locale`, `question`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `faq_translations` (`faq_id`, `locale`, `question`, `answer`, `created_at`, `updated_at`)
SELECT `id`, 'vi', `question`, `answer`, `created_at`, `updated_at` FROM `faqs`;

ALTER TABLE `faq_translations`
  ADD CONSTRAINT `faq_translations_faq_id_fkey`
  FOREIGN KEY (`faq_id`) REFERENCES `faqs`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `faqs`
  DROP COLUMN `question`,
  DROP COLUMN `answer`;
