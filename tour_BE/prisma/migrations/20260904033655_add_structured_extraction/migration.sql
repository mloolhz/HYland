-- AlterTable
ALTER TABLE `community_posts` ADD COLUMN `best_months` JSON NULL,
    ADD COLUMN `cautions` JSON NULL,
    ADD COLUMN `companion_fit` JSON NULL;
