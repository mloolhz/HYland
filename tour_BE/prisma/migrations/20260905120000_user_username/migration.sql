-- 로그인 아이디(username) 추가 + 이메일을 선택 입력으로
--
-- 프론트 로그인/회원가입 폼이 이메일이 아니라 "아이디"를 받고, 이메일은 선택
-- 항목이다. 백엔드가 이메일로만 로그인하도록 되어 있어 폼과 맞지 않았다.
--
-- 기존 계정 7건은 전부 테스트용이라 이메일 로컬파트를 아이디로 채운다.
-- (test@hyland.kr → test) 로컬파트가 서로 겹치지 않는 것을 확인했다.

-- 1) 먼저 NULL 허용으로 추가하고
ALTER TABLE `users` ADD COLUMN `username` VARCHAR(191) NULL;

-- 2) 기존 행을 채운 뒤
UPDATE `users` SET `username` = SUBSTRING_INDEX(`email`, '@', 1) WHERE `username` IS NULL;

-- 3) NOT NULL + UNIQUE 로 조인다
ALTER TABLE `users` MODIFY COLUMN `username` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

-- 4) 이메일은 선택 입력이므로 NULL 허용으로 바꾼다
--    (MySQL 은 UNIQUE 인덱스에 NULL 을 여러 개 허용하므로 기존 인덱스는 그대로 둔다)
ALTER TABLE `users` MODIFY COLUMN `email` VARCHAR(191) NULL;
