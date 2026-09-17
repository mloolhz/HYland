-- 홈페이지·예약 주소가 191자를 넘는 경우가 있다 (관광공사 상세 URL 등)
ALTER TABLE `leisure_sports` MODIFY `reservation_url` TEXT NULL;
