import React, { useState } from "react";
import { useGetExpensesQuery } from "../../services/dashboard.service";
import { formatDateTime, formatCurrency } from "../../lib/utils";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function SalaryList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetExpensesQuery({ page, per_page: 20, search, category: "salary" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Salary Records</h2>
        <Link to="/salaries/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Salary
        </Link>
      </div>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input type="text" placeholder="Search by employee name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
      </div>
      <div className="overflow-hidden rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Employee</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Month</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Basic Salary</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Allowances</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Deductions</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Net Pay</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Method</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No salary records found</td></tr>
            ) : (
              data?.items.map((e) => {
                const desc = e.description || "";
                const parts = desc.split("|");
                const employee = parts[0]?.replace("Employee: ", "") || e.paid_to || "-";
                const month = parts[1]?.replace("Month: ", "") || "-";
                const basic = parts[2]?.replace("Basic: ", "");
                const allowances = parts[3]?.replace("Allowances: ", "");
                const deductions = parts[4]?.replace("Deductions: ", "");
                return (
                  <tr key={e.id} className="border-b hover:bg-secondary">
                    <td className="px-4 py-3 font-medium text-primary">{e.expense_code}</td>
                    <td className="px-4 py-3 font-medium">{employee}</td>
                    <td className="px-4 py-3">{month}</td>
                    <td className="px-4 py-3">{basic ? formatCurrency(Number(basic)) : "-"}</td>
                    <td className="px-4 py-3 text-emerald-600">{allowances ? formatCurrency(Number(allowances)) : "-"}</td>
                    <td className="px-4 py-3 text-red-500 dark:text-red-400">{deductions ? formatCurrency(Number(deductions)) : "-"}</td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(e.amount)}</td>
                    <td className="px-4 py-3 capitalize">{e.payment_method}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDateTime(e.date)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
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
