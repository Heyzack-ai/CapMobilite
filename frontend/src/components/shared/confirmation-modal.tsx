"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Info, HelpCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive" | "warning";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "default",
  isLoading = false,
  icon,
}: ConfirmationModalProps) {
  const t = useTranslations("admin.modals.confirmation");

  const handleConfirm = () => {
    onConfirm();
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case "destructive":
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        );
      case "warning":
        return (
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-primary-600" />
          </div>
        );
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case "destructive":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="mb-4">{icon || getDefaultIcon()}</div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="mt-2">{message}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel || t("cancel")}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            disabled={isLoading}
            loading={isLoading}
          >
            {confirmLabel || t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Convenience components for common use cases
export function DeleteConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  isLoading?: boolean;
}) {
  const t = useTranslations("admin.modals.confirmation");

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={t("deleteTitle")}
      message={t("deleteMessage", { item: itemName })}
      confirmLabel={t("delete")}
      variant="destructive"
      isLoading={isLoading}
    />
  );
}

export function CancelConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  const t = useTranslations("admin.modals.confirmation");

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={t("cancelTitle")}
      message={t("cancelMessage")}
      confirmLabel={t("confirmCancel")}
      variant="warning"
      isLoading={isLoading}
    />
  );
}
