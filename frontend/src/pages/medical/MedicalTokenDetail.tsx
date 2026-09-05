import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetMedicalTokensQuery } from "../../services/dashboard.service";
import { MEDICAL_STATUSES } from "../../lib/constants";
import { formatDate, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer } from "lucide-react";

export default function MedicalTokenDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetMedicalTokensQuery({ per_page: 100 });
  const token = data?.items.find((t) => t.id === Number(id));

  if (isLoading) return <div className="text-center py-8 text-secondary">Loading...</div>;
  if (!token) return <div className="text-center py-8 text-secondary">Token not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/medical" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Medical Token: {token.token_code}</h2>
            <p className="text-sm text-secondary">{token.candidate?.full_name || "N/A"}</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Token Details</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Token Code</dt><dd className="font-medium">{token.token_code}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Token Number</dt><dd className="font-medium">{token.token_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Medical Center</dt><dd className="font-medium">{token.medical_center || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Medical Date</dt><dd className="font-medium">{token.medical_date ? formatDate(token.medical_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Appointment Date</dt><dd className="font-medium">{token.appointment_date ? formatDate(token.appointment_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Fee</dt><dd className="font-medium">{formatCurrency(token.medical_fee)}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Status</dt><dd className="font-medium">
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                token.medical_status === "completed" ? "bg-success text-success" :
                token.medical_status === "failed" ? "bg-warning text-warning" :
                "bg-secondary text-primary"
              }`}>{MEDICAL_STATUSES.find(s => s.value === token.medical_status)?.label}</span>
            </dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Payment Status</dt><dd className="font-medium capitalize">{token.payment_status}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Candidate Info</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-secondary">Name</dt><dd className="font-medium">{token.candidate?.full_name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Code</dt><dd className="font-medium">{token.candidate?.candidate_code || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Passport</dt><dd className="font-medium">{token.candidate?.passport_number || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-secondary">Mobile</dt><dd className="font-medium">{token.candidate?.mobile || "-"}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
