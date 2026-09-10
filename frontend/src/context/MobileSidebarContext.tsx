import React, { createContext, useContext, useState } from "react";

interface MobileSidebarContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<MobileSidebarContextType>({ open: false, setOpen: () => {} });

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export const useMobileSidebar = () => useContext(Ctx);
