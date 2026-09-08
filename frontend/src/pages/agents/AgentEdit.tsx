import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAgentQuery, useUpdateAgentMutation } from "../../services/agent.service";
import { formatCNIC } from "../../lib/utils";

export default function AgentEdit() {
  const params = useParams();
  const navigate = useNavigate();
  const agentId = params.id ? Number(params.id) : 0;
  const { data: agent, isLoading: loadingAgent } = useGetAgentQuery(agentId, { skip: agentId <= 0 });
  const [updateAgent, { isLoading }] = useUpdateAgentMutation();
  const [form, setForm] = useState({
    name: "",
    father_name: "",
    cnic: "",
    mobile: "",
    whatsapp: "",
    address: "",
    city: "",
    email: "",
    commission_rate: 0,
    bank_info: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name,
        father_name: agent.father_name ?? "",
        cnic: agent.cnic,
        mobile: agent.mobile,
        whatsapp: agent.whatsapp ?? "",
        address: agent.address ?? "",
        city: agent.city ?? "",
        email: agent.email ?? "",
        commission_rate: agent.commission_rate,
        bank_info: agent.bank_info ?? "",
        status: agent.status,
        notes: agent.notes ?? "",
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId) return;
    try {
      await updateAgent({ id: agentId, data: form }).unwrap();
      navigate("/agents");
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to update agent");
    }
  };

  if (!agentId) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Agent ID not found</p>;
  }

  if (loadingAgent) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Loading agent...</p>;
  }

  if (!agent) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Agent not found</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Agent</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              type="text"
              className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 w-full text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Father Name</label>
            <input
              value={form.father_name}
              onChange={(e) => setForm({ ...form, father_name: e.target.value })}
              type="text"
              className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 w-full text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">CNIC *</label>
            <input
              value={form.cnic}
              onChange={(e) => setForm({ ...form, cnic: formatCNIC(e.target.value) })}
              type="text"
              placeholder="35202-1234567-1"
              className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 w-full text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Mobile *</label>
            <input
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              type="text"
              placeholder="03012345678"
              className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 w-full text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">WhatsApp</label>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              type="text"
              className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 w-full text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              type="email"
              className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 w-full text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">City</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              type="text"
              className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 w-full text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Commission Rate (%)</label>
            <input
              value={form.commission_rate}
              onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })}
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 w-full text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
            className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 w-full text-sm focus:border-primary focus:outline-none resize-none"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="mt-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 w-full text-sm focus:border-primary focus:outline-none resize-none"
          />
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => navigate("/agents")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Agent"}
          </button>
        </div>
      </form>
    </div>
  );
}
