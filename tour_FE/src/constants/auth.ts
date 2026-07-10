export const CURRENT_USER_ID = "u1";
export const DEMO_LOGGED_IN_KEY = "island-quest-demo-logged-in";

export function isDemoLoggedIn(): boolean {
  return sessionStorage.getItem(DEMO_LOGGED_IN_KEY) === "1";
}

export function setDemoLoggedIn(): void {
  sessionStorage.setItem(DEMO_LOGGED_IN_KEY, "1");
}
