import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/integrations/api/client";

export interface AuthUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setAuthUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setAuthUser: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        api.clearTokens();
      }
    }
    setLoading(false);
  }, []);

  const setAuthUser = (userData: AuthUser | null) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } else {
      api.clearTokens();
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } catch {
      // continue even if request fails
    } finally {
      api.clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setAuthUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
