import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateVisaMutation } from "../../services/dashboard.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { useGetAgentsQuery } from "../../services/agent.service";
import { VISA_STATUSES } from "../../lib/constants";
import { getErrorMessage, apiFetch } from "../../lib/utils";
import FieldError from "../../components/common/FieldError";
import toast from "react-hot-toast";

export default function VisaCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateId = searchParams.get("candidate_id");
  const [createVisa, { isLoading }] = useCreateVisaMutation();
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const { data: agentsData } = useGetAgentsQuery({ per_page: 100 });
  const [lookingUp, setLookingUp] = useState(false);
  const [vendorTransactionId, setVendorTransactionId] = useState<number | null>(null);
  const [purchaseInfo, setPurchaseInfo] = useState<{ visa_country: string; visa_type: string; purchase_price: number } | null>(null);
  const [form, setForm] = useState({
    candidate_id: candidateId ? Number(candidateId) : 0,
    agent_id: 0,
    visa_type: "", country: "", visa_number: "", sponsor_number: "", reference_number: "",
    issue_date: "", expiry_date: "", status: "processing",
    profession: "", employer: "", sponsor: "", wakala_reference: "",
    visa_fee: 0, agent_fee: 0, other_charges: 0, remarks: "",
  });

  const handleLookup = async () => {
    if (!form.visa_number) {
      toast.error("Enter Visa Number to lookup purchase");
      return;
    }
    setLookingUp(true);
    try {
      const params = new URLSearchParams({ visa_number: form.visa_number });
      const r = await apiFetch(`/api/vendors/transactions/lookup/by-visa-number?${params.toString()}`);
      setVendorTransactionId(r.id);
      setPurchaseInfo({ visa_country: r.visa_country || "", visa_type: r.visa_type || "", purchase_price: r.purchase_price || 0 });
      setForm((prev) => ({
        ...prev,
        candidate_id: r.candidate_id || prev.candidate_id,
        visa_type: r.visa_type || prev.visa_type,
        country: r.visa_country || prev.country,
      }));
      toast.success("Purchase found — details loaded");
    } catch (err: any) {
      setVendorTransactionId(null);
      setPurchaseInfo(null);
      const msg = err?.message || "No purchase found for this visa number";
      toast.error(typeof msg === "string" ? msg : "No purchase found");
    } finally {
      setLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...form,
        candidate_id: Number(form.candidate_id),
        agent_id: form.agent_id || undefined,
        issue_date: form.issue_date || undefined,
        expiry_date: form.expiry_date || undefined,
      };
      if (vendorTransactionId) {
        payload.vendor_transaction_id = vendorTransactionId;
      }
      await createVisa(payload).unwrap();
      toast.success("Visa created");
      navigate("/visas");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to create visa"));
    }
  };

  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">New Visa</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Candidate *</label>
              <select value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: Number(e.target.value) })} required className={inputClass}>
                <option value={0}>Select Candidate</option>
                {candidatesData?.items.map((c) => <option key={c.id} value={c.id}>{c.candidate_code} - {c.full_name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Agent (optional - for commission)</label>
              <select value={form.agent_id} onChange={(e) => setForm({ ...form, agent_id: Number(e.target.value) })} className={inputClass}>
                <option value={0}>No Agent</option>
                {agentsData?.items.map((a) => <option key={a.id} value={a.id}>{a.agent_code} - {a.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Lookup Purchase by Visa Number</label>
              <div className="mt-1 flex gap-2">
                <input type="text" value={form.visa_number} onChange={(e) => setForm({ ...form, visa_number: e.target.value })}
                  placeholder="Visa Number" className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                <button type="button" onClick={handleLookup} disabled={lookingUp || !form.visa_number}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                  {lookingUp ? "Loading..." : "Lookup"}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">Enter Visa Number to auto-fill from purchase</p>
              {purchaseInfo && (
                <div className="mt-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                  Purchase loaded: {purchaseInfo.visa_country} ({purchaseInfo.visa_type}) | Purchase Price: {new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(purchaseInfo.purchase_price)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visa Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Type</label>
              <input type="text" value={form.visa_type} onChange={(e) => setForm({ ...form, visa_type: e.target.value })}
                placeholder="e.g. Work, Visit, Family" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Country</label>
              <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. Saudi Arabia, UAE" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Number</label>
              <input type="text" value={form.visa_number} onChange={(e) => setForm({ ...form, visa_number: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Sponsor Number</label>
              <input type="text" value={form.sponsor_number} onChange={(e) => setForm({ ...form, sponsor_number: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {VISA_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Issue Date</label>
              <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Employer</label>
              <input type="text" value={form.employer} onChange={(e) => setForm({ ...form, employer: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pricing</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Fee (selling) *</label>
              <input type="number" step="0.01" value={form.visa_fee || ""} onChange={(e) => setForm({ ...form, visa_fee: Number(e.target.value) })} required min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Agent Fee</label>
              <input type="number" step="0.01" value={form.agent_fee || ""} onChange={(e) => setForm({ ...form, agent_fee: Number(e.target.value) })} min="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Other Charges</label>
              <input type="number" step="0.01" value={form.other_charges || ""} onChange={(e) => setForm({ ...form, other_charges: Number(e.target.value) })} min="0" className={inputClass} />
            </div>
          </div>
          {purchaseInfo && form.visa_fee > 0 && (
            <div className={`mt-4 rounded-lg border p-3 text-xs font-medium ${form.visa_fee >= purchaseInfo.purchase_price ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"}`}>
              {form.visa_fee >= purchaseInfo.purchase_price ? "Profit" : "Loss"}: {new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(form.visa_fee - purchaseInfo.purchase_price)}
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
            {isLoading ? "Saving..." : "Create Visa"}
          </button>
          <button type="button" onClick={() => navigate("/visas")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
