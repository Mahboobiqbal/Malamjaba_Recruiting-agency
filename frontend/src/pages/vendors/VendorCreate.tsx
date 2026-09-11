import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateVendorMutation } from "../../services/vendor.service";
import { getErrorMessage } from "../../lib/utils";
import toast from "react-hot-toast";

export default function VendorCreate() {
  const navigate = useNavigate();
  const [createVendor, { isLoading }] = useCreateVendorMutation();
  const [form, setForm] = useState({
    name: "", contact_person: "", phone: "", email: "", address: "",
    bank_name: "", account_title: "", account_number: "", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVendor({
        ...form,
        email: form.email || undefined,
        contact_person: form.contact_person || undefined,
        address: form.address || undefined,
        bank_name: form.bank_name || undefined,
        account_title: form.account_title || undefined,
        account_number: form.account_number || undefined,
        notes: form.notes || undefined,
      }).unwrap();
      toast.success("Vendor created");
      navigate("/vendors");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to create vendor"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">New Vendor</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Company/Person Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Contact Person</label>
            <input type="text" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Phone *</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Bank Details</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Bank Name</label>
            <input type="text" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Account Title</label>
            <input type="text" value={form.account_title} onChange={(e) => setForm({ ...form, account_title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Account Number</label>
            <input type="text" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Create Vendor"}
          </button>
          <button type="button" onClick={() => navigate("/vendors")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
