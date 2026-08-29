-- CreateTable
CREATE TABLE `leisure_sports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `activity` ENUM('KAYAK', 'SURFING', 'CRUISE', 'PADDLE_BOAT', 'TREKKING', 'CYCLING', 'CAMPING', 'BACKPACKING', 'MUDFLAT', 'FISHING', 'PULDEUNG', 'NIGHT_GATHERING', 'ZIPLINE', 'MONORAIL', 'LUGE', 'FOREST_BATH', 'SUNSET', 'SEAL_WATCHING', 'COASTAL_WALK', 'STARGAZING', 'VILLAGE_TOUR', 'SPA', 'GOLF', 'GROUP_TRAINING', 'ETC') NOT NULL,
    `island_id` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `address_level` ENUM('EXACT', 'VILLAGE', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `reservation_url` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `verification` ENUM('UNVERIFIED', 'VERIFIED', 'DUPLICATE', 'MERGED', 'EXCLUDED', 'CLOSED') NOT NULL DEFAULT 'UNVERIFIED',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leisure_sports_island_id_activity_idx`(`island_id`, `activity`),
    INDEX `leisure_sports_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leisure_sport_sources` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leisure_sport_id` INTEGER NOT NULL,
    `source_type` ENUM('TOUR_CONTENT', 'LOCAL_HUB', 'RELATED_TOURISM', 'WEB_RESEARCH', 'MANUAL') NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `source_name` VARCHAR(191) NULL,
    `source_url` TEXT NULL,
    `raw_category` VARCHAR(191) NULL,
    `first_seen_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_seen_at` DATETIME(3) NOT NULL,
    `raw_data` JSON NULL,

    INDEX `leisure_sport_sources_leisure_sport_id_idx`(`leisure_sport_id`),
    UNIQUE INDEX `leisure_sport_sources_source_type_external_id_key`(`source_type`, `external_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leisure_candidates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `source_type` ENUM('TOUR_CONTENT', 'LOCAL_HUB', 'RELATED_TOURISM', 'WEB_RESEARCH', 'MANUAL') NOT NULL,
    `external_id` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `address_level` ENUM('EXACT', 'VILLAGE', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `suggested_activity` ENUM('KAYAK', 'SURFING', 'CRUISE', 'PADDLE_BOAT', 'TREKKING', 'CYCLING', 'CAMPING', 'BACKPACKING', 'MUDFLAT', 'FISHING', 'PULDEUNG', 'NIGHT_GATHERING', 'ZIPLINE', 'MONORAIL', 'LUGE', 'FOREST_BATH', 'SUNSET', 'SEAL_WATCHING', 'COASTAL_WALK', 'STARGAZING', 'VILLAGE_TOUR', 'SPA', 'GOLF', 'GROUP_TRAINING', 'ETC') NULL,
    `suggested_island_id` VARCHAR(191) NULL,
    `verification` ENUM('UNVERIFIED', 'VERIFIED', 'DUPLICATE', 'MERGED', 'EXCLUDED', 'CLOSED') NOT NULL DEFAULT 'UNVERIFIED',
    `review_note` TEXT NULL,
    `raw_data` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `leisure_candidates_suggested_island_id_idx`(`suggested_island_id`),
    UNIQUE INDEX `leisure_candidates_source_type_external_id_key`(`source_type`, `external_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `leisure_sports` ADD CONSTRAINT `leisure_sports_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `sport_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leisure_sports` ADD CONSTRAINT `leisure_sports_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leisure_sport_sources` ADD CONSTRAINT `leisure_sport_sources_leisure_sport_id_fkey` FOREIGN KEY (`leisure_sport_id`) REFERENCES `leisure_sports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
