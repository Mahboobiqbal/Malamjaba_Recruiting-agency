import { api } from "./api";
import type { Agent, PaginatedResponse } from "../types";

interface AgentCandidateSummary {
  id: number;
  candidate_code: string;
  full_name: string;
  passport_number: string;
  mobile: string;
  status: string;
  registration_date: string;
  created_at: string;
}

interface AgentModuleSummary {
  code: string;
  candidate_name: string;
  status: string;
  amount: number;
  paid: number;
  remaining: number;
  date: string | null;
}

export interface AgentPayment {
  id: number;
  payment_code: string;
  agent_id: number;
  amount: number;
  payment_method: string;
  reference_number?: string;
  remarks?: string;
  created_by?: number;
  created_at: string;
}

export interface AgentPaymentListResponse {
  items: AgentPayment[];
  total: number;
  page: number;
  per_page: number;
}

export interface AgentDetailsResponse extends Agent {
  candidates: AgentCandidateSummary[];
  medical_tokens: AgentModuleSummary[];
  visas: AgentModuleSummary[];
  tickets: AgentModuleSummary[];
  payments: AgentModuleSummary[];
  stats: {
    total_candidates: number;
    total_medical: number;
    total_visas: number;
    total_tickets: number;
    total_payments: number;
    total_paid: number;
    total_amount: number;
    total_remaining: number;
  };
}

export const agentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAgents: builder.query<
      PaginatedResponse<Agent>,
      { page?: number; per_page?: number; search?: string; status?: string; date_from?: string; date_to?: string }
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
    getAgentDetails: builder.query<AgentDetailsResponse, number>({
      query: (id) => `/agents/${id}/details`,
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
    getAgentPayments: builder.query<AgentPaymentListResponse, { agentId: number; page?: number; per_page?: number }>({
      query: ({ agentId, ...params }) => ({ url: `/agents/${agentId}/payments`, params }),
      providesTags: ["AgentPayment"],
    }),
    createAgentPayment: builder.mutation<AgentPayment, { agentId: number; data: { amount: number; payment_method: string; reference_number?: string; remarks?: string } }>({
      query: ({ agentId, data }) => ({ url: `/agents/${agentId}/payments`, method: "POST", body: data }),
      invalidatesTags: ["AgentPayment"],
    }),
    updateAgentStatus: builder.mutation<Agent, { id: number; status: string }>({
      query: ({ id, ...data }) => ({
        url: `/agents/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Agent", "Dashboard"],
    }),
  }),
});

export const {
  useGetAgentsQuery,
  useGetAgentQuery,
  useGetAgentDetailsQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
  useGetAgentPaymentsQuery,
  useCreateAgentPaymentMutation,
  useUpdateAgentStatusMutation,
} = agentApi;
