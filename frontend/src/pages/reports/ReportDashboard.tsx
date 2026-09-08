import React from "react";
import { useGetFinancialReportQuery, useGetAgentPerformanceQuery } from "../../services/dashboard.service";
import { formatCurrency } from "../../lib/utils";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";

export default function ReportDashboard() {
  const { data: financial } = useGetFinancialReportQuery();
  const { data: agents } = useGetAgentPerformanceQuery();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reports</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Received</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(financial?.total_received || 0)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning p-2"><TrendingDown className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
              <p className="text-xl font-bold text-warning">{formatCurrency(financial?.total_expenses || 0)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2"><BarChart3 className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Net Profit</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(financial?.net_profit || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Agent Performance</h3>
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Agent Code</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Agent Name</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Candidates</th>
            </tr>
          </thead>
          <tbody>
            {agents?.map((a: any) => (
              <tr key={a.agent_id} className="border-b hover:bg-secondary">
                <td className="px-4 py-3 font-medium text-primary">{a.agent_code}</td>
                <td className="px-4 py-3">{a.agent_name}</td>
                <td className="px-4 py-3">{a.candidate_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
