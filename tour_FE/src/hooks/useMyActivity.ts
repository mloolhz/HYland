import { useEffect, useState } from "react";
import { fetchLikedPosts, fetchMyComments, fetchMyPosts } from "@/api/community";
import type { MyComment, Post } from "@/types/community";
import { useSession } from "@/store/session";

/**
 * 내가 쓴 글·댓글, 내가 좋아요한 글.
 *
 * 예전에는 mocks/myActivity.ts 가 MOCK_POSTS 를 훑어 만들었다. 지금은 로그인한
 * 사용자 기준으로 서버가 골라 준다. 비로그인이면 전부 빈 배열이다.
 */
export function useMyActivity() {
  const { isLoggedIn } = useSession();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myComments, setMyComments] = useState<MyComment[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setMyPosts([]);
      setMyComments([]);
      setLikedPosts([]);
      return;
    }
    let alive = true;
    setLoading(true);
    Promise.all([fetchMyPosts(), fetchMyComments(), fetchLikedPosts()])
      .then(([posts, comments, liked]) => {
        if (!alive) return;
        setMyPosts(posts);
        setMyComments(comments);
        setLikedPosts(liked);
      })
      .catch((err: unknown) => {
        console.error("[community] 내 활동 조회 실패:", err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  return { myPosts, myComments, likedPosts, loading };
}
