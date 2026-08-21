import { api } from "./api";
import type { CurrentUser } from "../types";

export interface LoginResponse {
  token: string;
  user: CurrentUser;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
    return data;
  },
  async me(): Promise<CurrentUser> {
    const { data } = await api.get<CurrentUser>("/auth/me");
    return data;
  }
};
