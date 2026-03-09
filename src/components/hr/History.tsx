"use client";

import { useEffect, useState, useMemo } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster } from "react-hot-toast";
import { RequestBasket } from "@/types/procurement";

export default function History() {
  const [requests, setRequests] = useState<RequestBasket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.requests.viewAllHistory();
      setRequests(res.data?.data?.baskets || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.title.toLowerCase().includes(search.toLowerCase()) ||
        req.id.toString().includes(search) ||
        req.requester?.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HANDED_OVER":
        return "bg-green-100 text-green-700 border-green-600";
      case "REJECTED_REVISION_REQUIRED":
        return "bg-red-100 text-red-700 border-red-600";
      case "PENDING_APPROVALS":
        return "bg-orange-100 text-orange-700 border-orange-600";
      default:
        return "bg-gray-100 text-gray-700 border-gray-600";
    }
  };

  if (loading)
    return (
      <div className="p-10 sm:p-20 flex flex-col items-center justify-center gap-4">
        {/* Sharp Loading Spinner */}
        <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 animate-spin" />
        <p className="text-gray-400 font-black/20 text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Fetching audit logs...
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "text-[10px] font-black/20 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-gray-900 bg-white text-gray-900",
        }}
      />

      {/* Header & Controls */}
      <div className="mb-8 sm:mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="flex items-center gap-5">
          {/* Sharp Icon Box */}
          <div className="w-14 h-14 bg-gray-900 text-white flex items-center justify-center border-b-4 border-r-4 border-orange-500 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="square"
              strokeLinejoin="miter"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black/20 text-orange-600 uppercase tracking-[0.2em] mb-1">
              Audit Log
            </p>
            <h2 className="text-2xl sm:text-4xl font-black/20 text-gray-900 tracking-tighter uppercase leading-none">
              Procurement History
            </h2>
            <p className="text-gray-400 text-xs mt-2 font-bold uppercase tracking-tight">
              Complete record of all baskets and asset lifecycle.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth="3"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="SEARCH BY ID, TITLE, EMAIL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-900 text-[10px] font-black/20 outline-none focus:bg-white transition-all placeholder:text-gray-300 uppercase tracking-widest"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-4 text-black  border-2 border-gray-900 text-[10px] font-black/20 outline-none cursor-pointer  transition-all uppercase tracking-widest"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="PENDING_APPROVALS">PENDING APPROVAL</option>
            <option value="APPROVED">AUTHORIZED</option>
            <option value="MOVE_HR">IN LOGISTICS</option>
            <option value="HANDED_OVER">COMPLETED</option>
            <option value="REJECTED_REVISION_REQUIRED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-[9px] font-black/20 text-gray-400 uppercase tracking-[0.2em]">
          {filteredRequests.length} record
          {filteredRequests.length !== 1 ? "s" : ""} found
        </span>
        {search || statusFilter !== "ALL" ? (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
            }}
            className="text-[9px] font-black/20 text-orange-600 hover:text-gray-900 uppercase tracking-widest transition-colors"
          >
            · Clear filters
          </button>
        ) : null}
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-24 sm:py-32 bg-gray-50 border-4 border-dashed border-gray-200">
            <p className="text-gray-400 font-black/20 uppercase tracking-widest text-sm">
              No records match your filters.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`group bg-white border-2 border-gray-900 transition-all duration-200 ${expandedId === req.id ? "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"}`}
            >
              {/* Summary Row */}
              <div
                onClick={() =>
                  setExpandedId(expandedId === req.id ? null : req.id)
                }
                className="p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 cursor-pointer"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <span className="text-[10px] font-black/20 text-white bg-gray-900 px-3 py-1.5 shrink-0 tracking-widest">
                    #{req.id}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black/20 text-gray-900 uppercase tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                      {req.title}
                    </h3>
                    <p className="text-[9px] text-gray-400 font-black/20 uppercase tracking-widest mt-1">
                      {req.requester?.email} •{" "}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <p className="text-[8px] font-black/20 text-gray-400 uppercase tracking-widest mb-1">
                      Total Value
                    </p>
                    <p className="text-xl sm:text-2xl font-black/20 text-gray-900 leading-none">
                      ${Number(req.totalValue).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 py-1.5 border-2 text-[9px] font-black/20 uppercase tracking-widest ${getStatusColor(req.status)}`}
                    >
                      {req.status.replace(/_/g, " ")}
                    </div>
                    <svg
                      className={`hidden sm:block w-5 h-5 text-gray-300 transition-transform duration-300 shrink-0 ${expandedId === req.id ? "rotate-180 text-gray-900" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        strokeWidth="4"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Detailed View */}
              {expandedId === req.id && (
                <div className="px-5 sm:px-8 pb-10 pt-4 border-t-2 border-gray-100 bg-gray-50/50 animate-in slide-in-from-top-2">
                  {/* Internal Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                    <div className="bg-white p-6 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                      <p className="text-[9px] font-black/20 text-orange-600 uppercase tracking-widest mb-3 border-b border-orange-100 pb-1">
                        Justification
                      </p>
                      <p className="text-[10px] font-bold text-gray-600 leading-relaxed uppercase">
                        {req.justification || "No justification provided."}
                      </p>
                    </div>

                    <div className="bg-white p-6 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                      <p className="text-[9px] font-black/20 text-orange-600 uppercase tracking-widest mb-3 border-b border-orange-100 pb-1">
                        Approval Chain
                      </p>
                      <div className="space-y-2">
                        {(req as any).approvals?.map(
                          (app: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[9px]"
                            >
                              <span className="font-black/20 text-gray-900 uppercase">
                                {app.role}
                              </span>
                              <span
                                className={`font-black/20 px-2 py-0.5 border text-[8px] uppercase tracking-widest ${app.status === "APPROVED" ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200"}`}
                              >
                                {app.status}
                              </span>
                            </div>
                          ),
                        ) || (
                          <p className="text-[9px] font-bold uppercase text-gray-300">
                            No approvals recorded yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-6 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                      <p className="text-[9px] font-black/20 text-orange-600 uppercase tracking-widest mb-3 border-b border-orange-100 pb-1">
                        Metadata
                      </p>
                      <p className="text-[9px] text-gray-500 font-black/20 uppercase mb-2">
                        Version: v{req.version}
                      </p>
                      <p className="text-[9px] text-gray-500 font-black/20 uppercase">
                        Sync: {new Date(req.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="bg-white border-2 border-gray-900 overflow-x-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                    <table className="w-full text-left min-w-[700px]">
                      <thead className="bg-gray-900 text-white">
                        <tr>
                          <th className="p-4 text-[9px] font-black/20 uppercase tracking-widest border-r border-gray-800">
                            Item Description
                          </th>
                          <th className="p-4 text-[9px] font-black/20 uppercase tracking-widest text-center border-r border-gray-800">
                            Qty
                          </th>
                          <th className="p-4 text-[9px] font-black/20 uppercase tracking-widest border-r border-gray-800">
                            Price
                          </th>
                          <th className="p-4 text-[9px] font-black/20 uppercase tracking-widest border-r border-gray-800">
                            Invoice #
                          </th>
                          <th className="p-4 text-[9px] font-black/20 uppercase tracking-widest text-right">
                            Asset Tag
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-gray-100">
                        {req.items && req.items.length > 0 ? (
                          req.items.map((item: any) => (
                            <tr
                              key={item.id}
                              className="hover:bg-orange-50/50 transition-colors"
                            >
                              <td className="p-4 border-r border-gray-50">
                                <p className="text-[10px] font-black/20 text-gray-900 uppercase tracking-tight">
                                  {item.title}
                                </p>
                                <p className="text-[8px] text-gray-400 uppercase font-black/20 tracking-widest mt-0.5">
                                  {item.inWarehouse
                                    ? "WAREHOUSE STOCK"
                                    : "MARKET PURCHASE"}
                                </p>
                              </td>
                              <td className="p-4 text-center text-[10px] font-black/20 text-gray-600 border-r border-gray-50">
                                {item.quantity}
                              </td>
                              <td className="p-4 text-[10px] font-black/20 text-gray-900 border-r border-gray-50">
                                ${Number(item.price).toLocaleString()}
                              </td>
                              <td className="p-4 border-r border-gray-50">
                                {item.invoiceNumber ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black/20 text-gray-900 uppercase">
                                      {item.invoiceNumber}
                                    </span>
                                    <a
                                      href={item.invoiceUrl}
                                      target="_blank"
                                      className="text-orange-600 hover:text-gray-900 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                      </svg>
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-[9px] font-black/20 text-gray-200 uppercase">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                {item.tag ? (
                                  <span className="text-[9px] font-mono font-black/20 text-green-700 bg-green-50 border-2 border-green-600 px-2 py-1 uppercase tracking-widest">
                                    {item.tag}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-black/20 text-gray-200 uppercase tracking-widest">
                                    PENDING
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-10 text-center text-[9px] font-black/20 text-gray-300 uppercase tracking-[0.3em] italic"
                            >
                              No items found in this request record.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
