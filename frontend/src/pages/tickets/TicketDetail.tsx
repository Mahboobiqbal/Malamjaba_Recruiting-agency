import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetTicketQuery, useUpdateTicketStatusMutation } from "../../services/dashboard.service";
import { TICKET_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer, FileDown, DollarSign } from "lucide-react";
import { downloadPDF } from "../../lib/pdf";
import StatusDropdown from "../../components/common/StatusDropdown";
import TicketPrintDocument from "../../components/print/TicketPrintDocument";

export default function TicketDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetTicketQuery(Number(id));
  const [updateStatus] = useUpdateTicketStatusMutation();

  if (isLoading) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!data) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Ticket not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/tickets" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ticket: {data.ticket_code}</h2>
            <p className="text-sm text-secondary-foreground">{data.candidate?.full_name || "N/A"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={`/payments/new?candidate_id=${data.candidate_id}&ticket_id=${data.id}`}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700">
            <DollarSign className="h-4 w-4" /> Pay Now
          </Link>
          <button onClick={() => downloadPDF("print-area", data.ticket_code)} className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary/90">
            <FileDown className="h-4 w-4" /> Download PDF
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-secondary">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <div id="print-area" className="print-only">
        <TicketPrintDocument ticket={data} total={data.total} paid={data.paid} remaining={data.remaining} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Flight Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary-foreground">Airline</dt><dd className="font-medium text-slate-800 dark:text-white">{data.airline || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">PNR</dt><dd className="font-medium text-slate-800 dark:text-white">{data.pnr || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Ticket Number</dt><dd className="font-medium text-slate-800 dark:text-white">{data.ticket_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Flight</dt><dd className="font-medium text-slate-800 dark:text-white">{data.flight_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Route</dt><dd className="font-medium text-slate-800 dark:text-white">{data.departure_airport || "?"} → {data.arrival_airport || "?"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Departure</dt><dd className="font-medium text-slate-800 dark:text-white">{data.departure_date ? formatDate(data.departure_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Arrival</dt><dd className="font-medium text-slate-800 dark:text-white">{data.arrival_date ? formatDate(data.arrival_date) : "-"}</dd></div>
            <div className="flex justify-between items-center"><dt className="text-secondary-foreground">Status</dt><dd>
              <StatusDropdown value={data.status} options={TICKET_STATUSES} onChange={(status) => updateStatus({ id: data.id, status })} />
            </dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Financial Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary-foreground">Ticket Price</dt><dd className="font-medium text-slate-800 dark:text-white">{formatCurrency(data.ticket_price)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Agent Commission</dt><dd className="font-medium text-slate-800 dark:text-white">{formatCurrency(data.agent_commission)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Other Charges</dt><dd className="font-medium text-slate-800 dark:text-white">{formatCurrency(data.other_charges)}</dd></div>
            <div className="flex justify-between border-t pt-3"><dt className="text-secondary-foreground">Total</dt><dd className="font-bold">{formatCurrency(data.total)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Paid</dt><dd className="font-medium text-success">{formatCurrency(data.paid)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Remaining</dt><dd className="font-medium text-warning">{formatCurrency(data.remaining)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}