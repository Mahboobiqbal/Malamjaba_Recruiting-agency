import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateMedicalTokenMutation, useGetMedicalTokensQuery } from "../../services/dashboard.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { MEDICAL_STATUSES } from "../../lib/constants";

export default function MedicalTokenCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate_id");
  const [createToken, { isLoading }] = useCreateMedicalTokenMutation();
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const [form, setForm] = useState({
    candidate_id: candidateId ? Number(candidateId) : 0,
    token_number: "", medical_center: "", medical_date: "", appointment_date: "",
    medical_fee: 0, payment_status: "unpaid", medical_status: "pending", remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createToken({
        ...form,
        candidate_id: Number(form.candidate_id),
        medical_date: form.medical_date || undefined,
        appointment_date: form.appointment_date || undefined,
      }).unwrap();
      navigate("/medical");
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to create token");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">New Medical Token</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Candidate *</label>
            <select value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" required>
              <option value={0}>Select Candidate</option>
              {candidatesData?.items.map((c) => <option key={c.id} value={c.id}>{c.candidate_code} - {c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Token Number</label>
            <input type="text" value={form.token_number} onChange={(e) => setForm({ ...form, token_number: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Medical Center</label>
            <input type="text" value={form.medical_center} onChange={(e) => setForm({ ...form, medical_center: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Medical Date</label>
            <input type="date" value={form.medical_date} onChange={(e) => setForm({ ...form, medical_date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Appointment Date</label>
            <input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Fee</label>
            <input type="number" value={form.medical_fee} onChange={(e) => setForm({ ...form, medical_fee: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Medical Status</label>
            <select value={form.medical_status} onChange={(e) => setForm({ ...form, medical_status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none">
              {MEDICAL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Payment Status</label>
            <select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none">
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Create Token"}
          </button>
          <button type="button" onClick={() => navigate("/medical")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
