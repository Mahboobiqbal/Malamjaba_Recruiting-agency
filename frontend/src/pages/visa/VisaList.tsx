import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetVisasQuery, useUpdateVisaStatusMutation, useDeleteVisaMutation } from "../../services/dashboard.service";
import { VISA_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { Plus, Search, Eye, Printer, Edit, Trash2, DollarSign } from "lucide-react";
import StatusDropdown from "../../components/common/StatusDropdown";
import PeriodFilter from "../../components/common/PeriodFilter";
import { downloadPDF } from "../../lib/pdf";
import VisaPrintDocument from "../../components/print/VisaPrintDocument";
import ConfirmModal from "../../components/common/ConfirmModal";
import toast from "react-hot-toast";

export default function VisaList() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { data, isLoading } = useGetVisasQuery({ page, per_page: 20, search, status, date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const [updateStatus] = useUpdateVisaStatusMutation();
  const [deleteVisa] = useDeleteVisaMutation();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Visas</h2>
        <Link to="/visas/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Visa
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
          {VISA_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <PeriodFilter dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={(v) => { setDateFrom(v); setPage(1); }} onDateToChange={(v) => { setDateTo(v); setPage(1); }} onClear={() => { setDateFrom(""); setDateTo(""); setPage(1); }} />
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Candidate</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Country</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Type</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Total Cost</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Remaining</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
              <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No visas found</td></tr>
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
                        <StatusDropdown value={v.status} options={VISA_STATUSES} onChange={(s) => updateStatus({ id: v.id, status: s })} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/visas/${v.id}`} className="text-slate-400 hover:text-primary"><Eye className="h-4 w-4" /></Link>
                          <Link to={`/visas/${v.id}/edit`} className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"><Edit className="h-4 w-4" /></Link>
                          <Link to={`/payments/new?candidate_id=${v.candidate_id}&visa_id=${v.id}`} className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"><DollarSign className="h-4 w-4" /></Link>
                          <button onClick={() => downloadPDF(`print-${v.id}`, v.visa_code)} className="text-slate-400 hover:text-primary"><Printer className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(v.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
              ))
            )}
              </tbody>
            </table>
            {data?.items.map((v) => (
              <div key={`print-${v.id}`} id={`print-${v.id}`} className="print-only"><VisaPrintDocument visa={v} /></div>
            ))}
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Visa"
        message="Are you sure you want to delete this visa? This action cannot be undone."
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await deleteVisa(deleteId).unwrap();
            toast.success("Visa deleted");
          } catch {
            toast.error("Failed to delete visa");
          }
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
