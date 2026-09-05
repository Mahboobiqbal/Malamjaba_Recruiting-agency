import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCandidateMutation } from "../../services/candidate.service";
import { useGetAgentsQuery } from "../../services/agent.service";

export default function CandidateCreate() {
  const navigate = useNavigate();
  const [createCandidate, { isLoading }] = useCreateCandidateMutation();
  const { data: agentsData } = useGetAgentsQuery({ per_page: 100 });
  const [form, setForm] = useState({
    full_name: "", father_name: "", cnic: "", passport_number: "",
    mobile: "", alternate_mobile: "", address: "", city: "", country: "",
    profession: "", employer: "", job_visa_category: "", agent_id: 0,
    reference: "", notes: "", gender: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCandidate({
        ...form,
        agent_id: form.agent_id || undefined,
      }).unwrap();
      navigate("/candidates");
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to create candidate");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">New Candidate</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name *</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Father Name</label>
            <input type="text" value={form.father_name} onChange={(e) => setForm({ ...form, father_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">CNIC</label>
            <input type="text" value={form.cnic} onChange={(e) => setForm({ ...form, cnic: e.target.value })}
              placeholder="XXXXX-XXXXXXX-X"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Passport Number *</label>
            <input type="text" value={form.passport_number} onChange={(e) => setForm({ ...form, passport_number: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mobile *</label>
            <input type="text" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Alternate Mobile</label>
            <input type="text" value={form.alternate_mobile} onChange={(e) => setForm({ ...form, alternate_mobile: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Agent</label>
            <select value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option value={0}>Select Agent</option>
              {agentsData?.items.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Country</label>
            <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Profession</label>
            <input type="text" value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Employer</label>
            <input type="text" value={form.employer} onChange={(e) => setForm({ ...form, employer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Visa Category</label>
            <input type="text" value={form.job_visa_category} onChange={(e) => setForm({ ...form, job_visa_category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Reference</label>
            <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Create Candidate"}
          </button>
          <button type="button" onClick={() => navigate("/candidates")}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
