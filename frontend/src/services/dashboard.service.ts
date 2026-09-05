import { api } from "./api";
import type { Candidate, DashboardSummary, PaginatedResponse, Payment, Expense, MedicalToken, Visa, Ticket, LedgerEntry } from "../types";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardSummary, void>({
      query: () => "/dashboard",
      providesTags: ["Dashboard"],
    }),
    getPayments: builder.query<
      PaginatedResponse<Payment>,
      { page?: number; per_page?: number; search?: string; candidate_id?: number }
    >({
      query: (params) => ({ url: "/payments", params }),
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
    getExpenses: builder.query<
      PaginatedResponse<Expense>,
      { page?: number; per_page?: number; search?: string; category?: string }
    >({
      query: (params) => ({ url: "/expenses", params }),
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
    createMedicalToken: builder.mutation<MedicalToken, Partial<MedicalToken>>({
      query: (data) => ({
        url: "/medical-tokens",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MedicalToken"],
    }),
    getVisas: builder.query<
      PaginatedResponse<Visa>,
      { page?: number; per_page?: number; search?: string; status?: string }
    >({
      query: (params) => ({ url: "/visas", params }),
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
    getTickets: builder.query<
      PaginatedResponse<Ticket>,
      { page?: number; per_page?: number; search?: string; status?: string }
    >({
      query: (params) => ({ url: "/tickets", params }),
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
    getCandidateLedger: builder.query<
      { candidate: Candidate; entries: LedgerEntry[]; summary: { total_charges: number; total_payments: number; balance: number } },
      number
    >({
      query: (candidateId) => `/ledger/candidate/${candidateId}`,
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
  useCreatePaymentMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetMedicalTokensQuery,
  useCreateMedicalTokenMutation,
  useGetVisasQuery,
  useCreateVisaMutation,
  useGetTicketsQuery,
  useCreateTicketMutation,
  useGetCandidateLedgerQuery,
  useGetNotificationsQuery,
  useGetFinancialReportQuery,
  useGetAgentPerformanceQuery,
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} = dashboardApi;
