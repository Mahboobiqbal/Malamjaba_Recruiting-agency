import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetCandidateLedgerQuery } from "../../services/dashboard.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { formatCurrency, formatDateTime } from "../../lib/utils";
import { ArrowLeft, FileText } from "lucide-react";

export default function CandidateLedger() {
  const { id } = useParams();
  const ledgerId = id ? Number(id) : 0;

  if (!ledgerId) {
    return <LedgerCandidateList />;
  }

  return <LedgerDetail candidateId={ledgerId} />;
}

function LedgerCandidateList() {
  const { data, isLoading } = useGetCandidatesQuery({ per_page: 100 });

  if (isLoading) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"><ArrowLeft className="h-5 w-5" /></Link>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Select Candidate Ledger</h2>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Name</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Mobile</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((c) => (
              <tr key={c.id} className="border-b hover:bg-secondary">
                <td className="px-4 py-3 font-medium text-primary">{c.candidate_code}</td>
                <td className="px-4 py-3">{c.full_name}</td>
                <td className="px-4 py-3">{c.mobile}</td>
                <td className="px-4 py-3 capitalize">{c.status}</td>
                <td className="px-4 py-3">
                  <Link to={`/ledger/${c.id}`} className="flex items-center gap-1 text-primary hover:underline">
                    <FileText className="h-4 w-4" /> View Ledger
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LedgerDetail({ candidateId }: { candidateId: number }) {
  const { data, isLoading } = useGetCandidateLedgerQuery(candidateId);

  if (isLoading) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!data) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Ledger not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/ledger" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ledger: {data.candidate.full_name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{data.candidate.candidate_code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Charges</p>
          <p className="text-xl font-bold text-warning">{formatCurrency(data.summary.total_charges)}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Payments</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(data.summary.total_payments)}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
          <p className="text-sm text-slate-500 dark:text-slate-400">Balance</p>
          <p className={`text-xl font-bold ${data.summary.balance > 0 ? "text-warning" : "text-emerald-600"}`}>
            {formatCurrency(data.summary.balance)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Date</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Description</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Type</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Debit</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Credit</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No ledger entries</td></tr>
            ) : (
              data.entries.map((e) => (
                <tr key={e.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(e.created_at)}</td>
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
