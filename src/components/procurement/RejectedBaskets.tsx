"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster, toast } from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";
import BasketDetailView from "./BasketDetailsView";

export default function RejectedBaskets() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState(true);

  // Track which basket is currently being edited
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchRejected = async () => {
    try {
      setLoading(true);
      const res = await api.requests.viewAllByStatus(
        "REJECTED_REVISION_REQUIRED",
      );
      setRequests(res.data?.data?.baskets || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejected();
  }, []);

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse text-gray-400 font-black">
        Loading Rejected Requests...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight text-red-600">
            Revision Required
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Fix the issues mentioned in the feedback and resubmit your request.
          </p>
        </div>
        <div className="bg-red-50 px-4 py-2 -2xl border border-red-100">
          <span className="text-red-600 font-black text-xs">
            {requests.length} Baskets Rejected
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {requests.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 -[3rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">
              No rejected requests. Your workflow is clean!
            </p>
          </div>
        ) : (
          requests.map((basket) => (
            <div
              key={basket.id}
              className={`group bg-white -[2.5rem] border transition-all overflow-hidden ${
                expandedId === basket.id
                  ? "border-orange-200 shadow-2xl ring-4 ring-orange-50/50"
                  : "border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100"
              }`}
            >
              <div className="p-8">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black bg-red-100 text-red-600 px-3 py-1 -lg uppercase tracking-widest">
                        Needs Revision
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        ID #{basket.id}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 capitalize">
                      {basket.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Total Value
                    </p>
                    <p className="text-2xl font-black text-gray-900">
                      ${Number(basket.totalValue).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* THE REJECTION REASON */}
                <div className="bg-red-50/50 border border-red-100 -3xl p-6 mb-8 relative">
                  <div className="absolute -top-3 left-6 bg-red-600 text-white text-[8px] font-black px-2 py-1  uppercase tracking-tighter shadow-sm">
                    Feedback from Approver
                  </div>
                  <p className="text-sm text-red-800 font-medium italic leading-relaxed">
                    "
                    {(basket as any).approvals?.find((a: any) => a.comment)
                      ?.comment ||
                      "No specific comment provided. Check item details for errors."}
                    "
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 -full"></div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                      Rejected by{" "}
                      {(basket as any).approvals?.find((a: any) => a.comment)
                        ?.role || "Manager"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-50">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === basket.id ? null : basket.id)
                    }
                    className={`flex-1 py-4 -2xl font-black text-xs transition-all uppercase tracking-widest shadow-sm active:scale-95 ${
                      expandedId === basket.id
                        ? "bg-orange-100 text-orange-600 border-2 border-orange-200"
                        : "bg-white border-2 border-gray-100 text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {expandedId === basket.id
                      ? "Close Editor"
                      : "Edit & Fix Items"}
                  </button>
                </div>

                {/* --- ITEM MANAGEMENT VIEW (The actual editing interface) --- */}
                {expandedId === basket.id && (
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-orange-100 animate-in slide-in-from-top-4 duration-500">
                    <div className="mb-4">
                      <h4 className="text-sm font-black text-orange-600 uppercase tracking-tight">
                        Editor Mode
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Toggle warehouse stock or update prices/links below.
                      </p>
                    </div>
                    <BasketDetailView
                      basket={basket}
                      onRefresh={fetchRejected}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
