import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetPaymentsQuery } from "../../services/dashboard.service";
import { PAYMENT_METHODS } from "../../lib/constants";
import { formatDateTime, formatCurrency } from "../../lib/utils";
import { Plus, Search } from "lucide-react";

export default function PaymentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetPaymentsQuery({ page, per_page: 20, search });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Payments</h2>
        <Link to="/payments/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Record Payment
        </Link>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search by payment code, receipt..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
      </div>
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Payment Code</th>
              <th className="px-4 py-3 font-medium text-slate-600">Receipt</th>
              <th className="px-4 py-3 font-medium text-slate-600">Candidate</th>
              <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
              <th className="px-4 py-3 font-medium text-slate-600">Method</th>
              <th className="px-4 py-3 font-medium text-slate-600">Type</th>
              <th className="px-4 py-3 font-medium text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No payments found</td></tr>
            ) : (
              data?.items.map((p) => (
                <tr key={p.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 font-medium text-primary">{p.payment_code}</td>
                  <td className="px-4 py-3">{p.receipt_number}</td>
                  <td className="px-4 py-3">{p.candidate?.full_name || "-"}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3">{PAYMENT_METHODS.find(m => m.value === p.payment_method)?.label || p.payment_method}</td>
                  <td className="px-4 py-3 capitalize">{p.payment_type}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(p.payment_date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
