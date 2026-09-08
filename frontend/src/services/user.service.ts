import { api } from "./api";
import type { User, Role } from "../types";

interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  per_page: number;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsers, { page?: number; per_page?: number; search?: string }>({
      query: (params) => ({ url: "/users", params }),
      providesTags: ["User"],
    }),
    getUser: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation<User, { username: string; password: string; full_name: string; email?: string; phone?: string; role_ids?: number[] }>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<User, { id: number; data: { full_name?: string; email?: string; phone?: string; is_active?: boolean; role_ids?: number[] } }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    getRoles: builder.query<Role[], void>({
      query: () => "/users/roles/list",
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
} = userApi;
