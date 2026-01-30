"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle,
  Circle,
  Camera,
  Upload,
  Trash2,
  PenTool,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type DeliveryStatus = "PENDING" | "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

interface Delivery {
  id: string;
  status: DeliveryStatus;
}

interface DeliveryConfirmationProps {
  delivery: Delivery;
  onConfirm: () => void;
  isLoading: boolean;
}

interface ChecklistItem {
  id: string;
  labelKey: string;
  checked: boolean;
}

export function DeliveryConfirmation({
  delivery,
  onConfirm,
  isLoading,
}: DeliveryConfirmationProps) {
  const t = useTranslations("admin.deliveryDetail");

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "deviceDelivered", labelKey: "confirmation.checklist.deviceDelivered", checked: false },
    { id: "deviceInspected", labelKey: "confirmation.checklist.deviceInspected", checked: false },
    { id: "patientTrained", labelKey: "confirmation.checklist.patientTrained", checked: false },
    { id: "documentsReviewed", labelKey: "confirmation.checklist.documentsReviewed", checked: false },
    { id: "signatureCollected", labelKey: "confirmation.checklist.signatureCollected", checked: false },
  ]);

  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [hasSignature, setHasSignature] = useState(false);

  const allChecked = checklist.every((item) => item.checked);
  const canConfirm = allChecked && hasSignature && delivery.status === "IN_TRANSIT";

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked } : item))
    );
  };

  const handlePhotoUpload = () => {
    // Simulating photo upload
    const newPhoto = `photo-${Date.now()}.jpg`;
    setPhotos((prev) => [...prev, newPhoto]);
  };

  const handleRemovePhoto = (photo: string) => {
    setPhotos((prev) => prev.filter((p) => p !== photo));
  };

  const handleSignatureCapture = () => {
    // Simulating signature capture
    setHasSignature(true);
  };

  const handleClearSignature = () => {
    setHasSignature(false);
  };

  const isDelivered = delivery.status === "DELIVERED";

  return (
    <div className="space-y-6">
      {/* Checklist Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary-500" />
            {t("confirmation.checklist.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  item.checked
                    ? "border-success/30 bg-success/5"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={(checked) =>
                    handleChecklistChange(item.id, checked as boolean)
                  }
                  disabled={isDelivered}
                />
                <label
                  htmlFor={item.id}
                  className={`flex-1 cursor-pointer ${
                    item.checked ? "text-success" : "text-neutral-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.checked ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-300" />
                    )}
                    {t(item.labelKey)}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signature Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary-500" />
            {t("confirmation.signature.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500 mb-4">
            {t("confirmation.signature.instructions")}
          </p>
          <div
            className={`relative border-2 border-dashed rounded-lg h-40 flex items-center justify-center ${
              hasSignature
                ? "border-success bg-success/5"
                : "border-neutral-300 bg-neutral-50"
            }`}
          >
            {hasSignature ? (
              <div className="text-center">
                <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
                <p className="text-success font-medium">Signature collectee</p>
              </div>
            ) : (
              <div className="text-center">
                <PenTool className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-neutral-400">{t("confirmation.signature.placeholder")}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            {!hasSignature ? (
              <Button
                variant="outline"
                onClick={handleSignatureCapture}
                disabled={isDelivered}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Capturer la signature
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleClearSignature}
                disabled={isDelivered}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("confirmation.signature.clear")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary-500" />
            {t("confirmation.photo.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500 mb-4">
            {t("confirmation.photo.description")}
          </p>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {photos.map((photo, index) => (
                <div
                  key={photo}
                  className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden group"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-neutral-300" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={() => handleRemovePhoto(photo)}
                      disabled={isDelivered}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
                    Photo {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upload Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePhotoUpload}
              disabled={isDelivered}
            >
              <Upload className="w-4 h-4 mr-2" />
              {t("confirmation.photo.upload")}
            </Button>
            <Button
              variant="outline"
              onClick={handlePhotoUpload}
              disabled={isDelivered}
            >
              <Camera className="w-4 h-4 mr-2" />
              {t("confirmation.photo.take")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("confirmation.notes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("confirmation.notesPlaceholder")}
            rows={4}
            disabled={isDelivered}
          />
        </CardContent>
      </Card>

      {/* Confirm Button */}
      {!isDelivered && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                {!allChecked && (
                  <span className="text-warning">
                    Completez tous les elements de la checklist
                  </span>
                )}
                {allChecked && !hasSignature && (
                  <span className="text-warning">
                    Collectez la signature du patient
                  </span>
                )}
                {canConfirm && (
                  <span className="text-success">
                    Pret pour confirmation
                  </span>
                )}
              </div>
              <Button
                onClick={onConfirm}
                loading={isLoading}
                disabled={!canConfirm}
                className="bg-success hover:bg-success/90"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t("actions.confirmDelivery")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already Delivered Message */}
      {isDelivered && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-success">
              {t("status.DELIVERED")}
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Cette livraison a ete confirmee avec succes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
