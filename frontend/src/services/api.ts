import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "User",
    "Agent",
    "Candidate",
    "MedicalToken",
    "Visa",
    "Ticket",
    "Payment",
    "Expense",
    "Dashboard",
    "Ledger",
    "Notification",
    "Settings",
  ],
  endpoints: () => ({}),
});
