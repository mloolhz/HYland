-- AlterTable
ALTER TABLE `community_posts` ADD COLUMN `analyzed_at` DATETIME(3) NULL,
    ADD COLUMN `analyzed_by` VARCHAR(191) NULL,
    ADD COLUMN `highlight` TEXT NULL,
    ADD COLUMN `mentioned_activities` JSON NULL,
    ADD COLUMN `sentiment` VARCHAR(191) NULL,
    ADD COLUMN `sentiment_score` INTEGER NULL;
