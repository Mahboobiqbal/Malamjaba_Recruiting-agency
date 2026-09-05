import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetMedicalTokensQuery } from "../../services/dashboard.service";
import { MEDICAL_STATUSES } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import { Plus, Search, Eye } from "lucide-react";

export default function MedicalTokenList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useGetMedicalTokensQuery({ page, per_page: 20, search, medical_status: status });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Medical Tokens</h2>
        <Link to="/medical/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Token
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
          {MEDICAL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600">Candidate</th>
              <th className="px-4 py-3 font-medium text-slate-600">Center</th>
              <th className="px-4 py-3 font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 font-medium text-slate-600">Fee</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600">Payment</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-secondary">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-secondary">No medical tokens found</td></tr>
            ) : (
              data?.items.map((t) => (
                <tr key={t.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 font-medium text-primary">{t.token_code}</td>
                  <td className="px-4 py-3">{t.candidate?.full_name || "-"}</td>
                  <td className="px-4 py-3">{t.medical_center || "-"}</td>
                  <td className="px-4 py-3">{t.medical_date ? formatDate(t.medical_date) : "-"}</td>
                  <td className="px-4 py-3">{t.medical_fee}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      t.medical_status === "completed" ? "bg-success text-success" :
                      t.medical_status === "failed" ? "bg-warning text-warning" :
                      "bg-primary text-primary"
                    }`}>{MEDICAL_STATUSES.find(s => s.value === t.medical_status)?.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      t.payment_status === "paid" ? "bg-success text-success" :
                      t.payment_status === "partial" ? "bg-accent text-accent" :
                      "bg-warning text-warning"
                    }`}>{t.payment_status}</span>
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
