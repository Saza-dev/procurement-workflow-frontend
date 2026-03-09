// @/components/procurement/BasketDetailView.tsx
"use client";

import { useState, useMemo } from "react";
import { RequestBasket } from "@/types/procurement";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  basket: RequestBasket;
  onRefresh: () => void;
}

export default function BasketDetailView({ basket, onRefresh }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editValues, setEditValues] = useState<
    Record<number, { price: string; quoteUrl: string }>
  >({});

  // 1. Validation Logic: Check if the basket is ready for approval
  const isBasketComplete = useMemo(() => {
    return basket.items.every((item) => {
      if (item.inWarehouse) return true; // Items in warehouse don't need quotes
      return item.price && item.quoteUrl; // Otherwise, must have both
    });
  }, [basket.items]);

  const toggleItemSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleInputChange = (
    itemId: number,
    field: "price" | "quoteUrl",
    value: string,
  ) => {
    setEditValues((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {
          price:
            basket.items.find((i) => i.id === itemId)?.price?.toString() || "",
          quoteUrl: basket.items.find((i) => i.id === itemId)?.quoteUrl || "",
        }),
        [field]: value,
      },
    }));
  };

  const handleWarehouseToggle = async (
    itemId: number,
    inWarehouse: boolean,
  ) => {
    try {
      setLoadingId(itemId);
      await api.items.warehouseCheck({ itemId, inWarehouse });
      toast.success(
        inWarehouse ? "Moved to Warehouse" : "Removed from Warehouse",
      );
      onRefresh();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleQuoteSave = async (itemId: number) => {
    const values = editValues[itemId];
    if (!values?.price || !values?.quoteUrl)
      return toast.error("Provide Price and Quote URL");

    try {
      setLoadingId(itemId);
      await api.items.addQuotation({
        itemId,
        price: parseFloat(values.price),
        quoteUrl: values.quoteUrl,
      });
      toast.success("Quotation updated");
      const newEditValues = { ...editValues };
      delete newEditValues[itemId];
      setEditValues(newEditValues);
      onRefresh();
    } catch (err) {
      toast.error("Failed to save quote");
    } finally {
      setLoadingId(null);
    }
  };

  // 2. Submit for Approval Logic
  const handleSendForApproval = async () => {
    if (!isBasketComplete)
      return toast.error("All items must have a quote or be in warehouse");

    setIsSubmitting(true);
    try {
      await api.requests.changeStatus(basket.id, "PENDING_APPROVALS");
      toast.success("Basket sent for approval!");
      onRefresh();
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSplitItems = async () => {
    if (selectedIds.length === 0) return;
    try {
      const itemsToMove = selectedIds.map((id) => ({
        itemId: id,
        quantity: basket.items.find((i) => i.id === id)?.quantity || 0,
      }));
      await api.requests.split({ originalBasketId: basket.id, itemsToMove });
      toast.success("Items split successfully");
      setSelectedIds([]);
      onRefresh();
    } catch (err) {
      toast.error("Split failed");
    }
  };

  return (
    <div className="mt-4 p-5 bg-gray-50 -2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Item Management
        </h4>
        {selectedIds.length > 0 && (
          <button
            onClick={handleSplitItems}
            className="text-[10px] bg-gray-900 text-white px-3 py-1.5 -lg font-bold hover:bg-orange-600 transition-all shadow-lg active:scale-95"
          >
            Split {selectedIds.length} Selected Items
          </button>
        )}
      </div>

      {basket.items.map((item) => {
        const isEditing = !!editValues[item.id];
        const currentPrice =
          editValues[item.id]?.price ?? (item.price?.toString() || "");
        const currentUrl =
          editValues[item.id]?.quoteUrl ?? (item.quoteUrl || "");

        return (
          <div
            key={item.id}
            className={`flex flex-col md:flex-row gap-4 p-4 bg-white border -xl shadow-sm transition-all ${
              loadingId === item.id ? "opacity-50 grayscale" : ""
            }`}
          >
            {/* ... Existing Item row content ... */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleItemSelection(item.id)}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
              <div className="min-w-[120px]">
                <p className="text-sm font-bold text-gray-800 line-clamp-1">
                  {item.title}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Qty: {item.quantity}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center px-4 border-x border-gray-50">
              <span className="text-[8px] font-black text-gray-400 uppercase mb-1">
                In Warehouse
              </span>
              <input
                type="checkbox"
                disabled={loadingId === item.id}
                checked={item.inWarehouse}
                onChange={(e) =>
                  handleWarehouseToggle(item.id, e.target.checked)
                }
                className="w-5 h-5 accent-green-600 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-1 flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="text-[8px] font-black text-gray-400 block mb-1">
                  PRICE ($)
                </label>
                <input
                  type="number"
                  disabled={item.inWarehouse || loadingId === item.id}
                  value={currentPrice}
                  onChange={(e) =>
                    handleInputChange(item.id, "price", e.target.value)
                  }
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-100 -lg outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-200"
                  placeholder="0.00"
                />
              </div>

              <div className="flex-[2] w-full">
                <label className="text-[8px] font-black text-gray-400 block mb-1">
                  QUOTE URL
                </label>
                <input
                  type="text"
                  disabled={item.inWarehouse || loadingId === item.id}
                  value={currentUrl}
                  onChange={(e) =>
                    handleInputChange(item.id, "quoteUrl", e.target.value)
                  }
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-100 -lg outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-200"
                  placeholder="https://..."
                />
              </div>

              {!item.inWarehouse && (
                <button
                  onClick={() => handleQuoteSave(item.id)}
                  disabled={!isEditing || loadingId === item.id}
                  className="px-4 py-2 bg-orange-500 text-white text-[10px] font-black -lg hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors uppercase whitespace-nowrap"
                >
                  {loadingId === item.id ? "Saving..." : "Save Quote"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* 3. Send for Approval Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col items-center">
        {!isBasketComplete && (
          <p className="text-[10px] text-red-500 font-bold mb-2 uppercase">
            * All items must have quotes or be in warehouse before submission
          </p>
        )}
        <button
          onClick={handleSendForApproval}
          disabled={!isBasketComplete || isSubmitting}
          className={`w-full py-4 -2xl font-black text-sm transition-all flex items-center justify-center space-x-2 shadow-xl ${
            isBasketComplete
              ? "bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-green-100"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent -full animate-spin"></div>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>SEND FOR APPROVAL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
