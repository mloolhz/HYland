import type { FoundAccount } from "@/api/auth";
import { formatJoinDate } from "@/lib/account-format";

type FoundAccountCardProps = {
  account: FoundAccount;
};

export function FoundAccountCard({ account }: FoundAccountCardProps) {
  // 아이디는 서버가 이미 가려서 내려준다
  const masked = account.maskedUsername;
  const prefix = masked.replace(/\*+$/, "");

  return (
    <div className="auth-found-card" aria-label={`아이디 ${prefix}으로 시작하는 계정`}>
      <div className="auth-found-card-body">
        <p className="auth-found-userId">{masked}</p>
        {account.joinedAt && (
          <p className="auth-found-date">{formatJoinDate(account.joinedAt)}</p>
        )}
      </div>
      <span className="auth-found-ava" aria-hidden="true">
        {masked[0].toUpperCase()}
      </span>
    </div>
  );
}
