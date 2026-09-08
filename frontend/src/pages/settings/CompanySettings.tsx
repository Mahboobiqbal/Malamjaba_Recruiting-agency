import React, { useState, useEffect, useRef } from "react";
import {
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
  useCreateBackupMutation,
  useGetBackupsQuery,
  useDownloadBackupMutation,
  useRestoreBackupMutation,
  useRestoreFromUploadMutation,
  useResetAllDataMutation,
} from "../../services/dashboard.service";
import { formatDateTime } from "../../lib/utils";
import { Building2, Database, Upload, Download, RotateCcw, Trash2, Save, Check, Shield, HardDrive, AlertTriangle } from "lucide-react";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
}

const TABS = [
  { key: "company", label: "Company", icon: Building2 },
  { key: "backup", label: "Backup & Restore", icon: HardDrive },
  { key: "danger", label: "Danger Zone", icon: Shield },
];

export default function CompanySettings() {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your application settings</p>
      </div>

      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === key
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "company" && <CompanyTab />}
          {activeTab === "backup" && <BackupTab />}
          {activeTab === "danger" && <DangerTab />}
        </div>
      </div>
    </div>
  );
}

function CompanyTab() {
  const { data, isLoading } = useGetCompanySettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateCompanySettingsMutation();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(form).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to save settings");
    }
  };

  const fields = [
    { key: "company_name", label: "Company Name", placeholder: "Malamjaba Recruiting Agency", colSpan: 2 },
    { key: "address", label: "Address", placeholder: "Full address", colSpan: 2 },
    { key: "phone", label: "Phone", placeholder: "0300-1234567", colSpan: 1 },
    { key: "whatsapp", label: "WhatsApp", placeholder: "0300-1234567", colSpan: 1 },
    { key: "email", label: "Email", placeholder: "info@example.com", colSpan: 1 },
    { key: "website", label: "Website", placeholder: "www.example.com", colSpan: 1 },
    { key: "ntn", label: "NTN / Registration No", placeholder: "1234567-8", colSpan: 1 },
    { key: "logo_url", label: "Logo URL", placeholder: "https://...", colSpan: 1 },
  ];

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 dark:text-slate-500">Loading settings...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-5">
        {fields.map((f) => (
          <div key={f.key} className={f.colSpan === 2 ? "col-span-2" : ""}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">{f.label}</label>
            <input
              type="text"
              value={form[f.key] || ""}
              placeholder={f.placeholder}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-white transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function BackupTab() {
  const [createBackup, { isLoading: creating }] = useCreateBackupMutation();
  const { data: backups, isLoading: loadingBackups, refetch } = useGetBackupsQuery();
  const [downloadBackup] = useDownloadBackupMutation();
  const [restoreBackup] = useRestoreBackupMutation();
  const [restoreFromUpload] = useRestoreFromUploadMutation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = async (id: number, filename: string) => {
    try {
      const blob = await downloadBackup(id).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to download backup");
    }
  };

  const handleBackup = async () => {
    try {
      await createBackup().unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to create backup");
    }
  };

  const handleRestore = async (id: number, filename: string) => {
    if (!window.confirm(`Restore from "${filename}"?\n\nCurrent database will be backed up automatically before restoring.`)) return;
    try {
      await restoreBackup(id).unwrap();
      alert("Database restored. Please restart the application.");
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to restore");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".db")) {
      alert("Only .db files are allowed");
      return;
    }
    if (!window.confirm("Restore from uploaded file?\n\nCurrent database will be backed up automatically.")) return;

    setUploading(true);
    try {
      await restoreFromUpload(file).unwrap();
      alert("Database restored. Please restart the application.");
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to restore");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Database Backups</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Create, download, or restore database backups</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload & Restore"}
          </button>
          <button
            onClick={handleBackup}
            disabled={creating}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            {creating ? "Creating..." : "New Backup"}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept=".db" onChange={handleFileUpload} className="hidden" />
      </div>

      {loadingBackups ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">Loading backups...</div>
      ) : backups && backups.length > 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Filename</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Type</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Size</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Created</th>
                <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800 dark:text-white">{b.filename}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.backup_type === "manual" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    }`}>
                      {b.backup_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatFileSize(b.file_size)}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{b.created_at ? formatDateTime(b.created_at) : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleDownload(b.id, b.filename)}
                        className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                      <button
                        onClick={() => handleRestore(b.id, b.filename)}
                        className="flex items-center gap-1 text-sm text-amber-600 hover:underline font-medium"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 py-12 text-center">
          <HardDrive className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No backups yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click "New Backup" to create your first backup</p>
        </div>
      )}
    </div>
  );
}

function DangerTab() {
  const [resetAllData] = useResetAllDataMutation();
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (confirmText !== "DELETE") return;
    setResetting(true);
    try {
      await resetAllData().unwrap();
      setShowModal(false);
      setShowSuccess(true);
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to reset data");
      setResetting(false);
    }
  };

  return (
    <div>
      <div className="rounded-lg border-2 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">Reset All Data</h3>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Permanently delete all application data including candidates, agents, transactions, users, and settings.
              The default admin account will be recreated.
            </p>
            <button
              onClick={() => { setShowModal(true); setConfirmText(""); }}
              className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Reset Everything
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-xl bg-white dark:bg-slate-900 shadow-2xl">
            <div className="p-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mt-4 text-center text-lg font-bold text-slate-900 dark:text-white">Reset All Data?</h3>
              <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                This action is <span className="font-semibold text-red-600 dark:text-red-400">irreversible</span>. All data will be permanently deleted:
              </p>
              <ul className="mt-4 space-y-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-red-400" /> All candidates & agents</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-red-400" /> All medical tokens, visas & tickets</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-red-400" /> All payments, expenses & ledger entries</li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-red-400" /> All users, settings & backups</li>
              </ul>
              <div className="mt-5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                  Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-bl-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={confirmText !== "DELETE" || resetting}
                className="flex-1 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed border-l border-slate-200 dark:border-slate-700 rounded-br-xl"
              >
                {resetting ? "Resetting..." : "Reset All Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 shadow-2xl">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Reset Complete</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                All data has been successfully deleted.
              </p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-xl">
              <button
                onClick={() => window.location.href = "/login"}
                className="w-full px-4 py-3 text-sm font-medium text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-b-xl"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
