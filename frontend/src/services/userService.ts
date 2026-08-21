import { api } from "./api";
import type { AppUser, Role } from "../types";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
}

export interface UpdateUserPayload {
  name: string;
  role: Role;
  department: string;
  active: boolean;
  password?: string;
}

export const userService = {
  async list(params: { search?: string; role?: string; department?: string } = {}): Promise<AppUser[]> {
    const { data } = await api.get<AppUser[]>("/users", { params });
    return data;
  },
  async officers(): Promise<AppUser[]> {
    const { data } = await api.get<AppUser[]>("/users/officers");
    return data;
  },
  async create(payload: CreateUserPayload): Promise<AppUser> {
    const { data } = await api.post<AppUser>("/users", payload);
    return data;
  },
  async update(id: string, payload: UpdateUserPayload): Promise<void> {
    await api.put(`/users/${id}`, payload);
  },
  async setActive(id: string, active: boolean): Promise<void> {
    await api.put(`/users/${id}/active`, active);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
};

export const ROLES: Role[] = [
  "Super Administrator", "Compliance Officer", "Vendor Manager", "Approver", "Employee"
];
