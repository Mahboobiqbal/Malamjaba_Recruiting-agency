import { api } from "./api";
import type { Candidate, DashboardSummary, PaginatedResponse, Payment, Expense, MedicalToken, Visa, Ticket, LedgerEntry } from "../types";

interface OutstandingBalance {
  candidate: Candidate;
  balance: number;
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardSummary, void>({
      query: () => "/dashboard",
      providesTags: ["Dashboard"],
      refetchOnMountOrArgChange: true,
    }),
    getPayments: builder.query<
      PaginatedResponse<Payment>,
      { page?: number; per_page?: number; search?: string; candidate_id?: number }
    >({
      query: (params) => ({ url: "/payments", params }),
      providesTags: ["Payment"],
    }),
    getPayment: builder.query<Payment, number>({
      query: (id) => `/payments/${id}`,
      providesTags: ["Payment"],
    }),
    createPayment: builder.mutation<Payment, Partial<Payment>>({
      query: (data) => ({
        url: "/payments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment", "Dashboard", "Ledger"],
    }),
    updatePayment: builder.mutation<Payment, { id: number; data: Partial<Payment> }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Payment", "Dashboard", "Ledger"],
    }),
    deletePayment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payment", "Dashboard", "Ledger"],
    }),
    getExpenses: builder.query<
      PaginatedResponse<Expense>,
      { page?: number; per_page?: number; search?: string; category?: string }
    >({
      query: (params) => ({ url: "/expenses", params }),
      providesTags: ["Expense"],
    }),
    getExpense: builder.query<Expense, number>({
      query: (id) => `/expenses/${id}`,
      providesTags: ["Expense"],
    }),
    createExpense: builder.mutation<Expense, Partial<Expense>>({
      query: (data) => ({
        url: "/expenses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Expense", "Dashboard"],
    }),
    getMedicalTokens: builder.query<
      PaginatedResponse<MedicalToken>,
      { page?: number; per_page?: number; search?: string; medical_status?: string }
    >({
      query: (params) => ({ url: "/medical-tokens", params }),
      providesTags: ["MedicalToken"],
    }),
    getMedicalToken: builder.query<MedicalToken, number>({
      query: (id) => `/medical-tokens/${id}`,
      providesTags: ["MedicalToken"],
    }),
    createMedicalToken: builder.mutation<MedicalToken, Partial<MedicalToken>>({
      query: (data) => ({
        url: "/medical-tokens",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MedicalToken"],
    }),
    updateMedicalTokenStatus: builder.mutation<MedicalToken, { id: number; medical_status?: string; payment_status?: string }>({
      query: ({ id, ...data }) => ({
        url: `/medical-tokens/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["MedicalToken", "Dashboard"],
    }),
    getVisas: builder.query<
      PaginatedResponse<Visa>,
      { page?: number; per_page?: number; search?: string; status?: string }
    >({
      query: (params) => ({ url: "/visas", params }),
      providesTags: ["Visa"],
    }),
    getVisa: builder.query<Visa, number>({
      query: (id) => `/visas/${id}`,
      providesTags: ["Visa"],
    }),
    createVisa: builder.mutation<Visa, Partial<Visa>>({
      query: (data) => ({
        url: "/visas",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Visa"],
    }),
    updateVisaStatus: builder.mutation<Visa, { id: number; status: string }>({
      query: ({ id, ...data }) => ({
        url: `/visas/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Visa", "Dashboard"],
    }),
    getTickets: builder.query<
      PaginatedResponse<Ticket>,
      { page?: number; per_page?: number; search?: string; status?: string }
    >({
      query: (params) => ({ url: "/tickets", params }),
      providesTags: ["Ticket"],
    }),
    getTicket: builder.query<Ticket, number>({
      query: (id) => `/tickets/${id}`,
      providesTags: ["Ticket"],
    }),
    createTicket: builder.mutation<Ticket, Partial<Ticket>>({
      query: (data) => ({
        url: "/tickets",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Ticket"],
    }),
    updateTicketStatus: builder.mutation<Ticket, { id: number; status: string }>({
      query: ({ id, ...data }) => ({
        url: `/tickets/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Ticket", "Dashboard"],
    }),
    getCandidateLedger: builder.query<
      { candidate: Candidate; entries: LedgerEntry[]; summary: { total_charges: number; total_payments: number; balance: number } },
      number
    >({
      query: (candidateId) => `/ledger/candidate/${candidateId}`,
      providesTags: ["Ledger"],
    }),
    getOutstandingBalances: builder.query<OutstandingBalance[], void>({
      query: () => "/ledger/outstanding",
      providesTags: ["Ledger"],
    }),
    getNotifications: builder.query<any[], void>({
      query: () => "/notifications",
      providesTags: ["Notification"],
    }),
    getFinancialReport: builder.query<any, void>({
      query: () => "/reports/financial",
    }),
    getAgentPerformance: builder.query<any[], void>({
      query: () => "/reports/agent-performance",
    }),
    getCompanySettings: builder.query<Record<string, string>, void>({
      query: () => "/settings/company",
      providesTags: ["Settings"],
    }),
    updateCompanySettings: builder.mutation<void, Record<string, string>>({
      query: (settings) => ({
        url: "/settings/company",
        method: "PUT",
        body: { settings },
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetMedicalTokensQuery,
  useCreateMedicalTokenMutation,
  useUpdateMedicalTokenStatusMutation,
  useGetVisasQuery,
  useCreateVisaMutation,
  useUpdateVisaStatusMutation,
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
  useGetMedicalTokenQuery,
  useGetVisaQuery,
  useGetTicketQuery,
  useGetExpenseQuery,
  useGetCandidateLedgerQuery,
  useGetOutstandingBalancesQuery,
  useGetNotificationsQuery,
  useGetFinancialReportQuery,
  useGetAgentPerformanceQuery,
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} = dashboardApi;
