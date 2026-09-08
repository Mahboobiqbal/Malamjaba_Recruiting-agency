import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateExpenseMutation } from "../../services/dashboard.service";
import { PAYMENT_METHODS } from "../../lib/constants";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function SalaryCreate() {
  const navigate = useNavigate();
  const [createExpense, { isLoading }] = useCreateExpenseMutation();
  const currentMonth = MONTHS[new Date().getMonth()];
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    employee_name: "",
    month: currentMonth,
    year: currentYear,
    basic_salary: 0,
    allowances: 0,
    deductions: 0,
    payment_method: "bank_transfer",
    paid_to: "",
    reference: "",
    remarks: "",
  });

  const netPay = form.basic_salary + form.allowances - form.deductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const description = [
        `Employee: ${form.employee_name}`,
        `Month: ${form.month} ${form.year}`,
        `Basic: ${form.basic_salary}`,
        `Allowances: ${form.allowances}`,
        `Deductions: ${form.deductions}`,
        form.remarks ? `Remarks: ${form.remarks}` : "",
      ].filter(Boolean).join(" | ");

      await createExpense({
        date: new Date().toISOString(),
        category: "salary",
        description,
        amount: netPay,
        payment_method: form.payment_method,
        paid_to: form.employee_name,
        reference: form.reference,
      }).unwrap();
      navigate("/salaries");
    } catch (err: any) {
      alert(err?.data?.detail || "Failed to record salary");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Add Salary</h2>
      <form onSubmit={handleSubmit} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-none">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Employee Name *</label>
            <input type="text" value={form.employee_name} onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" required placeholder="Enter employee name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Month *</label>
            <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" required>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Year *</label>
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" required min="2020" max="2099" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Basic Salary (PKR) *</label>
            <input type="number" value={form.basic_salary} onChange={(e) => setForm({ ...form, basic_salary: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" required min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Allowances (PKR)</label>
            <input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Deductions (PKR)</label>
            <input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" min="0" />
          </div>
          <div className="flex items-end">
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-4 w-full">
              <p className="text-sm text-slate-500 dark:text-slate-400">Net Pay</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">PKR {netPay.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Payment Method *</label>
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white">
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Reference</label>
            <input type="text" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Record Salary"}
          </button>
          <button type="button" onClick={() => navigate("/salaries")}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
