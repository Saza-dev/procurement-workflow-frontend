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

  // Filtering Logic
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
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED_REVISION_REQUIRED":
        return "bg-red-100 text-red-700 border-red-200";
      case "PENDING_APPROVALS":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading)
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">
          Fetching audit logs...
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "text-sm font-semibold shadow-xl rounded-2xl border border-orange-50 bg-white text-gray-900",
        }}
      />

      {/* Header & Controls */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-orange-200 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5">
              Audit Log
            </p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">
              Procurement History
            </h2>
            <p className="text-gray-400 text-sm mt-1.5 font-medium">
              Complete record of all baskets and asset lifecycle.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by ID, Title, or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 focus:bg-white transition-all placeholder:text-gray-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-xs font-black outline-none cursor-pointer focus:border-orange-500 transition-all"
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
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {filteredRequests.length} record{filteredRequests.length !== 1 ? "s" : ""} found
        </span>
        {search || statusFilter !== "ALL" ? (
          <button
            onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
            className="text-[10px] font-black text-orange-500 hover:text-orange-700 uppercase tracking-widest transition-colors"
          >
            · Clear filters
          </button>
        ) : null}
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">
              No records match your filters.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="group bg-white border-2 border-gray-200 rounded-3xl overflow-hidden hover:border-orange-200 hover:shadow-lg transition-all duration-200"
            >
              {/* Summary Row */}
              <div
                onClick={() =>
                  setExpandedId(expandedId === req.id ? null : req.id)
                }
                className="p-6 flex flex-col lg:flex-row justify-between items-center gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg shrink-0">
                    #{req.id}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-gray-900 capitalize leading-tight">
                      {req.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      {req.requester?.email} •{" "}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                      Total Value
                    </p>
                    <p className="text-xl font-black text-gray-900">
                      ${Number(req.totalValue).toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tight ${getStatusColor(req.status)}`}
                  >
                    {req.status.replace(/_/g, " ")}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-300 transition-transform duration-300 shrink-0 ${expandedId === req.id ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Detailed View */}
              {expandedId === req.id && (
                <div className="px-6 pb-8 pt-2 border-t-2 border-gray-100 bg-gray-50/40 animate-in slide-in-from-top-2 duration-200">
                  {/* Internal Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
                      <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2">
                        Justification
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed italic">
                        {req.justification || "No justification provided."}
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
                      <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2">
                        Approval Chain
                      </p>
                      <div className="space-y-2">
                        {(req as any).approvals?.map(
                          (app: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[10px]"
                            >
                              <span className="font-black text-gray-700">
                                {app.role}
                              </span>
                              <span
                                className={`font-bold px-2 py-0.5 rounded-md text-[9px] ${app.status === "APPROVED" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}
                              >
                                {app.status}
                              </span>
                            </div>
                          ),
                        ) || (
                          <p className="text-[10px] italic text-gray-400">
                            No approvals recorded yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border-2 border-gray-100 shadow-sm">
                      <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2">
                        Metadata
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">
                        Version: v{req.version}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">
                        Last Updated: {new Date(req.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-950 text-white">
                        <tr>
                          <th className="p-4 text-[9px] font-black uppercase tracking-widest">
                            Item Description
                          </th>
                          <th className="p-4 text-[9px] font-black uppercase tracking-widest text-center">
                            Qty
                          </th>
                          <th className="p-4 text-[9px] font-black uppercase tracking-widest">
                            Price
                          </th>
                          <th className="p-4 text-[9px] font-black uppercase tracking-widest">
                            Invoice #
                          </th>
                          <th className="p-4 text-[9px] font-black uppercase tracking-widest text-right">
                            Asset Tag
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {req.items && req.items.length > 0 ? (
                          req.items.map((item: any) => (
                            <tr
                              key={item.id}
                              className="hover:bg-orange-50/30 transition-colors"
                            >
                              <td className="p-4">
                                <p className="text-xs font-black text-gray-800">
                                  {item.title}
                                </p>
                                <p className="text-[9px] text-gray-400 uppercase font-bold mt-0.5">
                                  {item.inWarehouse
                                    ? "Warehouse stock"
                                    : "Market purchase"}
                                </p>
                              </td>
                              <td className="p-4 text-center text-xs font-bold text-gray-600">
                                {item.quantity}
                              </td>
                              <td className="p-4 text-xs font-black text-gray-900">
                                ${Number(item.price).toLocaleString()}
                              </td>
                              <td className="p-4">
                                {item.invoiceNumber ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-gray-700">
                                      {item.invoiceNumber}
                                    </span>
                                    <a
                                      href={item.invoiceUrl}
                                      target="_blank"
                                      className="text-orange-500 hover:text-orange-700 transition-colors"
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
                                  <span className="text-[10px] italic text-gray-300">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                {item.tag ? (
                                  <span className="text-[10px] font-mono font-black text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded-lg">
                                    {item.tag}
                                  </span>
                                ) : (
                                  <span className="text-[10px] italic text-gray-300">
                                    Unassigned
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          /* Empty State for the Table */
                          <tr>
                            <td
                              colSpan={5}
                              className="p-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest italic"
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
