export type CoursePeriod = "dawn" | "morning" | "noon" | "afternoon" | "sunset";

export type CourseStep = {
  time: string;
  period: CoursePeriod;
  activity: string;
  desc: string;
};

export type RecItemBooking = {
  label: string;
  url?: string;
  tel?: string;
};

export type RecItem = {
  islandId: string;
  islandName: string;
  regionColor: string;
  category: string;
  categoryKey: string;
  sportId: string;
  name: string;
  booking?: RecItemBooking;
};

export type AiResponse = {
  text: string;
  recommendations: RecItem[];
  course?: { title: string; steps: CourseStep[] };
  tips?: string[];
  followups?: string[];
};

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; response: AiResponse };
