import React, { useState, useEffect } from "react";
import { useGetCompanySettingsQuery, useUpdateCompanySettingsMutation } from "../../services/dashboard.service";

export default function CompanySettings() {
  const { data, isLoading } = useGetCompanySettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateCompanySettingsMutation();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(form).unwrap();
      alert("Settings saved successfully");
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to save settings");
    }
  };

  const fields = [
    { key: "company_name", label: "Company Name" },
    { key: "address", label: "Address" },
    { key: "phone", label: "Phone" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "email", label: "Email" },
    { key: "website", label: "Website" },
    { key: "ntn", label: "NTN/Registration" },
    { key: "logo_url", label: "Logo URL" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Company Settings</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700">{f.label}</label>
              <input type="text" value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button type="submit" disabled={saving}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
