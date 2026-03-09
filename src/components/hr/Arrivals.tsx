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

  // Updated: Loops through all items in the basket and tags them
  const handleGenerateTags = async (basketId: number) => {
    const basket = requests.find((r) => r.id === basketId);
    if (!basket) return;

    setIsGenerating(basketId);

    try {
      // Create a list of promises for every item that doesn't have a tag yet
      const tagPromises = basket.items
        .filter((item: any) => !item.tag) // Only tag items that need it
        .map((item) => api.items.addTag(item.id));

      if (tagPromises.length === 0) {
        toast.error("All items are already tagged!");
        return;
      }

      await Promise.all(tagPromises);

      toast.success(`Successfully generated ${tagPromises.length} asset tags!`);
      fetchMoveHR(); // Refresh the UI to show the new tags
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
      <div className="p-20 text-center animate-pulse text-gray-400 font-black tracking-widest">
        LOADING LOGISTICS...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      <div className="mb-12">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
          Logistics & Tagging
        </h2>
        <p className="text-gray-400 text-sm mt-1 italic">
          Verify auto-generated tags and confirm physical transfer.
        </p>
      </div>

      <div className="space-y-16">
        {requests.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 -[3rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">
              LOGISTICS QUEUE IS CLEAR
            </p>
          </div>
        ) : (
          requests.map((basket) => {
            const itemsWithTags = basket.items.filter((i: any) => i.tag).length;
            const isFullyTagged = itemsWithTags === basket.items.length;

            return (
              <div
                key={basket.id}
                className="bg-white -[3rem] border-4 border-gray-900 shadow-[15px_15px_0px_0px_#f3f4f6] overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gray-900 p-8 flex flex-col md:flex-row justify-between items-center text-white">
                  <div>
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">
                      Dispatch Ready
                    </p>
                    <h3 className="text-2xl font-black">{basket.title}</h3>
                  </div>
                  <button
                    onClick={() => handleGenerateTags(basket.id)}
                    disabled={isFullyTagged || isGenerating === basket.id}
                    className={`px-8 py-3 -2xl font-black text-xs transition-all ${
                      isFullyTagged
                        ? "bg-green-600/20 text-green-500 cursor-not-allowed border border-green-600/30"
                        : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg active:scale-95"
                    }`}
                  >
                    {isGenerating === basket.id
                      ? "GENERATING..."
                      : isFullyTagged
                        ? "TAGS GENERATED"
                        : "GENERATE ALL TAGS"}
                  </button>
                </div>

                <div className="p-8">
                  {/* Items List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {basket.items.map((item: any) => (
                      <div
                        key={item.id}
                        className={`p-5 -3xl border-2 transition-all flex items-center justify-between ${item.tag ? "bg-gray-50 border-green-200" : "bg-white border-gray-100"}`}
                      >
                        <div>
                          <p className="text-sm font-black text-gray-800 line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                            Asset Tag
                          </p>
                          <p
                            className={`text-sm font-black font-mono ${item.tag ? "text-green-600" : "text-gray-300 italic"}`}
                          >
                            {item.tag || "WAITING"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <div className="border-t-2 border-gray-50 pt-8">
                    <button
                      onClick={() => handleHandover(basket.id)}
                      disabled={!isFullyTagged || isFinishing === basket.id}
                      className={`w-full py-6 -[2rem] font-black text-sm tracking-widest transition-all ${
                        isFullyTagged
                          ? "bg-gray-900 text-white hover:bg-black shadow-xl active:scale-[0.98]"
                          : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {isFinishing === basket.id
                        ? "PROCESSING..."
                        : "CONFIRM HANDOVER TO DEPARTMENT HEAD"}
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
