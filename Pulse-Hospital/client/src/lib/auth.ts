import { LoginRequest, OtpLoginRequest, OtpVerifyRequest } from "@shared/schema";
import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  userId: string;
  mobile: string;
  name: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  generateOtp: (request: OtpLoginRequest) => Promise<string>;
  verifyOtp: (request: OtpVerifyRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export async function loginUser(credentials: LoginRequest): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const data = await response.json();
  return data.user;
}

export async function generateOtp(request: OtpLoginRequest): Promise<string> {
  const response = await apiRequest("POST", "/api/auth/generate-otp", request);
  const data = await response.json();
  return data.otp; // For demo only
}

export async function verifyOtp(request: OtpVerifyRequest): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/verify-otp", request);
  const data = await response.json();
  return data.user;
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    operator: 1,
    supervisor: 2,
    manager: 3,
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
}
