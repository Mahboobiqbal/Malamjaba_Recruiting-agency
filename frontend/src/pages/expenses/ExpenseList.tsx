import React, { useState } from "react";
import { useGetExpensesQuery } from "../../services/dashboard.service";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "../../lib/constants";
import { formatDateTime, formatCurrency } from "../../lib/utils";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExpenseList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const { data, isLoading } = useGetExpensesQuery({ page, per_page: 20, search, category });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Expenses</h2>
        <Link to="/expenses/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Expense
        </Link>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600">Category</th>
              <th className="px-4 py-3 font-medium text-slate-600">Description</th>
              <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
              <th className="px-4 py-3 font-medium text-slate-600">Method</th>
              <th className="px-4 py-3 font-medium text-slate-600">Paid To</th>
              <th className="px-4 py-3 font-medium text-slate-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No expenses found</td></tr>
            ) : (
              data?.items.map((e) => (
                <tr key={e.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 font-medium text-primary">{e.expense_code}</td>
                  <td className="px-4 py-3">{EXPENSE_CATEGORIES.find(c => c.value === e.category)?.label || e.category}</td>
                  <td className="px-4 py-3">{e.description || "-"}</td>
                  <td className="px-4 py-3 font-medium text-red-500">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3">{PAYMENT_METHODS.find(m => m.value === e.payment_method)?.label || e.payment_method}</td>
                  <td className="px-4 py-3">{e.paid_to || "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(e.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
