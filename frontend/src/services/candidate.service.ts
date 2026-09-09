import { api } from "./api";
import type { Candidate, PaginatedResponse } from "../types";

export const candidateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCandidates: builder.query<
      PaginatedResponse<Candidate>,
      { page?: number; per_page?: number; search?: string; status?: string; agent_id?: number; country?: string; date_from?: string; date_to?: string }
    >({
      query: (params) => ({
        url: "/candidates",
        params,
      }),
      providesTags: ["Candidate"],
    }),
    getCandidate: builder.query<Candidate, number>({
      query: (id) => `/candidates/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Candidate", id }],
    }),
    createCandidate: builder.mutation<Candidate, Partial<Candidate>>({
      query: (data) => ({
        url: "/candidates",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Candidate"],
    }),
    updateCandidate: builder.mutation<Candidate, { id: number; data: Partial<Candidate> }>({
      query: ({ id, data }) => ({
        url: `/candidates/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Candidate"],
    }),
    updateCandidateStatus: builder.mutation<Candidate, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/candidates/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Candidate", "Dashboard"],
    }),
    deleteCandidate: builder.mutation<void, number>({
      query: (id) => ({
        url: `/candidates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Candidate"],
    }),
  }),
});

export const {
  useGetCandidatesQuery,
  useGetCandidateQuery,
  useLazyGetCandidateQuery,
  useCreateCandidateMutation,
  useUpdateCandidateMutation,
  useUpdateCandidateStatusMutation,
  useDeleteCandidateMutation,
} = candidateApi;
