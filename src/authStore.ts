import { createStore } from "zustand";
import { persist } from "zustand/middleware";

const initialState = { accessToken: "", refreshToken: "" };

export const authStore = createStore(
  persist(() => initialState, { name: "auth" })
);

export const logout = () => authStore.setState(initialState);
