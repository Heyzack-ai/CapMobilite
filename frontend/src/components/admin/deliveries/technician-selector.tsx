"use client";

import { useTranslations } from "next-intl";
import { User, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type TechnicianStatus = "available" | "busy" | "onLeave";

interface Technician {
  id: string;
  name: string;
  phone: string;
  status: TechnicianStatus;
  specialties: string[];
}

// Mock technicians data
const mockTechnicians: Technician[] = [
  {
    id: "tech-1",
    name: "Pierre Martin",
    phone: "+33 6 12 34 56 78",
    status: "available",
    specialties: ["Manuel", "Electrique"],
  },
  {
    id: "tech-2",
    name: "Marie Dupont",
    phone: "+33 6 23 45 67 89",
    status: "available",
    specialties: ["Electrique", "Tout-terrain"],
  },
  {
    id: "tech-3",
    name: "Jean Lefebvre",
    phone: "+33 6 34 56 78 90",
    status: "busy",
    specialties: ["Manuel"],
  },
  {
    id: "tech-4",
    name: "Sophie Bernard",
    phone: "+33 6 45 67 89 01",
    status: "onLeave",
    specialties: ["Manuel", "Electrique", "Tout-terrain"],
  },
];

interface TechnicianSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const statusVariantMap: Record<TechnicianStatus, "success" | "warning" | "secondary"> = {
  available: "success",
  busy: "warning",
  onLeave: "secondary",
};

export function TechnicianSelector({ value, onChange }: TechnicianSelectorProps) {
  const t = useTranslations("admin.deliveryDetail");

  const selectedTechnician = mockTechnicians.find((tech) => tech.id === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="max-w-md">
        <SelectValue placeholder={t("schedule.technicianPlaceholder")}>
          {selectedTechnician && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-400" />
              <span>{selectedTechnician.name}</span>
              <Badge
                variant={statusVariantMap[selectedTechnician.status]}
                className="text-xs ml-auto"
              >
                {t(`technicians.${selectedTechnician.status}`)}
              </Badge>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1.5 text-xs font-medium text-neutral-500 uppercase tracking-wider">
          {t("technicians.title")}
        </div>
        {mockTechnicians.map((technician) => (
          <SelectItem
            key={technician.id}
            value={technician.id}
            disabled={technician.status === "onLeave"}
            className="py-3"
          >
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <p className="font-medium">{technician.name}</p>
                  <p className="text-xs text-neutral-500">
                    {technician.specialties.join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={statusVariantMap[technician.status]}
                  className="text-xs"
                >
                  {t(`technicians.${technician.status}`)}
                </Badge>
                {value === technician.id && (
                  <Check className="w-4 h-4 text-primary-500" />
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
