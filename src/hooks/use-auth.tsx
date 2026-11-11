import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = { id: string; name: string; bio: string | null; avatar_url: string | null; created_at: string };

type AuthState = {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children, onIdentityChange }: { children: ReactNode; onIdentityChange?: (event: string) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadExtras = useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    const [{ data: p }, { data: admin }] = await Promise.all([
      supabase.from("profiles").select("id, name, bio, avatar_url, created_at").eq("id", u.id).maybeSingle(),
      supabase.rpc("has_role", { _user_id: u.id, _role: "admin" }),
    ]);
    setProfile(p ?? null);
    setIsAdmin(Boolean(admin));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      // Defer extra queries so they don't run inside the auth callback.
      setTimeout(() => {
        void loadExtras(u).finally(() => setLoading(false));
      }, 0);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        onIdentityChange?.(event);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadExtras, onIdentityChange]);

  const refreshProfile = useCallback(() => loadExtras(user), [loadExtras, user]);

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
