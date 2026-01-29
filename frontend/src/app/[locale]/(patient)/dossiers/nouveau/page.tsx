"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileText,
  CreditCard,
  User,
  CheckCircle,
  Loader2,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/auth.store";

type Step = 'prescription' | 'identity' | 'insurance' | 'review';

interface UploadedDoc {
  name: string;
  type: string;
  status: 'uploading' | 'uploaded' | 'verified';
}

export default function NewCasePage() {
  const t = useTranslations("patient.newCase");
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState<Step>('prescription');
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc | null>>({
    prescription: null,
    identity: null,
    carteVitale: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: 'prescription', label: t("steps.prescription"), icon: FileText },
    { key: 'identity', label: t("steps.identity"), icon: User },
    { key: 'insurance', label: t("steps.insurance"), icon: CreditCard },
    { key: 'review', label: t("steps.review"), icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleFileUpload = (docType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload
    setUploadedDocs(prev => ({
      ...prev,
      [docType]: { name: file.name, type: file.type, status: 'uploading' }
    }));

    // Simulate upload completion
    setTimeout(() => {
      setUploadedDocs(prev => ({
        ...prev,
        [docType]: prev[docType] ? { ...prev[docType]!, status: 'uploaded' } : null
      }));
    }, 1500);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'prescription':
        return uploadedDocs.prescription?.status === 'uploaded';
      case 'identity':
        return uploadedDocs.identity?.status === 'uploaded';
      case 'insurance':
        return uploadedDocs.carteVitale?.status === 'uploaded';
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to cases list with success
    router.push('/dossiers?created=true');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'prescription':
        return (
          <div className="space-y-6">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-900">{t("prescriptionInfo.title")}</p>
                  <p className="text-sm text-primary-700 mt-1">{t("prescriptionInfo.description")}</p>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                id="prescription-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload('prescription')}
              />
              <label htmlFor="prescription-upload" className="cursor-pointer">
                {uploadedDocs.prescription ? (
                  <div className="space-y-2">
                    {uploadedDocs.prescription.status === 'uploading' ? (
                      <Loader2 className="w-10 h-10 mx-auto text-primary-600 animate-spin" />
                    ) : (
                      <CheckCircle className="w-10 h-10 mx-auto text-green-600" />
                    )}
                    <p className="font-medium">{uploadedDocs.prescription.name}</p>
                    <Badge variant={uploadedDocs.prescription.status === 'uploaded' ? 'success' : 'default'}>
                      {uploadedDocs.prescription.status === 'uploading' ? t("uploading") : t("uploaded")}
                    </Badge>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto text-neutral-400" />
                    <p className="mt-2 font-medium text-neutral-700">{t("dropzone.title")}</p>
                    <p className="text-sm text-neutral-500">{t("dropzone.formats")}</p>
                  </>
                )}
              </label>
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-500">{t("noPrescription")}</p>
              <Link href="/support" className="text-sm text-primary-600 hover:underline">
                {t("contactUs")}
              </Link>
            </div>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-6">
            <p className="text-neutral-600">{t("identityDescription")}</p>
            
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                id="identity-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload('identity')}
              />
              <label htmlFor="identity-upload" className="cursor-pointer">
                {uploadedDocs.identity ? (
                  <div className="space-y-2">
                    {uploadedDocs.identity.status === 'uploading' ? (
                      <Loader2 className="w-10 h-10 mx-auto text-primary-600 animate-spin" />
                    ) : (
                      <CheckCircle className="w-10 h-10 mx-auto text-green-600" />
                    )}
                    <p className="font-medium">{uploadedDocs.identity.name}</p>
                    <Badge variant={uploadedDocs.identity.status === 'uploaded' ? 'success' : 'default'}>
                      {uploadedDocs.identity.status === 'uploading' ? t("uploading") : t("uploaded")}
                    </Badge>
                  </div>
                ) : (
                  <>
                    <User className="w-10 h-10 mx-auto text-neutral-400" />
                    <p className="mt-2 font-medium text-neutral-700">{t("uploadId")}</p>
                    <p className="text-sm text-neutral-500">{t("dropzone.formats")}</p>
                  </>
                )}
              </label>
            </div>
          </div>
        );

      case 'insurance':
        return (
          <div className="space-y-6">
            <p className="text-neutral-600">{t("insuranceDescription")}</p>
            
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                id="vitale-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload('carteVitale')}
              />
              <label htmlFor="vitale-upload" className="cursor-pointer">
                {uploadedDocs.carteVitale ? (
                  <div className="space-y-2">
                    {uploadedDocs.carteVitale.status === 'uploading' ? (
                      <Loader2 className="w-10 h-10 mx-auto text-primary-600 animate-spin" />
                    ) : (
                      <CheckCircle className="w-10 h-10 mx-auto text-green-600" />
                    )}
                    <p className="font-medium">{uploadedDocs.carteVitale.name}</p>
                    <Badge variant={uploadedDocs.carteVitale.status === 'uploaded' ? 'success' : 'default'}>
                      {uploadedDocs.carteVitale.status === 'uploading' ? t("uploading") : t("uploaded")}
                    </Badge>
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-10 h-10 mx-auto text-neutral-400" />
                    <p className="mt-2 font-medium text-neutral-700">{t("uploadCarteVitale")}</p>
                    <p className="text-sm text-neutral-500">{t("dropzone.formats")}</p>
                  </>
                )}
              </label>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">{t("reviewReady.title")}</p>
                  <p className="text-sm text-green-700 mt-1">{t("reviewReady.description")}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">{t("uploadedDocuments")}</h3>
              
              <div className="grid gap-3">
                {Object.entries(uploadedDocs).map(([key, doc]) => doc && (
                  <div key={key} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-neutral-500" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-neutral-500">{t(`docTypes.${key}`)}</p>
                      </div>
                    </div>
                    <Badge variant="success">{t("verified")}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">{t("patientInfo")}</h3>
              <div className="grid gap-3 p-4 bg-neutral-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("name")}</span>
                  <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("email")}</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dossiers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("back")}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{t("title")}</h1>
          <p className="text-neutral-500">{t("subtitle")}</p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const Icon = step.icon;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      isCompleted
                        ? 'bg-primary-600 text-white'
                        : isActive
                        ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-600'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-24 h-1 mx-2 ${
                        isCompleted ? 'bg-primary-600' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <span
                key={step.key}
                className={index === currentStepIndex ? 'text-primary-600 font-medium' : 'text-neutral-500'}
              >
                {step.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStepIndex].label}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          {t("previous")}
        </Button>
        
        {currentStep === 'review' ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {t("next")}
          </Button>
        )}
      </div>
    </div>
  );
}
