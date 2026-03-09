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
      await api.requests.changeStatus(basketId,"DONE");
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
      <div className="p-20 text-center animate-pulse text-gray-400 font-black uppercase">
        Checking arrivals...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      <div className="mb-12">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
          Items for Collection
        </h2>
        <p className="text-gray-400 text-sm mt-1 font-medium italic">
          Verify your items and their asset tags. Confirm receipt only after
          physical handover.
        </p>
      </div>

      <div className="space-y-10">
        {requests.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 -[3rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">
              No items waiting for your confirmation.
            </p>
          </div>
        ) : (
          requests.map((basket) => (
            <div
              key={basket.id}
              className="bg-white -[2.5rem] border-4 border-green-600 shadow-2xl overflow-hidden"
            >
              {/* Status Banner */}
              <div className="bg-green-600 p-6 flex justify-between items-center text-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                    Final Step
                  </p>
                  <h3 className="text-xl font-black">{basket.title}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold opacity-80 uppercase">
                    Request ID
                  </p>
                  <p className="text-sm font-black">#{basket.id}</p>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Verification Checklist
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {basket.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-50 border border-gray-100 -2xl flex justify-between items-center"
                      >
                        <div>
                          <p className="text-xs font-black text-gray-800">
                            {item.title}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black text-gray-400 uppercase">
                            Tag ID
                          </p>
                          <p className="text-[11px] font-mono font-black text-green-700">
                            {item.tag || "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Action */}
                <div className="pt-6 border-t border-gray-50">
                  <div className="bg-orange-50 p-4 -2xl mb-6 flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-orange-500 mt-0.5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-[10px] text-orange-700 font-bold leading-relaxed">
                      By clicking the button below, you confirm that you have
                      physically received all items listed above and that the
                      asset tags match the system records.
                    </p>
                  </div>

                  <button
                    onClick={() => handleFinalConfirm(basket.id)}
                    disabled={processingId === basket.id}
                    className="w-full py-5 bg-gray-900 text-white -[2rem] font-black text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
                  >
                    {processingId === basket.id
                      ? "FINALIZING..."
                      : "I HAVE RECEIVED THESE ITEMS"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
