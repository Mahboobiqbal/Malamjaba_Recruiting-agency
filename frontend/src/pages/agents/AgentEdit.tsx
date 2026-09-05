import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateAgentMutation } from "../../services/agent.service";

export default function AgentEdit() {
  const navigate = useNavigate();
  const [createAgent, { isLoading }] = useCreateAgentMutation();
  const [form, setForm] = useState({
    name: "", father_name: "", cnic: "", mobile: "", whatsapp: "",
    address: "", city: "", email: "", commission_rate: 0, bank_info: "",
    status: "active", notes: "",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Edit Agent</h2>
      <form onSubmit={(e) => e.preventDefault()} className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Agent edit form - implement with proper update mutation</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => navigate("/agents")}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-secondary">
            Back to Agents
          </button>
        </div>
      </form>
    </div>
  );
}
