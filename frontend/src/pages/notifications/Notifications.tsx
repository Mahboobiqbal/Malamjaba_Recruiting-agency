import React from "react";
import { useGetNotificationsQuery } from "../../services/dashboard.service";
import { formatDateTime } from "../../lib/utils";
import { Bell, AlertCircle, Info } from "lucide-react";

export default function Notifications() {
  const { data: notifications, isLoading } = useGetNotificationsQuery();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
            <Bell className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-slate-500">No notifications</p>
          </div>
        ) : (
          notifications.map((n: any) => (
            <div key={n.id} className={`rounded-lg border bg-white p-4 shadow-sm ${!n.is_read ? "border-l-4 border-l-primary" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${n.type === "warning" ? "bg-amber-50" : n.type === "alert" ? "bg-red-50" : "bg-secondary"}`}>
                  {n.type === "warning" ? <AlertCircle className="h-4 w-4 text-amber-600" /> : <Info className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-slate-800">{n.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(n.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
