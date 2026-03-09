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
      <div className="p-20 text-center animate-pulse text-gray-400 font-bold">
        Initializing Procurement View...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Basket Processing
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Add quotations, check warehouse stock, or split baskets.
        </p>
      </div>

      <ul className="space-y-6">
        {requests.map((req: RequestBasket) => (
          <li
            key={req.id}
            className="group border-b border-gray-100 pb-6 last:border-0"
          >
            {/* Header / Clickable Area */}
            <div
              onClick={() =>
                setExpandedBasketId(expandedBasketId === req.id ? null : req.id)
              }
              className="flex justify-between items-start cursor-pointer hover:bg-gray-50 p-4 -2xl transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-black bg-gray-900 text-white px-2 py-0.5 ">
                    ID #{req.id}
                  </span>
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition-colors capitalize">
                    {req.title}
                  </h3>
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  Requester:{" "}
                  <span className="text-gray-600">
                    {req.requester?.email || `User ${req.requesterId}`}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Estimated Total
                </p>
                <p className="text-xl font-black text-gray-900">
                  {req.totalValue
                    ? `$${Number(req.totalValue).toLocaleString()}`
                    : "Pending..."}
                </p>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 -full ${expandedBasketId === req.id ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}
                >
                  {expandedBasketId === req.id ? "CLOSE DETAILS" : "VIEW ITEMS"}
                </span>
              </div>
            </div>

            {/* Expanded Detail View */}
            {expandedBasketId === req.id && (
              <BasketDetailView
                basket={req}
                onRefresh={fetchSubmittedRequests}
              />
            )}
          </li>
        ))}
      </ul>

      {requests.length === 0 && (
        <div className="text-center py-20 bg-gray-50 -3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold">
            No submitted baskets found in queue.
          </p>
        </div>
      )}
    </div>
  );
}
