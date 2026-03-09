"use client";

import { useState, useEffect } from "react";
import { api, handleApiError } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";

export default function AddItems() {
  // State Management
  const [baskets, setBaskets] = useState<any[]>([]);
  const [selectedBasket, setSelectedBasket] = useState<any | null>(null);
  const [basketItems, setBasketItems] = useState<any[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  // --- ACTIONS ---

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

  // 1. Logic to trigger the Modal
  const handleOpenConfirmModal = () => {
    if (!selectedBasket) return;
    if (basketItems.length === 0) {
      toast.error("You cannot submit an empty basket.");
      return;
    }
    setShowConfirmModal(true);
  };

  // 2. Logic for actual API call after confirmation
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2 h-full relative">
      <Toaster position="top-right" />

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white -2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 -full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Final Submission
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to submit{" "}
              <span className="font-semibold text-gray-800">
                "{selectedBasket?.title}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 -xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isActionLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white -xl font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 disabled:bg-gray-400"
              >
                {isActionLoading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: Draft Baskets List */}
      <div className="md:col-span-1 space-y-4 border-r border-gray-100 pr-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Draft Baskets</h2>
          <button
            onClick={fetchBaskets}
            className="text-orange-500 text-xs hover:underline"
          >
            Refresh
          </button>
        </div>

        {isPageLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse -xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {baskets.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed -xl">
                <p className="text-gray-400 text-sm">No drafts found.</p>
              </div>
            ) : (
              baskets.map((b) => (
                <button
                  key={b.id}
                  disabled={isActionLoading}
                  onClick={() => handleSelectBasket(b)}
                  className={`w-full text-left p-4 -xl border transition-all ${
                    selectedBasket?.id === b.id
                      ? "border-orange-500 bg-orange-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-orange-300"
                  }`}
                >
                  <p className="font-bold text-gray-900">{b.title}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1">
                    ID: {b.id}
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Action Area */}
      <div className="md:col-span-2 space-y-6">
        {selectedBasket ? (
          <div className="animate-in slide-in-from-right-4 duration-300">
            {/* Header with Submit Button */}
            <div className="flex justify-between items-center bg-gray-900 text-white p-4 -t-xl">
              <div>
                <h3 className="font-bold">{selectedBasket.title}</h3>
                <p className="text-[10px] text-gray-400">
                  Add items to this request
                </p>
              </div>
              <button
                onClick={handleOpenConfirmModal}
                disabled={isActionLoading}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 -lg text-xs font-black transition-all flex items-center disabled:bg-gray-700"
              >
                SUBMIT TO PROCUREMENT
              </button>
            </div>

            {/* Form Body */}
            <div className="bg-white p-6 border-x border-b -b-xl shadow-sm space-y-4">
              <form onSubmit={handleAddItem} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <input
                    className="w-full p-3 border -lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Item Name"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <textarea
                    className="w-full p-3 border -lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Description (minimum 10 characters)"
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
                  className="p-3 border -lg focus:ring-2 focus:ring-orange-500 outline-none"
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
                  className="p-3 border -lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                  required
                />
                <label className="col-span-2 flex items-center p-3 bg-gray-50 -lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-orange-500 mr-3"
                    checked={formData.isHighPriority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isHighPriority: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    High Priority Requirement
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="col-span-2 bg-gray-900 text-white py-3 -lg font-bold hover:bg-black transition-all flex justify-center items-center"
                >
                  {isActionLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent -full animate-spin" />
                  ) : (
                    "ADD ITEM"
                  )}
                </button>
              </form>
            </div>

            {/* Existing Items List */}
            <div className="mt-6">
              <h4 className="font-bold text-gray-700 mb-3 flex items-center">
                Items in Basket
                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-[10px] -full">
                  {basketItems.length}
                </span>
              </h4>
              <div className="space-y-2">
                {basketItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-white border -xl hover:border-orange-200 transition-all"
                  >
                    <div>
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    {item.isUrgent && (
                      <span className="text-[9px] bg-red-600 text-white px-2 py-1  font-black animate-pulse">
                        URGENT
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed -3xl text-gray-400 bg-gray-50/50">
            <p className="font-medium">Select a draft basket to manage items</p>
          </div>
        )}
      </div>
    </div>
  );
}
