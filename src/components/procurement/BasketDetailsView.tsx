"use client";

import { useState, useMemo, useRef } from "react";
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

  // Store the actual File object and the price
  const [editValues, setEditValues] = useState<
    Record<number, { price: string; file: File | null }>
  >({});

  const isBasketComplete = useMemo(() => {
    return basket.items.every((item) => {
      if (item.inWarehouse) return true;
      // Now checking if it already has a URL in the DB OR if there is a new file staged in local state
      return item.price && (item.quoteUrl || editValues[item.id]?.file);
    });
  }, [basket.items, editValues]);

  const toggleItemSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // --- ACTIONS ---

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
    const existingItem = basket.items.find((i) => i.id === itemId);

    // Validate: Must have price and either a new file or an existing URL
    if (!values?.price || (!values?.file && !existingItem?.quoteUrl)) {
      return toast.error("Provide Price and select a PDF Quotation");
    }

    setLoadingId(itemId);
    const toastId = toast.loading("Uploading quotation...");

    try {
      const formData = new FormData();
      formData.append("itemId", itemId.toString());
      formData.append("price", values.price);

      if (values.file) {
        formData.append("file", values.file);
      }

      // Ensure your api.items.addQuotation sends this as multipart/form-data
      await api.items.addQuotation(formData);

      toast.success("Quotation & PDF saved", { id: toastId });

      // Clear local state for this item
      const newEditValues = { ...editValues };
      delete newEditValues[itemId];
      setEditValues(newEditValues);

      onRefresh();
    } catch (err) {
      toast.error("Upload failed", { id: toastId });
    } finally {
      setLoadingId(null);
    }
  };

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

  return (
    <div className="mt-4 p-5 bg-gray-50 border-2 border-gray-900 space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Procurement Management
        </h4>
        {selectedIds.length > 0 && (
          <button
            onClick={async () => {
              const itemsToMove = selectedIds.map((id) => ({
                itemId: id,
                quantity: basket.items.find((i) => i.id === id)?.quantity || 0,
              }));
              await api.requests.split({
                originalBasketId: basket.id,
                itemsToMove,
              });
              onRefresh();
            }}
            className="text-[10px] bg-gray-900 text-white px-4 py-2 font-black uppercase tracking-widest hover:bg-orange-600 transition-all"
          >
            Split {selectedIds.length} Items
          </button>
        )}
      </div>

      {basket.items.map((item) => {
        const isStaged = !!editValues[item.id];
        const displayPrice =
          editValues[item.id]?.price ?? (item.price?.toString() || "");
        const hasFile = !!editValues[item.id]?.file;

        return (
          <div
            key={item.id}
            className={`flex flex-col xl:flex-row gap-6 p-6 bg-white border-2 border-gray-900 transition-all ${
              loadingId === item.id ? "opacity-50 grayscale" : ""
            }`}
          >
            {/* 1. Item Basics */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleItemSelection(item.id)}
                className="w-5 h-5 accent-orange-500 cursor-pointer shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate">
                  {item.title}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Units Required: {item.quantity}
                </p>
              </div>
            </div>

            {/* 2. Warehouse Toggle */}
            <div className="flex flex-col items-center justify-center px-6 border-x-2 border-gray-50 bg-gray-50/50">
              <span className="text-[8px] font-black text-gray-400 uppercase mb-2">
                In Stock?
              </span>
              <input
                type="checkbox"
                disabled={loadingId === item.id}
                checked={item.inWarehouse}
                onChange={(e) =>
                  handleWarehouseToggle(item.id, e.target.checked)
                }
                className="w-6 h-6 accent-green-600 cursor-pointer"
              />
            </div>

            {/* 3. Quote Inputs */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="w-full">
                <label className="text-[8px] font-black text-gray-400 uppercase block mb-1 tracking-widest">
                  Unit Price ($)
                </label>
                <input
                  type="number"
                  disabled={item.inWarehouse || loadingId === item.id}
                  value={displayPrice}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...(prev[item.id] || { file: null }),
                        price: e.target.value,
                      },
                    }))
                  }
                  className="w-full p-3 text-xs border-2 border-gray-100 outline-none focus:border-orange-500 disabled:bg-gray-100 font-bold"
                  placeholder="0.00"
                />
              </div>

              <div className="w-full">
                <label className="text-[8px] font-black text-gray-400 uppercase block mb-1 tracking-widest">
                  Quotation PDF
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    disabled={item.inWarehouse || loadingId === item.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setEditValues((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...(prev[item.id] || { price: "" }),
                          file,
                        },
                      }));
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div
                    className={`p-3 text-[10px] font-black border-2 border-dashed flex items-center justify-center uppercase transition-all ${
                      hasFile
                        ? "bg-green-50 border-green-500 text-green-600"
                        : item.quoteUrl
                          ? "bg-orange-50 border-orange-200 text-orange-600"
                          : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {hasFile
                      ? "File Staged"
                      : item.quoteUrl
                        ? "Update PDF"
                        : "Select PDF"}
                  </div>
                </div>
              </div>

              {!item.inWarehouse && (
                <button
                  onClick={() => handleQuoteSave(item.id)}
                  disabled={!isStaged || loadingId === item.id}
                  className="w-full py-3.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-900 disabled:bg-gray-100 disabled:text-gray-300 transition-all border-2 border-transparent"
                >
                  Save Entry
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Footer Submission */}
      <div className="mt-10 pt-8 border-t-4 border-gray-900 flex flex-col items-center">
        {!isBasketComplete && (
          <p className="text-[9px] font-black text-red-600 mb-4 uppercase tracking-[0.2em]">
            * Validation Required: All line items must have a PDF quotation
          </p>
        )}
        <button
          onClick={handleSendForApproval}
          disabled={!isBasketComplete || isSubmitting}
          className={`w-full py-6 font-black text-sm tracking-[0.4em] uppercase transition-all border-4 ${
            isBasketComplete
              ? "bg-gray-900 text-white border-gray-900 hover:bg-white hover:text-gray-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
              : "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "PROCESSING..." : "CONFIRM & SUBMIT FOR APPROVAL"}
        </button>
      </div>
    </div>
  );
}
