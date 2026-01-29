"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { 
  FileText, Upload, CheckCircle, AlertTriangle, 
  Loader2, Download, Trash2, X, Eye 
} from "lucide-react";
import { toast } from "@/lib/toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCaseDocuments,
  useAttachCaseDocument,
  useRemoveCaseDocument,
  useGetUploadUrl,
  useConfirmUpload,
  useDocumentDownloadUrl,
} from "@/lib/api/hooks";

interface CaseDocumentsProps {
  caseId: string;
  readOnly?: boolean;
}

interface Document {
  id: string;
  filename: string;
  documentType: string;
  mimeType: string;
  size: number;
  scanStatus: 'PENDING' | 'CLEAN' | 'INFECTED';
  uploadedAt: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'success' | 'error';
  documentId?: string;
  error?: string;
}

const DOCUMENT_TYPES = [
  'PRESCRIPTION',
  'IDENTITY',
  'INSURANCE',
  'MUTUAL_CARD',
  'QUOTE',
  'DELIVERY_NOTE',
  'OTHER',
] as const;

export function CaseDocuments({ caseId, readOnly = false }: CaseDocumentsProps) {
  const t = useTranslations("patient.documents");
  
  // State
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('OTHER');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  
  // API hooks
  const { data: documentsData, isLoading, refetch } = useCaseDocuments(caseId);
  const { mutateAsync: getUploadUrl } = useGetUploadUrl();
  const { mutateAsync: confirmUpload } = useConfirmUpload();
  const { mutate: attachDocument } = useAttachCaseDocument();
  const { mutate: removeDocument, isPending: isRemoving } = useRemoveCaseDocument();
  
  const documents = (documentsData?.data || []).map((doc: any) => ({
    id: doc.id,
    filename: doc.filename || doc.name || 'unknown',
    documentType: doc.documentType || doc.type || 'OTHER',
    mimeType: doc.mimeType || doc.contentType || 'application/octet-stream',
    size: doc.size || 0,
    scanStatus: doc.scanStatus || 'PENDING',
    uploadedAt: doc.uploadedAt || doc.createdAt || new Date().toISOString(),
  })) as Document[];
  
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    // Add files to uploading state
    const newUploading: UploadingFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploading]);
    
    // Upload each file
    for (const uploadingFile of newUploading) {
      try {
        // Get presigned URL
        const response = await getUploadUrl({
          filename: uploadingFile.file.name,
          mimeType: uploadingFile.file.type,
          documentType: selectedDocType,
          ownerId: caseId,
        });
        
        const { uploadUrl, documentId, fields } = response as {
          uploadUrl: string;
          documentId: string;
          fields: Record<string, string>;
        };
        
        // Update progress
        setUploadingFiles(prev => 
          prev.map(f => f.file === uploadingFile.file 
            ? { ...f, progress: 30, documentId } 
            : f
          )
        );
        
        // Upload to S3
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append('file', uploadingFile.file);
        
        await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });
        
        // Update progress
        setUploadingFiles(prev => 
          prev.map(f => f.file === uploadingFile.file 
            ? { ...f, progress: 70, status: 'processing' } 
            : f
          )
        );
        
        // Confirm upload
        await confirmUpload(documentId);
        
        // Attach to case
        attachDocument({
          caseId,
          documentId,
        }, {
          onSuccess: () => {
            setUploadingFiles(prev => 
              prev.map(f => f.file === uploadingFile.file 
                ? { ...f, progress: 100, status: 'success' } 
                : f
              )
            );
            
            // Remove from uploading after delay
            setTimeout(() => {
              setUploadingFiles(prev => 
                prev.filter(f => f.file !== uploadingFile.file)
              );
              refetch();
            }, 1500);
          },
          onError: () => {
            setUploadingFiles(prev => 
              prev.map(f => f.file === uploadingFile.file 
                ? { ...f, status: 'error', error: t("uploadError") } 
                : f
              )
            );
          },
        });
      } catch (error) {
        setUploadingFiles(prev => 
          prev.map(f => f.file === uploadingFile.file 
            ? { ...f, status: 'error', error: t("uploadError") } 
            : f
          )
        );
      }
    }
    
    // Reset file input
    e.target.value = '';
  }, [caseId, selectedDocType, getUploadUrl, confirmUpload, attachDocument, refetch, t]);
  
  const handleRemoveDocument = (documentId: string) => {
    if (!confirm(t("confirmRemove"))) return;
    
    removeDocument({
      caseId,
      documentId,
    }, {
      onSuccess: () => {
        toast.success(t("removed"));
        refetch();
      },
      onError: () => {
        toast.error(t("removeError"));
      },
    });
  };
  
  const handlePreview = async (doc: Document) => {
    setPreviewDoc(doc);
    // For now, just show filename - real implementation would fetch download URL
    setPreviewUrl(null);
  };
  
  const getDocTypeLabel = (type: string) => {
    const key = `types.${type.toLowerCase()}` as any;
    return t(key) || type;
  };
  
  const getScanStatusBadge = (status: string) => {
    switch (status) {
      case 'CLEAN':
        return <Badge variant="success">{t("status.clean")}</Badge>;
      case 'INFECTED':
        return <Badge variant="error">{t("status.infected")}</Badge>;
      default:
        return <Badge variant="warning">{t("status.pending")}</Badge>;
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
            {!readOnly && (
              <div className="flex items-center gap-2">
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {getDocTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button asChild>
                  <label className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {t("upload")}
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Uploading Files */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-3 mb-6">
              {uploadingFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                >
                  <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{file.file.name}</p>
                    {file.status === 'error' ? (
                      <p className="text-xs text-error">{file.error}</p>
                    ) : (
                      <Progress value={file.progress} className="h-1 mt-1" />
                    )}
                  </div>
                  {file.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                  {file.status === 'processing' && (
                    <span className="text-xs text-neutral-500">{t("processing")}</span>
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                  {file.status === 'error' && (
                    <AlertTriangle className="w-4 h-4 text-error" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Documents List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t("noDocuments")}</p>
              {!readOnly && (
                <p className="text-sm mt-2">{t("uploadHint")}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.filename}</p>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <span>{(doc.size / 1024).toFixed(0)} KB</span>
                        <span>·</span>
                        <span>{getDocTypeLabel(doc.documentType)}</span>
                        <span>·</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getScanStatusBadge(doc.scanStatus)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(doc.id)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="w-4 h-4 text-error" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.filename}</DialogTitle>
          </DialogHeader>
          <div className="min-h-[400px] bg-neutral-100 rounded-lg flex items-center justify-center">
            {previewUrl ? (
              <iframe src={previewUrl} className="w-full h-[500px]" />
            ) : (
              <div className="text-center text-neutral-500">
                <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p>{t("previewUnavailable")}</p>
                <Button variant="outline" className="mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  {t("downloadToView")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
