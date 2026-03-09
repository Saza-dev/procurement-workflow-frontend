"use client";

import { useState, useEffect } from "react";
import { api, handleApiError } from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

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
      // We pass "ALL" to see every request regardless of status
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
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED_REVISION_REQUIRED":
        return "bg-red-100 text-red-700 border-red-200";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse">
        Loading your history...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-gray-800">My Request History</h2>

      {requests.length === 0 ? (
        <div className="text-center p-20 bg-white -3xl border-2 border-dashed">
          <p className="text-gray-400">You haven't sent any requests yet.</p>
        </div>
      ) : (
        requests.map((req) => (
          <div
            key={req.id}
            className="bg-white -2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Header / Summary */}
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
              onClick={() =>
                setExpandedId(expandedId === req.id ? null : req.id)
              }
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-gray-400">
                    #{req.id}
                  </span>
                  <h3 className="font-bold text-lg text-gray-900">
                    {req.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Updated {format(new Date(req.updatedAt), "PPP")}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 -full text-xs font-bold border ${getStatusColor(req.status)}`}
                >
                  {req.status.replace(/_/g, " ")}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === req.id ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === req.id && (
              <div className="p-6 border-t border-gray-50 bg-gray-50/50 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">
                {/* Left Side: Items & Justification */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                      Justification
                    </h4>
                    <p className="text-sm text-gray-700 bg-white p-4 -xl border italic">
                      "{req.justification || "No justification provided."}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                      Requested Items
                    </h4>
                    <div className="space-y-2">
                      {req.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="bg-white p-3 -xl border border-gray-200 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          {item.isUrgent && (
                            <span className="text-[9px] text-red-600 font-bold bg-red-50 px-2 py-0.5 ">
                              URGENT
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: "What Happened" (Audit Logs) */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Activity History
                  </h4>
                  <div className="relative pl-6 border-l-2 border-orange-200 space-y-8">
                    {req.auditLogs.map((log: any, idx: number) => (
                      <div key={log.id} className="relative">
                        {/* Dot on timeline */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 -full bg-orange-500 border-4 border-white shadow-sm" />

                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {log.action.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-gray-500">
                            By {log.user?.role} ({log.user?.email})
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {format(new Date(log.createdAt), "MMM d, h:mm a")}
                          </p>

                          {/* Explanation of Status Changes */}
                          {log.action === "STATUS_CHANGED" && (
                            <div className="mt-2 text-xs p-2 bg-orange-50 text-orange-800 -lg">
                              Status moved to{" "}
                              <span className="font-bold">{req.status}</span>
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
        ))
      )}
    </div>
  );
}
