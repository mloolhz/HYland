-- 알림
--
-- 내 글에 댓글·답글·좋아요가 달리거나, 인증이 승인/반려되거나, 배지를 받으면 쌓인다.
-- actor 는 닉네임을 값으로 저장한다. 계정이 지워져도 문구가 남아야 하기 때문이다.

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('COMMENT', 'REPLY', 'LIKE', 'BADGE', 'REVIEW', 'NOTICE') NOT NULL,
    `actor` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `highlight` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_read_idx`(`user_id`, `read`),
    INDEX `notifications_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

