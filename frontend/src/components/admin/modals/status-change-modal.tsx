"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusOption {
  value: string;
  label: string;
}

interface StatusChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  currentStatusLabel: string;
  availableStatuses: StatusOption[];
  onConfirm: (newStatus: string, notes?: string) => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  getStatusColor?: (status: string) => string;
}

export function StatusChangeModal({
  open,
  onOpenChange,
  currentStatus,
  currentStatusLabel,
  availableStatuses,
  onConfirm,
  title,
  description,
  isLoading = false,
  getStatusColor,
}: StatusChangeModalProps) {
  const t = useTranslations("admin.modals.statusChange");

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus, notes || undefined);
      // Reset form after confirmation
      setSelectedStatus("");
      setNotes("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setSelectedStatus("");
      setNotes("");
    }
    onOpenChange(newOpen);
  };

  const defaultGetStatusColor = (status: string): string => {
    // Default color logic - can be overridden via props
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
      case "DELIVERED":
      case "APPROVED":
      case "CPAM_APPROVED":
        return "success";
      case "IN_PROGRESS":
      case "SCHEDULED":
      case "SUBMITTED_TO_CPAM":
        return "info";
      case "OPEN":
      case "ASSIGNED":
      case "PENDING":
      case "DOCUMENTS_PENDING":
        return "warning";
      case "CANCELLED":
      case "CPAM_REJECTED":
        return "error";
      default:
        return "secondary";
    }
  };

  const statusColorFn = getStatusColor || defaultGetStatusColor;

  const selectedStatusOption = availableStatuses.find(
    (s) => s.value === selectedStatus
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t("title")}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status Display */}
          <div className="space-y-2">
            <Label className="text-neutral-500">{t("currentStatus")}</Label>
            <div className="flex items-center gap-2">
              <Badge variant={statusColorFn(currentStatus) as "success" | "info" | "warning" | "error" | "secondary"}>
                {currentStatusLabel}
              </Badge>
            </div>
          </div>

          {/* Status Transition Arrow */}
          {selectedStatus && (
            <div className="flex items-center justify-center py-2">
              <ArrowRight className="w-5 h-5 text-neutral-400" />
            </div>
          )}

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="new-status">{t("newStatus")}</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="new-status">
                <SelectValue placeholder={t("selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStatusOption && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-neutral-500">{t("willChangeTo")}:</span>
                <Badge variant={statusColorFn(selectedStatus) as "success" | "info" | "warning" | "error" | "secondary"}>
                  {selectedStatusOption.label}
                </Badge>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Textarea
              label={t("notes")}
              placeholder={t("notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus || isLoading}
            loading={isLoading}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
