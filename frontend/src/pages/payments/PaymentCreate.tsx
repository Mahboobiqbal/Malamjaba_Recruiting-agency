import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreatePaymentMutation } from "../../services/dashboard.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { useGetAgentsQuery } from "../../services/agent.service";
import { PAYMENT_METHODS, PAYMENT_TYPES } from "../../lib/constants";

export default function PaymentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate_id");
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const { data: agentsData } = useGetAgentsQuery({ per_page: 100 });
  const [form, setForm] = useState({
    candidate_id: candidateId ? Number(candidateId) : 0,
    agent_id: 0,
    payment_date: new Date().toISOString().slice(0, 16),
    payment_type: "partial",
    amount: 0,
    payment_method: "cash",
    reference_number: "",
    description: "",
    remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment({
        ...form,
        candidate_id: form.candidate_id || undefined,
        agent_id: form.agent_id || undefined,
        payment_date: new Date(form.payment_date).toISOString(),
      }).unwrap();
      navigate("/payments");
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to record payment");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Record Payment</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Candidate</label>
            <select value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white">
              <option value={0}>Select Candidate (Optional)</option>
              {candidatesData?.items.map((c) => <option key={c.id} value={c.id}>{c.candidate_code} - {c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Agent</label>
            <select value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white">
              <option value={0}>Select Agent (Optional)</option>
              {agentsData?.items.map((a) => <option key={a.id} value={a.id}>{a.agent_code} - {a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Payment Date *</label>
            <input type="datetime-local" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Amount *</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" required min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Payment Type *</label>
            <select value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white">
              {PAYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Payment Method *</label>
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white">
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Reference Number</label>
            <input type="text" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Record Payment"}
          </button>
          <button type="button" onClick={() => navigate("/payments")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
