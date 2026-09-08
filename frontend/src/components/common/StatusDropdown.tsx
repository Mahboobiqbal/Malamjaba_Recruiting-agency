import React, { useState } from "react";

interface StatusOption {
  value: string;
  label: string;
}

interface StatusDropdownProps {
  value: string;
  options: StatusOption[];
  onChange: (status: string) => void;
  disabled?: boolean;
}

export default function StatusDropdown({ value, options, onChange, disabled = false }: StatusDropdownProps) {
  const [pendingValue, setPendingValue] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    if (newValue === value) return;
    setPendingValue(newValue);
  };

  const confirmChange = () => {
    if (pendingValue) {
      onChange(pendingValue);
      setPendingValue(null);
    }
  };

  const cancelChange = () => {
    setPendingValue(null);
  };

  return (
    <>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:border-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {pendingValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl w-80">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Confirm Status Change</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Change status to <span className="font-medium">{options.find(o => o.value === pendingValue)?.label}</span>?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={cancelChange}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={confirmChange}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
