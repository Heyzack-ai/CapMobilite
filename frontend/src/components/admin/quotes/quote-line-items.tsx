"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2, Euro } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  lpprCode: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuoteLineItemsProps {
  lineItems: LineItem[];
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  isEditable: boolean;
}

export function QuoteLineItems({
  lineItems,
  onAddItem,
  onRemoveItem,
  isEditable,
}: QuoteLineItemsProps) {
  const t = useTranslations("admin.quoteDetail.lineItems");

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4 pt-4">
      {/* Add button */}
      {isEditable && (
        <div className="flex justify-end">
          <Button onClick={onAddItem} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t("addItem")}
          </Button>
        </div>
      )}

      {/* Line items table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">{t("product")}</TableHead>
              <TableHead className="font-semibold">{t("lpprCode")}</TableHead>
              <TableHead className="font-semibold text-center">{t("quantity")}</TableHead>
              <TableHead className="font-semibold text-right">{t("unitPrice")}</TableHead>
              <TableHead className="font-semibold text-right">{t("total")}</TableHead>
              {isEditable && (
                <TableHead className="font-semibold w-16">{t("actions")}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-neutral-900">{item.productName}</p>
                    <p className="text-xs text-neutral-500">ID: {item.productId}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-neutral-100 px-2 py-1 rounded">
                    {item.lpprCode}
                  </span>
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end gap-1">
                    {item.unitPrice.toLocaleString("fr-FR")}
                    <Euro className="w-3 h-3 text-neutral-400" />
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  <span className="flex items-center justify-end gap-1">
                    {item.total.toLocaleString("fr-FR")}
                    <Euro className="w-3 h-3 text-neutral-400" />
                  </span>
                </TableCell>
                {isEditable && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:text-error hover:bg-error/10"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}

            {lineItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isEditable ? 6 : 5}
                  className="text-center py-8 text-neutral-500"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}

            {/* Total row */}
            {lineItems.length > 0 && (
              <TableRow className="bg-neutral-50 font-semibold">
                <TableCell colSpan={isEditable ? 4 : 3} className="text-right">
                  {t("totalHT")}
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end gap-1 text-lg">
                    {totalAmount.toLocaleString("fr-FR")}
                    <Euro className="w-4 h-4 text-neutral-600" />
                  </span>
                </TableCell>
                {isEditable && <TableCell />}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary info */}
      {lineItems.length > 0 && (
        <p className="text-sm text-neutral-500 text-right">
          {lineItems.length} {lineItems.length === 1 ? t("itemCount.singular") : t("itemCount.plural")}
        </p>
      )}
    </div>
  );
}
