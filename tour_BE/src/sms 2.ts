/**
 * 문자 발송 (솔라피)
 *
 * 키가 없으면 실제로 보내지 않고 "개발 모드"로 동작한다 — 인증번호를 응답에
 * 담아 화면이 안내로 띄운다. 키를 .env 에 넣는 순간 문자가 나가고 devCode 는
 * 사라진다. 코드를 고칠 필요가 없다.
 *
 *   SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER
 *
 * SOLAPI_SENDER 는 솔라피 콘솔에 미리 등록한 발신번호여야 한다 (전기통신사업법상
 * 사전 등록된 번호로만 발송할 수 있다).
 */
import crypto from "node:crypto";

const API_KEY = process.env.SOLAPI_API_KEY ?? "";
const API_SECRET = process.env.SOLAPI_API_SECRET ?? "";
/** 숫자만 남긴다 — 콘솔에 010-1234-5678 로 적어 뒀을 수 있다 */
const SENDER = (process.env.SOLAPI_SENDER ?? "").replace(/\D/g, "");

const ENDPOINT = "https://api.solapi.com/messages/v4/send";

/** 세 값이 모두 있어야 실제 발송을 시도한다 */
export function smsEnabled(): boolean {
  return Boolean(API_KEY && API_SECRET && SENDER);
}

/** 솔라피 HMAC 인증 헤더 */
function authorization(): string {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString("hex");
  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(date + salt)
    .digest("hex");
  return `HMAC-SHA256 apiKey=${API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;
}

export type SmsResult = { sent: boolean; error?: string };

/**
 * 문자 한 통. 실패해도 예외를 던지지 않는다 — 부르는 쪽이 인증 흐름을
 * 계속할지 말지 결정한다.
 */
export async function sendSms(to: string, text: string): Promise<SmsResult> {
  if (!smsEnabled()) return { sent: false, error: "SMS 키가 설정되지 않았어요" };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization(),
      },
      body: JSON.stringify({
        message: { to: to.replace(/\D/g, ""), from: SENDER, text },
      }),
    });

    const body = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      const reason = body?.errorMessage ?? body?.message ?? `HTTP ${res.status}`;
      console.error("문자 발송 실패:", reason);
      return { sent: false, error: String(reason) };
    }
    // 솔라피는 200 이어도 건별로 실패할 수 있다
    const failed = body?.failedMessageList?.length ?? 0;
    if (failed > 0) {
      const reason = body.failedMessageList[0]?.statusMessage ?? "발송 실패";
      console.error("문자 발송 실패:", reason);
      return { sent: false, error: String(reason) };
    }
    return { sent: true };
  } catch (err) {
    console.error("문자 발송 오류:", err);
    return { sent: false, error: "문자 발송 중 오류가 났어요" };
  }
}

/** 인증번호 문자 */
export function verificationText(code: string): string {
  return `[인천섬 레저누리] 인증번호 ${code} 를 입력해주세요. (5분 이내)`;
}
