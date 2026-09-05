import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetPaymentsQuery } from "../../services/dashboard.service";
import { formatDateTime, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer } from "lucide-react";

export default function PaymentDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetPaymentsQuery({ per_page: 100 });
  const payment = data?.items.find((p) => p.id === Number(id));

  if (isLoading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (!payment) return <div className="text-center py-8 text-slate-500">Payment not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/payments" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Payment: {payment.payment_code}</h2>
            <p className="text-sm text-slate-500">Receipt: {payment.receipt_number}</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-secondary">
          <Printer className="h-4 w-4" /> Print Receipt
        </button>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-8 shadow-sm print:shadow-none">
        <div className="mb-6 text-center border-b pb-4">
          <h3 className="text-xl font-bold text-slate-800">Malamjaba Recruiting Agency</h3>
          <p className="text-sm text-slate-500">Payment Receipt</p>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">Payment Code</dt><dd className="font-medium">{payment.payment_code}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Receipt Number</dt><dd className="font-medium">{payment.receipt_number}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Candidate</dt><dd className="font-medium">{payment.candidate?.full_name || "N/A"}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Amount</dt><dd className="font-bold text-lg">{formatCurrency(payment.amount)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Payment Type</dt><dd className="font-medium capitalize">{payment.payment_type}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Payment Method</dt><dd className="font-medium">{payment.payment_method}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">Date</dt><dd className="font-medium">{formatDateTime(payment.payment_date)}</dd></div>
          {payment.reference_number && <div className="flex justify-between"><dt className="text-slate-500">Reference</dt><dd className="font-medium">{payment.reference_number}</dd></div>}
          {payment.description && <div className="flex justify-between"><dt className="text-slate-500">Description</dt><dd className="font-medium">{payment.description}</dd></div>}
        </dl>
        <div className="mt-8 border-t pt-4 text-center text-xs text-slate-400">
          <p>Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}
