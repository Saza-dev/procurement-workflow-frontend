"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster, toast } from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";

export default function DamageReport() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [damageCounts, setDamageCounts] = useState<Record<number, number>>({});

  const fetchArrivals = async () => {
    try {
      setLoading(true);
      const res = await api.requests.getByUserId("DONE");
      setRequests(res.data?.data || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
  }, []);

  const handleMarkDamaged = async (itemId: number, maxQty: number) => {
    const qty = damageCounts[itemId] || 0;

    if (qty <= 0) return toast.error("Please enter a valid quantity");
    if (qty > maxQty)
      return toast.error(`Cannot exceed total quantity of ${maxQty}`);

    setProcessingId(itemId);
    try {
      await api.items.markDamaged({ itemId, damagedQuantity: qty });
      toast.success(
        qty === maxQty ? "Item marked as damaged" : "Item split successfully",
      );
      setDamageCounts((prev) => ({ ...prev, [itemId]: 0 }));
      fetchArrivals();
    } catch (err) {
      handleApiError(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center animate-pulse text-gray-900/20 font-black/20 uppercase tracking-[0.4em] text-lg sm:text-2xl">
        SCANNING ARRIVALS
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-white min-h-screen relative">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "text-[10px] font-black/20 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-gray-900 bg-white text-gray-900",
        }}
      />

      {/* Decorative background text using requested opacity style */}
      <div className="absolute top-0 right-4 text-7xl sm:text-9xl font-black/20 text-black/5 -z-10 select-none pointer-events-none uppercase">
        REPORT
      </div>

      {/* Page Header */}
      <div className="mb-10 sm:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
        <div className="flex items-center gap-5">
          {/* Sharp Brutalist Icon */}
          <div className="w-14 h-14 bg-orange-500 text-white flex items-center justify-center border-b-4 border-r-4 border-gray-900 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black/20 text-orange-600 uppercase tracking-[0.2em] mb-1">
              Arrival Inspection
            </p>
            <h2 className="text-3xl sm:text-5xl font-black/20 text-gray-900 tracking-tighter uppercase leading-none">
              Damage Reporting
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 font-bold uppercase tracking-tight">
              Identify damaged items to trigger replacements.
            </p>
          </div>
        </div>
        <div className="bg-gray-900 text-white px-5 py-3 border-2 border-gray-900 flex items-center gap-3 self-start sm:self-auto shrink-0">
          <div className="w-2 h-2 bg-orange-500 animate-pulse" />
          <span className="text-[10px] font-black/20 uppercase tracking-widest">
            {requests.length} Active Baskets
          </span>
        </div>
      </div>

      <div className="space-y-12 sm:space-y-20">
        {requests.length === 0 ? (
          <div className="text-center py-24 sm:py-32 bg-gray-50 border-4 border-dashed border-gray-200">
            <p className="text-gray-900/20 font-black/20 text-xl sm:text-3xl uppercase tracking-widest px-4">
              NO DAMAGE TO REPORT
            </p>
          </div>
        ) : (
          requests.map((basket) => (
            <div
              key={basket.id}
              className="bg-white border-4 border-gray-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] sm:shadow-[20px_20px_0px_0px_#f3f4f6] overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gray-900 px-6 sm:px-10 py-6 sm:py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-white relative">
                <div>
                  <p className="text-[9px] font-black/20 text-orange-500 uppercase tracking-widest mb-1">
                    Inspection Batch
                  </p>
                  <h3 className="text-xl sm:text-3xl font-black/20 uppercase tracking-tight">
                    {basket.title}
                  </h3>
                </div>
                {/* Visual Label with requested opacity */}
                <span className="text-[10px] font-black/20 text-white/20 border-2 border-white/20 px-4 py-2 uppercase tracking-widest">
                  Bundle #{basket.id}
                </span>
              </div>

              <div className="p-5 sm:p-10">
                {/* Actionable Items */}
                <div className="space-y-4 mb-10">
                  {basket.items
                    .filter((i: any) => i.condition !== "DAMAGED")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-5 bg-gray-50 border-2 border-gray-100 flex flex-col lg:flex-row items-start lg:items-center gap-6 hover:border-orange-500 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-black/20 text-gray-900 uppercase tracking-tight truncate">
                            {item.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-1">
                            <span className="text-[10px] font-black/20 text-gray-900/20 uppercase tracking-widest">
                              Quantity: {item.quantity}
                            </span>
                            {item.tag && (
                              <span className="text-[10px] font-mono font-black/20 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 uppercase tracking-tighter">
                                ID: {item.tag}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                          <div className="relative w-full sm:w-44">
                            <input
                              type="number"
                              min="1"
                              max={item.quantity}
                              placeholder="QTY"
                              value={damageCounts[item.id] || ""}
                              onChange={(e) =>
                                setDamageCounts({
                                  ...damageCounts,
                                  [item.id]: parseInt(e.target.value),
                                })
                              }
                              className="w-full pl-4 pr-14 py-4 bg-white border-2 border-gray-900 text-xs font-black/20 outline-none focus:bg-orange-50 transition-all uppercase"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black/20 text-gray-900/20 uppercase">
                              MAX {item.quantity}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              handleMarkDamaged(item.id, item.quantity)
                            }
                            disabled={processingId === item.id}
                            className="w-full sm:w-auto bg-orange-600 text-white px-8 py-4 font-black/20 text-[10px] uppercase tracking-widest hover:bg-gray-900 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {processingId === item.id
                              ? "SPLITTING..."
                              : "Mark Damaged"}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Reported Damaged Section */}
                {basket.items.some((i: any) => i.condition === "DAMAGED") && (
                  <div className="border-t-4 border-gray-100 pt-8 sm:pt-10 mb-8">
                    <p className="text-[10px] font-black/20 text-gray-900/20 uppercase tracking-[0.3em] mb-4">
                      Reported Damaged
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {basket.items
                        .filter((i: any) => i.condition === "DAMAGED")
                        .map((item) => (
                          <div
                            key={item.id}
                            className="p-5 bg-red-50 border-2 border-red-600 flex justify-between items-center"
                          >
                            <div className="min-w-0 pr-4">
                              <p className="text-xs font-black/20 text-red-700 uppercase truncate">
                                {item.title}
                              </p>
                              <p className="text-[10px] font-black/20 text-red-500 uppercase tracking-widest mt-1">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="bg-red-600 text-white px-3 py-1 text-[9px] font-black/20 uppercase tracking-widest">
                              Reported
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Info Notice Box */}
                <div className="bg-orange-50 border-l-8 border-orange-500 p-6 flex items-start gap-4 shadow-sm">
                  <div className="w-6 h-6 bg-orange-500 text-white flex items-center justify-center shrink-0 text-xs font-black/20">
                    !
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-orange-900 font-bold uppercase leading-relaxed tracking-tight">
                    Audit Logic: Marking a{" "}
                    <span className="text-orange-600">partial quantity</span>{" "}
                    will auto-split the item into two entries (Good/Damaged).
                    Marking{" "}
                    <span className="text-orange-600">full quantity</span> flags
                    the original record as Damaged.
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
