import { demoProps } from "@/components/landing/ToastProvider";

export function CommunityHeader() {
  return (
    <header className="cm-header">
      <div className="cm-header-bg" aria-hidden="true" />
      <div className="cm-header-inner">
        <div className="cm-header-copy">
          <span className="cm-header-eyebrow">COMMUNITY</span>
          <h1 className="cm-header-title">섬 탐험가들의 기록</h1>
          <p className="cm-header-desc">인천의 다양한 섬에서 남긴 후기와 인증샷을 만나보세요</p>
        </div>
        <button className="cm-header-cta" type="button" {...demoProps("글 작성은 로그인 후 이용할 수 있어요 ✍️")}>
          글 작성하기
        </button>
      </div>
    </header>
  );
}
