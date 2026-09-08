import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut, Sun, Moon, ChevronDown } from "lucide-react";
import { logout } from "../../store/authSlice";
import { toggleTheme } from "../../store/themeSlice";
import { useGetMeQuery } from "../../services/auth.service";
import { RootState } from "../../store";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: me } = useGetMeQuery();
  const theme = useSelector((state: RootState) => state.theme.mode);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
          Malamjaba Recruiting Agency
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-secondary bg-secondary/50 text-slate-600 transition-all hover:bg-secondary hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary dark:bg-primary/20">
            {(me?.full_name || "A").charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
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
    </header>
  );
}
