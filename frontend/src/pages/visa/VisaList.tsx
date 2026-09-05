import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetVisasQuery } from "../../services/dashboard.service";
import { VISA_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { Plus, Search } from "lucide-react";

export default function VisaList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useGetVisasQuery({ page, per_page: 20, search, status });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Visas</h2>
        <Link to="/visas/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Visa
        </Link>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
          <option value="">All Status</option>
          {VISA_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600">Candidate</th>
              <th className="px-4 py-3 font-medium text-slate-600">Country</th>
              <th className="px-4 py-3 font-medium text-slate-600">Type</th>
              <th className="px-4 py-3 font-medium text-slate-600">Total Cost</th>
              <th className="px-4 py-3 font-medium text-slate-600">Remaining</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No visas found</td></tr>
            ) : (
              data?.items.map((v) => (
                <tr key={v.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 font-medium text-primary">{v.visa_code}</td>
                  <td className="px-4 py-3">{v.candidate?.full_name || "-"}</td>
                  <td className="px-4 py-3">{v.country || "-"}</td>
                  <td className="px-4 py-3">{v.visa_type || "-"}</td>
                  <td className="px-4 py-3">{formatCurrency(v.total_cost)}</td>
                  <td className="px-4 py-3">{formatCurrency(v.remaining_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      v.status === "approved" ? "bg-success text-success" :
                      v.status === "rejected" ? "bg-warning text-warning" :
                      "bg-secondary text-primary"
                    }`}>{VISA_STATUSES.find(s => s.value === v.status)?.label}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
