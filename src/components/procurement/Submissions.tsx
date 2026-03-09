"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster } from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";
import BasketDetailView from "./BasketDetailsView";

export default function Submissions() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedBasketId, setExpandedBasketId] = useState<number | null>(null);

  const fetchSubmittedRequests = async () => {
    try {
      const response = await api.requests.viewAllByStatus("SUBMITTED");
      setRequests(response.data?.data?.baskets || []);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmittedRequests();
  }, []);

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center animate-pulse text-gray-400 font-black/20 uppercase tracking-widest">
        Initializing Procurement View...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      {/* --- HEADER --- */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-black/20 text-gray-900 tracking-tighter uppercase">
          Basket Processing
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-1 font-bold uppercase">
          Add quotations, check warehouse stock, or split baskets.
        </p>
      </div>

      {/* --- LIST --- */}
      <ul className="space-y-4 sm:space-y-6">
        {requests.map((req: RequestBasket) => (
          <li
            key={req.id}
            className="group border-b-2 border-gray-100 pb-6 last:border-0"
          >
            {/* Header / Clickable Area */}
            <div
              onClick={() =>
                setExpandedBasketId(expandedBasketId === req.id ? null : req.id)
              }
              className={`flex flex-col sm:flex-row justify-between items-start gap-4 cursor-pointer p-4 sm:p-6 transition-all border-2 ${
                expandedBasketId === req.id
                  ? "border-gray-900 bg-gray-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  : " border-gray-900"
              }`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black/20 bg-gray-900 text-white px-2 py-1 uppercase tracking-widest">
                    ID #{req.id}
                  </span>
                  <h3 className="font-black/20 text-gray-900 text-base sm:text-xl uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                    {req.title}
                  </h3>
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 font-black/20 uppercase tracking-widest">
                  Requester:{" "}
                  <span className="text-gray-900">
                    {req.requester?.email || `User ${req.requesterId}`}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-2 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-[8px] sm:text-[10px] font-black/20 text-gray-400 uppercase tracking-widest">
                    Estimated Total
                  </p>
                  <p className="text-lg sm:text-2xl font-black/20 text-gray-900 leading-none">
                    {req.totalValue
                      ? `$${Number(req.totalValue).toLocaleString()}`
                      : "Pending..."}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-black/20 px-3 py-1 uppercase tracking-widest transition-colors ${
                    expandedBasketId === req.id
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-900 group-hover:bg-orange-100"
                  }`}
                >
                  {expandedBasketId === req.id ? "CLOSE DETAILS" : "VIEW ITEMS"}
                </span>
              </div>
            </div>

            {/* Expanded Detail View */}
            {expandedBasketId === req.id && (
              <div className="mt-4 border-x-2 border-b-2 border-gray-900 p-2 sm:p-6 bg-white animate-in slide-in-from-top-2">
                <BasketDetailView
                  basket={req}
                  onRefresh={fetchSubmittedRequests}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* --- EMPTY STATE --- */}
      {requests.length === 0 && (
        <div className="text-center py-24 sm:py-32 bg-gray-50 border-4 border-dashed border-gray-200">
          <p className="text-gray-400 font-black/20 uppercase tracking-widest text-sm">
            No submitted baskets found in queue.
          </p>
        </div>
      )}
    </div>
  );
}
