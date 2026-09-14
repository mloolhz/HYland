/** community-insights 집계용 (FE TripIntent와 호환) */
export type TripIntent = {
  travelDate?: string;
  travelEndDate?: string;
  duration?: number;
  departure?: string;
  companion?: "solo" | "couple" | "friend" | "family";
  intensity?: "relaxed" | "moderate" | "active";
  travelMood?: "healing" | "active" | "nature" | "social" | "adventure";
  activities?: string[];
};
