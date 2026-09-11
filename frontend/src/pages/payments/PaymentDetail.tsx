import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetPaymentQuery, useDeletePaymentMutation } from "../../services/dashboard.service";
import { PAYMENT_METHODS, PAYMENT_TYPES } from "../../lib/constants";
import { formatDateTime, formatCurrency } from "../../lib/utils";
import { ArrowLeft, Printer, FileDown, Trash2 } from "lucide-react";
import { downloadPDF } from "../../lib/pdf";
import PaymentPrintDocument from "../../components/print/PaymentPrintDocument";
import ConfirmModal from "../../components/common/ConfirmModal";
import toast from "react-hot-toast";

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: payment, isLoading } = useGetPaymentQuery(Number(id));
  const [deletePayment] = useDeletePaymentMutation();
  const [showConfirm, setShowConfirm] = useState(false);

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
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={() => downloadPDF("print-area", payment.payment_code)} className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary/90">
            <FileDown className="h-4 w-4" /> Download PDF
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-secondary">
            <Printer className="h-4 w-4" /> Print Receipt
          </button>
          <button onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      <div id="print-area" className="print-only">
        <PaymentPrintDocument payment={payment} />
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border bg-white dark:bg-slate-900 p-8 shadow-sm dark:shadow-none print:shadow-none">
        <div className="mb-6 text-center border-b pb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Malamjaba Recruiting Agency</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Payment Receipt</p>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Payment Code</dt><dd className="font-medium text-slate-800 dark:text-white">{payment.payment_code}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Receipt Number</dt><dd className="font-medium text-slate-800 dark:text-white">{payment.receipt_number}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Candidate</dt><dd className="font-medium text-slate-800 dark:text-white">{payment.candidate?.full_name || "N/A"}</dd></div>
          {payment.agent && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Agent</dt><dd className="font-medium text-slate-800 dark:text-white">{payment.agent.name}</dd></div>}
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Amount</dt><dd className="font-bold text-lg">{formatCurrency(payment.amount)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Payment Type</dt><dd className="font-medium capitalize">{PAYMENT_TYPES.find(t => t.value === payment.payment_type)?.label || payment.payment_type}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Payment Method</dt><dd className="font-medium text-slate-800 dark:text-white">{PAYMENT_METHODS.find(m => m.value === payment.payment_method)?.label || payment.payment_method}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Date</dt><dd className="font-medium text-slate-800 dark:text-white">{formatDateTime(payment.payment_date)}</dd></div>
          {payment.reference_number && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Reference</dt><dd className="font-medium text-slate-800 dark:text-white">{payment.reference_number}</dd></div>}
          {payment.description && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Description</dt><dd className="font-medium text-slate-800 dark:text-white">{payment.description}</dd></div>}
          {payment.remarks && <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Remarks</dt><dd className="font-medium text-slate-800 dark:text-white">{payment.remarks}</dd></div>}
          {payment.visa && (
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Linked Visa</dt>
              <dd className="font-medium text-slate-800 dark:text-white">
                <Link to={`/visas/${payment.visa.id}`} className="text-primary hover:underline">
                  {payment.visa.visa_code} - {payment.visa.country || "N/A"}
                </Link>
              </dd>
            </div>
          )}
          {payment.ticket && (
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Linked Ticket</dt>
              <dd className="font-medium text-slate-800 dark:text-white">
                <Link to={`/tickets/${payment.ticket.id}`} className="text-primary hover:underline">
                  {payment.ticket.ticket_code} - {payment.ticket.airline || "N/A"}
                </Link>
              </dd>
            </div>
          )}
          {payment.medical_token && (
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Linked Medical</dt>
              <dd className="font-medium text-slate-800 dark:text-white">
                <Link to={`/medical/${payment.medical_token.id}`} className="text-primary hover:underline">
                  {payment.medical_token.token_code} - {payment.medical_token.medical_center || "N/A"}
                </Link>
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-8 border-t pt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>Authorized Signature</p>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? This action cannot be undone."
        onConfirm={async () => {
          try {
            await deletePayment(payment.id).unwrap();
            toast.success("Payment deleted");
            navigate("/payments");
          } catch {
            toast.error("Failed to delete payment");
          }
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
