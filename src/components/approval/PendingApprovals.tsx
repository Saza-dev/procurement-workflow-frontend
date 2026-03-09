"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";

export default function PendingApprovals() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionComment, setRejectionComment] = useState("");

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // 1. Get Current User Info
      const userRes = await api.auth.me();
      const loggedInId = userRes.data?.data?.user?.id;
      setCurrentUserId(loggedInId);

      // 2. Fetch Baskets
      const response = await api.requests.viewAllByStatus("PENDING_APPROVALS");
      const allBaskets: RequestBasket[] = response.data?.data?.baskets || [];

      const filtered = allBaskets.filter((basket: any) => {
        // 1. Specifically look for an APPROVAL on the CURRENT version
        const hasApprovedCurrent = basket.approvals?.some(
          (app: any) =>
            Number(app.approverId) === Number(loggedInId) &&
            Number(app.version) === Number(basket.version) &&
            app.status === "APPROVED",
        );

        // 2. If I have already approved this version, hide it instantly
        if (hasApprovedCurrent) return false;

        // 3. Otherwise, check if I have a rejection on this version
        const hasRejectedCurrent = basket.approvals?.some(
          (app: any) =>
            Number(app.approverId) === Number(loggedInId) &&
            Number(app.version) === Number(basket.version) &&
            app.status === "REJECTED",
        );

        // 4. If I rejected it, keep showing it (so I can see if they fix it)
        if (hasRejectedCurrent) return true;

        // 5. If I haven't done anything to this version, show it
        return true;
      });

      setRequests(filtered);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleAction = async (
    basketId: number,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    // ... (validation)
    setProcessingId(basketId);
    try {
      await api.approvals.decision(basketId, newStatus, rejectionComment);
      toast.success(newStatus === "APPROVED" ? "Approved!" : "Rejected!");

      // Give the DB 300ms to breathe before we re-fetch
      setTimeout(() => {
        fetchInitialData();
        setRejectionComment("");
        setRejectingId(null);
      }, 300);
    } catch (error) {
      handleApiError(error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-gray-400 font-bold animate-pulse">
        Checking Approval Queue...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Pending Approvals
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Baskets requiring your authorization. Requests you've already signed
          are hidden.
        </p>
      </div>

      <div className="space-y-6">
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 -3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">
              All caught up! No new requests for you.
            </p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className={`p-6 bg-white border border-gray-100 -[2rem] shadow-sm transition-all ${
                processingId === req.id ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* --- HEADER SECTION --- */}
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5  uppercase">
                      ID #{req.id}
                    </span>
                    <h3 className="font-bold text-gray-900 text-xl capitalize">
                      {req.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    Requester:{" "}
                    <span className="text-gray-900 font-semibold">
                      {req.requester?.email}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Grand Total
                    </p>
                    <p className="text-3xl font-black text-green-600">
                      $
                      {req.totalValue
                        ? Number(req.totalValue).toLocaleString()
                        : "0.00"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === req.id ? null : req.id)
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-600 text-[10px] font-black -xl hover:bg-gray-200 uppercase transition-all"
                    >
                      {expandedId === req.id ? "Hide Details" : "Review Items"}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(req.id);
                        setExpandedId(null);
                      }}
                      className="px-4 py-2 bg-red-50 text-red-500 text-[10px] font-black -xl hover:bg-red-500 hover:text-white uppercase transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "APPROVED")}
                      className="px-4 py-2 bg-green-600 text-white text-[10px] font-black -xl hover:bg-green-700 shadow-lg shadow-green-100 uppercase transition-all"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>

              {/* --- LINE ITEMS SECTION --- */}
              {expandedId === req.id && (
                <div className="mt-6 border-t border-gray-50 pt-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid gap-3">
                    {req.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 -2xl border ${item.inWarehouse ? "bg-green-50/30 border-green-100" : "bg-gray-50 border-gray-100"}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-800">
                              {item.title}
                            </p>
                            {item.inWarehouse && (
                              <span className="text-[8px] font-black bg-green-600 text-white px-1.5 py-0.5 ">
                                WAREHOUSE STOCK
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 italic line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-8 text-right">
                          <div>
                            <p className="text-[8px] font-black text-gray-400 uppercase">
                              Qty
                            </p>
                            <p className="text-sm font-bold">{item.quantity}</p>
                          </div>
                          <div className={item.inWarehouse ? "opacity-30" : ""}>
                            <p className="text-[8px] font-black text-gray-400 uppercase">
                              Price
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              $
                              {item.inWarehouse
                                ? "0.00"
                                : Number(item.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- REJECTION SECTION --- */}
              {rejectingId === req.id && (
                <div className="mt-6 p-6 bg-red-50 -[2rem] border border-red-100 animate-in zoom-in-95">
                  <label className="block text-xs font-black text-red-700 uppercase mb-2">
                    Rejection Note
                  </label>
                  <textarea
                    autoFocus
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    className="w-full p-4 -2xl border border-red-200 text-sm focus:ring-2 focus:ring-red-500 outline-none h-24 mb-4"
                    placeholder="Explain the reason for rejection..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionComment("");
                      }}
                      className="px-4 py-2 text-xs font-bold text-red-400 hover:text-red-700 uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "REJECTED")}
                      className="px-6 py-2 bg-red-600 text-white text-xs font-black -xl hover:bg-red-700 uppercase"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
