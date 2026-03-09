"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster, toast } from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";

export default function DamageReport() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // State for the damage quantity input per item
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

      // Clear input and refresh
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
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">
          Scanning for arrivals...
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "text-sm font-semibold shadow-xl rounded-2xl border border-orange-50 bg-white text-gray-900",
        }}
      />

      {/* Page Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-orange-200 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">
              Arrival Inspection
            </p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">
              Damage Reporting
            </h2>
            <p className="text-gray-400 text-sm mt-1.5 font-medium">
              Identify damaged items upon arrival to trigger replacements or repairs.
            </p>
          </div>
        </div>
        <div className="bg-gray-950 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs font-bold tracking-tight">
            {requests.length} basket{requests.length !== 1 ? "s" : ""} to inspect
          </span>
        </div>
      </div>

      <div className="space-y-10">
        {requests.length === 0 ? (
          <div className="text-center py-28 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <p className="text-gray-800 font-black text-lg uppercase tracking-tight">
              No Damage to Report
            </p>
            <p className="text-gray-400 text-sm mt-1 font-medium italic">
              All items in current arrivals are reported as Good.
            </p>
          </div>
        ) : (
          requests.map((basket) => (
            <div
              key={basket.id}
              className="bg-white rounded-3xl border-2 border-gray-200 shadow-xl shadow-gray-100/80 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gray-950 px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-white">
                <div>
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">
                    Arrival Inspection Active
                  </p>
                  <h3 className="text-xl font-black tracking-tight">{basket.title}</h3>
                </div>
                <span className="bg-white/10 border border-white/10 px-4 py-1.5 rounded-xl text-[11px] font-black tracking-widest uppercase shrink-0">
                  Bundle #{basket.id}
                </span>
              </div>

              <div className="p-8">
                {/* Good items (actionable) */}
                <div className="space-y-3 mb-6">
                  {basket.items
                    .filter((i: any) => i.condition !== "DAMAGED")
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col lg:flex-row items-start lg:items-center gap-5 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200"
                      >
                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 leading-snug truncate">
                            {item.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                              Total In Basket: {item.quantity}
                            </span>
                            {item.tag && (
                              <span className="text-[10px] font-mono font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                                #{item.tag}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                          <div className="relative flex-1 lg:w-44">
                            <input
                              type="number"
                              min="1"
                              max={item.quantity}
                              placeholder="Qty Damaged"
                              value={damageCounts[item.id] || ""}
                              onChange={(e) =>
                                setDamageCounts({
                                  ...damageCounts,
                                  [item.id]: parseInt(e.target.value),
                                })
                              }
                              className="w-full pl-4 pr-14 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-gray-300"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-300 uppercase tracking-widest pointer-events-none">
                              / {item.quantity}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              handleMarkDamaged(item.id, item.quantity)
                            }
                            disabled={processingId === item.id}
                            className="bg-orange-500 text-white px-6 py-3.5 rounded-xl font-black text-[11px] hover:bg-orange-600 transition-all uppercase shadow-md shadow-orange-200 active:scale-95 disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                          >
                            {processingId === item.id ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Splitting...
                              </>
                            ) : (
                              "Mark Damaged"
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Show already marked damaged items as reference */}
                {basket.items.some((i: any) => i.condition === "DAMAGED") && (
                  <div className="border-t border-gray-100 pt-6 mb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Already Reported
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {basket.items
                        .filter((i: any) => i.condition === "DAMAGED")
                        .map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 bg-red-50 rounded-xl border border-red-100 flex justify-between items-center"
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-800 line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-[9px] font-black text-red-500 uppercase tracking-tight mt-0.5">
                                Damaged • Qty: {item.quantity}
                              </p>
                            </div>
                            <div className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-tight shrink-0 ml-3">
                              Reported
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Info notice */}
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 mt-px text-[10px] font-black">
                    i
                  </div>
                  <p className="text-[10px] text-orange-800 font-bold leading-relaxed">
                    Marking a <strong>partial quantity</strong> will split the item into two records: one Good, one Damaged.
                    Marking the <strong>full quantity</strong> flags the entire item as damaged.
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
