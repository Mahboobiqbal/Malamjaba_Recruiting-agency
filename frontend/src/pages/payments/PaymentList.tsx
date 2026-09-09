import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetPaymentsQuery, useGetOutstandingBalancesQuery } from "../../services/dashboard.service";
import { PAYMENT_METHODS } from "../../lib/constants";
import { formatDateTime, formatCurrency } from "../../lib/utils";
import { Plus, Search, ArrowRight, CreditCard, Eye, Printer } from "lucide-react";
import { downloadPDF } from "../../lib/pdf";
import PaymentPrintDocument from "../../components/print/PaymentPrintDocument";
import DateFilter from "../../components/common/DateFilter";

export default function PaymentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "outstanding">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { data, isLoading } = useGetPaymentsQuery({ page, per_page: 20, search, date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const { data: outstanding, isLoading: loadingOutstanding } = useGetOutstandingBalancesQuery();

  const totalOutstanding = outstanding?.reduce((sum, o) => sum + o.balance, 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Payments</h2>
        <Link to="/payments/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Record Payment
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Payments</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{data?.total || 0}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Collected</p>
          <p className="text-lg font-bold text-emerald-600">{formatCurrency(data?.items.reduce((s, p) => s + p.amount, 0) || 0)}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Outstanding Balance</p>
          <p className="text-lg font-bold text-rose-600">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === "all" ? "border-b-2 border-primary text-primary" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          All Payments
        </button>
        <button
          onClick={() => setActiveTab("outstanding")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === "outstanding" ? "border-b-2 border-primary text-primary" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input type="text" placeholder="Search by payment code, receipt..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
            </div>
            <DateFilter dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={(v) => { setDateFrom(v); setPage(1); }} onDateToChange={(v) => { setDateTo(v); setPage(1); }} onClear={() => { setDateFrom(""); setDateTo(""); setPage(1); }} />
          </div>
          <div className="overflow-hidden rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-secondary">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Payment Code</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Receipt</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Candidate</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Service</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Agent</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Amount</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Method</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Type</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Date</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Loading...</td></tr>
                ) : data?.items.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No payments found</td></tr>
                ) : (
                  data?.items.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr className="border-b hover:bg-secondary">
                        <td className="px-4 py-3">
                          <Link to={`/payments/${p.id}`} className="font-medium text-primary hover:underline">{p.payment_code}</Link>
                        </td>
                        <td className="px-4 py-3">{p.receipt_number}</td>
                        <td className="px-4 py-3">{p.candidate?.full_name || "-"}</td>
                        <td className="px-4 py-3">
                          {p.visa ? (
                            <Link to={`/visas/${p.visa.id}`} className="text-primary hover:underline text-xs">Visa: {p.visa.visa_code}</Link>
                          ) : p.ticket ? (
                            <Link to={`/tickets/${p.ticket.id}`} className="text-primary hover:underline text-xs">Ticket: {p.ticket.ticket_code}</Link>
                          ) : p.medical_token ? (
                            <Link to={`/medical/${p.medical_token.id}`} className="text-primary hover:underline text-xs">Medical: {p.medical_token.token_code}</Link>
                          ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-3">{p.agent?.name || "-"}</td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3">{PAYMENT_METHODS.find(m => m.value === p.payment_method)?.label || p.payment_method}</td>
                        <td className="px-4 py-3 capitalize">{p.payment_type}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(p.payment_date)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link to={`/payments/${p.id}`} className="text-slate-400 hover:text-primary"><Eye className="h-4 w-4" /></Link>
                            <button onClick={() => downloadPDF(`print-${p.id}`, p.payment_code)} className="text-slate-400 hover:text-primary"><Printer className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                      <div id={`print-${p.id}`} className="print-only"><PaymentPrintDocument payment={p} /></div>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data && data.total > 20 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-secondary disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-secondary disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "outstanding" && (
        <>
          {loadingOutstanding ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>
          ) : !outstanding || outstanding.length === 0 ? (
            <div className="rounded-lg border bg-white dark:bg-slate-900 p-12 text-center shadow-sm dark:shadow-none">
              <CreditCard className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No outstanding balances. All clients are fully paid.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-secondary">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Candidate Code</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Name</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Passport</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Mobile</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Agent</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Outstanding</th>
                    <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Action</th>
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
              <div className="border-t bg-slate-50 dark:bg-slate-800 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Total Outstanding ({outstanding.length} clients)</span>
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
