import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Shield } from "lucide-react";
import { useGetUsersQuery, useDeleteUserMutation } from "../../services/user.service";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

export default function UserList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteUser] = useDeleteUserMutation();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = permissions.includes("users.create") || permissions.includes("super_admin");

  const { data, isLoading } = useGetUsersQuery({ page, per_page: 10, search: search || undefined });

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try { await deleteUser(id).unwrap(); } catch { alert("Failed to delete user"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Users</h2>
        {canCreate && (
          <Link to="/users/new" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add User
          </Link>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
      </div>

      <div className="overflow-hidden rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">User</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Roles</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Last Login</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Loading...</td></tr>
            ) : !data?.items?.length ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No users found</td></tr>
            ) : (
              data.items.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-slate-800 dark:text-white">{user.full_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.map((r) => (
                        <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <Shield className="h-3 w-3" /> {r.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/users/${user.id}/edit`} className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400">
                        <Edit className="h-4 w-4" />
                      </Link>
                      {!user.is_superadmin && permissions.includes("users.delete") && (
                        <button onClick={() => handleDelete(user.id, user.full_name)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.total > 10 && (
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.total)} of {data.total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 hover:bg-secondary disabled:opacity-50">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= data.total}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 hover:bg-secondary disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
