import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetTicketQuery, useUpdateTicketStatusMutation } from "../../services/dashboard.service";
import { TICKET_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer } from "lucide-react";
import StatusDropdown from "../../components/common/StatusDropdown";

export default function TicketDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetTicketQuery(Number(id));
  const [updateStatus] = useUpdateTicketStatusMutation();

  if (isLoading) return <div className="text-center py-8 text-secondary">Loading...</div>;
  if (!data) return <div className="text-center py-8 text-secondary">Ticket not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/tickets" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ticket: {data.ticket_code}</h2>
            <p className="text-sm text-secondary">{data.candidate?.full_name || "N/A"}</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Flight Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Airline</dt><dd className="font-medium">{data.airline || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">PNR</dt><dd className="font-medium">{data.pnr || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Ticket Number</dt><dd className="font-medium">{data.ticket_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Flight</dt><dd className="font-medium">{data.flight_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Route</dt><dd className="font-medium">{data.departure_airport || "?"} → {data.arrival_airport || "?"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Departure</dt><dd className="font-medium">{data.departure_date ? formatDate(data.departure_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Arrival</dt><dd className="font-medium">{data.arrival_date ? formatDate(data.arrival_date) : "-"}</dd></div>
            <div className="flex justify-between items-center"><dt className="text-secondary">Status</dt><dd>
              <StatusDropdown value={data.status} options={TICKET_STATUSES} onChange={(status) => updateStatus({ id: data.id, status })} />
            </dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Financial Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Ticket Price</dt><dd className="font-medium">{formatCurrency(data.ticket_price)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Agent Commission</dt><dd className="font-medium">{formatCurrency(data.agent_commission)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Other Charges</dt><dd className="font-medium">{formatCurrency(data.other_charges)}</dd></div>
            <div className="flex justify-between border-t pt-3"><dt className="text-secondary">Total</dt><dd className="font-bold">{formatCurrency(data.total)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Paid</dt><dd className="font-medium text-success">{formatCurrency(data.paid)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Remaining</dt><dd className="font-medium text-warning">{formatCurrency(data.remaining)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}