-- CreateTable
CREATE TABLE `community_posts` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `summary` VARCHAR(191) NULL,
    `island` VARCHAR(191) NOT NULL,
    `activity` VARCHAR(191) NOT NULL,
    `images` JSON NULL,
    `badge` VARCHAR(191) NULL,
    `is_notice` BOOLEAN NOT NULL DEFAULT false,
    `is_resolved` BOOLEAN NULL,
    `author_id` VARCHAR(191) NOT NULL,
    `author_nickname` VARCHAR(191) NOT NULL,
    `author_bti` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `views` INTEGER NOT NULL DEFAULT 0,

    INDEX `community_posts_island_idx`(`island`),
    INDEX `community_posts_activity_idx`(`activity`),
    INDEX `community_posts_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_comments` (
    `id` VARCHAR(191) NOT NULL,
    `post_id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NULL,
    `author_id` VARCHAR(191) NOT NULL,
    `author_nickname` VARCHAR(191) NOT NULL,
    `author_bti` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `is_author` BOOLEAN NOT NULL DEFAULT false,

    INDEX `community_comments_post_id_idx`(`post_id`),
    INDEX `community_comments_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `community_comments` ADD CONSTRAINT `community_comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_comments` ADD CONSTRAINT `community_comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `community_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
