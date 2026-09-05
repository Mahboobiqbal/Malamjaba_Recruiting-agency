import { api } from "./api";
import type { LoginRequest, TokenResponse, User } from "../types";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refreshToken: builder.mutation<TokenResponse, { refresh_token: string }>({
      query: (data) => ({
        url: "/auth/refresh",
        method: "POST",
        body: data,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => "/auth/me",
    }),
    getPermissions: builder.query<{ permissions: string[] }, void>({
      query: () => "/auth/permissions",
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery, useGetPermissionsQuery } = authApi;
