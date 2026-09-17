-- 커뮤니티 신고
--
-- 글·댓글 중 하나만 가리키므로 post_id·comment_id 는 둘 다 NULL 을 허용한다.
-- 대상이 지워지면 신고도 함께 사라진다 (ON DELETE CASCADE).

CREATE TABLE `reports` (
  `id`          VARCHAR(191) NOT NULL,
  `target`      ENUM('POST', 'COMMENT') NOT NULL,
  `post_id`     VARCHAR(191) NULL,
  `comment_id`  VARCHAR(191) NULL,
  `reporter_id` VARCHAR(191) NOT NULL,
  `reason`      VARCHAR(191) NOT NULL,
  `detail`      TEXT NULL,
  `status`      ENUM('PENDING', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
  `handled_by`  VARCHAR(191) NULL,
  `handled_at`  DATETIME(3) NULL,
  `handle_note` TEXT NULL,
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `reports_status_created_at_idx`(`status`, `created_at`),
  INDEX `reports_post_id_idx`(`post_id`),
  INDEX `reports_comment_id_idx`(`comment_id`),
  INDEX `reports_reporter_id_idx`(`reporter_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `reports` ADD CONSTRAINT `reports_post_id_fkey`
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reports` ADD CONSTRAINT `reports_comment_id_fkey`
  FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reports` ADD CONSTRAINT `reports_reporter_id_fkey`
  FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reports` ADD CONSTRAINT `reports_handled_by_fkey`
  FOREIGN KEY (`handled_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
