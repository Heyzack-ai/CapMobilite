"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddLineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: {
    productId: string;
    productName: string;
    lpprCode: string;
    quantity: number;
    unitPrice: number;
  }) => void;
}

// Mock products data
const mockProducts = [
  {
    id: "product-1",
    name: "FreedomLite X1",
    lpprCodes: [
      { code: "4011001", description: "Fauteuil roulant manuel standard", basePrice: 1200 },
      { code: "4011002", description: "Fauteuil roulant manuel - options confort", basePrice: 1500 },
    ],
  },
  {
    id: "product-2",
    name: "ElectroDrive Pro",
    lpprCodes: [
      { code: "4012001", description: "Fauteuil roulant electrique standard", basePrice: 4500 },
      { code: "4012002", description: "Fauteuil roulant electrique - batterie supplementaire", basePrice: 450 },
      { code: "4012003", description: "Coussin anti-escarres premium", basePrice: 550 },
    ],
  },
  {
    id: "product-3",
    name: "TerrainMaster 4x4",
    lpprCodes: [
      { code: "4013001", description: "Fauteuil tout-terrain", basePrice: 6800 },
      { code: "4013002", description: "Pack tout-terrain premium", basePrice: 1950 },
    ],
  },
  {
    id: "product-4",
    name: "Accessoires divers",
    lpprCodes: [
      { code: "4014001", description: "Housse de protection", basePrice: 150 },
      { code: "4014002", description: "Kit accessoires confort", basePrice: 800 },
      { code: "4014003", description: "Support tablette/telephone", basePrice: 120 },
    ],
  },
];

export function AddLineItemModal({ isOpen, onClose, onAdd }: AddLineItemModalProps) {
  const t = useTranslations("admin.quoteDetail.addLineItem");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedLpprCode, setSelectedLpprCode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [priceOverride, setPriceOverride] = useState("");

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.lpprCodes.some((lppr) =>
      lppr.code.includes(searchTerm) ||
      lppr.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const selectedProduct = mockProducts.find((p) => p.id === selectedProductId);
  const selectedLppr = selectedProduct?.lpprCodes.find((l) => l.code === selectedLpprCode);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedProductId("");
    setSelectedLpprCode("");
    setQuantity(1);
    setPriceOverride("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAdd = () => {
    if (!selectedProduct || !selectedLppr) return;

    const unitPrice = priceOverride ? parseFloat(priceOverride) : selectedLppr.basePrice;

    onAdd({
      productId: selectedProduct.id,
      productName: selectedLppr.description,
      lpprCode: selectedLppr.code,
      quantity,
      unitPrice,
    });

    handleReset();
  };

  const isValid = selectedProductId && selectedLpprCode && quantity > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Search */}
          <div className="space-y-2">
            <Label htmlFor="search">{t("searchProduct")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                id="search"
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="product">{t("product")}</Label>
            <Select
              value={selectedProductId}
              onValueChange={(value) => {
                setSelectedProductId(value);
                setSelectedLpprCode("");
              }}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder={t("selectProduct")} />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* LPPR Code Selection */}
          {selectedProduct && (
            <div className="space-y-2">
              <Label htmlFor="lpprCode">{t("lpprCode")}</Label>
              <Select value={selectedLpprCode} onValueChange={setSelectedLpprCode}>
                <SelectTrigger id="lpprCode">
                  <SelectValue placeholder={t("selectLpprCode")} />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.lpprCodes.map((lppr) => (
                    <SelectItem key={lppr.code} value={lppr.code}>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm">{lppr.code}</span>
                        <span className="text-xs text-neutral-500">{lppr.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">{t("quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24"
            />
          </div>

          {/* Price Override */}
          {selectedLppr && (
            <div className="space-y-2">
              <Label htmlFor="priceOverride">
                {t("priceOverride")}
                <span className="text-neutral-400 font-normal ml-2">
                  ({t("defaultPrice")}: {selectedLppr.basePrice.toLocaleString("fr-FR")} EUR)
                </span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="priceOverride"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder={selectedLppr.basePrice.toString()}
                  value={priceOverride}
                  onChange={(e) => setPriceOverride(e.target.value)}
                  className="w-32"
                />
                <span className="text-neutral-500">EUR</span>
              </div>
              <p className="text-xs text-neutral-400">{t("priceOverrideHint")}</p>
            </div>
          )}

          {/* Preview */}
          {selectedLppr && (
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg border">
              <p className="text-sm font-medium text-neutral-700 mb-2">{t("preview")}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("product")}:</span>
                  <span>{selectedProduct?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("lpprCode")}:</span>
                  <span className="font-mono">{selectedLppr.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("quantity")}:</span>
                  <span>{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("unitPrice")}:</span>
                  <span>
                    {(priceOverride ? parseFloat(priceOverride) : selectedLppr.basePrice).toLocaleString("fr-FR")} EUR
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t mt-2">
                  <span>{t("lineTotal")}:</span>
                  <span>
                    {((priceOverride ? parseFloat(priceOverride) : selectedLppr.basePrice) * quantity).toLocaleString("fr-FR")} EUR
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button onClick={handleAdd} disabled={!isValid}>
            <Plus className="w-4 h-4 mr-2" />
            {t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
