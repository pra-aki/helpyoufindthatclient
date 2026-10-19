// Real authentication via Supabase Auth. The client persists the session
// (localStorage) and refreshes the access token automatically in the
// background, so callers never need to think about token expiry.
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { TERMS_VERSION } from "./constants";

export interface User {
  id: string;
  email: string;
  name: string;
}

const toUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  const name = (supabaseUser.user_metadata?.name as string | undefined) || supabaseUser.email?.split("@")[0] || "";
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    name,
  };
};

export interface SignUpResult {
  user: User | null;
  // true if Supabase requires the user to click a confirmation link before
  // they have an active session (depends on the project's auth settings).
  needsEmailConfirmation: boolean;
}

/**
 * Creates the account. The caller is expected to have already shown the user
 * the Terms/Privacy checkbox and only call this once they've agreed — we
 * stamp that agreement (version + time) onto the account's own metadata as a
 * record of consent, the same way `name` is stored, no backend involved.
 */
export const signUp = async (email: string, password: string, name: string): Promise<SignUpResult> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: new Date().toISOString(),
      },
    },
  });
  if (error) throw error;
  return {
    user: toUser(data.user),
    needsEmailConfirmation: !data.session,
  };
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const user = toUser(data.user);
  if (!user) throw new Error("Login succeeded but no user was returned");
  return user;
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getSession();
  return toUser(data.session?.user ?? null);
};

export const isAuthenticated = async (): Promise<boolean> => {
  return (await getCurrentUser()) !== null;
};

/** The current session's access token, for calling the backend API. Null if not logged in. */
export const getAccessToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

/**
 * Changes the signed-in user's password. Re-authenticates with the current
 * password first (Supabase's own updateUser call doesn't require it, since
 * the caller already holds a valid session — this just makes sure whoever
 * is doing it actually knows the current password).
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  const { data } = await supabase.auth.getSession();
  const email = data.session?.user.email;
  if (!email) throw new Error("Not signed in. Log in and try again.");

  const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (reauthError) throw new Error("Current password is incorrect");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};
