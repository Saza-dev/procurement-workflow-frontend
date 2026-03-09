// src/types/auth.ts

export type Role = "DH" | "PE" | "FM" | "OM" | "CEO" | "HR";

export interface User {
  id: number;
  email: string;
  role: Role;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}
