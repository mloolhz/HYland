import type { IslandBti } from "./community";

export interface User {
  id: string;
  userId: string;
  phone: string;
  email?: string;
  nickname: string;
  bti: IslandBti;
  phoneVerified: boolean;
}
