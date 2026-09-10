import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useCreatePaymentMutation,
  useGetPaymentsQuery,
  useGetOutstandingBalancesQuery,
  useGetVisaQuery,
  useGetTicketQuery,
  useGetMedicalTokenQuery,
} from "../../services/dashboard.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { useGetAgentsQuery } from "../../services/agent.service";
import { PAYMENT_METHODS, PAYMENT_TYPES } from "../../lib/constants";
import { formatCurrency, getErrorMessage } from "../../lib/utils";
import toast from "react-hot-toast";

function parseId(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function paymentEffect(paymentType: string, amount: number): number {
  return paymentType === "refund" ? -amount : amount;
}

export default function PaymentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateIdFromQuery = parseId(searchParams.get("candidate_id"));
  const visaId = parseId(searchParams.get("visa_id"));
  const ticketId = parseId(searchParams.get("ticket_id"));
  const medicalTokenId = parseId(searchParams.get("medical_token_id"));
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const { data: agentsData } = useGetAgentsQuery({ per_page: 100 });
  const { data: outstandingBalances } = useGetOutstandingBalancesQuery();
  const { data: visaData } = useGetVisaQuery(visaId ?? 0, { skip: !visaId });
  const { data: ticketData } = useGetTicketQuery(ticketId ?? 0, { skip: !ticketId });
  const { data: medicalTokenData } = useGetMedicalTokenQuery(medicalTokenId ?? 0, { skip: !medicalTokenId });
  const { data: medicalPayments } = useGetPaymentsQuery(
    medicalTokenId ? { medical_token_id: medicalTokenId, page: 1, per_page: 100 } : { page: 1, per_page: 1 },
    { skip: !medicalTokenId },
  );
  const [form, setForm] = useState({
    candidate_id: candidateIdFromQuery || 0,
    agent_id: 0,
    visa_id: visaId || 0,
    ticket_id: ticketId || 0,
    medical_token_id: medicalTokenId || 0,
    payment_date: new Date().toISOString().slice(0, 16),
    payment_type: "paid",
    amount: 0,
    payment_method: "cash",
    reference_number: "",
    description: "",
    remarks: "",
  });
  const [amountAutoFillKey, setAmountAutoFillKey] = useState("");

  const linkedCandidateId = visaData?.candidate_id || ticketData?.candidate_id || medicalTokenData?.candidate_id || candidateIdFromQuery || 0;

  const medicalSummary = useMemo(() => {
    if (!medicalTokenData) return null;
    const netPaid = medicalPayments?.items.reduce((total, payment) => total + paymentEffect(payment.payment_type, Number(payment.amount)), 0) || 0;
    const paid = Math.max(netPaid, 0);
    const remaining = Math.max(Number(medicalTokenData.medical_fee || 0) - paid, 0);
    return {
      label: "Medical Token",
      code: medicalTokenData.token_code,
      candidateName: medicalTokenData.candidate?.full_name || "N/A",
      total: Number(medicalTokenData.medical_fee || 0),
      paid,
      remaining,
      reference: medicalTokenData.medical_center || "N/A",
      status: medicalTokenData.payment_status,
    };
  }, [medicalPayments?.items, medicalTokenData]);

  const linkedSummary = useMemo(() => {
    if (visaData) {
      return {
        label: "Visa Payment",
        code: visaData.visa_code,
        candidateName: visaData.candidate?.full_name || "N/A",
        total: Number(visaData.total_cost || 0),
        paid: Number(visaData.paid_amount || 0),
        remaining: Number(visaData.remaining_amount || 0),
        reference: visaData.country || visaData.visa_type || "N/A",
        status: visaData.status,
      };
    }
    if (ticketData) {
      return {
        label: "Ticket Payment",
        code: ticketData.ticket_code,
        candidateName: ticketData.candidate?.full_name || "N/A",
        total: Number(ticketData.total || 0),
        paid: Number(ticketData.paid || 0),
        remaining: Number(ticketData.remaining || 0),
        reference: ticketData.airline || `${ticketData.departure_airport || ""}${ticketData.arrival_airport ? ` → ${ticketData.arrival_airport}` : ""}` || "N/A",
        status: ticketData.status,
      };
    }
    if (medicalSummary) {
      return medicalSummary;
    }
    return null;
  }, [medicalSummary, ticketData, visaData]);

  const candidateOutstanding = outstandingBalances?.find((item) => item.candidate.id === form.candidate_id)?.balance || 0;
  const suggestedAmount = linkedSummary ? linkedSummary.remaining : candidateOutstanding;
  const canUseSuggestedAmount = suggestedAmount > 0;

  useEffect(() => {
    if (linkedCandidateId && form.candidate_id !== linkedCandidateId) {
      setForm((prev) => ({ ...prev, candidate_id: linkedCandidateId }));
    }
  }, [form.candidate_id, linkedCandidateId]);

  useEffect(() => {
    const autofillKey = linkedSummary ? `${linkedSummary.label}-${linkedSummary.code}` : `candidate-${form.candidate_id || 0}`;
    if (!autofillKey || suggestedAmount <= 0) {
      setAmountAutoFillKey("");
      return;
    }
    if (amountAutoFillKey === autofillKey) return;
    setForm((prev) => (prev.amount > 0 ? prev : { ...prev, amount: Number(suggestedAmount.toFixed(2)) }));
    setAmountAutoFillKey(autofillKey);
  }, [amountAutoFillKey, form.candidate_id, linkedSummary, suggestedAmount]);

  const targetTitle = linkedSummary?.label || "Candidate Payment";
  const targetHint = linkedSummary
    ? `Linked to ${linkedSummary.code} for ${linkedSummary.candidateName}`
    : form.candidate_id
      ? `Candidate balance for ${candidatesData?.items.find((candidate) => candidate.id === form.candidate_id)?.full_name || "selected candidate"}`
      : "Choose a candidate or open a linked record to prefill the payment.";

  const handleAmountChange = (value: string) => {
    setAmountAutoFillKey(linkedSummary ? `${linkedSummary.label}-${linkedSummary.code}` : `candidate-${form.candidate_id || 0}`);
    setForm({ ...form, amount: Number(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidate_id && !linkedSummary) {
      toast.error("Select a candidate or open a linked visa, ticket, or medical record before saving.");
      return;
    }
    if (linkedSummary && form.amount > linkedSummary.remaining) {
      toast.error("Payment amount cannot exceed the remaining balance for this linked record.");
      return;
    }
    if (!linkedSummary && form.candidate_id) {
      const outstanding = outstandingBalances?.find((item) => item.candidate.id === form.candidate_id)?.balance || 0;
      if (outstanding > 0 && form.amount > outstanding) {
        toast.error("Payment amount cannot exceed the selected candidate's outstanding balance.");
        return;
      }
    }
    try {
      await createPayment({
        ...form,
        candidate_id: form.candidate_id || undefined,
        agent_id: form.agent_id || undefined,
        visa_id: form.visa_id || undefined,
        ticket_id: form.ticket_id || undefined,
        medical_token_id: form.medical_token_id || undefined,
        payment_date: new Date(form.payment_date).toISOString(),
      }).unwrap();
      navigate("/payments");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to record payment"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Record Payment</h2>
      {(linkedSummary || form.candidate_id) && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Payment Context</p>
              <h3 className="mt-1 text-lg font-semibold">{targetTitle}</h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">{targetHint}</p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-3 text-right shadow-sm dark:bg-slate-950/40">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Suggested Amount</p>
              <p className="text-2xl font-bold">{canUseSuggestedAmount ? formatCurrency(suggestedAmount) : "PKR 0"}</p>
            </div>
          </div>
          {linkedSummary && (
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white/80 p-4 shadow-sm dark:bg-slate-950/40">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</dt>
                <dd className="mt-1 text-lg font-semibold">{formatCurrency(linkedSummary.total)}</dd>
              </div>
              <div className="rounded-xl bg-white/80 p-4 shadow-sm dark:bg-slate-950/40">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Paid</dt>
                <dd className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(linkedSummary.paid)}</dd>
              </div>
              <div className="rounded-xl bg-white/80 p-4 shadow-sm dark:bg-slate-950/40">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Remaining</dt>
                <dd className="mt-1 text-lg font-semibold text-rose-700 dark:text-rose-300">{formatCurrency(linkedSummary.remaining)}</dd>
              </div>
            </dl>
          )}
          {!linkedSummary && form.candidate_id > 0 && (
            <div className="mt-4 rounded-xl bg-white/80 p-4 shadow-sm dark:bg-slate-950/40">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Outstanding Balance</p>
              <p className="mt-1 text-lg font-semibold text-rose-700 dark:text-rose-300">{formatCurrency(candidateOutstanding)}</p>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Candidate</label>
            <select
              value={form.candidate_id}
              onChange={(e) => setForm({ ...form, candidate_id: Number(e.target.value) })}
              disabled={Boolean(linkedCandidateId)}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
            >
              <option value={0}>Select Candidate (Optional)</option>
              {candidatesData?.items.map((c) => <option key={c.id} value={c.id}>{c.candidate_code} - {c.full_name}</option>)}
            </select>
            {linkedCandidateId ? (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">The candidate is locked to the selected visa, ticket, or medical token.</p>
            ) : form.candidate_id ? (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {candidateOutstanding > 0 ? `Outstanding balance: ${formatCurrency(candidateOutstanding)}` : "No outstanding balance found for the selected candidate."}
              </p>
            ) : null}
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Paid Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={linkedSummary?.remaining || undefined}
              value={form.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter amount"
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white"
              required
            />
            {linkedSummary ? (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Payments above the remaining balance are blocked by the server.</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Enter the amount collected from the candidate.</p>
            )}
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
          <button type="submit" disabled={isLoading || (!form.candidate_id && !linkedSummary)}
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
