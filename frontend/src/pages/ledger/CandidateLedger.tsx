import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetCandidateLedgerQuery } from "../../services/dashboard.service";
import { formatCurrency, formatDateTime } from "../../lib/utils";
import { ArrowLeft } from "lucide-react";

export default function CandidateLedger() {
  const { id } = useParams();
  const ledgerId = id ? Number(id) : 0;
  const { data, isLoading } = useGetCandidateLedgerQuery(ledgerId);

  if (isLoading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (!data) return <div className="text-center py-8 text-slate-500">Ledger not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/candidates" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ledger: {data.candidate.full_name}</h2>
          <p className="text-sm text-slate-500">{data.candidate.candidate_code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Charges</p>
          <p className="text-xl font-bold text-warning">{formatCurrency(data.summary.total_charges)}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Payments</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(data.summary.total_payments)}</p>
        </div>
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Balance</p>
          <p className={`text-xl font-bold ${data.summary.balance > 0 ? "text-warning" : "text-emerald-600"}`}>
            {formatCurrency(data.summary.balance)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 font-medium text-slate-600">Description</th>
              <th className="px-4 py-3 font-medium text-slate-600">Type</th>
              <th className="px-4 py-3 font-medium text-slate-600">Debit</th>
              <th className="px-4 py-3 font-medium text-slate-600">Credit</th>
              <th className="px-4 py-3 font-medium text-slate-600">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No ledger entries</td></tr>
            ) : (
              data.entries.map((e) => (
                <tr key={e.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(e.created_at)}</td>
                  <td className="px-4 py-3">{e.description}</td>
                  <td className="px-4 py-3 capitalize">{e.entry_type}</td>
                  <td className="px-4 py-3">{e.debit > 0 ? formatCurrency(e.debit) : "-"}</td>
                  <td className="px-4 py-3">{e.credit > 0 ? formatCurrency(e.credit) : "-"}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(e.balance)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
