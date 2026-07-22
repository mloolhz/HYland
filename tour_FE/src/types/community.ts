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
}

export interface Island {
  name: string;
  region: string;
  accent: string;
  bg: string;
  text: string;
}
