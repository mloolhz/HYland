import { formatJoinDate, maskUserId, type MockAccount } from "@/mocks/accounts";

type FoundAccountCardProps = {
  account: MockAccount;
};

export function FoundAccountCard({ account }: FoundAccountCardProps) {
  const masked = maskUserId(account.userId);
  const prefix = masked.replace(/\*+$/, "");

  return (
    <div
      className="auth-found-card"
      aria-label={`아이디 ${prefix}으로 시작하는 계정`}
    >
      <div className="auth-found-card-body">
        <p className="auth-found-userId">{masked}</p>
        <p className="auth-found-date">{formatJoinDate(account.joinedAt)}</p>
      </div>
      <span className="auth-found-ava" aria-hidden="true">
        {account.userId[0].toUpperCase()}
      </span>
    </div>
  );
}
