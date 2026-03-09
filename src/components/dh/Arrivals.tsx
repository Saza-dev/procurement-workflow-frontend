"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster, toast } from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";

export default function Arrivals() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchHandedOver = async () => {
    try {
      setLoading(true);
      const res = await api.requests.getByUserId("HANDED_OVER");
      setRequests(res.data.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandedOver();
  }, []);

  const handleFinalConfirm = async (basketId: number) => {
    setProcessingId(basketId);
    try {
      await api.requests.changeStatus(basketId, "DONE");
      toast.success("Items received! Request marked as Completed.");
      fetchHandedOver();
    } catch (err) {
      handleApiError(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center animate-pulse text-gray-900/20 font-black/20 uppercase tracking-[0.4em] text-lg sm:text-2xl">
        SYNCHRONIZING ARRIVALS
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      {/* --- PAGE HEADER --- */}
      <div className="mb-10 sm:mb-16 relative">
        <h2 className="text-3xl sm:text-5xl font-black/20 text-gray-900 tracking-tighter uppercase leading-none">
          Items for Collection
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-2 font-bold uppercase tracking-tight max-w-2xl">
          Verify your items and their asset tags. Confirm receipt only after
          physical handover.
        </p>
        {/* Decorative background text */}
        <div className="absolute -top-6 -left-2 text-6xl sm:text-9xl font-black/20 text-black/5 -z-10 select-none pointer-events-none uppercase">
          RECEIVE
        </div>
      </div>

      <div className="space-y-12">
        {requests.length === 0 ? (
          <div className="text-center py-24 sm:py-32 bg-gray-50 border-4 border-dashed border-gray-200">
            <p className="text-gray-900/20 font-black/20 text-xl sm:text-3xl uppercase tracking-widest px-4">
              NO PENDING ARRIVALS
            </p>
          </div>
        ) : (
          requests.map((basket) => (
            <div
              key={basket.id}
              className="bg-white border-4 border-green-600 shadow-[10px_10px_0px_0px_rgba(22,163,74,0.1)] sm:shadow-[20px_20px_0px_0px_rgba(22,163,74,0.05)]"
            >
              {/* Status Banner */}
              <div className="bg-green-600 p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white relative overflow-hidden">
                <div className="z-10">
                  <p className="text-[10px] font-black/20 uppercase tracking-[0.2em] text-green-100">
                    Final Step
                  </p>
                  <h3 className="text-xl sm:text-3xl font-black/20 uppercase tracking-tight ">
                    {basket.title}
                  </h3>
                </div>
                <div className="z-10 text-left sm:text-right border-t sm:border-t-0 border-green-500 pt-3 sm:pt-0 w-full sm:w-auto">
                  <p className="text-[10px] font-black/20 text-green-100 uppercase tracking-widest">
                    Request ID
                  </p>
                  <p className="text-lg sm:text-xl font-black/20">#{basket.id}</p>
                </div>
                {/* Decorative ID background */}
                <span className="absolute right-[-10px] bottom-[-20px] text-8xl font-black/20 text-white/10 select-none pointer-events-none uppercase">
                  #{basket.id}
                </span>
              </div>

              <div className="p-5 sm:p-10">
                <div className="mb-10">
                  <h4 className="text-[10px] font-black/20 text-gray-400 uppercase tracking-[0.3em] mb-6 border-b-2 border-gray-50 pb-2">
                    Verification Checklist
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {basket.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-5 bg-gray-50 border-2 border-gray-100 flex justify-between items-center group hover:border-green-200 transition-colors"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="text-sm font-black/20 text-gray-900 uppercase truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[8px] font-black/20 text-gray-400 uppercase tracking-[0.2em]">
                            Asset Tag
                          </p>
                          <p className="text-xs sm:text-sm font-mono font-black/20 text-green-700">
                            {item.tag || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Action Area */}
                <div className="pt-8 border-t-4 border-gray-100">
                  <div className="bg-orange-50 border-l-8 border-orange-500 p-5 sm:p-6 mb-8 flex items-start gap-4">
                    <svg
                      className="w-6 h-6 text-orange-600 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-[11px] sm:text-xs text-orange-800 font-bold uppercase leading-relaxed tracking-tight">
                      Legal Confirmation: By clicking the button below, you
                      confirm that you have physically received all items listed
                      above and that the asset tags match the system records.
                    </p>
                  </div>

                  <button
                    onClick={() => handleFinalConfirm(basket.id)}
                    disabled={processingId === basket.id}
                    className={`w-full py-6 sm:py-4 font-black/20 text-xs sm:text-sm tracking-[0.4em] uppercase transition-all border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
                      processingId === basket.id
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-gray-900 text-white border-gray-900 hover:bg-white hover:text-gray-900"
                    }`}
                  >
                    {processingId === basket.id
                      ? "PROCESSING ENTRY..."
                      : "I HAVE RECEIVED THESE ITEMS"}
                  </button>

                  {/* Lower visual label using the requested opacity style */}
                  <div className="mt-4 flex justify-between items-center px-1">
                    <span className="text-[9px] font-black/20 text-gray-900/20 uppercase tracking-widest">
                      Post-Logistics Ledger
                    </span>
                    <span className="text-[9px] font-black/20 text-gray-900/20 uppercase tracking-widest">
                      DH-VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
