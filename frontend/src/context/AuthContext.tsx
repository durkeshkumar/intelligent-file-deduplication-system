import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../api/axios";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get<User>("/auth/me");

      setUser(response.data);
    } catch (error) {
      console.error(
        "Unable to fetch current user:",
        error,
      );

      localStorage.removeItem("access_token");
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken =
        localStorage.getItem("access_token");

      if (storedToken) {
        await fetchCurrentUser();
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (
    username: string,
    password: string,
  ) => {
    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);
    formData.append("grant_type", "password");
    formData.append("scope", "");
    formData.append("client_id", "");
    formData.append("client_secret", "");

    const response = await api.post<{
      access_token: string;
      token_type: string;
    }>("/auth/login", formData, {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;

    localStorage.setItem(
      "access_token",
      accessToken,
    );

    setToken(accessToken);

    await fetchCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem("access_token");

    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider",
    );
  }

  return context;
}