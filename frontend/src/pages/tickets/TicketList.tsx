import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetTicketsQuery } from "../../services/dashboard.service";
import { TICKET_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { Plus, Search } from "lucide-react";

export default function TicketList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useGetTicketsQuery({ page, per_page: 20, search, status });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Tickets</h2>
        <Link to="/tickets/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> New Ticket
        </Link>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by PNR, ticket number..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
          <option value="">All Status</option>
          {TICKET_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-secondary">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">Code</th>
              <th className="px-4 py-3 font-medium text-slate-600">Candidate</th>
              <th className="px-4 py-3 font-medium text-slate-600">Airline</th>
              <th className="px-4 py-3 font-medium text-slate-600">PNR</th>
              <th className="px-4 py-3 font-medium text-slate-600">Route</th>
              <th className="px-4 py-3 font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 font-medium text-slate-600">Total</th>
              <th className="px-4 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No tickets found</td></tr>
            ) : (
              data?.items.map((t) => (
                <tr key={t.id} className="border-b hover:bg-secondary">
                  <td className="px-4 py-3 font-medium text-primary">{t.ticket_code}</td>
                  <td className="px-4 py-3">{t.candidate?.full_name || "-"}</td>
                  <td className="px-4 py-3">{t.airline || "-"}</td>
                  <td className="px-4 py-3">{t.pnr || "-"}</td>
                  <td className="px-4 py-3">{t.departure_airport || ""} → {t.arrival_airport || ""}</td>
                  <td className="px-4 py-3">{t.departure_date ? formatDate(t.departure_date) : "-"}</td>
                  <td className="px-4 py-3">{formatCurrency(t.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      t.status === "issued" ? "bg-success text-success" :
                      t.status === "cancelled" ? "bg-warning text-warning" :
                      "bg-secondary text-primary"
                    }`}>{TICKET_STATUSES.find(s => s.value === t.status)?.label}</span>
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
