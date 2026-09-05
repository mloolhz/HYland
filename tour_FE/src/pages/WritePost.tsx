import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { ISLAND_CATALOG } from "@/constants/island";
import { CONTAINER } from "@/constants/layout";
import { COMMUNITY_ACTIVITY_OPTIONS } from "@/lib/community-activities";
import { refreshPosts } from "@/lib/post-store";
import { createPost } from "@/api/community";
import { uploadImage } from "@/api/uploads";
import { submitMissionProof } from "@/api/submissions";
import { useMissionQuests } from "@/hooks/useMissionQuests";
import { ApiError } from "@/api/auth";
import type { PostType } from "@/types/community";

const TYPE_OPTIONS: { value: PostType; label: string }[] = [
  { value: "review", label: "후기" },
  { value: "photo", label: "인증샷" },
  { value: "question", label: "Q&A" },
];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type WritePrefill = {
  type?: PostType;
  island?: string;
  activity?: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function WritePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as WritePrefill | null) ?? null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 작성자는 서버가 토큰으로 판단한다 (예전에는 프론트가 mock 사용자를 붙였다)

  const [type, setType] = useState<PostType>(prefill?.type ?? "review");
  const [title, setTitle] = useState("");
  const [island, setIsland] = useState(prefill?.island ?? "");
  const [activity, setActivity] = useState(prefill?.activity ?? "");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const [asMissionProof, setAsMissionProof] = useState(false);
  const [questId, setQuestId] = useState<number | null>(null);
  const { quests } = useMissionQuests();

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const handleImageSelect = (file: File | null) => {
    setImageError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("이미지 파일(JPG, PNG 등)만 첨부할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("이미지 용량은 최대 5MB까지 가능합니다.");
      return;
    }

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !island || !activity || !content.trim()) {
      setError("제목, 섬, 활동, 내용은 모두 입력해주세요.");
      return;
    }

    if (asMissionProof && !questId) {
      setError("인증할 미션을 선택해주세요.");
      return;
    }
    if (asMissionProof && !imageFile) {
      setError("미션 인증에는 인증샷이 필요해요.");
      return;
    }

    try {
      // 사진이 있으면 먼저 올리고 그 URL 을 글에 담는다
      const images = imageFile ? [await uploadImage(imageFile)] : undefined;

      const created = await createPost({
        type,
        title: title.trim(),
        content: content.trim(),
        island,
        activity,
        images,
      });
      // 미션 인증으로 냈으면 검수 대기로 보낸다
      if (asMissionProof && questId) {
        await submitMissionProof(created.id, questId);
      }
      await refreshPosts();
      navigate(`/community/${created.id}`);
    } catch (err) {
      console.error("[community] 글 작성 실패:", err);
      setError(
        err instanceof ApiError && err.status === 401
          ? "로그인이 필요해요. 로그인 후 다시 시도해주세요."
          : "글을 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
      );
    }
  };

  return (
    <main className="cm-page">
      <CommunityHeader />

      <div className={CONTAINER}>
        <div className="cm-write-page">
          <h1 className="cm-write-title">글 작성하기</h1>

          <form className="cm-write-form" onSubmit={handleSubmit}>
            <div className="cm-write-field">
              <label className="cm-write-label">유형</label>
              <div className="cm-filter-pills" role="radiogroup" aria-label="글 유형">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={type === opt.value}
                    className={`cm-filter-pill${type === opt.value ? " is-active" : ""}`}
                    onClick={() => setType(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="cm-write-field">
              <label className="cm-write-label" htmlFor="write-title">
                제목
              </label>
              <input
                id="write-title"
                type="text"
                className="cm-write-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력해주세요"
                maxLength={80}
              />
            </div>

            <div className="cm-write-row">
              <div className="cm-write-field">
                <label className="cm-write-label" htmlFor="write-island">
                  섬
                </label>
                <select
                  id="write-island"
                  className="cm-write-input"
                  value={island}
                  onChange={(e) => setIsland(e.target.value)}
                >
                  <option value="">섬 선택</option>
                  {ISLAND_CATALOG.map((i) => (
                    <option key={i.name} value={i.name}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cm-write-field">
                <label className="cm-write-label" htmlFor="write-activity">
                  활동
                </label>
                <select
                  id="write-activity"
                  className="cm-write-input"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                >
                  <option value="">활동 선택</option>
                  {COMMUNITY_ACTIVITY_OPTIONS.map((group) => (
                    <optgroup key={group.key} label={group.label}>
                      {group.activities.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="cm-write-field">
              <label className="cm-write-label" htmlFor="write-content">
                내용
              </label>
              <textarea
                id="write-content"
                className="cm-write-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="섬에서의 경험을 자유롭게 남겨주세요"
                rows={8}
              />
            </div>

            <div className="cm-write-field cm-write-proof">
              <label className="cm-write-proof-toggle">
                <input
                  type="checkbox"
                  checked={asMissionProof}
                  onChange={(e) => setAsMissionProof(e.target.checked)}
                />
                <span>
                  미션 인증으로 제출하기
                  <span className="cm-write-optional"> — 관리자 확인 후 배지가 지급돼요</span>
                </span>
              </label>

              {asMissionProof && (
                <div className="cm-write-proof-body">
                  <select
                    className="cm-write-select"
                    value={questId ?? ""}
                    onChange={(e) => setQuestId(e.target.value ? Number(e.target.value) : null)}
                    aria-label="인증할 미션 선택"
                  >
                    <option value="">인증할 미션 선택</option>
                    {quests
                      .filter((q) => q.current < q.target)
                      .map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.icon} {q.title} ({q.current}/{q.target} {q.unit})
                        </option>
                      ))}
                  </select>
                  <p className="cm-write-proof-note">
                    인증샷이 있어야 제출할 수 있어요. 승인되면 진행도가 1 올라가고, 목표를 채우면
                    배지를 받습니다.
                  </p>
                </div>
              )}
            </div>

            <div className="cm-write-field">
              <span className="cm-write-label">
                이미지 <span className="cm-write-optional">(선택)</span>
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="cm-write-file-input"
                onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
                aria-label="이미지 파일 선택"
              />

              {imagePreviewUrl && imageFile ? (
                <div className="cm-write-image-preview">
                  <img src={imagePreviewUrl} alt="" className="cm-write-image-thumb" />
                  <div className="cm-write-image-meta">
                    <span className="cm-write-image-name">{imageFile.name}</span>
                    <span className="cm-write-image-size">{formatFileSize(imageFile.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="cm-write-image-remove"
                    onClick={handleRemoveImage}
                    aria-label="첨부 이미지 제거"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className="cm-write-image-drop"
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <p className="cm-write-image-hint">클릭하여 파일 선택 · JPG, PNG (최대 5MB)</p>
                  <button
                    type="button"
                    className="cm-write-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    파일 첨부
                  </button>
                </div>
              )}

              {imageError && <p className="cm-write-error">{imageError}</p>}
            </div>

            {error && <p className="cm-write-error">{error}</p>}

            <div className="cm-write-actions">
              <Link to="/community" className="cm-write-cancel">
                뒤로
              </Link>
              <button type="submit" className="cm-write-submit">
                등록하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
