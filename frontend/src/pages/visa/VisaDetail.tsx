import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetVisaQuery, useUpdateVisaStatusMutation } from "../../services/dashboard.service";
import { VISA_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer } from "lucide-react";
import StatusDropdown from "../../components/common/StatusDropdown";

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
          <Link to="/visas" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Visa: {visa.visa_code}</h2>
            <p className="text-sm text-secondary">{visa.candidate?.full_name || "N/A"} - {visa.country || ""}</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Visa Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Visa Code</dt><dd className="font-medium">{visa.visa_code}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Type</dt><dd className="font-medium">{visa.visa_type || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Country</dt><dd className="font-medium">{visa.country || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Visa Number</dt><dd className="font-medium">{visa.visa_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Sponsor Number</dt><dd className="font-medium">{visa.sponsor_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Issue Date</dt><dd className="font-medium">{visa.issue_date ? formatDate(visa.issue_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Expiry Date</dt><dd className="font-medium">{visa.expiry_date ? formatDate(visa.expiry_date) : "-"}</dd></div>
            <div className="flex justify-between items-center"><dt className="text-secondary">Status</dt><dd>
              <StatusDropdown value={visa.status} options={VISA_STATUSES} onChange={(status) => updateStatus({ id: visa.id, status })} />
            </dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Financial Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Visa Fee</dt><dd className="font-medium">{formatCurrency(visa.visa_fee)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Agent Fee</dt><dd className="font-medium">{formatCurrency(visa.agent_fee)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Other Charges</dt><dd className="font-medium">{formatCurrency(data.other_charges)}</dd></div>
            <div className="flex justify-between border-t pt-3"><dt className="text-secondary">Total Cost</dt><dd className="font-bold">{formatCurrency(data.total_cost)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Paid Amount</dt><dd className="font-medium text-success">{formatCurrency(data.paid_amount)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Remaining</dt><dd className="font-medium text-warning">{formatCurrency(data.remaining_amount)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}