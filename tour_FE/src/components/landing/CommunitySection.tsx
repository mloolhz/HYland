import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "@/api/community";
import { avaColor } from "@/lib/landing-data";
import { formatRelativeTime } from "@/lib/time";
import type { Post } from "@/types/community";

const PREVIEW_SIZE = 3;

function LatestReviewItem({ post }: { post: Post }) {
  const name = post.author?.nickname ?? "탐험가";
  const thumb = post.images?.[0];
  return (
    <li>
      <Link className="review-item review-item--example review-item--link" to={`/community/${post.id}`}>
        <span className="r-ava" style={{ background: avaColor(name + post.island) }}>
          {name[0]}
        </span>
        <div className="r-body">
          <div className="r-line">
            {post.island && <span className="isl-tag">{post.island}</span>}
            <span className="r-name">{name}</span>
            {post.activity && <span className="r-act">{post.activity}</span>}
            <span className="r-time">{formatRelativeTime(post.createdAt)}</span>
          </div>
          <div className="r-text">{post.title || post.content}</div>
        </div>
        {thumb && <img className="r-thumb" src={thumb} alt="" loading="lazy" />}
      </Link>
    </li>
  );
}

/**
 * 랜딩 커뮤니티 — 실제로 올라온 최신 후기·인증샷.
 * 예전에는 "예시 후기 · 김OO · OO도" 고정 문구라 미완성처럼 보였다.
 */
export function CommunitySection() {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPosts({ sort: "latest", size: 12 })
      .then(({ posts: rows }) => {
        if (!alive) return;
        // 질문·공지는 빼고 후기·인증샷만 보여 준다
        const reviews = rows.filter((p) => !p.isNotice && p.type !== "question");
        setPosts(reviews.slice(0, PREVIEW_SIZE));
      })
      .catch((err: unknown) => {
        console.error("[landing] 최신 후기 조회 실패:", err);
        if (alive) setPosts([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="sec" id="community">
      <div className="container com-wrap">
        <div className="com-info reveal rv-l">
          <span className="eyebrow">COMMUNITY</span>
          <h2>인천섬 레저누리 커뮤니티</h2>
          <p>다른 탐험가들의 생생한 후기가 올라오는 곳이에요.</p>
          <div className="com-btns">
            <Link to="/community/write" className="btn btn-gold">
              후기 남기기
            </Link>
            <Link className="btn btn-outline" to="/community">
              전체 후기 보기
            </Link>
          </div>
        </div>
        <div className="live-card live-card--example reveal rv-r">
          <p className="live-card-example-label">최신 후기</p>
          {posts !== null && posts.length === 0 ? (
            <p className="live-card-empty">
              아직 올라온 후기가 없어요. 섬에 다녀왔다면 첫 후기를 남겨 주세요!
            </p>
          ) : (
            <ul className="feed feed--example" aria-busy={posts === null}>
              {(posts ?? []).map((post) => (
                <LatestReviewItem key={post.id} post={post} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
