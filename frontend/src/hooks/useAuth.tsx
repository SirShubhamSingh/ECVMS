import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../services/authService";
import type { CurrentUser } from "../types";

interface AuthContextValue {
  currentUser: CurrentUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("ecmvs_user");
    const storedToken = localStorage.getItem("ecmvs_token");
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    setError(null);
    try {
      const { token, user } = await authService.login(email, password);
      localStorage.setItem("ecmvs_token", token);
      localStorage.setItem("ecmvs_user", JSON.stringify(user));
      setCurrentUser(user);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Invalid email or password.";
      setError(message);
      throw new Error(message);
    }
  }

  function logout() {
    localStorage.removeItem("ecmvs_token");
    localStorage.removeItem("ecmvs_user");
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
