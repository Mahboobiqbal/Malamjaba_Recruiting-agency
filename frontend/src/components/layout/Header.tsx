import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon, Menu, Database, X } from "lucide-react";
import { logout } from "../../store/authSlice";
import { toggleTheme } from "../../store/themeSlice";
import { useGetMeQuery } from "../../services/auth.service";
import { useCreateBackupMutation } from "../../services/dashboard.service";
import { RootState } from "../../store";
import { useMobileSidebar } from "../../context/MobileSidebarContext";
import toast from "react-hot-toast";

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onBackupAndLogout: () => void;
  onLogoutWithoutBackup: () => void;
  isBackingUp: boolean;
}

function LogoutModal({ open, onClose, onBackupAndLogout, onLogoutWithoutBackup, isBackingUp }: LogoutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
            <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Backup Before Logout</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Do you want to create a backup before logging out? This will save all your data to a local backup file.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onLogoutWithoutBackup}
            className="rounded-lg border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Logout Without Backup
          </button>
          <button
            onClick={onBackupAndLogout}
            disabled={isBackingUp}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              isBackingUp
                ? "bg-primary/50 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isBackingUp ? "Backing up..." : "Backup & Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: me } = useGetMeQuery();
  const theme = useSelector((state: RootState) => state.theme.mode);
  const { setOpen } = useMobileSidebar();
  const [createBackup] = useCreateBackupMutation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmBackupAndLogout = async () => {
    setIsBackingUp(true);
    try {
      await createBackup().unwrap();
      toast.success("Backup completed successfully");
    } catch (err: any) {
      toast.error("Backup failed: " + (err?.data?.detail || "Unknown error"));
    }
    dispatch(logout());
    navigate("/login");
    setShowLogoutModal(false);
    setIsBackingUp(false);
  };

  const handleLogoutWithoutBackup = () => {
    dispatch(logout());
    navigate("/login");
    setShowLogoutModal(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
          Malamjaba Recruiting Agency
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-secondary bg-secondary/50 text-slate-600 transition-all hover:bg-secondary hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* User — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary dark:bg-primary/20">
            {(me?.full_name || "A").charAt(0).toUpperCase()}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{me?.full_name || "Admin"}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{me?.roles?.[0]?.name || "admin"}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onBackupAndLogout={handleConfirmBackupAndLogout}
        onLogoutWithoutBackup={handleLogoutWithoutBackup}
        isBackingUp={isBackingUp}
      />
    </header>
  );
}