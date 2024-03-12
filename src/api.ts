import axios, { AxiosError } from "axios";
import { authStore } from "./authStore";

const api = axios.create({ baseURL: "http://localhost:3000" });

api.interceptors.request.use((req) => {
  const token = authStore.getState().accessToken;
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err instanceof AxiosError) {
      const status = err.response?.status;

      // auth err
      if (status === 401 && !err.config?.url?.includes("/refresh")) {
        const refreshToken = authStore.getState().refreshToken;
        let retryCount = 0;
        let isRefreshed = false;

        while (retryCount < 3 && !isRefreshed) {
          try {
            const refreshResult = await api.post("/refresh", { refreshToken });
            authStore.setState({ accessToken: refreshResult.data.accessToken });
            isRefreshed = true;
          } catch (err) {
            retryCount += 1;
          }
        }

        if (isRefreshed && err.config) {
          return api.request(err.config);
        }

        return Promise.reject(err);
      }

      const response = err.response?.data;
      const message =
        typeof response === "object" && response?.message
          ? response.message
          : err.message;

      return Promise.reject(new Error(message));
    }

    Promise.reject(err);
  }
);

export default api;
