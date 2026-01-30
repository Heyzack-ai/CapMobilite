"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMembers: StaffMember[];
  onAssign: (staffId: string, notes?: string) => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  currentAssigneeId?: string;
  currentAssigneeName?: string;
}

// Mock staff data for demonstration
export const mockStaffMembers: StaffMember[] = [
  {
    id: "tech-1",
    name: "Lucas Moreau",
    role: "TECHNICIAN",
  },
  {
    id: "tech-2",
    name: "Sophie Martin",
    role: "TECHNICIAN",
  },
  {
    id: "ops-1",
    name: "Pierre Bernard",
    role: "OPS_AGENT",
  },
  {
    id: "ops-2",
    name: "Marie Dubois",
    role: "OPS_AGENT",
  },
  {
    id: "billing-1",
    name: "Jean Lefebvre",
    role: "BILLING_AGENT",
  },
];

export function AssignmentModal({
  open,
  onOpenChange,
  staffMembers,
  onAssign,
  title,
  description,
  isLoading = false,
  currentAssigneeId,
  currentAssigneeName,
}: AssignmentModalProps) {
  const t = useTranslations("admin.modals.assignment");

  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const handleAssign = () => {
    if (selectedStaffId) {
      onAssign(selectedStaffId, notes || undefined);
      // Reset form after assignment
      setSelectedStaffId("");
      setNotes("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setSelectedStaffId("");
      setNotes("");
    }
    onOpenChange(newOpen);
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case "TECHNICIAN":
        return t("roleTechnician");
      case "OPS_AGENT":
        return t("roleOpsAgent");
      case "BILLING_AGENT":
        return t("roleBillingAgent");
      case "ADMIN":
        return t("roleAdmin");
      default:
        return role;
    }
  };

  const selectedStaff = staffMembers.find((s) => s.id === selectedStaffId);

  // Filter out current assignee from available options
  const availableStaff = staffMembers.filter((s) => s.id !== currentAssigneeId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || t("title")}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Assignee (if any) */}
          {currentAssigneeName && (
            <div className="space-y-2">
              <Label className="text-neutral-500">{t("currentAssignee")}</Label>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-neutral-500" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {currentAssigneeName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Staff Selection */}
          <div className="space-y-2">
            <Label htmlFor="staff-select">{t("selectStaff")}</Label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger id="staff-select">
                <SelectValue placeholder={t("selectStaffPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    <div className="flex items-center gap-2">
                      <span>{staff.name}</span>
                      <span className="text-neutral-400">
                        ({getRoleLabel(staff.role)})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Staff Preview */}
          {selectedStaff && (
            <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">
                  {selectedStaff.name}
                </p>
                <p className="text-sm text-neutral-500">
                  {getRoleLabel(selectedStaff.role)}
                </p>
              </div>
            </div>
          )}

          {/* Handoff Notes */}
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
            onClick={handleAssign}
            disabled={!selectedStaffId || isLoading}
            loading={isLoading}
          >
            {t("assign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
