// Simple authentication mock
export const AUTH_KEY = "beaconflow_auth";

export interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
}

export const login = (email: string, password: string): User | null => {
  // Mock authentication - in production this would call your backend
  if (email && password) {
    const user: User = {
      id: "1",
      email: email,
      name: email.split("@")[0],
      plan: "free",
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(AUTH_KEY);
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};
