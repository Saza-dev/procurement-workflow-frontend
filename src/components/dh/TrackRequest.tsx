"use client";

import { useState, useEffect } from "react";
import { api, handleApiError } from "@/lib/api";
import { format } from "date-fns";
import  { Toaster } from "react-hot-toast";

export default function TrackRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.requests.getByUserId("ALL");
      setRequests(data.data || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-600";
      case "REJECTED_REVISION_REQUIRED":
        return "bg-red-100 text-red-700 border-red-600";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-700 border-blue-600";
      case "DRAFT":
        return "bg-gray-100 text-gray-700 border-gray-600";
      default:
        return "bg-orange-100 text-orange-700 border-orange-600";
    }
  };

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center animate-pulse text-gray-900/20 font-black/20 uppercase tracking-[0.4em] text-lg sm:text-2xl">
        RETRIEVING HISTORY
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 pb-20 bg-white min-h-screen relative">
      <Toaster position="top-right" />

      {/* Decorative background text */}
      <div className="absolute top-0 right-4 text-7xl sm:text-9xl font-black/20 text-black/5 -z-10 select-none pointer-events-none uppercase">
        TRACK
      </div>

      <h2 className="text-3xl sm:text-5xl font-black/20 text-gray-900 tracking-tighter uppercase leading-none mb-10">
        My Request History
      </h2>

      {requests.length === 0 ? (
        <div className="text-center p-20 bg-gray-50 border-4 border-dashed border-gray-200">
          <p className="text-gray-900/20 font-black/20 text-xl uppercase tracking-widest">
            NO REQUESTS FOUND
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`bg-white border border-gray-900 transition-all ${
                expandedId === req.id
                  ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                  : "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
              }`}
            >
              {/* Header / Summary */}
              <div
                className="p-5 sm:p-8 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                onClick={() =>
                  setExpandedId(expandedId === req.id ? null : req.id)
                }
              >
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black/20 bg-gray-900 text-white px-2 py-1 uppercase tracking-widest">
                      #{req.id}
                    </span>
                    <h3 className="font-black/20 text-base sm:text-xl text-gray-900 uppercase tracking-tight truncate">
                      {req.title}
                    </h3>
                  </div>
                  <p className="text-[10px] font-black/20 text-gray-400 uppercase tracking-widest">
                    Modified: {format(new Date(req.updatedAt), "PPP")}
                  </p>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                  <span
                    className={`px-3 py-1.5 border-2 text-[9px] font-black/20 uppercase tracking-widest ${getStatusColor(req.status)}`}
                  >
                    {req.status.replace(/_/g, " ")}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-900 transition-transform duration-300 ${expandedId === req.id ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      strokeWidth="3"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === req.id && (
                <div className="p-5 sm:p-10 border-t-2 border-gray-900 bg-gray-50/50 grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-2">
                  {/* Left Side: Items & Justification */}
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black/20 text-gray-400 uppercase tracking-[0.3em] mb-4">
                        Justification
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-800 bg-white p-5 border-2 border-gray-900 italic font-bold uppercase tracking-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                        "{req.justification || "No justification provided."}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black/20 text-gray-400 uppercase tracking-[0.3em] mb-4">
                        Requested Items
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {req.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="bg-white p-4 border-2 border-gray-200 flex justify-between items-center group hover:border-gray-900 transition-colors"
                          >
                            <div className="min-w-0 pr-4">
                              <p className="text-xs sm:text-sm font-black/20 text-gray-900 uppercase truncate">
                                {item.title}
                              </p>
                              <p className="text-[9px] font-black/20 text-gray-400 uppercase mt-1">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            {item.isUrgent && (
                              <span className="text-[8px] font-black/20 bg-red-600 text-white px-2 py-1 tracking-widest shrink-0">
                                URGENT
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Activity History */}
                  <div className="space-y-8">
                    <h4 className="text-[10px] font-black/20 text-gray-400 uppercase tracking-[0.3em] mb-4">
                      Activity Ledger
                    </h4>
                    <div className="relative pl-8 border-l-4 border-gray-900 space-y-10">
                      {req.auditLogs.map((log: any) => (
                        <div key={log.id} className="relative">
                          {/* Sharp Square Dot on timeline */}
                          <div className="absolute -left-[38px] top-1 w-4 h-4 bg-gray-900 border-4 border-gray-50" />

                          <div className="bg-white p-4 border-2 border-gray-100 shadow-sm">
                            <p className="text-xs font-black/20 text-gray-900 uppercase tracking-tight">
                              {log.action.replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                              By {log.user?.role} • {log.user?.email}
                            </p>
                            <p className="text-[9px] font-black/20 text-orange-600 mt-2 uppercase tracking-widest">
                              {format(new Date(log.createdAt), "MMM d, h:mm a")}
                            </p>

                            {log.action === "STATUS_CHANGED" && (
                              <div className="mt-3 text-[10px] font-black/20 p-3 bg-gray-900 text-white uppercase tracking-widest flex justify-between items-center">
                                <span>Transitioned To</span>
                                <span className="text-orange-500">
                                  {req.status}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
