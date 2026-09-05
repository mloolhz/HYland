/** 활동명 대조 시 무시할 구분 문자 (공백·가운뎃점·각종 하이픈) */
const ACTIVITY_NOISE = [" ", "·", "・", "-", "–", "—"];

/**
 * 종목명·활동명 대조용 키.
 * "수련·단체 활동"(프론트)과 "수련단체활동"(수집 데이터)을 같게 본다.
 * 백엔드 src/leisure.ts 의 activityKey 와 같은 규칙이어야 한다.
 */
export function activityKey(name: string): string {
  return ACTIVITY_NOISE.reduce((acc, ch) => acc.split(ch).join(""), name);
}
