import React, { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { useGetMeQuery, useGetPermissionsQuery } from "../../services/auth.service";
import { setUser, setPermissions } from "../../store/authSlice";
import { MobileSidebarProvider } from "../../context/MobileSidebarContext";

export default function Layout() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const theme = useSelector((state: RootState) => state.theme.mode);
  const { data: me } = useGetMeQuery();
  const { data: perms } = useGetPermissionsQuery();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (me) dispatch(setUser(me));
  }, [me, dispatch]);

  useEffect(() => {
    if (perms?.permissions) dispatch(setPermissions(perms.permissions));
  }, [perms, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MobileSidebarProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden md:ml-64">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
