import React, { useState } from "react";
import { useGetExpensesQuery, useDeleteExpenseMutation } from "../../services/dashboard.service";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "../../lib/constants";
import { formatDateTime, formatCurrency } from "../../lib/utils";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import PeriodFilter from "../../components/common/PeriodFilter";
import { Link } from "react-router-dom";
import ConfirmModal from "../../components/common/ConfirmModal";
import toast from "react-hot-toast";

export default function ExpenseList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { data, isLoading } = useGetExpensesQuery({ page, per_page: 20, search, category, date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const [deleteExpense] = useDeleteExpenseMutation();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Expenses</h2>
        <Link to="/expenses/new" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Expense
        </Link>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none sm:w-auto">
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <PeriodFilter dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={(v) => { setDateFrom(v); setPage(1); }} onDateToChange={(v) => { setDateTo(v); setPage(1); }} onClear={() => { setDateFrom(""); setDateTo(""); setPage(1); }} />
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Category</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Description</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Amount</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Method</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Paid To</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Date</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No expenses found</td></tr>
            ) : (
              data?.items.map((e) => (
                <tr key={e.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 font-medium text-primary">{e.expense_code}</td>
                  <td className="px-4 py-3">{EXPENSE_CATEGORIES.find(c => c.value === e.category)?.label || e.category}</td>
                  <td className="px-4 py-3">{e.description || "-"}</td>
                  <td className="px-4 py-3 font-medium text-red-500 dark:text-red-400">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3">{PAYMENT_METHODS.find(m => m.value === e.payment_method)?.label || e.payment_method}</td>
                  <td className="px-4 py-3">{e.paid_to || "-"}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(e.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/expenses/${e.id}`} className="text-slate-400 hover:text-primary"><Eye className="h-4 w-4" /></Link>
                      <Link to={`/expenses/${e.id}/edit`} className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"><Edit className="h-4 w-4" /></Link>
                      <button onClick={() => setDeleteId(e.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={async () => {
          if (deleteId === null) return;
          try {
            await deleteExpense(deleteId).unwrap();
            toast.success("Expense deleted");
          } catch {
            toast.error("Failed to delete expense");
          }
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
