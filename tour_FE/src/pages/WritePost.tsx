import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { CURRENT_USER_ID } from "@/constants/auth";
import { ISLAND_CATALOG } from "@/constants/island";
import { CONTAINER } from "@/constants/layout";
import { MOCK_POSTS } from "@/mocks/posts";
import type { Post, PostType } from "@/types/community";

const TYPE_OPTIONS: { value: PostType; label: string }[] = [
  { value: "review", label: "후기" },
  { value: "photo", label: "인증샷" },
  { value: "question", label: "질문" },
];

function getCurrentAuthor() {
  const existing = MOCK_POSTS.find((p) => p.author.id === CURRENT_USER_ID);
  return existing?.author ?? { id: CURRENT_USER_ID, nickname: "이파도", bti: "파도형" as const };
}

export function WritePost() {
  const navigate = useNavigate();
  const author = useMemo(getCurrentAuthor, []);

  const [type, setType] = useState<PostType>("review");
  const [title, setTitle] = useState("");
  const [island, setIsland] = useState("");
  const [activity, setActivity] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !island || !activity.trim() || !content.trim()) {
      setError("제목, 섬, 활동, 내용은 모두 입력해주세요.");
      return;
    }

    const newPost: Post = {
      id: `p-${Date.now()}`,
      type,
      title: title.trim(),
      content: content.trim(),
      island,
      activity: activity.trim(),
      images: imageUrl.trim() ? [imageUrl.trim()] : undefined,
      author,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
    };

    MOCK_POSTS.unshift(newPost);
    navigate(`/community/${newPost.id}`);
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
                <input
                  id="write-activity"
                  type="text"
                  className="cm-write-input"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="예: 카약, 하이킹, 캠핑"
                  maxLength={20}
                />
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

            <div className="cm-write-field">
              <label className="cm-write-label" htmlFor="write-image">
                이미지 URL <span className="cm-write-optional">(선택)</span>
              </label>
              <input
                id="write-image"
                type="url"
                className="cm-write-input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
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
