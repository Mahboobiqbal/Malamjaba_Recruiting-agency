import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateTicketMutation } from "../../services/dashboard.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { useGetAgentsQuery } from "../../services/agent.service";
import { TICKET_STATUSES } from "../../lib/constants";
import { getErrorMessage, apiFetch, getFieldErrors } from "../../lib/utils";
import FieldError from "../../components/common/FieldError";
import toast from "react-hot-toast";

export default function TicketCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate_id");
  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const { data: agentsData } = useGetAgentsQuery({ per_page: 100 });
  const [lookingUp, setLookingUp] = useState(false);
  const [vendorTransactionId, setVendorTransactionId] = useState<number | null>(null);
  const [purchaseInfo, setPurchaseInfo] = useState<{ origin: string; destination: string; purchase_price: number } | null>(null);
  const [form, setForm] = useState({
    candidate_id: candidateId ? Number(candidateId) : 0,
    agent_id: 0,
    airline: "", pnr: "", ticket_number: "", flight_number: "",
    departure_airport: "", arrival_airport: "", departure_date: "", departure_time: "",
    arrival_date: "", arrival_time: "", baggage_allowance: "", ticket_class: "",
    ticket_price: 0, agent_commission: 0, other_charges: 0, status: "pending", remarks: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleLookup = async () => {
    if (!form.ticket_number && !form.pnr) {
      toast.error("Enter Ticket Number or PNR");
      return;
    }
    setLookingUp(true);
    try {
      const params = new URLSearchParams();
      if (form.ticket_number) params.set("ticket_number", form.ticket_number);
      if (form.pnr) params.set("pnr", form.pnr);
      const r = await apiFetch(`/api/vendors/transactions/lookup/by-reference?${params.toString()}`);
      setVendorTransactionId(r.id);
      setPurchaseInfo({ origin: r.origin || "", destination: r.destination || "", purchase_price: r.purchase_price || 0 });
      setForm((prev) => ({
        ...prev,
        candidate_id: r.candidate_id || prev.candidate_id,
        airline: r.airline || "",
        pnr: r.pnr || "",
        ticket_number: r.ticket_number || "",
        flight_number: r.flight_number || "",
        departure_airport: r.origin || "",
        arrival_airport: r.destination || "",
        departure_date: r.travel_date || "",
        departure_time: r.travel_time || "",
      }));
      toast.success("Purchase found — details loaded");
    } catch (err: any) {
      setVendorTransactionId(null);
      setPurchaseInfo(null);
      const msg = err?.message || err?.data?.detail || "No purchase found for this ticket number / PNR";
      toast.error(typeof msg === "string" ? msg : "No purchase found");
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      const payload: any = {
        candidate_id: Number(form.candidate_id),
        agent_id: form.agent_id || undefined,
        departure_date: form.departure_date || undefined,
        arrival_date: form.arrival_date || undefined,
        departure_time: form.departure_time || undefined,
        arrival_time: form.arrival_time || undefined,
        airline: form.airline || undefined,
        pnr: form.pnr || undefined,
        ticket_number: form.ticket_number || undefined,
        flight_number: form.flight_number || undefined,
        departure_airport: form.departure_airport || undefined,
        arrival_airport: form.arrival_airport || undefined,
        baggage_allowance: form.baggage_allowance || undefined,
        ticket_class: form.ticket_class || undefined,
        ticket_price: form.ticket_price,
        agent_commission: form.agent_commission,
        other_charges: form.other_charges,
        status: form.status,
        remarks: form.remarks || undefined,
      };
      if (vendorTransactionId) {
        payload.vendor_transaction_id = vendorTransactionId;
      }
      await createTicket(payload).unwrap();
      toast.success("Ticket created");
      navigate("/tickets");
    } catch (err: any) {
      const fe = getFieldErrors(err);
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
      } else {
        toast.error(getErrorMessage(err, "Failed to create ticket"));
      }
    }
  };

  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">New Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Candidate *</label>
              <select value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: Number(e.target.value) })} required className={`${inputClass} ${fieldErrors.candidate_id ? "border-red-500" : ""}`}>
                <option value={0}>Select Candidate</option>
                {candidatesData?.items.map((c) => <option key={c.id} value={c.id}>{c.candidate_code} - {c.full_name}</option>)}
              </select>
              <FieldError errors={fieldErrors} field="candidate_id" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Agent (optional - for commission)</label>
              <select value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: Number(e.target.value) })} className={inputClass}>
                <option value={0}>No Agent</option>
                {agentsData?.items.map((a) => <option key={a.id} value={a.id}>{a.agent_code} - {a.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Lookup Purchase by Ticket Number / PNR</label>
              <div className="mt-1 flex gap-2">
                <input type="text" value={form.ticket_number} onChange={(e) => setForm({ ...form, ticket_number: e.target.value })}
                  placeholder="Ticket Number" className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                <input type="text" value={form.pnr} onChange={(e) => setForm({ ...form, pnr: e.target.value })}
                  placeholder="PNR" className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                <button type="button" onClick={handleLookup} disabled={lookingUp || (!form.ticket_number && !form.pnr)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                  {lookingUp ? "Loading..." : "Lookup"}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">Enter Ticket Number or PNR to auto-fill from purchase</p>
              {purchaseInfo && (
                <div className="mt-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                  Purchase loaded: {purchaseInfo.origin} → {purchaseInfo.destination} | Purchase Price: {new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(purchaseInfo.purchase_price)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Flight Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Airline</label>
              <input type="text" value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">PNR</label>
              <input type="text" value={form.pnr} onChange={(e) => setForm({ ...form, pnr: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Ticket Number</label>
              <input type="text" value={form.ticket_number} onChange={(e) => setForm({ ...form, ticket_number: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Flight Number</label>
              <input type="text" value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Departure Airport</label>
              <input type="text" value={form.departure_airport} onChange={(e) => setForm({ ...form, departure_airport: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Arrival Airport</label>
              <input type="text" value={form.arrival_airport} onChange={(e) => setForm({ ...form, arrival_airport: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Departure Date</label>
              <input type="date" value={form.departure_date} onChange={(e) => setForm({ ...form, departure_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Departure Time</label>
              <input type="time" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {TICKET_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pricing</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Ticket Price (selling) *</label>
              <input type="number" step="0.01" value={form.ticket_price || ""} onChange={(e) => setForm({ ...form, ticket_price: Number(e.target.value) })} required min="0" className={`${inputClass} ${fieldErrors.ticket_price ? "border-red-500" : ""}`} />
              <FieldError errors={fieldErrors} field="ticket_price" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Agent Commission</label>
              <input type="number" step="0.01" value={form.agent_commission || ""} onChange={(e) => setForm({ ...form, agent_commission: Number(e.target.value) })} min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Other Charges</label>
              <input type="number" step="0.01" value={form.other_charges || ""} onChange={(e) => setForm({ ...form, other_charges: Number(e.target.value) })} min="0" className={inputClass} />
            </div>
          </div>
          {purchaseInfo && form.ticket_price > 0 && (
            <div className={`mt-4 rounded-lg border p-3 text-xs font-medium ${form.ticket_price >= purchaseInfo.purchase_price ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"}`}>
              {form.ticket_price >= purchaseInfo.purchase_price ? "Profit" : "Loss"}: {new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(form.ticket_price - purchaseInfo.purchase_price)}
            </div>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Create Ticket"}
          </button>
          <button type="button" onClick={() => navigate("/tickets")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
