import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetAgentsQuery, useDeleteAgentMutation, useUpdateAgentStatusMutation } from "../../services/agent.service";
import { AGENT_STATUSES } from "../../lib/constants";
import { Plus, Search, Trash2, Eye, Edit } from "lucide-react";
import StatusDropdown from "../../components/common/StatusDropdown";
import DateFilter from "../../components/common/DateFilter";

export default function AgentList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { data, isLoading } = useGetAgentsQuery({ page, per_page: 20, search, date_from: dateFrom || undefined, date_to: dateTo || undefined });
  const [deleteAgent] = useDeleteAgentMutation();
  const [updateStatus] = useUpdateAgentStatusMutation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Agents</h2>
        <Link to="/agents/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Agent
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input type="text" placeholder="Search agents..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
        </div>
        <DateFilter dateFrom={dateFrom} dateTo={dateTo} onDateFromChange={(v) => { setDateFrom(v); setPage(1); }} onDateToChange={(v) => { setDateTo(v); setPage(1); }} onClear={() => { setDateFrom(""); setDateTo(""); setPage(1); }} />
      </div>
      <div className="overflow-hidden rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Name</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">CNIC</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Mobile</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">City</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No agents found</td></tr>
            ) : (
              data?.items.map((a) => (
                <tr key={a.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 font-medium text-primary">{a.agent_code}</td>
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{a.cnic}</td>
                  <td className="px-4 py-3">{a.mobile}</td>
                  <td className="px-4 py-3">{a.city || "-"}</td>
                  <td className="px-4 py-3">
                    <StatusDropdown value={a.status} options={AGENT_STATUSES} onChange={(s) => updateStatus({ id: a.id, status: s })} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/agents/${a.id}`} className="text-slate-400 dark:text-slate-500 hover:text-primary"><Eye className="h-4 w-4" /></Link>
                      <Link to={`/agents/${a.id}/edit`} className="text-slate-400 dark:text-slate-500 hover:text-accent"><Edit className="h-4 w-4" /></Link>
                      <button onClick={async () => { if (window.confirm("Delete?")) await deleteAgent(a.id); }} className="text-slate-400 dark:text-slate-500 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
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
