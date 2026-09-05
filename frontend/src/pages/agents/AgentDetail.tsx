import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetAgentQuery, useDeleteAgentMutation } from "../../services/agent.service";
import { AGENT_STATUSES } from "../../lib/constants";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

export default function AgentDetail() {
  const { id } = useParams();
  const { data: agent, isLoading } = useGetAgentQuery(Number(id));
  const [deleteAgent] = useDeleteAgentMutation();

  if (isLoading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (!agent) return <div className="text-center py-8 text-slate-500">Agent not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/agents" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{agent.name}</h2>
            <p className="text-sm text-slate-500">{agent.agent_code}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/agents/${agent.id}/edit`} className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">
            <Edit className="h-4 w-4" /> Edit
          </Link>
          <button onClick={async () => { if (window.confirm("Delete?")) { await deleteAgent(agent.id); } }}
            className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Personal Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Father Name</dt><dd className="font-medium">{agent.father_name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">CNIC</dt><dd className="font-medium">{agent.cnic}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="font-medium">
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                agent.status === "active" ? "bg-emerald-50 text-emerald-700" :
                agent.status === "blocked" ? "bg-red-50 text-warning" : "bg-slate-100 text-slate-700"
              }`}>{AGENT_STATUSES.find(s => s.value === agent.status)?.label}</span>
            </dd></div>
          </dl>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Contact Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Mobile</dt><dd className="font-medium">{agent.mobile}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">WhatsApp</dt><dd className="font-medium">{agent.whatsapp || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-medium">{agent.email || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">City</dt><dd className="font-medium">{agent.city || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Address</dt><dd className="font-medium">{agent.address || "-"}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
