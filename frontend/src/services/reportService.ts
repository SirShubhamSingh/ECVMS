import { api } from "./api";

export const reportService = {
  async dashboard(): Promise<any> {
    const { data } = await api.get("/reports/dashboard");
    return data;
  },
  async issues(): Promise<any> {
    const { data } = await api.get("/reports/issues");
    return data;
  },
  async investigations(): Promise<any> {
    const { data } = await api.get("/reports/investigations");
    return data;
  },
  async risk(): Promise<any> {
    const { data } = await api.get("/reports/risk");
    return data;
  },
  async resolutions(): Promise<any> {
    const { data } = await api.get("/reports/resolutions");
    return data;
  }
};
