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

  const [invoiceData, setInvoiceData] = useState<
    Record<number, { number: string; url: string }>
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

  const handleInputChange = (
    itemId: number,
    field: "number" | "url",
    value: string,
  ) => {
    setInvoiceData((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const saveInvoice = async (itemId: number) => {
    const data = invoiceData[itemId];
    if (!data?.number || !data?.url)
      return toast.error("Invoice number and link are required");

    setProcessingId(itemId);
    try {
      await api.items.updateInvoice({
        itemId,
        invoiceNumber: data.number,
        invoiceUrl: data.url,
      } as any);
      toast.success("Invoice details recorded");
      fetchApproved();
    } catch (err) {
      handleApiError(err);
    } finally {
      setProcessingId(null);
    }
  };

  // NEW: Pass to HR Logic
  const handlePassToHR = async (basketId: number) => {
    const basket = requests.find((r) => r.id === basketId);

    // Check if every item that is NOT in warehouse has an invoice
    const allInvoiced = basket?.items.every(
      (item) => item.inWarehouse || (item.invoiceNumber && item.invoiceUrl),
    );

    if (!allInvoiced) {
      return toast.error(
        "Please save invoices for all market items before passing to HR.",
      );
    }

    setIsSubmitting(basketId);
    try {
      // Change status to PENDING_HR_FUNDS or similar
      await api.requests.changeStatus(basketId, "MOVE_HR");
      toast.success("Basket passed to HR successfully!");
      fetchApproved(); // Refresh list to remove the passed basket
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(null);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse text-gray-400 font-black">
        Loading Approved Baskets...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white min-h-screen">
      <Toaster position="top-right" />
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Post-Approval Management
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Provide invoices for purchase or release warehouse items to HR.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 -[3rem] border-2 border-dashed">
            <p className="text-gray-400 font-bold">
              No approved baskets pending invoices.
            </p>
          </div>
        ) : (
          requests.map((basket) => {
            // Calculate if this specific basket is ready for HR
            const isReadyForHR = basket.items.every(
              (item) =>
                item.inWarehouse || (item.invoiceNumber && item.invoiceUrl),
            );

            return (
              <div
                key={basket.id}
                className="bg-white -[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <span className="text-[10px] font-black bg-green-100 text-green-600 px-3 py-1 -full uppercase tracking-widest">
                      Authorized
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 mt-2">
                      {basket.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handlePassToHR(basket.id)}
                    disabled={isSubmitting === basket.id}
                    className={`px-10 py-4 -2xl font-black text-xs transition-all shadow-lg active:scale-95 ${
                      isReadyForHR
                        ? "bg-gray-900 text-white hover:bg-orange-600"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting === basket.id
                      ? "Processing..."
                      : "PASS TO HR"}
                  </button>
                </div>

                <div className="space-y-4">
                  {basket.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-5 -3xl border transition-all ${item.inWarehouse ? "bg-green-50/50 border-green-100" : "bg-gray-50 border-gray-100"}`}
                    >
                      <div className="flex flex-col lg:flex-row items-center gap-6">
                        <div className="flex-1 w-full text-center lg:text-left">
                          <p className="text-sm font-black text-gray-800">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        {item.inWarehouse ? (
                          <div className="flex-[2] flex items-center justify-center bg-white text-green-600 border border-green-200 -2xl py-4 px-6 shadow-sm">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-tight">
                              Stock Item - Ready to Pass
                            </span>
                          </div>
                        ) : (
                          <div className="flex-[2] w-full grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="Invoice #"
                              defaultValue={item.invoiceNumber || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  item.id,
                                  "number",
                                  e.target.value,
                                )
                              }
                              className="bg-white border border-gray-200 text-xs p-3 -xl outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                            />
                            <input
                              type="text"
                              placeholder="PDF/Link"
                              defaultValue={item.invoiceUrl || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  item.id,
                                  "url",
                                  e.target.value,
                                )
                              }
                              className="bg-white border border-gray-200 text-xs p-3 -xl outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                            />
                            <button
                              onClick={() => saveInvoice(item.id)}
                              disabled={processingId === item.id}
                              className={`text-[10px] font-black -xl transition-all uppercase shadow-sm ${
                                item.invoiceNumber
                                  ? "bg-white text-gray-400 border border-gray-200"
                                  : "bg-orange-500 text-white hover:bg-orange-600"
                              }`}
                            >
                              {item.invoiceNumber
                                ? "Edit Invoice"
                                : "Save Invoice"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {!isReadyForHR && (
                  <p className="mt-4 text-[9px] font-bold text-orange-500 uppercase text-center italic">
                    * All market items must have an invoice number and link
                    before passing to HR
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
