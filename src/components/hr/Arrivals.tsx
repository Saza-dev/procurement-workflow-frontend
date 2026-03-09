"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster, toast } from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";

export default function Arrivals() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState<number | null>(null);

  const fetchMoveHR = async () => {
    try {
      setLoading(true);
      const res = await api.requests.viewAllByStatus("MOVE_HR");
      setRequests(res.data?.data?.baskets || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoveHR();
  }, []);

  const handleGenerateTags = async (basketId: number) => {
    const basket = requests.find((r) => r.id === basketId);
    if (!basket) return;

    setIsGenerating(basketId);
    try {
      const tagPromises = basket.items
        .filter((item: any) => !item.tag)
        .map((item) => api.items.addTag(item.id));

      if (tagPromises.length === 0) {
        toast.error("All items are already tagged!");
        return;
      }

      await Promise.all(tagPromises);
      toast.success(`Successfully generated ${tagPromises.length} asset tags!`);
      fetchMoveHR();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleHandover = async (basketId: number) => {
    const basket = requests.find((r) => r.id === basketId);
    const allItemsHaveTags = basket?.items.every((item: any) => item.tag);

    if (!allItemsHaveTags) {
      return toast.error(
        "Tags must be generated for ALL items before handover.",
      );
    }

    setIsFinishing(basketId);
    try {
      await api.requests.changeStatus(basketId, "HANDED_OVER");
      toast.success("Handover confirmed! Basket moved to history.");
      fetchMoveHR();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsFinishing(null);
    }
  };

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center animate-pulse text-gray-900/20 font-black/20 uppercase tracking-[0.4em] text-lg sm:text-2xl">
        LOADING LOGISTICS
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      {/* --- PAGE HEADER --- */}
      <div className="mb-10 sm:mb-16 relative">
        <h2 className="text-3xl sm:text-5xl font-black/20 text-gray-900 tracking-tighter uppercase leading-none">
          Logistics & Tagging
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-2 font-bold uppercase tracking-tight">
          Verify auto-generated tags and confirm physical transfer.
        </p>
        {/* Decorative background text using requested opacity */}
        <div className="absolute -top-6 -left-2 text-6xl sm:text-8xl font-black/20 text-black/5 -z-10 select-none pointer-events-none uppercase">
          LOGS
        </div>
      </div>

      <div className="space-y-12 sm:space-y-20">
        {requests.length === 0 ? (
          <div className="text-center py-24 sm:py-32 bg-gray-50 border-4 border-dashed border-gray-200">
            <p className="text-gray-900/20 font-black/20 text-xl sm:text-3xl uppercase tracking-widest">
              QUEUE CLEAR
            </p>
          </div>
        ) : (
          requests.map((basket) => {
            const itemsWithTags = basket.items.filter((i: any) => i.tag).length;
            const isFullyTagged = itemsWithTags === basket.items.length;

            return (
              <div
                key={basket.id}
                className="bg-white border border-gray-900 shadow-[10px_10px_0px_0px_#000000] sm:shadow-[20px_20px_0px_0px_#f3f4f6]"
              >
                {/* Basket Header */}
                <div className="bg-gray-900 p-6 sm:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 text-white relative overflow-hidden">
                  <div className="z-10">
                    <p className="text-[10px] font-black/20 text-orange-500 uppercase tracking-widest mb-1">
                      Dispatch Ready
                    </p>
                    <h3 className="text-2xl  font-black/20 uppercase tracking-tighter leading-none">
                      {basket.title}
                    </h3>
                  </div>

                  {/* Decorative ID using font-black/20/20 style */}
                  <span className="absolute right-[-10px] top-[-10px] text-7xl font-black/20 text-white/10 select-none pointer-events-none uppercase">
                    #{basket.id}
                  </span>

                  <button
                    onClick={() => handleGenerateTags(basket.id)}
                    disabled={isFullyTagged || isGenerating === basket.id}
                    className={`z-10 w-full lg:w-auto px-8 py-4 font-black/20 text-xs uppercase tracking-[0.2em] transition-all border-2 ${
                      isFullyTagged
                        ? "bg-transparent text-green-500 border-green-500 cursor-not-allowed"
                        : "bg-orange-500 text-white border-orange-500 hover:bg-white hover:text-orange-600 active:scale-95"
                    }`}
                  >
                    {isGenerating === basket.id
                      ? "PROCESSING..."
                      : isFullyTagged
                        ? "TAGS VERIFIED"
                        : "GENERATE ALL TAGS"}
                  </button>
                </div>

                <div className="p-5 sm:p-10">
                  {/* Items List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {basket.items.map((item: any) => (
                      <div
                        key={item.id}
                        className={`p-5 border-2 transition-all flex items-center justify-between gap-4 ${
                          item.tag
                            ? "bg-gray-50 border-green-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-black/20 text-gray-900 uppercase tracking-tight truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] font-black/20 text-gray-400 uppercase tracking-widest mt-1">
                            Units: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[8px] font-black/20 text-gray-400 uppercase tracking-[0.2em] mb-1">
                            Asset ID
                          </p>
                          <p
                            className={`text-xs sm:text-sm font-black/20 font-mono tracking-tighter ${
                              item.tag
                                ? "text-green-600"
                                : "text-gray-500 italic"
                            }`}
                          >
                            {item.tag || "WAITING"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit / Handover Area */}
                  <div className="border-t-4 border-gray-100 pt-8 sm:pt-10">
                    <div className="mb-4 flex justify-between items-center px-1">
                      <span className="text-[10px] font-black/20 text-gray-900 uppercase tracking-widest">
                        Verification Status
                      </span>
                      <span
                        className={`text-[10px] font-black/20 uppercase ${isFullyTagged ? "text-green-600" : "text-red-500"}`}
                      >
                        {itemsWithTags} / {basket.items.length} TAGS
                      </span>
                    </div>
                    <button
                      onClick={() => handleHandover(basket.id)}
                      disabled={!isFullyTagged || isFinishing === basket.id}
                      className={`w-full py-5 sm:py-7 font-black/20 text-xs sm:text-sm tracking-[0.3em] uppercase transition-all border-4 ${
                        isFullyTagged
                          ? "bg-gray-900 text-white border-gray-900 hover:bg-white hover:text-gray-900 active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      {isFinishing === basket.id
                        ? "UPDATING LEDGER..."
                        : "CONFIRM PHYSICAL HANDOVER"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
