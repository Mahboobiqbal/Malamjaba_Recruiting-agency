import { api } from "./api";
import type { Vendor, VendorTransaction, VendorPayment, VendorLedger, PaginatedResponse } from "../types";

export const vendorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<PaginatedResponse<Vendor>, { page?: number; per_page?: number; search?: string; status?: string }>({
      query: (params) => ({ url: "/vendors", params }),
      providesTags: ["Vendor"],
    }),
    getVendor: builder.query<Vendor, number>({
      query: (id) => `/vendors/${id}`,
      providesTags: ["Vendor"],
    }),
    createVendor: builder.mutation<Vendor, Partial<Vendor>>({
      query: (data) => ({ url: "/vendors", method: "POST", body: data }),
      invalidatesTags: ["Vendor"],
    }),
    updateVendor: builder.mutation<Vendor, { id: number; data: Partial<Vendor> }>({
      query: ({ id, data }) => ({ url: `/vendors/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Vendor"],
    }),
    deleteVendor: builder.mutation<void, number>({
      query: (id) => ({ url: `/vendors/${id}`, method: "DELETE" }),
      invalidatesTags: ["Vendor"],
    }),
    getVendorTransactions: builder.query<PaginatedResponse<VendorTransaction>, { vendorId: number; page?: number; per_page?: number }>({
      query: ({ vendorId, ...params }) => ({ url: `/vendors/${vendorId}/transactions`, params }),
      providesTags: ["VendorTransaction"],
    }),
    createVendorTransaction: builder.mutation<VendorTransaction, { vendorId: number; data: Partial<VendorTransaction> }>({
      query: ({ vendorId, data }) => ({ url: `/vendors/${vendorId}/transactions`, method: "POST", body: data }),
      invalidatesTags: ["VendorTransaction"],
    }),
    updateVendorTransaction: builder.mutation<VendorTransaction, { vendorId: number; txnId: number; data: Partial<VendorTransaction> }>({
      query: ({ vendorId, txnId, data }) => ({ url: `/vendors/${vendorId}/transactions/${txnId}`, method: "PUT", body: data }),
      invalidatesTags: ["VendorTransaction", "VendorLedger"],
    }),
    assignVendorTransaction: builder.mutation<VendorTransaction, { vendorId: number; txnId: number; data: { candidate_id: number; ticket_price?: number; airline?: string; flight_number?: string; departure_airport?: string; arrival_airport?: string; departure_date?: string; departure_time?: string; visa_fee?: number; visa_type?: string; country?: string } }>({
      query: ({ vendorId, txnId, data }) => ({ url: `/vendors/${vendorId}/transactions/${txnId}/assign`, method: "POST", body: data }),
      invalidatesTags: ["VendorTransaction", "VendorLedger"],
    }),
    deleteVendorTransaction: builder.mutation<void, { vendorId: number; txnId: number }>({
      query: ({ vendorId, txnId }) => ({ url: `/vendors/${vendorId}/transactions/${txnId}`, method: "DELETE" }),
      invalidatesTags: ["VendorTransaction", "VendorLedger"],
    }),
    getAllVendorTransactions: builder.query<PaginatedResponse<VendorTransaction>, { page?: number; per_page?: number; service_type?: string; payment_status?: string }>({
      query: (params) => ({ url: "/vendors/transactions/all", params }),
      providesTags: ["VendorTransaction"],
    }),
    getVendorPayments: builder.query<PaginatedResponse<VendorPayment>, { vendorId: number; page?: number; per_page?: number }>({
      query: ({ vendorId, ...params }) => ({ url: `/vendors/${vendorId}/payments`, params }),
      providesTags: ["VendorPayment"],
    }),
    createVendorPayment: builder.mutation<VendorPayment, { vendorId: number; data: Partial<VendorPayment> }>({
      query: ({ vendorId, data }) => ({ url: `/vendors/${vendorId}/payments`, method: "POST", body: data }),
      invalidatesTags: ["VendorPayment", "VendorTransaction"],
    }),
    getVendorLedger: builder.query<VendorLedger, number>({
      query: (vendorId) => `/vendors/${vendorId}/ledger`,
      providesTags: ["VendorLedger"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useGetVendorTransactionsQuery,
  useCreateVendorTransactionMutation,
  useUpdateVendorTransactionMutation,
  useAssignVendorTransactionMutation,
  useDeleteVendorTransactionMutation,
  useGetAllVendorTransactionsQuery,
  useGetVendorPaymentsQuery,
  useCreateVendorPaymentMutation,
  useGetVendorLedgerQuery,
} = vendorApi;
