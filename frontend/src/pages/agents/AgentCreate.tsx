import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateAgentMutation } from "../../services/agent.service";
import { formatCNIC } from "../../lib/utils";

function parseErrors(err: any): string {
  if (err?.data?.detail) {
    const d = err.data.detail;
    if (Array.isArray(d)) {
      return d.map((e: any) => e.msg).join("\n");
    }
    return d;
  }
  return "Failed to create agent";
}

export default function AgentCreate() {
  const navigate = useNavigate();
  const [createAgent, { isLoading }] = useCreateAgentMutation();
  const [errors, setErrors] = useState("");
  const [form, setForm] = useState({
    name: "", father_name: "", cnic: "", mobile: "", whatsapp: "",
    address: "", city: "", email: "", commission_rate: 0, bank_info: "",
    status: "active", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors("");
    try {
      await createAgent(form).unwrap();
      navigate("/agents");
    } catch (err: any) {
      setErrors(parseErrors(err));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">New Agent</h2>
      {errors && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 whitespace-pre-line">
          {errors}
        </div>
      )}
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ahmad Khan"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Father Name</label>
            <input type="text" value={form.father_name} onChange={(e) => setForm({ ...form, father_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">CNIC *</label>
            <input type="text" value={form.cnic} onChange={(e) => setForm({ ...form, cnic: formatCNIC(e.target.value) })}
              placeholder="35202-1234567-1"
              pattern="\d{5}-\d{7}-\d"
              title="Format: XXXXX-XXXXXXX-X"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mobile *</label>
            <input type="text" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              placeholder="03012345678"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">WhatsApp</label>
            <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="03012345678"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="agent@example.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Commission Rate (%)</label>
            <input type="number" min="0" max="100" step="0.01" value={form.commission_rate}
              onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Create Agent"}
          </button>
          <button type="button" onClick={() => navigate("/agents")}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
