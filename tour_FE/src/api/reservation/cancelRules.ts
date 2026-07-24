/** 이용일까지 남은 일수 기준 취소 수수료 규정 */

export type CancelFeeResult =
  | {
      cancelable: true;
      daysLeft: number;
      feeRate: number;
      feeAmount: number;
      refundAmount: number;
    }
  | {
      cancelable: false;
      daysLeft: number;
      feeRate: number;
      feeAmount: number;
      refundAmount: number;
      reason: string;
    };

/** minDays: 이 값 이상일 때 적용 (높은 것부터 매칭) */
export const CANCEL_FEE_RULES: { minDays: number; feeRate: number }[] = [
  { minDays: 4, feeRate: 0 },
  { minDays: 3, feeRate: 0.1 },
  { minDays: 2, feeRate: 0.3 },
  { minDays: 1, feeRate: 0.5 },
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseYmd(date: string): Date {
  const [y, m, day] = date.split("-").map(Number);
  return new Date(y, m - 1, day);
}

/** 이용일 0시 − 오늘 0시 (일 단위) */
export function getDaysUntilUseDate(useDate: string, now = new Date()): number {
  const use = startOfDay(parseYmd(useDate));
  const today = startOfDay(now);
  return Math.round((use.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export function calcCancelFee(
  useDate: string,
  totalPrice: number,
  now = new Date(),
): CancelFeeResult {
  const daysLeft = getDaysUntilUseDate(useDate, now);

  if (daysLeft <= 0) {
    return {
      cancelable: false,
      daysLeft,
      feeRate: 1,
      feeAmount: totalPrice,
      refundAmount: 0,
      reason: "당일 또는 지난 예약은 취소할 수 없습니다.",
    };
  }

  const rule = CANCEL_FEE_RULES.find((r) => daysLeft >= r.minDays) ?? CANCEL_FEE_RULES[CANCEL_FEE_RULES.length - 1];
  const feeAmount = Math.round(totalPrice * rule.feeRate);
  const refundAmount = totalPrice - feeAmount;

  return {
    cancelable: true,
    daysLeft,
    feeRate: rule.feeRate,
    feeAmount,
    refundAmount,
  };
}
