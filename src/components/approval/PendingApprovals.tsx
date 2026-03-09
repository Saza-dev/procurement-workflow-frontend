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
      const userRes = await api.auth.me();
      const loggedInId = userRes.data?.data?.user?.id;
      setCurrentUserId(loggedInId);

      const response = await api.requests.viewAllByStatus("PENDING_APPROVALS");
      const allBaskets: RequestBasket[] = response.data?.data?.baskets || [];

      const filtered = allBaskets.filter((basket: any) => {
        const hasApprovedCurrent = basket.approvals?.some(
          (app: any) =>
            Number(app.approverId) === Number(loggedInId) &&
            Number(app.version) === Number(basket.version) &&
            app.status === "APPROVED",
        );
        if (hasApprovedCurrent) return false;

        const hasRejectedCurrent = basket.approvals?.some(
          (app: any) =>
            Number(app.approverId) === Number(loggedInId) &&
            Number(app.version) === Number(basket.version) &&
            app.status === "REJECTED",
        );
        if (hasRejectedCurrent) return true;
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
    setProcessingId(basketId);
    try {
      await api.approvals.decision(basketId, newStatus, rejectionComment);
      toast.success(newStatus === "APPROVED" ? "Approved!" : "Rejected!");

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
      <div className="p-10 sm:p-20 text-center text-gray-400 font-black/20 uppercase tracking-widest animate-pulse">
        Checking Approval Queue...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
      <Toaster position="top-right" />

      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-2xl font-black/20 text-gray-900 tracking-tighter uppercase">
          Pending Approvals
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mt-1 font-bold uppercase">
          Baskets requiring your authorization. Requests you've already signed
          are hidden.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-6">
        {requests.length === 0 ? (
          <div className="text-center py-24 sm:py-32 bg-gray-50 border-4 border-dashed border-gray-200">
            <p className="text-gray-400 font-black/20 uppercase tracking-widest text-sm">
              All caught up! No new requests for you.
            </p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className={`p-5 sm:p-8 bg-white border-1 border-gray-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] transition-all ${
                processingId === req.id ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* --- HEADER SECTION --- */}
              <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
                <div className="space-y-3 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black/20 bg-orange-600 text-white px-2 py-1 uppercase tracking-widest">
                      ID #{req.id}
                    </span>
                    <h3 className="font-black/20 text-gray-900 text-xl sm:text-lg uppercase tracking-tight">
                      {req.title}
                    </h3>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-black/20 uppercase tracking-widest">
                    Requester:{" "}
                    <span className="text-gray-900">
                      {req.requester?.email}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-end justify-between w-full xl:w-auto gap-6 border-t xl:border-t-0 pt-6 xl:pt-0 border-gray-100">
                  <div className="text-left xl:text-right">
                    <p className="text-[8px] sm:text-[10px] font-black/20 text-gray-400 uppercase tracking-widest">
                      Grand Total
                    </p>
                    <p className="text-3xl sm:text-4xl font-black/20 text-green-600 leading-none">
                      $
                      {req.totalValue
                        ? Number(req.totalValue).toLocaleString()
                        : "0.00"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === req.id ? null : req.id)
                      }
                      className="flex-1 sm:flex-none px-4 py-3 bg-gray-100 text-gray-900 text-[10px] font-black/20 uppercase tracking-widest hover:bg-gray-200 transition-all border-2 border-transparent"
                    >
                      {expandedId === req.id ? "Hide Details" : "Review Items"}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(req.id);
                        setExpandedId(null);
                      }}
                      className="flex-1 sm:flex-none px-4 py-3 bg-red-50 text-red-600 text-[10px] font-black/20 uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border-2 border-transparent"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "APPROVED")}
                      className="flex-1 sm:flex-none px-4 py-3 bg-green-600 text-white text-[10px] font-black/20 uppercase tracking-widest hover:bg-gray-900 transition-all border-2 border-transparent"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>

              {/* --- LINE ITEMS SECTION --- */}
              {expandedId === req.id && (
                <div className="mt-8 border-t-4 border-gray-100 pt-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid gap-3">
                    {req.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-2 transition-all gap-4 ${
                          item.inWarehouse
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="text-sm font-black/20 text-gray-900 uppercase tracking-tight">
                              {item.title}
                            </p>
                            {item.inWarehouse && (
                              <span className="text-[8px] font-black/20 bg-green-600 text-white px-2 py-0.5 tracking-widest">
                                WAREHOUSE STOCK
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-12 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-200/50">
                          <div>
                            <p className="text-[8px] font-black/20 text-gray-400 uppercase tracking-widest">
                              Qty
                            </p>
                            <p className="text-sm font-black/20 text-gray-900">
                              {item.quantity}
                            </p>
                          </div>
                          <div className={item.inWarehouse ? "opacity-30" : ""}>
                            <p className="text-[8px] font-black/20 text-gray-400 uppercase tracking-widest">
                              Price
                            </p>
                            <p className="text-sm font-black/20 text-gray-900">
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
                <div className="mt-8 p-6 bg-red-50 border-1 border-red-600 animate-in zoom-in-95">
                  <label className="block text-[10px] font-black/20 text-red-600 uppercase tracking-widest mb-3">
                    Rejection Note Required
                  </label>
                  <textarea
                    autoFocus
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    className="w-full p-4 border-2 border-red-200 text-xs font-bold uppercase focus:border-red-600 outline-none h-28 mb-4 placeholder:text-red-200"
                    placeholder="Explain the reason for rejection..."
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setRejectionComment("");
                      }}
                      className="px-4 py-2 text-[10px] font-black/20 text-red-400 hover:text-red-600 uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "REJECTED")}
                      className="px-6 py-3 bg-red-600 text-white text-[10px] font-black/20 uppercase tracking-widest hover:bg-gray-900 transition-all"
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
