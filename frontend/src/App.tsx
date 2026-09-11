import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store, RootState } from "./store";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import CandidateList from "./pages/candidates/CandidateList";
import CandidateCreate from "./pages/candidates/CandidateCreate";
import CandidateDetail from "./pages/candidates/CandidateDetail";
import CandidateEdit from "./pages/candidates/CandidateEdit";
import AgentList from "./pages/agents/AgentList";
import AgentCreate from "./pages/agents/AgentCreate";
import AgentDetail from "./pages/agents/AgentDetail";
import AgentEdit from "./pages/agents/AgentEdit";
import MedicalTokenList from "./pages/medical/MedicalTokenList";
import MedicalTokenCreate from "./pages/medical/MedicalTokenCreate";
import MedicalTokenDetail from "./pages/medical/MedicalTokenDetail";
import MedicalTokenEdit from "./pages/medical/MedicalTokenEdit";
import VisaList from "./pages/visa/VisaList";
import VisaCreate from "./pages/visa/VisaCreate";
import VisaDetail from "./pages/visa/VisaDetail";
import VisaEdit from "./pages/visa/VisaEdit";
import TicketList from "./pages/tickets/TicketList";
import TicketCreate from "./pages/tickets/TicketCreate";
import TicketDetail from "./pages/tickets/TicketDetail";
import TicketEdit from "./pages/tickets/TicketEdit";
import PaymentList from "./pages/payments/PaymentList";
import PaymentCreate from "./pages/payments/PaymentCreate";
import PaymentDetail from "./pages/payments/PaymentDetail";
import PaymentEdit from "./pages/payments/PaymentEdit";
import ExpenseList from "./pages/expenses/ExpenseList";
import ExpenseCreate from "./pages/expenses/ExpenseCreate";
import ExpenseEdit from "./pages/expenses/ExpenseEdit";
import SalaryList from "./pages/expenses/SalaryList";
import SalaryCreate from "./pages/expenses/SalaryCreate";
import SalaryEdit from "./pages/expenses/SalaryEdit";
import ReportDashboard from "./pages/reports/ReportDashboard";
import CandidateLedger from "./pages/ledger/CandidateLedger";
import CompanySettings from "./pages/settings/CompanySettings";
import UserList from "./pages/users/UserList";
import UserCreate from "./pages/users/UserCreate";
import UserEdit from "./pages/users/UserEdit";
import VendorList from "./pages/vendors/VendorList";
import VendorCreate from "./pages/vendors/VendorCreate";
import VendorEdit from "./pages/vendors/VendorEdit";
import VendorDetail from "./pages/vendors/VendorDetail";
import VendorTransactionCreate from "./pages/vendors/VendorTransactionCreate";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSelector((state: RootState) => state.theme.mode);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/candidates" element={<CandidateList />} />
              <Route path="/candidates/new" element={<CandidateCreate />} />
              <Route path="/candidates/:id" element={<CandidateDetail />} />
              <Route path="/candidates/:id/edit" element={<CandidateEdit />} />
              <Route path="/agents" element={<AgentList />} />
              <Route path="/agents/new" element={<AgentCreate />} />
              <Route path="/agents/:id" element={<AgentDetail />} />
              <Route path="/agents/:id/edit" element={<AgentEdit />} />
              <Route path="/medical" element={<MedicalTokenList />} />
              <Route path="/medical/new" element={<MedicalTokenCreate />} />
              <Route path="/medical/:id" element={<MedicalTokenDetail />} />
              <Route path="/medical/:id/edit" element={<MedicalTokenEdit />} />
              <Route path="/visas" element={<VisaList />} />
              <Route path="/visas/new" element={<VisaCreate />} />
              <Route path="/visas/:id" element={<VisaDetail />} />
              <Route path="/visas/:id/edit" element={<VisaEdit />} />
              <Route path="/tickets" element={<TicketList />} />
              <Route path="/tickets/new" element={<TicketCreate />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/tickets/:id/edit" element={<TicketEdit />} />
              <Route path="/payments" element={<PaymentList />} />
              <Route path="/payments/new" element={<PaymentCreate />} />
              <Route path="/payments/:id" element={<PaymentDetail />} />
              <Route path="/payments/:id/edit" element={<PaymentEdit />} />
              <Route path="/expenses" element={<ExpenseList />} />
              <Route path="/expenses/new" element={<ExpenseCreate />} />
              <Route path="/expenses/:id/edit" element={<ExpenseEdit />} />
              <Route path="/salaries" element={<SalaryList />} />
              <Route path="/salaries/new" element={<SalaryCreate />} />
              <Route path="/salaries/:id/edit" element={<SalaryEdit />} />
              <Route path="/ledger" element={<CandidateLedger />} />
              <Route path="/ledger/:id" element={<CandidateLedger />} />
              <Route path="/reports" element={<ReportDashboard />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/new" element={<UserCreate />} />
              <Route path="/users/:id/edit" element={<UserEdit />} />
              <Route path="/settings" element={<CompanySettings />} />
              <Route path="/vendors" element={<VendorList />} />
              <Route path="/vendors/new" element={<VendorCreate />} />
              <Route path="/vendors/:id" element={<VendorDetail />} />
              <Route path="/vendors/:id/edit" element={<VendorEdit />} />
              <Route path="/vendors/:id/transactions/new" element={<VendorTransactionCreate />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
