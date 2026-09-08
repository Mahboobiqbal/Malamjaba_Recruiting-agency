import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetPaymentsQuery, useGetOutstandingBalancesQuery } from "../../services/dashboard.service";
import { PAYMENT_METHODS } from "../../lib/constants";
import { formatDateTime, formatCurrency } from "../../lib/utils";
import { Plus, Search, ArrowRight, CreditCard } from "lucide-react";

export default function PaymentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "outstanding">("all");
  const { data, isLoading } = useGetPaymentsQuery({ page, per_page: 20, search });
  const { data: outstanding, isLoading: loadingOutstanding } = useGetOutstandingBalancesQuery();

  const totalOutstanding = outstanding?.reduce((sum, o) => sum + o.balance, 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Payments</h2>
        <Link to="/payments/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Record Payment
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Payments</p>
          <p className="text-lg font-bold text-slate-800">{data?.total || 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Collected</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(data?.items.reduce((s, p) => s + p.amount, 0) || 0)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Outstanding Balance</p>
          <p className="text-lg font-bold text-rose-600">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === "all" ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All Payments
        </button>
        <button
          onClick={() => setActiveTab("outstanding")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === "outstanding" ? "border-b-2 border-primary text-primary" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Outstanding Balances
          {outstanding && outstanding.length > 0 && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">{outstanding.length}</span>
          )}
        </button>
      </div>

      {activeTab === "all" && (
        <>
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
                  <th className="px-4 py-3 font-medium text-slate-600">Agent</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Method</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : data?.items.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No payments found</td></tr>
                ) : (
                  data?.items.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-secondary">
                      <td className="px-4 py-3">
                        <Link to={`/payments/${p.id}`} className="font-medium text-primary hover:underline">{p.payment_code}</Link>
                      </td>
                      <td className="px-4 py-3">{p.receipt_number}</td>
                      <td className="px-4 py-3">{p.candidate?.full_name || "-"}</td>
                      <td className="px-4 py-3">{p.agent?.name || "-"}</td>
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
          {data && data.total > 20 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-secondary disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-secondary disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "outstanding" && (
        <>
          {loadingOutstanding ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : !outstanding || outstanding.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
              <CreditCard className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">No outstanding balances. All clients are fully paid.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-secondary">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600">Candidate Code</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Passport</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Mobile</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Agent</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Outstanding</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {outstanding.map((o) => (
                    <tr key={o.candidate.id} className="border-b hover:bg-secondary">
                      <td className="px-4 py-3 font-medium text-primary">{o.candidate.candidate_code}</td>
                      <td className="px-4 py-3">{o.candidate.full_name}</td>
                      <td className="px-4 py-3">{o.candidate.passport_number}</td>
                      <td className="px-4 py-3">{o.candidate.mobile}</td>
                      <td className="px-4 py-3">{o.candidate.agent?.name || "-"}</td>
                      <td className="px-4 py-3 font-medium text-rose-600">{formatCurrency(o.balance)}</td>
                      <td className="px-4 py-3">
                        <Link to={`/payments/new?candidate_id=${o.candidate.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90">
                          <Plus className="h-3 w-3" /> Pay Now
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total Outstanding ({outstanding.length} clients)</span>
                  <span className="font-bold text-rose-600">{formatCurrency(totalOutstanding)}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
