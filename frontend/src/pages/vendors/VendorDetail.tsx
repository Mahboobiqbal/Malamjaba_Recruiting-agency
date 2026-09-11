import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetVendorQuery, useGetVendorLedgerQuery, useGetVendorTransactionsQuery, useGetVendorPaymentsQuery, useCreateVendorPaymentMutation, useUpdateVendorTransactionMutation, useAssignVendorTransactionMutation, useDeleteVendorTransactionMutation } from "../../services/vendor.service";
import { useGetCandidatesQuery } from "../../services/candidate.service";
import { formatCurrency, formatDateTime, getErrorMessage } from "../../lib/utils";
import { ArrowLeft, Plus, CreditCard, TrendingUp, TrendingDown, Building2, ChevronDown, ChevronRight, Eye, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function VendorDetail() {
  const { id } = useParams();
  const vendorId = Number(id);
  const { data: vendor, isLoading: loadingVendor } = useGetVendorQuery(vendorId);
  const { data: ledger } = useGetVendorLedgerQuery(vendorId);
  const { data: txnData } = useGetVendorTransactionsQuery({ vendorId, per_page: 100 });
  const { data: pmtData } = useGetVendorPaymentsQuery({ vendorId, per_page: 100 });
  const [createPayment] = useCreateVendorPaymentMutation();
  const [updateTransaction] = useUpdateVendorTransactionMutation();
  const [assignTransaction] = useAssignVendorTransactionMutation();
  const [deleteTransaction] = useDeleteVendorTransactionMutation();
  const { data: candidatesData } = useGetCandidatesQuery({ per_page: 100 });
  const [showPayModal, setShowPayModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [payForm, setPayForm] = useState({ amount: 0, payment_method: "cash", reference_number: "", remarks: "" });
  const [editingTxnId, setEditingTxnId] = useState<number | null>(null);
  const [editSellingPrice, setEditSellingPrice] = useState(0);
  const [expandedTxnId, setExpandedTxnId] = useState<number | null>(null);
  const [assignTxn, setAssignTxn] = useState<{ id: number; service_type: string } | null>(null);
  const [assignForm, setAssignForm] = useState({ candidate_id: 0, ticket_price: 0, airline: "", flight_number: "", departure_airport: "", arrival_airport: "", departure_date: "", departure_time: "", visa_fee: 0, visa_type: "", country: "" });
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [deleteTxnId, setDeleteTxnId] = useState<number | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPayment({ vendorId, data: { amount: Number(payForm.amount), payment_method: payForm.payment_method, reference_number: payForm.reference_number || undefined, remarks: payForm.remarks || undefined } }).unwrap();
      toast.success("Payment recorded");
      setShowPayModal(false);
      setPayForm({ amount: 0, payment_method: "cash", reference_number: "", remarks: "" });
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to record payment"));
    }
  };

  const handleUpdateSellingPrice = async (txnId: number) => {
    try {
      await updateTransaction({ vendorId, txnId, data: { selling_price: editSellingPrice } }).unwrap();
      toast.success("Selling price updated");
      setEditingTxnId(null);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update"));
    }
  };

  const openAssignModal = (txn: { id: number; service_type: string; passenger_name?: string; airline?: string; flight_number?: string; origin?: string; destination?: string; travel_date?: string; travel_time?: string; visa_country?: string; visa_type?: string; selling_price?: number }) => {
    setAssignTxn({ id: txn.id, service_type: txn.service_type });
    setAssignForm({
      candidate_id: 0,
      ticket_price: txn.selling_price || 0,
      airline: txn.airline || "",
      flight_number: txn.flight_number || "",
      departure_airport: txn.origin || "",
      arrival_airport: txn.destination || "",
      departure_date: txn.travel_date || "",
      departure_time: txn.travel_time || "",
      visa_fee: txn.selling_price || 0,
      visa_type: txn.visa_type || "",
      country: txn.visa_country || "",
    });
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!assignTxn) return;
    try {
      await assignTransaction({ vendorId, txnId: assignTxn.id, data: assignForm }).unwrap();
      toast.success("Ticket/Visa created and linked to candidate");
      setShowAssignModal(false);
      setAssignTxn(null);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to assign"));
    }
  };

  const handleDeleteTxn = async () => {
    if (!deleteTxnId) return;
    try {
      await deleteTransaction({ vendorId, txnId: deleteTxnId }).unwrap();
      toast.success("Transaction deleted");
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete"));
    }
    setDeleteTxnId(null);
  };

  if (loadingVendor) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading...</div>;
  if (!vendor) return <div className="text-center py-8 text-slate-500 dark:text-slate-400">Vendor not found</div>;

  const totalPurchased = txnData?.items?.reduce((s, t) => s + t.purchase_price, 0) || 0;
  const totalOwed = ledger?.closing_balance || 0;
  const filteredTxns = txnData?.items?.filter((t) => serviceTypeFilter === "all" || t.service_type === serviceTypeFilter) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/vendors" className="rounded-lg border border-slate-300 dark:border-slate-700 p-2 hover:bg-secondary"><ArrowLeft className="h-4 w-4" /></Link>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{vendor.name}</h2>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${vendor.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
          {vendor.status}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
          <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{vendor.phone}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
          <p className="text-sm text-slate-500 dark:text-slate-400">Contact Person</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{vendor.contact_person || "-"}</p>
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-900 p-4 shadow-sm dark:shadow-none">
          <p className="text-sm text-slate-500 dark:text-slate-400">Bank</p>
          <p className="text-lg font-bold text-slate-800 dark:text-white">{vendor.bank_name || "-"}</p>
          {vendor.account_number && <p className="text-xs text-slate-500 dark:text-slate-400">{vendor.account_number}</p>}
        </div>
        <div className={`rounded-lg border p-4 shadow-sm dark:shadow-none ${totalOwed > 0 ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"}`}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Balance Owed</p>
          <p className={`text-lg font-bold ${totalOwed > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>{formatCurrency(totalOwed)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Date</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Description</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600 dark:text-slate-300">Debit</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600 dark:text-slate-300">Credit</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600 dark:text-slate-300">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger?.entries?.length ? ledger.entries.map((e, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400 text-xs">{e.date}</td>
                  <td className="px-4 py-2 text-slate-800 dark:text-white">{e.description}</td>
                  <td className="px-4 py-2 text-right text-red-600 dark:text-red-400">{e.debit > 0 ? formatCurrency(e.debit) : "-"}</td>
                  <td className="px-4 py-2 text-right text-emerald-600 dark:text-emerald-400">{e.credit > 0 ? formatCurrency(e.credit) : "-"}</td>
                  <td className={`px-4 py-2 text-right font-medium ${e.balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>{formatCurrency(e.balance)}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No transactions yet</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 font-bold">
                <td className="px-4 py-2" colSpan={2}>Total</td>
                <td className="px-4 py-2 text-right text-red-600 dark:text-red-400">{formatCurrency(ledger?.total_debit || 0)}</td>
                <td className="px-4 py-2 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(ledger?.total_credit || 0)}</td>
                <td className={`px-4 py-2 text-right ${totalOwed > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>{formatCurrency(totalOwed)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-slate-800 dark:text-white">Purchases ({filteredTxns?.length || 0})</h3>
            <select value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none">
              <option value="all">All Services</option>
              <option value="ticket">Tickets Only</option>
              <option value="visa">Visas Only</option>
            </select>
          </div>
          <Link to={`/vendors/${id}/transactions/new`} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90">
            <Plus className="h-3 w-3" /> Record Purchase
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300 w-8"></th>
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Code</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Service</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Details</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600 dark:text-slate-300">Purchase</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600 dark:text-slate-300">Selling</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600 dark:text-slate-300">Profit</th>
                <th className="px-4 py-2 text-center font-medium text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-4 py-2 text-center font-medium text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length ? filteredTxns.map((t) => (
                <React.Fragment key={t.id}>
                  <tr className="border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => setExpandedTxnId(expandedTxnId === t.id ? null : t.id)}>
                    <td className="px-4 py-2 text-slate-400">
                      {expandedTxnId === t.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{t.transaction_code}</td>
                    <td className="px-4 py-2 text-slate-800 dark:text-white capitalize">{t.service_type}</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-300 text-xs">
                      {t.service_type === "ticket" ? (
                        <div className="flex flex-col">
                          <span>{t.origin && t.destination ? `${t.origin} → ${t.destination}` : t.airline || "-"}</span>
                          {t.ticket_number && <span className="text-slate-400 dark:text-slate-500 text-[10px]">TKT: {t.ticket_number}</span>}
                          {t.pnr && <span className="text-slate-400 dark:text-slate-500 text-[10px]">PNR: {t.pnr}</span>}
                        </div>
                      ) : (
                        <span>{t.visa_country || "-"}{t.visa_type ? ` (${t.visa_type})` : ""}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-800 dark:text-white">{formatCurrency(t.purchase_price)}</td>
                    <td className="px-4 py-2 text-right text-slate-800 dark:text-white">
                      {editingTxnId === t.id ? (
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <input type="number" step="0.01" value={editSellingPrice} onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                            className="w-28 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-right text-slate-800 dark:text-white" autoFocus />
                          <button onClick={() => handleUpdateSellingPrice(t.id)} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700">Save</button>
                          <button onClick={() => setEditingTxnId(null)} className="rounded bg-slate-200 dark:bg-slate-700 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-300">X</button>
                        </div>
                      ) : (
                        <span className="flex items-center justify-end gap-1">
                          {t.selling_price > 0 ? formatCurrency(t.selling_price) : <span className="text-amber-500 dark:text-amber-400 text-xs">Not set</span>}
                          {t.selling_price === 0 && (
                            <button onClick={(e) => { e.stopPropagation(); setEditingTxnId(t.id); setEditSellingPrice(0); }}
                              className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/20">Set Price</button>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(t.profit)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${t.payment_status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : t.payment_status === "partial" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {t.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        {t.service_id && t.service_type === "ticket" && (
                          <Link to={`/tickets/${t.service_id}`} onClick={(e) => e.stopPropagation()} className="text-slate-400 dark:text-slate-500 hover:text-blue-500" title="View Ticket">
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        {t.service_id && t.service_type === "visa" && (
                          <Link to={`/visas/${t.service_id}`} onClick={(e) => e.stopPropagation()} className="text-slate-400 dark:text-slate-500 hover:text-blue-500" title="View Visa">
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        {!t.service_id && (
                          <button onClick={(e) => { e.stopPropagation(); openAssignModal(t); }} className="rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 text-[10px] hover:bg-blue-200">
                            Assign
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setEditingTxnId(t.id); setEditSellingPrice(t.selling_price); }} className="text-slate-400 dark:text-slate-500 hover:text-amber-500" title="Edit Price">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTxnId(t.id); }} className="text-slate-400 dark:text-slate-500 hover:text-red-500" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedTxnId === t.id && (
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                      <td colSpan={9} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-3 lg:grid-cols-5">
                          {t.passenger_name && <div><span className="text-slate-500 dark:text-slate-400">Passenger:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.passenger_name}</span></div>}
                          {t.service_type === "ticket" && <>
                            {t.ticket_number && <div><span className="text-slate-500 dark:text-slate-400">Ticket #:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.ticket_number}</span></div>}
                            {t.pnr && <div><span className="text-slate-500 dark:text-slate-400">PNR:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.pnr}</span></div>}
                            {t.origin && <div><span className="text-slate-500 dark:text-slate-400">From:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.origin}</span></div>}
                            {t.destination && <div><span className="text-slate-500 dark:text-slate-400">To:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.destination}</span></div>}
                            {t.travel_date && <div><span className="text-slate-500 dark:text-slate-400">Date:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.travel_date}</span></div>}
                            {t.travel_time && <div><span className="text-slate-500 dark:text-slate-400">Time:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.travel_time}</span></div>}
                            {t.airline && <div><span className="text-slate-500 dark:text-slate-400">Airline:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.airline}</span></div>}
                            {t.flight_number && <div><span className="text-slate-500 dark:text-slate-400">Flight:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.flight_number}</span></div>}
                          </>}
                          {t.service_type === "visa" && <>
                            {t.visa_country && <div><span className="text-slate-500 dark:text-slate-400">Country:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.visa_country}</span></div>}
                            {t.visa_type && <div><span className="text-slate-500 dark:text-slate-400">Type:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.visa_type}</span></div>}
                            {t.visa_date && <div><span className="text-slate-500 dark:text-slate-400">Date:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.visa_date}</span></div>}
                          </>}
                          {t.candidate?.full_name && <div><span className="text-slate-500 dark:text-slate-400">Candidate:</span> <span className="font-medium text-slate-800 dark:text-white ml-1">{t.candidate.full_name}</span></div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No purchases recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments */}
      <div className="rounded-lg border bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
        <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-white">Payments ({pmtData?.total || 0})</h3>
          <button onClick={() => setShowPayModal(true)} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
            <CreditCard className="h-3 w-3" /> Pay Vendor
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Code</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Date</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Method</th>
                <th className="px-4 py-2 text-right font-medium text-slate-600 dark:text-slate-300">Amount</th>
                <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-slate-300">Reference</th>
              </tr>
            </thead>
            <tbody>
              {pmtData?.items?.length ? pmtData.items.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{p.payment_code}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400 text-xs">{formatDateTime(p.created_at)}</td>
                  <td className="px-4 py-2 text-slate-800 dark:text-white capitalize">{p.payment_method.replace("_", " ")}</td>
                  <td className="px-4 py-2 text-right text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{p.reference_number || "-"}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No payments made</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Pay Vendor</h3>
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Amount *</label>
                <input type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })} required min="0.01"
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Payment Method *</label>
                <select value={payForm.payment_method} onChange={(e) => setPayForm({ ...payForm, payment_method: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Reference Number</label>
                <input type="text" value={payForm.reference_number} onChange={(e) => setPayForm({ ...payForm, reference_number: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Remarks</label>
                <input type="text" value={payForm.remarks} onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">Record Payment</button>
                <button type="button" onClick={() => setShowPayModal(false)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && assignTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Assign {assignTxn.service_type === "ticket" ? "Ticket" : "Visa"} to Candidate
            </h3>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Candidate *</label>
                <select value={assignForm.candidate_id} onChange={(e) => setAssignForm({ ...assignForm, candidate_id: Number(e.target.value) })} required
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none">
                  <option value={0}>Select Candidate</option>
                  {candidatesData?.items.map((c: any) => <option key={c.id} value={c.id}>{c.candidate_code} - {c.full_name}</option>)}
                </select>
              </div>
              {assignTxn.service_type === "ticket" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Ticket Price *</label>
                    <input type="number" step="0.01" value={assignForm.ticket_price || ""} onChange={(e) => setAssignForm({ ...assignForm, ticket_price: Number(e.target.value) })} required min="0"
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Airline</label>
                    <input type="text" value={assignForm.airline} onChange={(e) => setAssignForm({ ...assignForm, airline: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Flight Number</label>
                    <input type="text" value={assignForm.flight_number} onChange={(e) => setAssignForm({ ...assignForm, flight_number: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">From (Airport)</label>
                    <input type="text" value={assignForm.departure_airport} onChange={(e) => setAssignForm({ ...assignForm, departure_airport: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">To (Airport)</label>
                    <input type="text" value={assignForm.arrival_airport} onChange={(e) => setAssignForm({ ...assignForm, arrival_airport: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Departure Date</label>
                    <input type="date" value={assignForm.departure_date} onChange={(e) => setAssignForm({ ...assignForm, departure_date: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Departure Time</label>
                    <input type="time" value={assignForm.departure_time} onChange={(e) => setAssignForm({ ...assignForm, departure_time: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                </div>
              )}
              {assignTxn.service_type === "visa" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Fee *</label>
                    <input type="number" step="0.01" value={assignForm.visa_fee || ""} onChange={(e) => setAssignForm({ ...assignForm, visa_fee: Number(e.target.value) })} required min="0"
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Country</label>
                    <input type="text" value={assignForm.country} onChange={(e) => setAssignForm({ ...assignForm, country: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Visa Type</label>
                    <input type="text" value={assignForm.visa_type} onChange={(e) => setAssignForm({ ...assignForm, visa_type: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-primary focus:outline-none" />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">Create & Assign</button>
                <button type="button" onClick={() => { setShowAssignModal(false); setAssignTxn(null); }} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteTxnId !== null}
        title="Delete Transaction"
        message="Are you sure you want to delete this purchase? This action cannot be undone."
        onConfirm={handleDeleteTxn}
        onCancel={() => setDeleteTxnId(null)}
      />
    </div>
  );
}
