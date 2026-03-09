"use client";

import { useEffect, useState } from "react";
import { api, handleApiError } from "@/lib/api";
import { Toaster, toast } from "react-hot-toast";

export default function PEWarranty() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    itemId: number | null;
    basketId: number | null;
    type: "GOOD" | null;
  }>({ isOpen: false, itemId: null, basketId: null, type: null });

  const fetchDamagedItems = async () => {
    try {
      setLoading(true);
      const res = await api.items.viewByCondition("DAMAGED");
      setItems(res.data?.data || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDamagedItems();
  }, []);

  const triggerConfirm = (itemId: number, basketId: number, type: "GOOD") => {
    setConfirmModal({ isOpen: true, itemId, basketId, type });
  };

  const executeResolution = async () => {
    const { itemId, type, basketId } = confirmModal;
    if (!itemId || !type) return;

    setResolvingId(itemId);
    setConfirmModal({ ...confirmModal, isOpen: false });

    if (!itemId || !type || basketId === null) {
      toast.error("Missing required ID information");
      return;
    }

    try {
      await api.items.updateCondition(itemId, {
        condition: type,
        note: `Warranty claim resolved as ${type} by Procurement Executive.`,
      });

      await api.requests.changeStatus(basketId, "MOVE_HR");

      toast.success(`Asset successfully marked as ${type}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      handleApiError(err);
    } finally {
      setResolvingId(null);
    }
  };

  if (loading)
    return (
      <div className="p-10 sm:p-20 text-center animate-pulse text-gray-400 font-black/20 uppercase tracking-widest text-xs sm:text-base">
        Scanning Damaged Inventory...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 bg-white min-h-screen relative">
      <Toaster position="top-right" />

      {/* --- CUSTOM DESIGNER MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div
              className={`p-6 sm:p-8 text-center ${confirmModal.type === "GOOD" ? "bg-green-50" : "bg-red-50"}`}
            >
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${confirmModal.type === "GOOD" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
              >
                {confirmModal.type === "GOOD" ? (
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black/20 text-gray-900 uppercase tracking-tighter">
                Confirm Resolution
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2 font-medium px-2">
                Are you sure you want to mark this item as{" "}
                <span className="font-bold text-gray-900">
                  {confirmModal.type}
                </span>
                ?
              </p>
            </div>
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-2 sm:gap-3 bg-white">
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    itemId: null,
                    type: null,
                    basketId: null,
                  })
                }
                className="flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] font-black/20 uppercase text-gray-400 hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={executeResolution}
                className={`flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] font-black/20 uppercase text-white shadow-lg transition-all active:scale-95 order-1 sm:order-2 ${confirmModal.type === "GOOD" ? "bg-green-600 shadow-green-100" : "bg-red-600 shadow-red-100"}`}
              >
                Confirm {confirmModal.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAGE HEADER --- */}
      <div className="mb-8 sm:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black/20 text-gray-900 tracking-tighter uppercase leading-none">
            Warranty & Repairs
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 font-medium">
            Items currently in{" "}
            <span className="text-red-500 font-bold">DAMAGED</span> state.
          </p>
        </div>
        <div className="bg-gray-900 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-black/20 text-[10px] sm:text-xs tracking-widest">
          {items.length} ACTIVE CLAIMS
        </div>
      </div>

      {/* --- ITEMS LIST --- */}
      <div className="space-y-4 sm:space-y-6">
        {items.length === 0 ? (
          <div className="text-center py-20 sm:py-32 bg-gray-50 rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-gray-200 px-4">
            <p className="text-gray-400 font-bold text-base sm:text-lg">
              No damaged items found.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="group bg-white border-2 border-gray-100 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 hover:shadow-2xl hover:border-orange-200 transition-all flex flex-col lg:flex-row gap-6 sm:gap-8 items-start lg:items-center"
            >
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="bg-red-50 text-red-600 text-[8px] sm:text-[9px] font-black/20 px-2 py-0.5 sm:py-1 rounded uppercase border border-red-100">
                    Claim Open
                  </span>
                  <p className="text-[8px] sm:text-[10px] font-black/20 text-gray-400 uppercase tracking-widest">
                    Item #{item.id}
                  </p>
                </div>
                <h3 className="text-xl sm:text-2xl font-black/20 text-gray-900 leading-tight mb-2">
                  {item.title}
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-4">
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-gray-100 min-w-[80px]">
                    <p className="text-[7px] sm:text-[8px] font-black/20 text-gray-400 uppercase">
                      Tag ID
                    </p>
                    <p className="text-[10px] sm:text-xs font-mono font-bold text-gray-800">
                      {item.tag || "NO_TAG"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-gray-100 min-w-[80px]">
                    <p className="text-[7px] sm:text-[8px] font-black/20 text-gray-400 uppercase">
                      Unit Value
                    </p>
                    <p className="text-[10px] sm:text-xs font-black/20 text-gray-800">
                      ${Number(item.price).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-72 flex flex-col gap-3">
                <button
                  onClick={() =>
                    triggerConfirm(item.id, item.requestBasketId, "GOOD")
                  }
                  disabled={resolvingId === item.id}
                  className="w-full bg-green-600 text-white py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black/20 text-[10px] sm:text-[11px] uppercase tracking-[0.1em] hover:bg-green-700 shadow-xl shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {resolvingId === item.id ? "..." : "Resolve as Repaired"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
