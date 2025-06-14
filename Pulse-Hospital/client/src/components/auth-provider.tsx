import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthContextType, loginUser, generateOtp as generateOtpApi, verifyOtp as verifyOtpApi } from "@/lib/auth";
import { LoginRequest, OtpLoginRequest, OtpVerifyRequest } from "@shared/schema";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const userData = await loginUser(credentials);
      setUser(userData);
      localStorage.setItem("pulse-user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const generateOtp = async (request: OtpLoginRequest): Promise<string> => {
    setIsLoading(true);
    try {
      return await generateOtpApi(request);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (request: OtpVerifyRequest) => {
    setIsLoading(true);
    try {
      const userData = await verifyOtpApi(request);
      setUser(userData);
      localStorage.setItem("pulse-user", JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pulse-user");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("pulse-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("pulse-user");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, generateOtp, verifyOtp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
