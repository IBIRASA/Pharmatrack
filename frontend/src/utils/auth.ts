export interface AuthUser {
  id?: string;
  username?: string;
  email?: string;
  access: string;
  refresh?: string;
  user_type?: string;
}

export interface User {
  id: number;
  email: string;
  username?: string;
  user_type: string;
  access: string;
  refresh: string;
}

// Persist a normalized user
export function setCurrentUser(user: User): void {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", user.access);
}

// Normalize various backend shapes and save
export function setCurrentUserFromResponse(resp: any): void {
  const rawUser = resp?.user ?? resp ?? {};
  const norm: User = {
    id: rawUser?.id ?? rawUser?.user_id ?? rawUser?.sub,
    email: rawUser?.email,
    username: rawUser?.username ?? rawUser?.name,
    user_type: rawUser?.user_type ?? rawUser?.role,
    access: resp?.access ?? resp?.access_token ?? resp?.token?.access,
    refresh: resp?.refresh ?? resp?.refresh_token ?? resp?.token?.refresh,
  };
  setCurrentUser(norm);
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    localStorage.removeItem("user");
    return null;
  }
}

export function getUserRole(): string | null {
  const user = getCurrentUser();
  return user?.user_type || null;
}

export function getUserDisplayName(): string {
  const u = getCurrentUser();
  return u?.username || u?.email || "User";
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function logout(): void {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "/";
}

export function redirectTo(path: string): void {
  setTimeout(() => {
    window.location.href = path;
  }, 500);
}
