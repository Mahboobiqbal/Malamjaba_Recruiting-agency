import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAgentQuery, useUpdateAgentMutation } from "../../services/agent.service";

export default function AgentEdit() {
  const params = useParams();
  const navigate = useNavigate();
  const agentId = params.id ? Number(params.id) : 0;
  const [updateAgent, { isLoading, isError }] = useUpdateAgentMutation();
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
    if (agentId > 0) {
      const agent = useGetAgentQuery(agentId);
      if (agent.data && !agent.error) {
        setForm({
          name: agent.data.name,
          father_name: agent.data.father_name,
          cnic: agent.data.cnic,
          mobile: agent.data.mobile,
          whatsapp: agent.data.whatsapp,
          address: agent.data.address,
          city: agent.data.city,
          email: agent.data.email,
          commission_rate: agent.data.commission_rate,
          bank_info: agent.data.bank_info,
          status: agent.data.status,
          notes: agent.data.notes,
        });
      }
    }
  }, [agentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentId) return;
    await updateAgent({ id: agentId, data: form }).unwrap();
    navigate("/agents");
  };

  if (!agentId) {
    return <p className="text-sm text-slate-500">Agent ID not found</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Updating agent...</p>;
  }

  if (isError) {
    return <p className="text-sm text-slate-500">Error updating agent</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Edit Agent</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              type="text"
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">CNIC</label>
            <input
              value={form.cnic}
              onChange={(e) => setForm({ ...form, cnic: e.target.value })}
              type="text"
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mobile</label>
            <input
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              type="text"
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">City</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              type="text"
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 w-full"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Commission Rate</label>
            <input
              value={form.commission_rate}
              onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })}
              type="number"
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2 w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="mt-1 rounded-lg border border-slate-300 px-3 py-2 w-full resize-none"
          ></textarea>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => navigate("/agents")}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-secondary">
            Back to Agents
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            Update Agent
          </button>
        </div>
      </form>
    </div>
  );
}