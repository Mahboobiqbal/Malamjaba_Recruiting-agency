import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetMedicalTokenQuery, useUpdateMedicalTokenStatusMutation } from "../../services/dashboard.service";
import { MEDICAL_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer, FileDown, DollarSign, User, Building2, CreditCard } from "lucide-react";
import { downloadPDF } from "../../lib/pdf";
import StatusDropdown from "../../components/common/StatusDropdown";
import MedicalPrintDocument from "../../components/print/MedicalPrintDocument";

const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

export default function MedicalTokenDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetMedicalTokenQuery(Number(id));
  const [updateStatus] = useUpdateMedicalTokenStatusMutation();

  if (isLoading) return <div className="text-center py-8 text-secondary">Loading...</div>;
  if (!data) return <div className="text-center py-8 text-secondary">Token not found</div>;

  const fee = data.medical_fee || 0;
  const paid = data.paid_amount || 0;
  const remaining = Math.max(fee - paid, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/medical" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Medical Token: {data.token_code}</h2>
            <p className="text-sm text-secondary">{data.candidate?.full_name || "N/A"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={`/payments/new?candidate_id=${data.candidate_id}&medical_token_id=${data.id}`}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700">
            <DollarSign className="h-4 w-4" /> Pay Now
          </Link>
          <button onClick={() => downloadPDF("print-area", data.token_code)} className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary/90">
            <FileDown className="h-4 w-4" /> Download PDF
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-secondary">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <div id="print-area" className="print-only">
        <MedicalPrintDocument token={data} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Medical Details</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Token Code</dt><dd className="font-medium">{data.token_code}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Token Number</dt><dd className="font-medium">{data.token_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Medical Center</dt><dd className="font-medium">{data.medical_center || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Medical Date</dt><dd className="font-medium">{data.medical_date ? formatDate(data.medical_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Appointment Date</dt><dd className="font-medium">{data.appointment_date ? formatDate(data.appointment_date) : "-"}</dd></div>
            <div className="flex justify-between items-center pt-2 border-t"><dt className="text-secondary">Status</dt><dd>
              <StatusDropdown value={data.medical_status} options={MEDICAL_STATUSES} onChange={(medical_status) => updateStatus({ id: data.id, medical_status })} />
            </dd></div>
          </dl>
        </div>

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Financial Details</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Medical Fee</dt><dd className="font-medium">{formatCurrency(fee)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Amount Paid</dt><dd className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(paid)}</dd></div>
            <div className="flex justify-between border-t pt-3"><dt className="text-secondary font-semibold">Remaining</dt><dd className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(remaining)}</dd></div>
            <div className="flex justify-between items-center pt-2 border-t"><dt className="text-secondary">Payment Status</dt><dd>
              <StatusDropdown value={data.payment_status} options={PAYMENT_STATUSES} onChange={(payment_status) => updateStatus({ id: data.id, payment_status })} />
            </dd></div>
          </dl>
        </div>

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Candidate Info</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Name</dt><dd className="font-medium">{data.candidate?.full_name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Code</dt><dd className="font-medium">{data.candidate?.candidate_code || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Passport</dt><dd className="font-medium">{data.candidate?.passport_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Mobile</dt><dd className="font-medium">{data.candidate?.mobile || "-"}</dd></div>
            {data.agent && (
              <>
                <div className="flex justify-between pt-2 border-t"><dt className="text-secondary">Agent</dt><dd className="font-medium">{data.agent.name}</dd></div>
                <div className="flex justify-between"><dt className="text-secondary">Agent Code</dt><dd className="font-medium">{data.agent.agent_code}</dd></div>
              </>
            )}
          </dl>
        </div>
      </div>

      {data.remarks && (
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-white">Remarks</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{data.remarks}</p>
        </div>
      )}
    </div>
  );
}
