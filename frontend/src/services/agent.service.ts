import { api } from "./api";
import type { Agent, PaginatedResponse } from "../types";

export const agentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAgents: builder.query<
      PaginatedResponse<Agent>,
      { page?: number; per_page?: number; search?: string; status?: string }
    >({
      query: (params) => ({
        url: "/agents",
        params,
      }),
      providesTags: ["Agent"],
    }),
    getAgent: builder.query<Agent, number>({
      query: (id) => `/agents/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Agent", id }],
    }),
    createAgent: builder.mutation<Agent, Partial<Agent>>({
      query: (data) => ({
        url: "/agents",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Agent"],
    }),
    updateAgent: builder.mutation<Agent, { id: number; data: Partial<Agent> }>({
      query: ({ id, data }) => ({
        url: `/agents/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Agent"],
    }),
    deleteAgent: builder.mutation<void, number>({
      query: (id) => ({
        url: `/agents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Agent"],
    }),
  }),
});

export const {
  useGetAgentsQuery,
  useGetAgentQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
} = agentApi;
