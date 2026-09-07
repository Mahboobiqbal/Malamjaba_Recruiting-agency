import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { logout } from "../../store/authSlice";
import { useGetMeQuery } from "../../services/auth.service";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: me, isLoading } = useGetMeQuery();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-300 bg-white px-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">
          Malamjaba Recruiting Agency
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <User className="h-4 w-4" />
          <span>{me?.full_name || "Admin"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
}