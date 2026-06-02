import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  rolesLoaded: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let currentUserId: string | null = null;

    const loadRole = (userId: string) => {
      setRolesLoaded(false);
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle()
        .then(({ data }) => {
          setIsAdmin(!!data);
          setRolesLoaded(true);
        });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(false);

      const newUserId = newSession?.user?.id ?? null;
      const userChanged = newUserId !== currentUserId;
      currentUserId = newUserId;

      // Only invalidate queries on actual sign-in/sign-out, not token refreshes
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        queryClient.invalidateQueries();
      }

      if (newSession?.user) {
        if (userChanged) {
          setTimeout(() => loadRole(newSession.user.id), 0);
        }
      } else {
        setIsAdmin(false);
        setRolesLoaded(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) {
        currentUserId = data.session.user.id;
        loadRole(data.session.user.id);
      } else {
        setRolesLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, isAdmin, rolesLoaded, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
