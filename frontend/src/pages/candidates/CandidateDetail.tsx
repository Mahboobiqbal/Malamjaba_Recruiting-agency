import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetCandidateQuery, useUpdateCandidateStatusMutation } from "../../services/candidate.service";
import { CANDIDATE_STATUSES } from "../../lib/constants";
import { formatDate } from "../../lib/utils";
import { Edit, ArrowLeft } from "lucide-react";

export default function CandidateDetail() {
  const { id } = useParams();
  const { data: candidate, isLoading } = useGetCandidateQuery(Number(id));
  const [updateStatus] = useUpdateCandidateStatusMutation();

  if (isLoading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (!candidate) return <div className="text-center py-8 text-slate-500">Candidate not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/candidates" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{candidate.full_name}</h2>
            <p className="text-sm text-slate-500">{candidate.candidate_code}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={candidate.status}
            onChange={(e) => updateStatus({ id: candidate.id, status: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {CANDIDATE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <Link to={`/candidates/${candidate.id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">
            <Edit className="h-4 w-4" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Personal Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Father Name</dt><dd className="font-medium">{candidate.father_name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">CNIC</dt><dd className="font-medium">{candidate.cnic || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Passport</dt><dd className="font-medium">{candidate.passport_number}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Gender</dt><dd className="font-medium capitalize">{candidate.gender || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Date of Birth</dt><dd className="font-medium">{candidate.date_of_birth ? formatDate(candidate.date_of_birth) : "-"}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Contact Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Mobile</dt><dd className="font-medium">{candidate.mobile}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Alternate Mobile</dt><dd className="font-medium">{candidate.alternate_mobile || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">City</dt><dd className="font-medium">{candidate.city || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Country</dt><dd className="font-medium">{candidate.country || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Address</dt><dd className="font-medium">{candidate.address || "-"}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Professional Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Profession</dt><dd className="font-medium">{candidate.profession || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Employer</dt><dd className="font-medium">{candidate.employer || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Visa Category</dt><dd className="font-medium">{candidate.job_visa_category || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Agent</dt><dd className="font-medium">{candidate.agent?.name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Reference</dt><dd className="font-medium">{candidate.reference || "-"}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">System Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Code</dt><dd className="font-medium">{candidate.candidate_code}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="font-medium">{CANDIDATE_STATUSES.find(s => s.value === candidate.status)?.label}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Registration Date</dt><dd className="font-medium">{formatDate(candidate.registration_date)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Passport Issue Date</dt><dd className="font-medium">{candidate.passport_issue_date ? formatDate(candidate.passport_issue_date) : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Passport Expiry Date</dt><dd className="font-medium">{candidate.passport_expiry_date ? formatDate(candidate.passport_expiry_date) : "-"}</dd></div>
          </dl>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to={`/medical/new?candidate_id=${candidate.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">Add Medical Token</Link>
        <Link to={`/visas/new?candidate_id=${candidate.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">Add Visa</Link>
        <Link to={`/tickets/new?candidate_id=${candidate.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">Add Ticket</Link>
        <Link to={`/payments/new?candidate_id=${candidate.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">Record Payment</Link>
        <Link to={`/ledger/${candidate.id}`} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">View Ledger</Link>
      </div>
    </div>
  );
}
