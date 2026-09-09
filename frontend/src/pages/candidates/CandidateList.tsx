import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetCandidatesQuery, useLazyGetCandidateQuery, useDeleteCandidateMutation, useUpdateCandidateStatusMutation } from "../../services/candidate.service";
import { CANDIDATE_STATUSES } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import { downloadPDF } from "../../lib/pdf";
import { Plus, Search, Trash2, Eye, Edit, Printer } from "lucide-react";
import StatusDropdown from "../../components/common/StatusDropdown";
import DateFilter from "../../components/common/DateFilter";
import CandidatePrintDocument from "../../components/print/CandidatePrintDocument";
import type { Candidate } from "../../types";

export default function CandidateList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { data, isLoading } = useGetCandidatesQuery({ page, per_page: 20, search, status, date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const [deleteCandidate] = useDeleteCandidateMutation();
  const [updateStatus] = useUpdateCandidateStatusMutation();
  const [fetchCandidate] = useLazyGetCandidateQuery();
  const [printCandidate, setPrintCandidate] = useState<Candidate | null>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      await deleteCandidate(id);
    }
  };

  const handlePrint = async (id: number) => {
    const result = await fetchCandidate(id);
    if (result.data) {
      setPrintCandidate(result.data);
      setTimeout(() => downloadPDF("print-area", `Candidate-${result.data!.candidate_code}`), 100);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Candidates</h2>
        <Link
          to="/candidates/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, passport, CNIC, mobile..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
        >
          <option value="">All Status</option>
          {CANDIDATE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <DateFilter dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={(v) => { setDateFrom(v); setPage(1); }} onDateToChange={(v) => { setDateTo(v); setPage(1); }} onClear={() => { setDateFrom(""); setDateTo(""); setPage(1); }} />
      </div>

      <div className="overflow-hidden rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Name</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Passport</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Mobile</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Registered</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No candidates found</td></tr>
            ) : (
              data?.items.map((c) => (
                <tr key={c.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 font-medium text-primary">{c.candidate_code}</td>
                  <td className="px-4 py-3">{c.full_name}</td>
                  <td className="px-4 py-3">{c.passport_number}</td>
                  <td className="px-4 py-3">{c.mobile}</td>
                  <td className="px-4 py-3">
                    <StatusDropdown value={c.status} options={CANDIDATE_STATUSES} onChange={(s) => updateStatus({ id: c.id, status: s })} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(c.registration_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/candidates/${c.id}`} className="text-slate-400 dark:text-slate-500 hover:text-primary">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handlePrint(c.id)} className="text-slate-400 dark:text-slate-500 hover:text-primary">
                        <Printer className="h-4 w-4" />
                      </button>
                      <Link to={`/candidates/${c.id}/edit`} className="text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDelete(c.id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {printCandidate && (
        <div id="print-area" className="print-only" style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <CandidatePrintDocument candidate={printCandidate} />
        </div>
      )}

      {data && data.total > 20 && (
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 hover:bg-secondary disabled:opacity-50">Prev</button>
            <button disabled={page * 20 >= data.total} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 hover:bg-secondary disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
