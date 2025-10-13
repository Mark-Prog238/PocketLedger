import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

type User = { id: string; name?: string; email?: string };
type JwtPayload = { sub: string; name?: string; email?: string };

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, userOverride?: Partial<User> | null) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

function deriveDisplayName(user: User | null): User | null {
  if (!user) return null;
  if (user.name && user.name.trim().length > 0) return user;
  if (user.email) {
    const localPart = user.email.split('@')[0] || '';
    if (localPart) {
      return { ...user, name: localPart };
    }
  }
  return user;
}

function parseUserFromToken(token: string): User | null {
  try {
    const p = jwtDecode<JwtPayload>(token);
    return deriveDisplayName({ id: p.sub, name: p.name, email: p.email });
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredToken();
  }, []);

  const loadStoredToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      const storedUser = await AsyncStorage.getItem("authUser");
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(parseUserFromToken(storedToken));
          }
        } else {
          setUser(parseUserFromToken(storedToken));
        }
      }
    } catch (error) {
      console.error("Error loading stored token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, userOverride?: Partial<User> | null) => {
    try {
      await AsyncStorage.setItem("authToken", newToken);
      setToken(newToken);
      const parsedFromToken = parseUserFromToken(newToken);
      const finalUser: User | null = userOverride
        ? {
            id: userOverride.id ?? parsedFromToken?.id ?? "",
            name: userOverride.name ?? parsedFromToken?.name,
            email: userOverride.email ?? parsedFromToken?.email,
          }
        : parsedFromToken;
      setUser(deriveDisplayName(finalUser));
      if (finalUser) {
        await AsyncStorage.setItem("authUser", JSON.stringify(deriveDisplayName(finalUser)));
      } else {
        await AsyncStorage.removeItem("authUser");
      }
    } catch (error) {
      console.error("Error storing token:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("authUser");
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error removing token:", error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!token,
    token,
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
