import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetCandidateQuery, useUpdateCandidateMutation } from "../../services/candidate.service";
import { useGetAgentsQuery } from "../../services/agent.service";

export default function CandidateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: candidate, isLoading: loadingCandidate } = useGetCandidateQuery(Number(id));
  const [updateCandidate, { isLoading }] = useUpdateCandidateMutation();
  const { data: agentsData } = useGetAgentsQuery({ per_page: 100 });
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (candidate) {
      setForm({
        full_name: candidate.full_name || "",
        father_name: candidate.father_name || "",
        cnic: candidate.cnic || "",
        passport_number: candidate.passport_number || "",
        mobile: candidate.mobile || "",
        alternate_mobile: candidate.alternate_mobile || "",
        address: candidate.address || "",
        city: candidate.city || "",
        country: candidate.country || "",
        profession: candidate.profession || "",
        employer: candidate.employer || "",
        job_visa_category: candidate.job_visa_category || "",
        agent_id: candidate.agent_id || 0,
        reference: candidate.reference || "",
        notes: candidate.notes || "",
        gender: candidate.gender || "",
      });
    }
  }, [candidate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCandidate({ id: Number(id), data: { ...form, agent_id: form.agent_id || undefined } }).unwrap();
      navigate(`/candidates/${id}`);
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to update candidate");
    }
  };

  if (loadingCandidate) return <div className="text-center py-8 text-slate-500">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Edit Candidate</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name *</label>
            <input type="text" value={form.full_name || ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Father Name</label>
            <input type="text" value={form.father_name || ""} onChange={(e) => setForm({ ...form, father_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">CNIC</label>
            <input type="text" value={form.cnic || ""} onChange={(e) => setForm({ ...form, cnic: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Passport Number *</label>
            <input type="text" value={form.passport_number || ""} onChange={(e) => setForm({ ...form, passport_number: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mobile *</label>
            <input type="text" value={form.mobile || ""} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Alternate Mobile</label>
            <input type="text" value={form.alternate_mobile || ""} onChange={(e) => setForm({ ...form, alternate_mobile: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Gender</label>
            <select value={form.gender || ""} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Agent</label>
            <select value={form.agent_id || 0} onChange={(e) => setForm({ ...form, agent_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option value={0}>Select Agent</option>
              {agentsData?.items.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input type="text" value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Country</label>
            <input type="text" value={form.country || ""} onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Profession</label>
            <input type="text" value={form.profession || ""} onChange={(e) => setForm({ ...form, profession: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Employer</label>
            <input type="text" value={form.employer || ""} onChange={(e) => setForm({ ...form, employer: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Update Candidate"}
          </button>
          <button type="button" onClick={() => navigate(`/candidates/${id}`)}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
