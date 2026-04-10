"use client";

import React, { createContext, useContext, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

const ConfirmContext = createContext();

export const useConfirmDialog = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within ConfirmProvider");
  }
  return context;
};

export function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState({});
  const showConfirm = (opts) => {
    setOptions(opts);
    setOpen(true);
  };
  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {options?.title || "Are you absolutely sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {options?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOpen(false);
                options?.onConfirm?.();
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
