import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserQuery, useUpdateUserMutation, useGetRolesQuery } from "../../services/user.service";

function parseErrors(err: any): string {
  if (err?.data?.detail) {
    const d = err.data.detail;
    if (Array.isArray(d)) return d.map((e: any) => e.msg).join("\n");
    return d;
  }
  return "Failed to update user";
}

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading: loadingUser } = useGetUserQuery(Number(id));
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const { data: roles } = useGetRolesQuery();
  const [errors, setErrors] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", is_active: true });
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name, email: user.email || "", phone: user.phone || "", is_active: user.is_active });
      setSelectedRoles(user.roles?.map((r) => r.id) || []);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors("");
    try {
      await updateUser({ id: Number(id), data: { ...form, role_ids: selectedRoles } }).unwrap();
      navigate("/users");
    } catch (err: any) {
      setErrors(parseErrors(err));
    }
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  if (loadingUser) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!user) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">User not found</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit User</h2>
      {errors && (
        <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 text-sm text-red-700 dark:text-red-400 whitespace-pre-line">{errors}</div>
      )}
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Username</label>
            <input type="text" value={user.username} disabled
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Full Name *</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</label>
          <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">{form.is_active ? "Active" : "Inactive"}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Roles</label>
          <div className="flex flex-wrap gap-2">
            {roles?.map((role) => (
              <button key={role.id} type="button" onClick={() => toggleRole(role.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedRoles.includes(role.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50"
                }`}>
                {role.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate("/users")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
