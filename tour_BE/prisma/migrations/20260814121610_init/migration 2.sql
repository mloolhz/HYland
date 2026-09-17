-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oauth_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_uid` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `oauth_accounts_provider_provider_uid_key`(`provider`, `provider_uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `phone_verifications_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `user_id` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `level` INTEGER NOT NULL DEFAULT 1,
    `level_title` VARCHAR(191) NOT NULL DEFAULT '새싹 탐험가',
    `exp_current` INTEGER NOT NULL DEFAULT 0,
    `exp_max` INTEGER NOT NULL DEFAULT 1000,
    `bti` VARCHAR(191) NULL,
    `character_id` VARCHAR(191) NULL,
    `passport_avatar` VARCHAR(191) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `user_id` VARCHAR(191) NOT NULL,
    `notifications_on` BOOLEAN NOT NULL DEFAULT true,
    `marketing_opt_in` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `island_regions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `islands` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `region_id` VARCHAR(191) NULL,
    `intro` TEXT NOT NULL,
    `ferry_route` VARCHAR(191) NOT NULL,
    `travel_time` VARCHAR(191) NOT NULL,
    `booking_label` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `island_leisure_courses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `island_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sport_categories` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sports` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `pay` BOOLEAN NOT NULL DEFAULT true,
    `photo` VARCHAR(191) NULL,
    `difficulty` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `season` VARCHAR(191) NOT NULL,
    `reservation_type` ENUM('RESERVABLE', 'FREE', 'COMMUNITY', 'INFO', 'MIXED') NOT NULL DEFAULT 'INFO',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sport_islands` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sport_id` VARCHAR(191) NOT NULL,
    `island_id` VARCHAR(191) NULL,
    `display_name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sport_booking_methods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sport_id` VARCHAR(191) NOT NULL,
    `type` ENUM('OFFICIAL', 'FACILITY', 'PHONE', 'INFO') NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mission_categories` (
    `id` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `color_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mission_quests` (
    `id` INTEGER NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `target` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `reward` VARCHAR(191) NOT NULL,
    `tier` ENUM('COMMON', 'RARE', 'LEGEND') NOT NULL DEFAULT 'COMMON',
    `island_id` VARCHAR(191) NULL,
    `sport_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badge_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PASSPORT', 'ISLAND', 'MISSION') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `island_id` VARCHAR(191) NULL,
    `tier` ENUM('COMMON', 'RARE', 'LEGEND') NULL,
    `condition` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `island_stamp_meta` (
    `island_id` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `scene` VARCHAR(191) NULL,
    `activity` VARCHAR(191) NOT NULL,
    `rotate` DOUBLE NOT NULL DEFAULT 0,
    `image_url` VARCHAR(191) NULL,

    PRIMARY KEY (`island_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile_characters` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `island_bti_questions` (
    `id` INTEGER NOT NULL,
    `dimension` ENUM('AB', 'WL', 'CI', 'PF') NOT NULL,
    `text` TEXT NOT NULL,
    `option_a` TEXT NOT NULL,
    `option_b` TEXT NOT NULL,
    `axis_a` VARCHAR(191) NOT NULL,
    `axis_b` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `island_bti_results` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `theme_color` VARCHAR(191) NOT NULL,
    `recommended_islands` JSON NOT NULL,
    `recommended_activities` JSON NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_island_visits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `island_id` VARCHAR(191) NOT NULL,
    `visited_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_island_visits_user_id_island_id_key`(`user_id`, `island_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_mission_progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `quest_id` INTEGER NOT NULL,
    `current` INTEGER NOT NULL DEFAULT 0,
    `completed_at` DATETIME(3) NULL,

    UNIQUE INDEX `user_mission_progress_user_id_quest_id_key`(`user_id`, `quest_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_badges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `badge_id` VARCHAR(191) NOT NULL,
    `acquired_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_badges_user_id_badge_id_key`(`user_id`, `badge_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_island_bti_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `result_code` VARCHAR(191) NOT NULL,
    `scores` JSON NOT NULL,
    `tested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_island_bti_results_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_spots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content_id` VARCHAR(191) NOT NULL,
    `content_type` ENUM('LEPORTS', 'SPOT', 'FOOD', 'STAY', 'CULTURE') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `addr` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NULL,
    `homepage` TEXT NULL,
    `image_url` VARCHAR(191) NULL,
    `thumbnail` VARCHAR(191) NULL,
    `mapx` DOUBLE NULL,
    `mapy` DOUBLE NULL,
    `island_id` VARCHAR(191) NULL,
    `synced_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tour_spots_content_id_key`(`content_id`),
    INDEX `tour_spots_island_id_content_type_idx`(`island_id`, `content_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_spot_sports` (
    `tour_spot_id` INTEGER NOT NULL,
    `sport_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tour_spot_id`, `sport_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `oauth_accounts` ADD CONSTRAINT `oauth_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_character_id_fkey` FOREIGN KEY (`character_id`) REFERENCES `profile_characters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `islands` ADD CONSTRAINT `islands_region_id_fkey` FOREIGN KEY (`region_id`) REFERENCES `island_regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `island_leisure_courses` ADD CONSTRAINT `island_leisure_courses_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sports` ADD CONSTRAINT `sports_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `sport_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sport_islands` ADD CONSTRAINT `sport_islands_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sport_islands` ADD CONSTRAINT `sport_islands_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sport_booking_methods` ADD CONSTRAINT `sport_booking_methods_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_quests` ADD CONSTRAINT `mission_quests_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `mission_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_quests` ADD CONSTRAINT `mission_quests_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mission_quests` ADD CONSTRAINT `mission_quests_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `island_stamp_meta` ADD CONSTRAINT `island_stamp_meta_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_island_visits` ADD CONSTRAINT `user_island_visits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_island_visits` ADD CONSTRAINT `user_island_visits_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mission_progress` ADD CONSTRAINT `user_mission_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mission_progress` ADD CONSTRAINT `user_mission_progress_quest_id_fkey` FOREIGN KEY (`quest_id`) REFERENCES `mission_quests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_badge_id_fkey` FOREIGN KEY (`badge_id`) REFERENCES `badge_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_island_bti_results` ADD CONSTRAINT `user_island_bti_results_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_island_bti_results` ADD CONSTRAINT `user_island_bti_results_result_code_fkey` FOREIGN KEY (`result_code`) REFERENCES `island_bti_results`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_spots` ADD CONSTRAINT `tour_spots_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_spot_sports` ADD CONSTRAINT `tour_spot_sports_tour_spot_id_fkey` FOREIGN KEY (`tour_spot_id`) REFERENCES `tour_spots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_spot_sports` ADD CONSTRAINT `tour_spot_sports_sport_id_fkey` FOREIGN KEY (`sport_id`) REFERENCES `sports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
