import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetVendorQuery, useCreateVendorTransactionMutation } from "../../services/vendor.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { getErrorMessage, getFieldErrors } from "../../lib/utils";
import FieldError from "../../components/common/FieldError";
import toast from "react-hot-toast";

export default function VendorTransactionCreate() {
  const { id } = useParams();
  const vendorId = Number(id);
  const navigate = useNavigate();
  const { data: vendor } = useGetVendorQuery(vendorId);
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const [createTransaction, { isLoading }] = useCreateVendorTransactionMutation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    candidate_id: 0,
    service_type: "ticket",
    passenger_name: "",
    ticket_number: "",
    pnr: "",
    origin: "",
    destination: "",
    travel_date: "",
    travel_time: "",
    airline: "",
    flight_number: "",
    visa_country: "",
    visa_type: "",
    visa_date: "",
    purchase_price: 0,
    selling_price: 0,
    payment_method: "",
    reference_number: "",
    remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    try {
      await createTransaction({
        vendorId,
        data: {
          service_type: form.service_type,
          candidate_id: form.candidate_id || undefined,
          passenger_name: form.passenger_name || undefined,
          ticket_number: form.ticket_number || undefined,
          pnr: form.pnr || undefined,
          origin: form.origin || undefined,
          destination: form.destination || undefined,
          travel_date: form.travel_date || undefined,
          travel_time: form.travel_time || undefined,
          airline: form.airline || undefined,
          flight_number: form.flight_number || undefined,
          visa_country: form.visa_country || undefined,
          visa_type: form.visa_type || undefined,
          visa_date: form.visa_date || undefined,
          purchase_price: form.purchase_price,
          selling_price: form.selling_price,
          payment_method: form.payment_method || undefined,
          reference_number: form.reference_number || undefined,
          remarks: form.remarks || undefined,
        },
      }).unwrap();
      toast.success("Purchase recorded");
      navigate(`/vendors/${id}`);
    } catch (err: any) {
      const fe = getFieldErrors(err);
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
      } else {
        toast.error(getErrorMessage(err, "Failed to record purchase"));
      }
    }
  };

  const inputClass = "mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
        Record Purchase from {vendor?.name || "..."}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purchase Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Service Type *</label>
              <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} className={`${inputClass} ${fieldErrors.service_type ? "border-red-500" : ""}`}>
                <option value="ticket">Ticket</option>
                <option value="visa">Visa</option>
              </select>
              <FieldError errors={fieldErrors} field="service_type" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Passenger / Applicant Name</label>
              <input type="text" value={form.passenger_name} onChange={(e) => setForm({ ...form, passenger_name: e.target.value })}
                placeholder="Full name as on passport" className={`${inputClass} ${fieldErrors.passenger_name ? "border-red-500" : ""}`} />
              <FieldError errors={fieldErrors} field="passenger_name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Candidate (optional)</label>
              <select value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: Number(e.target.value) })} className={inputClass}>
                <option value={0}>Select Candidate</option>
                {candidatesData?.items.map((c) => <option key={c.id} value={c.id}>{c.candidate_code} - {c.full_name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {form.service_type === "ticket" && (
          <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
            <h3 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Flight Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Ticket Number *</label>
                <input type="text" value={form.ticket_number} onChange={(e) => setForm({ ...form, ticket_number: e.target.value })}
                  placeholder="e.g. 176-1234567890" className={`${inputClass} ${fieldErrors.ticket_number ? "border-red-500" : ""}`} />
                <FieldError errors={fieldErrors} field="ticket_number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">PNR *</label>
                <input type="text" value={form.pnr} onChange={(e) => setForm({ ...form, pnr: e.target.value })}
                  placeholder="e.g. ABC123" className={`${inputClass} ${fieldErrors.pnr ? "border-red-500" : ""}`} />
                <FieldError errors={fieldErrors} field="pnr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Origin (From) *</label>
                <input type="text" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  placeholder="e.g. Karachi (KHI)" className={`${inputClass} ${fieldErrors.origin ? "border-red-500" : ""}`} />
                <FieldError errors={fieldErrors} field="origin" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Destination (To) *</label>
                <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  placeholder="e.g. Dubai (DXB)" className={`${inputClass} ${fieldErrors.destination ? "border-red-500" : ""}`} />
                <FieldError errors={fieldErrors} field="destination" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Travel Date *</label>
                <input type="date" value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} className={`${inputClass} ${fieldErrors.travel_date ? "border-red-500" : ""}`} />
                <FieldError errors={fieldErrors} field="travel_date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Departure Time</label>
                <input type="time" value={form.travel_time} onChange={(e) => setForm({ ...form, travel_time: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Airline *</label>
                <input type="text" value={form.airline} onChange={(e) => setForm({ ...form, airline: e.target.value })}
                  placeholder="e.g. Emirates, PIA, Airblue" className={`${inputClass} ${fieldErrors.airline ? "border-red-500" : ""}`} />
                <FieldError errors={fieldErrors} field="airline" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Flight Number</label>
                <input type="text" value={form.flight_number} onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
                  placeholder="e.g. EK-614" className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {form.service_type === "visa" && (
          <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
            <h3 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visa Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Country *</label>
                <input type="text" value={form.visa_country} onChange={(e) => setForm({ ...form, visa_country: e.target.value })}
                  placeholder="e.g. Saudi Arabia, UAE" className={`${inputClass} ${fieldErrors.visa_country ? "border-red-500" : ""}`} />
                <FieldError errors={fieldErrors} field="visa_country" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Type *</label>
                <input type="text" value={form.visa_type} onChange={(e) => setForm({ ...form, visa_type: e.target.value })}
                  placeholder="e.g. Work, Visit, Family" className={`${inputClass} ${fieldErrors.visa_type ? "border-red-500" : ""}`} />
                <FieldError errors={fieldErrors} field="visa_type" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Processing Date</label>
                <input type="date" value={form.visa_date} onChange={(e) => setForm({ ...form, visa_date: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
          <h3 className="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pricing & Payment</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Purchase Price (what you pay vendor) *</label>
              <input type="number" step="0.01" value={form.purchase_price || ""} onChange={(e) => setForm({ ...form, purchase_price: Number(e.target.value) })} required min="0"
                className={`${inputClass} ${fieldErrors.purchase_price ? "border-red-500" : ""}`} />
              <FieldError errors={fieldErrors} field="purchase_price" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Selling Price (what candidate pays you)</label>
              <input type="number" step="0.01" value={form.selling_price || ""} onChange={(e) => setForm({ ...form, selling_price: Number(e.target.value) })} min="0"
                placeholder="Add later" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Payment Method</label>
              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className={inputClass}>
                <option value="">Select Method</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="credit">Credit (Pay Later)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Reference Number</label>
              <input type="text" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} className={inputClass} />
            </div>
          </div>
          {form.purchase_price > 0 && form.selling_price > 0 && (
            <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-4">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                Profit: <span className="font-bold">{formatCurrency(form.selling_price - form.purchase_price)}</span>
              </p>
            </div>
          )}
          {form.purchase_price > 0 && !form.selling_price && (
            <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Selling price not set yet — profit will be calculated when you update it later.
              </p>
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
            {isLoading ? "Saving..." : "Record Purchase"}
          </button>
          <button type="button" onClick={() => navigate(`/vendors/${id}`)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);
}
