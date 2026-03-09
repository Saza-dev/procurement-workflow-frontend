"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster, toast } from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";

export default function ApprovedBaskets() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

  // State to handle File and Invoice Number
  const [invoiceData, setInvoiceData] = useState<
    Record<number, { number: string; file: File | null }>
  >({});

  const fetchApproved = async () => {
    try {
      setLoading(true);
      const res = await api.requests.viewAllByStatus("APPROVED");
      setRequests(res.data?.data?.baskets || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproved();
  }, []);

  const handleInputChange = (itemId: number, number: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || { file: null }), number },
    }));
  };

  const handleFileChange = (itemId: number, file: File | null) => {
    setInvoiceData((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || { number: "" }), file },
    }));
  };

  const saveInvoice = async (itemId: number) => {
    const data = invoiceData[itemId];
    const existingItem = requests
      .flatMap((r) => r.items)
      .find((i) => i.id === itemId);

    if (!data?.number || (!data?.file && !existingItem?.invoiceUrl)) {
      return toast.error("Invoice number and PDF file are required");
    }

    setProcessingId(itemId);
    const toastId = toast.loading("Saving invoice data...");

    try {
      const formData = new FormData();
      formData.append("itemId", itemId.toString());
      formData.append("invoiceNumber", data.number);
      if (data.file) {
        formData.append("file", data.file);
      }

      await api.items.addInvoice(formData);

      toast.success("Invoice details recorded", { id: toastId });

      const newInvoiceData = { ...invoiceData };
      delete newInvoiceData[itemId];
      setInvoiceData(newInvoiceData);

      fetchApproved();
    } catch (err) {
      toast.error("Failed to save invoice", { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const handlePassToHR = async (basketId: number) => {
    setIsSubmitting(basketId);
    try {
      await api.requests.changeStatus(basketId, "MOVE_HR");
      toast.success("Basket passed to HR successfully!");
      fetchApproved();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(null);
    }
  };

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center animate-pulse text-gray-400 font-black/20 uppercase tracking-widest text-xs sm:text-base">
        Loading Approved Baskets...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-black/20 text-gray-900 tracking-tighter uppercase leading-none">
          Post-Approval Management
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-2 font-bold uppercase tracking-tight">
          Provide invoices for purchase or release warehouse items to HR.
        </p>
      </div>

      <div className="space-y-8 sm:space-y-16">
        {requests.length === 0 ? (
          <div className="text-center py-20 sm:py-32 bg-gray-50 border border-dashed border-gray-200">
            <p className="text-gray-400 font-black/20 uppercase tracking-widest text-sm sm:text-lg">
              No approved baskets pending invoices.
            </p>
          </div>
        ) : (
          requests.map((basket) => {
            const isReadyForHR = basket.items.every(
              (item) =>
                item.inWarehouse || (item.invoiceNumber && item.invoiceUrl),
            );

            return (
              <div
                key={basket.id}
                className="bg-white border border-gray-900 p-5 sm:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] transition-all"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                  <div>
                    <span className="text-[10px] font-black/20 bg-green-600 text-white px-3 py-1 uppercase tracking-widest">
                      Authorized
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black/20 text-gray-900 mt-3 uppercase tracking-tight">
                      {basket.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handlePassToHR(basket.id)}
                    disabled={isSubmitting === basket.id || !isReadyForHR}
                    className={`w-full lg:w-auto px-8 py-4 font-black/20 text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                      isReadyForHR
                        ? "bg-gray-900 text-white hover:bg-orange-600"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting === basket.id
                      ? "Processing..."
                      : "Pass to HR"}
                  </button>
                </div>

                <div className="space-y-4">
                  {basket.items.map((item) => {
                    const staged = invoiceData[item.id];
                    const hasNewFile = !!staged?.file;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-6 border-2 transition-all ${
                          item.inWarehouse
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-6">
                          <div className="flex-1 w-full">
                            <p className="text-sm sm:text-base font-black/20 text-gray-900 uppercase tracking-tight">
                              {item.title}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-400 font-black/20 uppercase tracking-widest mt-1">
                              Quantity: {item.quantity}
                            </p>
                          </div>

                          {item.inWarehouse ? (
                            <div className="w-full xl:w-auto flex items-center justify-center bg-white text-green-600 border-2 border-green-600 py-3 px-6">
                              <svg
                                className="w-4 h-4 mr-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                              </svg>
                              <span className="text-[10px] font-black/20 uppercase tracking-widest">
                                Stock Item - Ready
                              </span>
                            </div>
                          ) : (
                            <div className="w-full xl:flex-[2] grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <input
                                type="text"
                                placeholder="INVOICE #"
                                value={
                                  staged?.number ?? (item.invoiceNumber || "")
                                }
                                onChange={(e) =>
                                  handleInputChange(item.id, e.target.value)
                                }
                                className="bg-white border-2 border-gray-100 text-[10px] font-black/20 uppercase p-3 outline-none focus:border-orange-500 transition-all"
                              />

                              <div className="relative">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) =>
                                    handleFileChange(
                                      item.id,
                                      e.target.files?.[0] || null,
                                    )
                                  }
                                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div
                                  className={`h-full flex items-center justify-center border-2 border-gray-100 text-[9px] font-black uppercase p-3 transition-all ${
                                    hasNewFile
                                      ? "bg-green-50 border-green-500 text-green-600"
                                      : item.invoiceUrl
                                        ? "bg-orange-50 border-orange-200 text-orange-600"
                                        : "bg-white text-gray-400"
                                  }`}
                                >
                                  {hasNewFile
                                    ? "PDF STAGED"
                                    : item.invoiceUrl
                                      ? "UPDATE PDF"
                                      : "SELECT PDF"}
                                </div>
                              </div>

                              <button
                                onClick={() => saveInvoice(item.id)}
                                disabled={processingId === item.id}
                                className={`py-3 px-4 text-[9px] font-black/20 uppercase tracking-widest transition-all border-2 ${
                                  item.invoiceNumber && !staged
                                    ? "bg-white text-gray-400 border-gray-100"
                                    : "bg-orange-600 text-white border-orange-600 hover:bg-gray-900 hover:border-gray-900"
                                }`}
                              >
                                {processingId === item.id
                                  ? "Saving..."
                                  : item.invoiceUrl
                                    ? "Re-save"
                                    : "Save Invoice"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!isReadyForHR && (
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-100">
                    <p className="text-[9px] font-black/20 text-orange-600 uppercase text-center tracking-[0.2em]">
                      * All market items must be invoiced before passing to HR
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
