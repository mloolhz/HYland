export const CURRENT_USER_ID = "u1";
export const DEMO_LOGGED_IN_KEY = "island-quest-demo-logged-in";
export const GUEST_KEY = "guest";
export const SAVED_USERNAME_KEY = "island-quest-saved-username";

export const MOCK_TAKEN_IDS = ["admin", "test", "island"];
export const MOCK_TAKEN_NICKNAMES = ["바다탐험가", "섬돌이"];

export function isDemoLoggedIn(): boolean {
  return sessionStorage.getItem(DEMO_LOGGED_IN_KEY) === "1";
}

export function setDemoLoggedIn(): void {
  sessionStorage.setItem(DEMO_LOGGED_IN_KEY, "1");
  sessionStorage.removeItem(GUEST_KEY);
}

export function clearDemoLoggedIn(): void {
  sessionStorage.removeItem(DEMO_LOGGED_IN_KEY);
}

export function isGuest(): boolean {
  return sessionStorage.getItem(GUEST_KEY) === "1";
}

export function setGuest(): void {
  sessionStorage.setItem(GUEST_KEY, "1");
  sessionStorage.removeItem(DEMO_LOGGED_IN_KEY);
}

export function clearGuest(): void {
  sessionStorage.removeItem(GUEST_KEY);
}

export function mockCheckUserId(userId: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_TAKEN_IDS.includes(userId.toLowerCase())), 400);
  });
}

export function mockCheckNickname(nickname: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_TAKEN_NICKNAMES.includes(nickname)), 400);
  });
}

/** @deprecated use mockCheckUserId */
export function mockCheckEmail(): Promise<boolean> {
  return Promise.resolve(false);
}
