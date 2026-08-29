-- 레저 활동을 enum → 참조 테이블(leisure_activity_types)로 전환
--
-- 활동을 추가할 때마다 enum 변경 = 마이그레이션이 필요하던 구조를 없앤다.
-- 이제 prisma/seed-data/leisure-activities.ts 에 한 줄 추가하고 시드만 돌리면 된다.
--
-- 3개 레저 테이블이 모두 0행인 상태에서 적용하므로 데이터 이관은 없다.
--
-- 주의 1: `prisma migrate diff` 가 만든 SQL 을 그대로 쓰지 않았다. 이미 있는
--   island_leisure_courses FK 를 다시 만들려 하고(중복 오류), leisure_sports 의
--   island_id FK 를 지우기만 하고 복구하지 않는다.
-- 주의 2: (island_id, activity) 복합 인덱스는 island_id FK 가 사용 중이라
--   그대로는 지울 수 없다(MySQL 1553). FK 를 잠시 떼었다가 다시 붙인다.

-- CreateTable
CREATE TABLE `leisure_activity_types` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `leisure_activity_types` ADD CONSTRAINT `leisure_activity_types_category_id_fkey`
    FOREIGN KEY (`category_id`) REFERENCES `sport_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- leisure_sports.activity(enum) → activity_id(FK)
ALTER TABLE `leisure_sports` DROP FOREIGN KEY `leisure_sports_island_id_fkey`;

DROP INDEX `leisure_sports_island_id_activity_idx` ON `leisure_sports`;

ALTER TABLE `leisure_sports` DROP COLUMN `activity`,
    ADD COLUMN `activity_id` VARCHAR(191) NOT NULL;

CREATE INDEX `leisure_sports_island_id_activity_id_idx` ON `leisure_sports`(`island_id`, `activity_id`);

ALTER TABLE `leisure_sports` ADD CONSTRAINT `leisure_sports_island_id_fkey`
    FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `leisure_sports` ADD CONSTRAINT `leisure_sports_activity_id_fkey`
    FOREIGN KEY (`activity_id`) REFERENCES `leisure_activity_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- leisure_candidates.suggested_activity(enum) → suggested_activity_id(FK)
ALTER TABLE `leisure_candidates` DROP COLUMN `suggested_activity`,
    ADD COLUMN `suggested_activity_id` VARCHAR(191) NULL;

ALTER TABLE `leisure_candidates` ADD CONSTRAINT `leisure_candidates_suggested_activity_id_fkey`
    FOREIGN KEY (`suggested_activity_id`) REFERENCES `leisure_activity_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
