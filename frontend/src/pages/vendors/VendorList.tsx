import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetVendorsQuery, useDeleteVendorMutation } from "../../services/vendor.service";
import { formatDateTime, getErrorMessage } from "../../lib/utils";
import { Plus, Edit, Trash2, Eye, Search, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function VendorList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data, isLoading } = useGetVendorsQuery({ page, per_page: 20, search, status });
  const [deleteVendor] = useDeleteVendorMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVendor(deleteId).unwrap();
      toast.success("Vendor deleted");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Vendors</h2>
        <Link to="/vendors/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Vendor
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search vendors..." className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>
      ) : !data?.items?.length ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No vendors found</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Code</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Bank</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Created</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{v.vendor_code}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{v.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{v.phone}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{v.bank_name || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${v.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{formatDateTime(v.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/vendors/${v.id}`} className="rounded p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10"><Eye className="h-4 w-4" /></Link>
                          <Link to={`/vendors/${v.id}/edit`} className="rounded p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"><Edit className="h-4 w-4" /></Link>
                          <button onClick={() => setDeleteId(v.id)} className="rounded p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {data.total > 20 && (
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Showing {((data.page - 1) * data.per_page) + 1} to {Math.min(data.page * data.per_page, data.total)} of {data.total}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(data.page - 1)} disabled={data.page <= 1} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 hover:bg-secondary disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(data.page + 1)} disabled={data.page * data.per_page >= data.total} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 hover:bg-secondary disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal open={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Vendor" message="Are you sure you want to delete this vendor? This will also delete all associated transactions and payments." confirmLabel="Delete" />
    </div>
  );
}
