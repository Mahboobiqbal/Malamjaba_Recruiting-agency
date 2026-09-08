import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetMedicalTokenQuery, useUpdateMedicalTokenStatusMutation } from "../../services/dashboard.service";
import { MEDICAL_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer } from "lucide-react";
import StatusDropdown from "../../components/common/StatusDropdown";

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
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Token Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Token Code</dt><dd className="font-medium">{data.token_code}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Token Number</dt><dd className="font-medium">{data.token_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Medical Center</dt><dd className="font-medium">{data.medical_center || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Medical Date</dt><dd className="font-medium">{data.medical_date ? formatDate(data.medical_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Appointment Date</dt><dd className="font-medium">{data.appointment_date ? formatDate(data.appointment_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Fee</dt><dd className="font-medium">{formatCurrency(data.medical_fee)}</dd></div>
            <div className="flex justify-between items-center"><dt className="text-secondary">Status</dt><dd>
              <StatusDropdown value={data.medical_status} options={MEDICAL_STATUSES} onChange={(medical_status) => updateStatus({ id: data.id, medical_status })} />
            </dd></div>
            <div className="flex justify-between items-center"><dt className="text-secondary">Payment Status</dt><dd>
              <StatusDropdown value={data.payment_status} options={PAYMENT_STATUSES} onChange={(payment_status) => updateStatus({ id: data.id, payment_status })} />
            </dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Candidate Info</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Name</dt><dd className="font-medium">{data.candidate?.full_name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Code</dt><dd className="font-medium">{data.candidate?.candidate_code || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Passport</dt><dd className="font-medium">{data.candidate?.passport_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Mobile</dt><dd className="font-medium">{data.candidate?.mobile || "-"}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
