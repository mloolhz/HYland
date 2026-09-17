-- 미션 인증 검수
--
-- 유저가 커뮤니티 인증샷을 올리며 미션을 지정해 제출하면 관리자가 사진을 보고
-- 승인/반려한다. 승인 시 미션 진행도가 오르고 목표를 채우면 배지가 지급된다.
-- 같은 글로 같은 미션을 두 번 제출하지 못하도록 (post_id, quest_id) 유니크.

-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `mission_submissions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `quest_id` INTEGER NOT NULL,
    `post_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `review_note` TEXT NULL,
    `reviewed_by` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mission_submissions_status_created_at_idx`(`status`, `created_at`),
    INDEX `mission_submissions_user_id_idx`(`user_id`),
    UNIQUE INDEX `mission_submissions_post_id_quest_id_key`(`post_id`, `quest_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mission_submissions` ADD CONSTRAINT `mission_submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_submissions` ADD CONSTRAINT `mission_submissions_quest_id_fkey` FOREIGN KEY (`quest_id`) REFERENCES `mission_quests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_submissions` ADD CONSTRAINT `mission_submissions_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_submissions` ADD CONSTRAINT `mission_submissions_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

