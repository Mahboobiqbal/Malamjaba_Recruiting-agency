import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetVisaQuery, useUpdateVisaMutation } from "../../services/dashboard.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { useGetAgentsQuery } from "../../services/agent.service";
import { VISA_STATUSES } from "../../lib/constants";
import { getErrorMessage } from "../../lib/utils";
import toast from "react-hot-toast";

export default function VisaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: visa, isLoading: loadingVisa } = useGetVisaQuery(Number(id));
  const [updateVisa, { isLoading }] = useUpdateVisaMutation();
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const { data: agentsData } = useGetAgentsQuery({ per_page: 100 });
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (visa) {
      setForm({
        candidate_id: visa.candidate_id,
        agent_id: visa.agent_id || 0,
        visa_type: visa.visa_type || "",
        country: visa.country || "",
        visa_number: visa.visa_number || "",
        sponsor_number: visa.sponsor_number || "",
        reference_number: visa.reference_number || "",
        issue_date: visa.issue_date ? visa.issue_date.split("T")[0] : "",
        expiry_date: visa.expiry_date ? visa.expiry_date.split("T")[0] : "",
        status: visa.status || "processing",
        profession: visa.profession || "",
        employer: visa.employer || "",
        sponsor: visa.sponsor || "",
        wakala_reference: visa.wakala_reference || "",
        visa_fee: visa.visa_fee || 0,
        agent_fee: visa.agent_fee || 0,
        other_charges: visa.other_charges || 0,
        remarks: visa.remarks || "",
      });
    }
  }, [visa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateVisa({ id: Number(id), data: { ...form, candidate_id: Number(form.candidate_id), agent_id: form.agent_id || undefined } }).unwrap();
      navigate(`/visas/${id}`);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update visa"));
    }
  };

  if (loadingVisa) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Visa</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Candidate *</label>
            <select value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" required>
              <option value={0}>Select Candidate</option>
              {candidatesData?.items.map((c) => <option key={c.id} value={c.id}>{c.candidate_code} - {c.full_name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Agent (optional - for commission)</label>
            <select value={form.agent_id || 0} onChange={(e) => setForm({ ...form, agent_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white">
              <option value={0}>No Agent</option>
              {agentsData?.items.map((a) => <option key={a.id} value={a.id}>{a.agent_code} - {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Type</label>
            <input type="text" value={form.visa_type} onChange={(e) => setForm({ ...form, visa_type: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Country</label>
            <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Number</label>
            <input type="text" value={form.visa_number} onChange={(e) => setForm({ ...form, visa_number: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Sponsor Number</label>
            <input type="text" value={form.sponsor_number} onChange={(e) => setForm({ ...form, sponsor_number: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white">
              {VISA_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Issue Date</label>
            <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Expiry Date</label>
            <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Fee</label>
            <input type="number" value={form.visa_fee} onChange={(e) => setForm({ ...form, visa_fee: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Agent Fee</label>
            <input type="number" value={form.agent_fee} onChange={(e) => setForm({ ...form, agent_fee: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Other Charges</label>
            <input type="number" value={form.other_charges} onChange={(e) => setForm({ ...form, other_charges: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Employer</label>
            <input type="text" value={form.employer} onChange={(e) => setForm({ ...form, employer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Update Visa"}
          </button>
          <button type="button" onClick={() => navigate(`/visas/${id}`)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}