import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetMedicalTokensQuery, useUpdateMedicalTokenStatusMutation, useDeleteMedicalTokenMutation } from "../../services/dashboard.service";
import { MEDICAL_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { Plus, Search, Eye, Printer, Edit, Trash2, DollarSign } from "lucide-react";
import StatusDropdown from "../../components/common/StatusDropdown";
import PeriodFilter from "../../components/common/PeriodFilter";
import { downloadPDF } from "../../lib/pdf";
import MedicalPrintDocument from "../../components/print/MedicalPrintDocument";
import ConfirmModal from "../../components/common/ConfirmModal";
import toast from "react-hot-toast";

export default function MedicalTokenList() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("medical_status") || "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { data, isLoading } = useGetMedicalTokensQuery({ page, per_page: 20, search, medical_status: status, date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const [updateStatus] = useUpdateMedicalTokenStatusMutation();
  const [deleteToken] = useDeleteMedicalTokenMutation();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Medical Tokens</h2>
        <Link to="/medical/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Token
        </Link>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none sm:w-auto">
          <option value="">All Status</option>
          {MEDICAL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <PeriodFilter dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={(v) => { setDateFrom(v); setPage(1); }} onDateToChange={(v) => { setDateTo(v); setPage(1); }} onClear={() => { setDateFrom(""); setDateTo(""); setPage(1); }} />
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Candidate</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Center</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Date</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Fee</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Paid</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Remaining</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-secondary">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-secondary">No medical tokens found</td></tr>
            ) : (
              data?.items.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-secondary">
                      <td className="px-4 py-3 font-medium text-primary">{t.token_code}</td>
                      <td className="px-4 py-3">{t.candidate?.full_name || "-"}</td>
                      <td className="px-4 py-3">{t.medical_center || "-"}</td>
                      <td className="px-4 py-3">{t.medical_date ? formatDate(t.medical_date) : "-"}</td>
                      <td className="px-4 py-3">{formatCurrency(t.medical_fee)}</td>
                      <td className="px-4 py-3">{formatCurrency(t.paid_amount || 0)}</td>
                      <td className="px-4 py-3 text-rose-600 dark:text-rose-400">{formatCurrency((t.medical_fee || 0) - (t.paid_amount || 0))}</td>
                      <td className="px-4 py-3">
                        <StatusDropdown value={t.medical_status} options={MEDICAL_STATUSES} onChange={(s) => updateStatus({ id: t.id, medical_status: s })} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/medical/${t.id}`} className="text-slate-400 hover:text-primary"><Eye className="h-4 w-4" /></Link>
                          <Link to={`/medical/${t.id}/edit`} className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"><Edit className="h-4 w-4" /></Link>
                          <Link to={`/payments/new?candidate_id=${t.candidate_id}&medical_token_id=${t.id}`} className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"><DollarSign className="h-4 w-4" /></Link>
                          <button onClick={() => downloadPDF(`print-${t.id}`, t.token_code)} className="text-slate-400 hover:text-primary"><Printer className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(t.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
              ))
            )}
          </tbody>
        </table>
        {data?.items.map((t) => (
          <div key={`print-${t.id}`} id={`print-${t.id}`} className="print-only"><MedicalPrintDocument token={t} /></div>
        ))}
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Medical Token"
        message="Are you sure you want to delete this medical token? This action cannot be undone."
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await deleteToken(deleteId).unwrap();
            toast.success("Medical token deleted");
          } catch {
            toast.error("Failed to delete medical token");
          }
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
