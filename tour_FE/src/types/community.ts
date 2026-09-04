export type PostType = "review" | "photo" | "question";
export type IslandBti = "파도형" | "등대형" | "갯벌형" | "해류형";

export interface Author {
  id: string;
  nickname: string;
  bti: IslandBti;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  likes: number;
  isAuthor: boolean;
  replies?: Comment[];
}

export interface MyComment extends Comment {
  post: Pick<Post, "id" | "title" | "island">;
  parentAuthor?: string;
}

export interface Post {
  id: string;
  type: PostType;
  title: string;
  content: string;
  summary?: string;
  island: string;
  activity: string;
  images?: string[];
  badge?: "레어카드" | "스탬프";
  isNotice?: boolean;
  isResolved?: boolean;
  author: Author;
  createdAt: string;
  likes: number;
  views: number;
  comments: Comment[];
  /** 본문 분석 결과 (서버에서 계산·저장) — AI 추천 근거로 쓴다 */
  sentiment?: "positive" | "neutral" | "negative";
  sentimentScore?: number;
  /** 추천 근거로 보여줄 본문 대표 문장 */
  highlight?: string;
  /** 본문에 실제로 언급된 활동 (태그와 다를 수 있다) */
  mentionedActivities?: string[];
  /** 후기에서 "좋았다"고 한 달 (1~12) */
  bestMonths?: number[];
  /** 이 글이 시사하는 동행 (family/couple/friend/solo) */
  companionFit?: string[];
  /** 방문객 주의·팁 */
  cautions?: string[];
}

export interface Island {
  name: string;
  region: string;
  accent: string;
  bg: string;
  text: string;
}
