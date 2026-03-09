"use client";

import { useState, useEffect } from "react";
import { api, handleApiError } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function AddItems() {
  const [baskets, setBaskets] = useState<any[]>([]);
  const [selectedBasket, setSelectedBasket] = useState<any | null>(null);
  const [basketItems, setBasketItems] = useState<any[]>([]);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [basketToDelete, setBasketToDelete] = useState<any | null>(null);

  // Loading States
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: 1,
    targetDate: "",
    isHighPriority: false,
  });

  const fetchBaskets = async () => {
    try {
      setIsPageLoading(true);
      const { data } = await api.requests.getByUserId("DRAFT");
      setBaskets(data.data || []);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchBaskets();
  }, []);

  const handleSelectBasket = async (basket: any) => {
    setSelectedBasket(basket);
    const loadToast = toast.loading("Loading items...");
    try {
      setIsActionLoading(true);
      const { data } = await api.items.viewByBasket(basket.id);
      setBasketItems(data.data || []);
      toast.dismiss(loadToast);
    } catch (err) {
      toast.error("Failed to load items", { id: loadToast });
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDeleteBasket = async () => {
    if (!basketToDelete) return;
    setIsActionLoading(true);
    try {
      await api.requests.deleteBasket(basketToDelete.id);
      toast.success("Basket deleted successfully");

      if (selectedBasket?.id === basketToDelete.id) {
        setSelectedBasket(null);
        setBasketItems([]);
      }

      setBasketToDelete(null);
      fetchBaskets();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBasket) return;
    if (formData.description.length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }

    try {
      setIsActionLoading(true);
      const formattedData = {
        ...formData,
        targetDate: new Date(formData.targetDate).toISOString(),
      };
      await api.items.add(selectedBasket.id, formattedData);
      toast.success("Item added!");
      const { data } = await api.items.viewByBasket(selectedBasket.id);
      setBasketItems(data.data || []);
      setFormData({
        title: "",
        description: "",
        quantity: 1,
        targetDate: "",
        isHighPriority: false,
      });
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsActionLoading(true);
      await api.requests.changeStatus(selectedBasket.id, "SUBMITTED");
      toast.success("Basket submitted successfully!");
      setShowConfirmModal(false);
      setSelectedBasket(null);
      setBasketItems([]);
      fetchBaskets();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1 h-full relative">
      <Toaster position="top-right" />

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {basketToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border-4 border-red-600 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full p-8 text-center">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-4">
              Confirm Deletion
            </h3>
            <p className="text-xs font-bold text-gray-500 uppercase mb-8 leading-relaxed">
              You are about to delete{" "}
              <span className="text-red-600">"{basketToDelete.title}"</span>.
              This will permanently remove the basket and all items inside it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBasketToDelete(null)}
                className="flex-1 py-4 border-2 border-gray-900 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBasket}
                disabled={isActionLoading}
                className="flex-1 py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
              >
                {isActionLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMISSION CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth="3"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-2">
              Final Submission
            </h3>
            <p className="text-gray-500 text-xs font-bold uppercase mb-6">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isActionLoading}
                className="flex-1 px-4 py-3 bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-colors disabled:bg-gray-400"
              >
                {isActionLoading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: Draft Baskets List */}
      <div className="lg:col-span-1 space-y-4 lg:border-r border-gray-300 lg:pr-6 pb-6 lg:pb-0">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
            Draft Baskets
          </h2>
          <button
            onClick={fetchBaskets}
            className="text-orange-600 font-black text-[10px] uppercase tracking-widest hover:underline"
          >
            Refresh
          </button>
        </div>

        {isPageLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-50 border border-gray-300 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-48 lg:max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
            {baskets.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-[10px] font-black uppercase">
                  No drafts found.
                </p>
              </div>
            ) : (
              baskets.map((b) => (
                <div key={b.id} className="relative group">
                  <button
                    disabled={isActionLoading}
                    onClick={() => handleSelectBasket(b)}
                    className={`w-full text-left p-4 border-2 transition-all pr-12 ${
                      selectedBasket?.id === b.id
                        ? "border-orange-500 bg-orange-50 shadow-[4px_4px_0px_0px_rgba(249,115,22,0.1)]"
                        : "border-gray-100 bg-white hover:border-gray-300"
                    }`}
                  >
                    <p className="font-black text-xs text-gray-900 uppercase tracking-tight truncate">
                      {b.title}
                    </p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1">
                      ID: {b.id}
                    </p>
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent selecting the basket
                      setBasketToDelete(b);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-600 transition-colors"
                    title="Delete Draft"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Action Area remains same as previous step */}
      <div className="lg:col-span-2">
        {selectedBasket ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-900 text-white p-5 gap-4">
              <div>
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">
                  Active Container
                </p>
                <h3 className="font-black uppercase tracking-tight text-sm">
                  {selectedBasket.title}
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isActionLoading}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all disabled:bg-gray-700"
              >
                Submit to Procurement
              </button>
            </div>

            <div className="bg-white p-5 sm:p-8 border-x-2 border-b-2 border-gray-300 shadow-sm space-y-6">
              <form
                onSubmit={handleAddItem}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="sm:col-span-2">
                  <input
                    className="w-full p-4 border-2 border-gray-100 focus:border-orange-500 outline-none text-xs font-bold uppercase"
                    placeholder="Item Name"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <textarea
                    className="w-full p-4 border-2 border-gray-100 focus:border-orange-500 outline-none text-xs font-bold uppercase"
                    placeholder="Description (Min 10 chars)"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                    required
                  />
                </div>
                <input
                  type="number"
                  className="p-4 border-2 border-gray-100 focus:border-orange-500 outline-none text-xs font-bold uppercase"
                  placeholder="Qty"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  required
                />
                <input
                  type="date"
                  className="p-4 border-2 border-gray-100 focus:border-orange-500 outline-none text-xs font-bold"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                  required
                />
                <label className="sm:col-span-2 flex items-center p-4 bg-gray-50 border-2 border-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-orange-600 mr-3 shrink-0"
                    checked={formData.isHighPriority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isHighPriority: e.target.checked,
                      })
                    }
                  />
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    High Priority Requirement
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="sm:col-span-2 bg-gray-900 text-white py-4 font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex justify-center items-center"
                >
                  {isActionLoading ? "Processing..." : "Add Item to Basket"}
                </button>
              </form>
            </div>

            {/* Existing Manifest List */}
            <div className="mt-10">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                Basket Manifest{" "}
                <span className="ml-3 px-2 py-0.5 bg-gray-100 text-gray-900">
                  {basketItems.length} Items
                </span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {basketItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-5 bg-white border-2 border-gray-300 hover:border-orange-200 transition-all"
                  >
                    <div>
                      <p className="font-black text-xs uppercase tracking-tight text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    {item.isUrgent && (
                      <span className="text-[8px] bg-red-600 text-white px-2 py-1 font-black tracking-widest">
                        URGENT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-4 border-dashed border-gray-100 text-gray-300 bg-gray-50/30 p-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">
              Select a container to manage items
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
