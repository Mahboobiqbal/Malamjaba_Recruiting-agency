import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetPaymentQuery, useDeletePaymentMutation } from "../../services/dashboard.service";
import { PAYMENT_METHODS, PAYMENT_TYPES } from "../../lib/constants";
import { formatDateTime, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer, Trash2 } from "lucide-react";

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: payment, isLoading } = useGetPaymentQuery(Number(id));
  const [deletePayment] = useDeletePaymentMutation();

  if (isLoading) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!payment) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Payment not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/payments" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Payment: {payment.payment_code}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Receipt: {payment.receipt_number}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-secondary">
            <Printer className="h-4 w-4" /> Print Receipt
          </button>
          <button onClick={async () => { if (window.confirm("Delete this payment?")) { await deletePayment(payment.id); navigate("/payments"); } }}
            className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border bg-white dark:bg-slate-900 p-8 shadow-sm dark:shadow-none print:shadow-none">
        <div className="mb-6 text-center border-b pb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Malamjaba Recruiting Agency</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Payment Receipt</p>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Payment Code</dt><dd className="font-medium">{payment.payment_code}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Receipt Number</dt><dd className="font-medium">{payment.receipt_number}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Candidate</dt><dd className="font-medium">{payment.candidate?.full_name || "N/A"}</dd></div>
          {payment.agent && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Agent</dt><dd className="font-medium">{payment.agent.name}</dd></div>}
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Amount</dt><dd className="font-bold text-lg">{formatCurrency(payment.amount)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Payment Type</dt><dd className="font-medium capitalize">{PAYMENT_TYPES.find(t => t.value === payment.payment_type)?.label || payment.payment_type}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Payment Method</dt><dd className="font-medium">{PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.label || payment.payment_method}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Date</dt><dd className="font-medium">{formatDateTime(payment.payment_date)}</dd></div>
          {payment.reference_number && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Reference</dt><dd className="font-medium">{payment.reference_number}</dd></div>}
          {payment.description && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Description</dt><dd className="font-medium">{payment.description}</dd></div>}
          {payment.remarks && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Remarks</dt><dd className="font-medium">{payment.remarks}</dd></div>}
        </dl>
        <div className="mt-8 border-t pt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}
