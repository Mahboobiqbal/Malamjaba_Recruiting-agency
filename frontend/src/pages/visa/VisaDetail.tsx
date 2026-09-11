import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetVisaQuery, useUpdateVisaStatusMutation } from "../../services/dashboard.service";
import { VISA_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer, FileDown, DollarSign } from "lucide-react";
import { downloadPDF } from "../../lib/pdf";
import StatusDropdown from "../../components/common/StatusDropdown";
import VisaPrintDocument from "../../components/print/VisaPrintDocument";

export default function VisaDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetVisaQuery(Number(id));
  const [updateStatus] = useUpdateVisaStatusMutation();

  if (isLoading) return <div className="text-center py-8 text-secondary">Loading...</div>;
  if (!data) return <div className="text-center py-8 text-secondary">Visa not found</div>;

  const visa = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/visas" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Visa: {visa.visa_code}</h2>
            <p className="text-sm text-secondary-foreground">{visa.candidate?.full_name || "N/A"} - {visa.country || ""}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={`/payments/new?candidate_id=${visa.candidate_id}&visa_id=${visa.id}`}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700">
            <DollarSign className="h-4 w-4" /> Pay Now
          </Link>
          <button onClick={() => downloadPDF("print-area", visa.visa_code)} className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary/90">
            <FileDown className="h-4 w-4" /> Download PDF
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-secondary">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <div id="print-area" className="print-only">
        <VisaPrintDocument visa={data} totalCost={data.total_cost} paidAmount={data.paid_amount} remainingAmount={data.remaining_amount} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Visa Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary-foreground">Visa Code</dt><dd className="font-medium text-slate-800 dark:text-white">{visa.visa_code}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Type</dt><dd className="font-medium text-slate-800 dark:text-white">{visa.visa_type || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Country</dt><dd className="font-medium text-slate-800 dark:text-white">{visa.country || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Visa Number</dt><dd className="font-medium text-slate-800 dark:text-white">{visa.visa_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Sponsor Number</dt><dd className="font-medium text-slate-800 dark:text-white">{visa.sponsor_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Issue Date</dt><dd className="font-medium text-slate-800 dark:text-white">{visa.issue_date ? formatDate(visa.issue_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Expiry Date</dt><dd className="font-medium text-slate-800 dark:text-white">{visa.expiry_date ? formatDate(visa.expiry_date) : "-"}</dd></div>
            <div className="flex justify-between items-center"><dt className="text-secondary-foreground">Status</dt><dd>
              <StatusDropdown value={visa.status} options={VISA_STATUSES} onChange={(status) => updateStatus({ id: visa.id, status })} />
            </dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Financial Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary-foreground">Visa Fee</dt><dd className="font-medium text-slate-800 dark:text-white">{formatCurrency(visa.visa_fee)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Agent Fee</dt><dd className="font-medium text-slate-800 dark:text-white">{formatCurrency(visa.agent_fee)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Other Charges</dt><dd className="font-medium text-slate-800 dark:text-white">{formatCurrency(data.other_charges)}</dd></div>
            <div className="flex justify-between border-t pt-3"><dt className="text-secondary-foreground">Total Cost</dt><dd className="font-bold">{formatCurrency(data.total_cost)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Paid Amount</dt><dd className="font-medium text-success">{formatCurrency(data.paid_amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary-foreground">Remaining</dt><dd className="font-medium text-warning">{formatCurrency(data.remaining_amount)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}