import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetExpenseQuery, useUpdateExpenseMutation } from "../../services/dashboard.service";
import { PAYMENT_METHODS } from "../../lib/constants";
import { formatCurrency, getErrorMessage } from "../../lib/utils";
import toast from "react-hot-toast";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function SalaryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: expense, isLoading: loadingExpense } = useGetExpenseQuery(Number(id));
  const [updateExpense, { isLoading }] = useUpdateExpenseMutation();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (expense) {
      const desc = expense.description || "";
      const parts = desc.split("|");
      const employee = parts[0]?.replace("Employee: ", "") || expense.paid_to || "";
      const month = parts[1]?.replace("Month: ", "") || MONTHS[new Date().getMonth()];
      const year = parseInt(parts[1]?.replace("Month: ", "").split(" ")[1] || new Date().getFullYear().toString());
      const basic = parts[2]?.replace("Basic: ", "");
      const allowances = parts[3]?.replace("Allowances: ", "");
      const deductions = parts[4]?.replace("Deductions: ", "");
      const remarks = parts[5]?.replace("Remarks: ", "");
      
      setForm({
        employee_name: employee,
        month: month,
        year: year,
        basic_salary: basic ? Number(basic) : 0,
        allowances: allowances ? Number(allowances) : 0,
        deductions: deductions ? Number(deductions) : 0,
        payment_method: expense.payment_method || "bank_transfer",
        reference: expense.reference || "",
        remarks: remarks || "",
      });
    }
  }, [expense]);

  const netPay = useMemo(() => (form.basic_salary || 0) + (form.allowances || 0) - (form.deductions || 0), [form.basic_salary, form.allowances, form.deductions]);

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

      await updateExpense({ id: Number(id), data: {
        category: "salary",
        description,
        amount: netPay,
        payment_method: form.payment_method,
        paid_to: form.employee_name,
        reference: form.reference,
      } }).unwrap();
      navigate(`/expenses/${id}`);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update salary"));
    }
  };

  if (loadingExpense) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Salary</h2>
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
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
            {isLoading ? "Saving..." : "Update Salary"}
          </button>
          <button type="button" onClick={() => navigate(`/expenses/${id}`)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}