import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPaymentQuery, useUpdatePaymentMutation } from "../../services/dashboard.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { useGetAgentsQuery } from "../../services/agent.service";
import { PAYMENT_METHODS, PAYMENT_TYPES } from "../../lib/constants";
import { formatCurrency, getErrorMessage } from "../../lib/utils";
import toast from "react-hot-toast";

export default function PaymentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: payment, isLoading: loadingPayment } = useGetPaymentQuery(Number(id));
  const [updatePayment, { isLoading }] = useUpdatePaymentMutation();
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const { data: agentsData } = useGetAgentsQuery({ per_page: 100 });
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (payment) {
      setForm({
        candidate_id: payment.candidate_id || 0,
        agent_id: payment.agent_id || 0,
        visa_id: payment.visa_id || 0,
        ticket_id: payment.ticket_id || 0,
        medical_token_id: payment.medical_token_id || 0,
        payment_date: payment.payment_date ? payment.payment_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
        payment_type: payment.payment_type || "partial",
        amount: payment.amount || 0,
        payment_method: payment.payment_method || "cash",
        reference_number: payment.reference_number || "",
        description: payment.description || "",
        remarks: payment.remarks || "",
      });
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePayment({
        id: Number(id),
        data: {
          ...form,
          candidate_id: form.candidate_id || undefined,
          agent_id: form.agent_id || undefined,
          visa_id: form.visa_id || undefined,
          ticket_id: form.ticket_id || undefined,
          medical_token_id: form.medical_token_id || undefined,
          payment_date: new Date(form.payment_date).toISOString(),
        }
      }).unwrap();
      navigate(`/payments/${id}`);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update payment"));
    }
  };

  if (loadingPayment) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Payment</h2>
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
            <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" required />
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
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Update Payment"}
          </button>
          <button type="button" onClick={() => navigate(`/payments/${id}`)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}