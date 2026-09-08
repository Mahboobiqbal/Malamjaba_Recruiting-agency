import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCandidateMutation } from "../../services/candidate.service";
import { useGetAgentsQuery } from "../../services/agent.service";
import { formatCNIC } from "../../lib/utils";

function parseErrors(err: any): string {
  if (err?.data?.detail) {
    const d = err.data.detail;
    if (Array.isArray(d)) {
      return d.map((e: any) => {
        const field = e.loc?.[1] || e.loc?.[0] || "";
        return `${field ? field + ": " : ""}${e.msg}`;
      }).join("\n");
    }
    return d;
  }
  return "Failed to create candidate";
}

export default function CandidateCreate() {
  const navigate = useNavigate();
  const [createCandidate, { isLoading }] = useCreateCandidateMutation();
  const { data: agentsData } = useGetAgentsQuery({ per_page: 100 });
  const [errors, setErrors] = useState("");
  const [form, setForm] = useState({
    full_name: "", father_name: "", cnic: "", passport_number: "",
    mobile: "", alternate_mobile: "", address: "", city: "", country: "",
    profession: "", employer: "", job_visa_category: "", agent_id: 0,
    reference: "", notes: "", gender: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors("");
    try {
      await createCandidate({
        ...form,
        agent_id: form.agent_id || undefined,
      }).unwrap();
      navigate("/candidates");
    } catch (err: any) {
      setErrors(parseErrors(err));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">New Candidate</h2>
      {errors && (
        <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 text-sm text-red-700 dark:text-red-400 whitespace-pre-line">
          {errors}
        </div>
      )}
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Full Name *</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. Muhammad Ali"
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Father Name</label>
            <input type="text" value={form.father_name} onChange={(e) => setForm({ ...form, father_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">CNIC</label>
            <input type="text" value={form.cnic} onChange={(e) => setForm({ ...form, cnic: formatCNIC(e.target.value) })}
              placeholder="35202-1234567-1"
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Passport Number *</label>
            <input type="text" value={form.passport_number} onChange={(e) => setForm({ ...form, passport_number: e.target.value.toUpperCase() })}
              placeholder="AB1234567"
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Mobile *</label>
            <input type="text" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="03012345678"
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Alternate Mobile</label>
            <input type="text" value={form.alternate_mobile} onChange={(e) => setForm({ ...form, alternate_mobile: e.target.value })}
              placeholder="03012345678"
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Agent</label>
            <select value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none">
              <option value={0}>Select Agent</option>
              {agentsData?.items.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">City</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Country</label>
            <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Profession</label>
            <input type="text" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Employer</label>
            <input type="text" value={form.employer} onChange={(e) => setForm({ ...form, employer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Category</label>
            <input type="text" value={form.job_visa_category} onChange={(e) => setForm({ ...form, job_visa_category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Reference</label>
            <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Create Candidate"}
          </button>
          <button type="button" onClick={() => navigate("/candidates")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
