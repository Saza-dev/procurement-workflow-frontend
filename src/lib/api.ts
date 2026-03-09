import axios from "axios";
import toast from "react-hot-toast";

// 1. Create the Axios Instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  withCredentials: true,
});

// 3. Define and Export API Functions
export const api = {
  // --- AUTH ---
  auth: {
    login: (credentials: any) => apiClient.post("/auth/login", credentials),
    me: () => apiClient.get("/auth/me"),
    logout: () => apiClient.post("auth/logout"),
  },

  // --- BUCKETS / REQUESTS ---
  requests: {
    create: (data: { title: string; justification: string }) =>
      apiClient.post("/basket", data),

    viewAllByStatus: (status: string) =>
      apiClient.get(`/basket/view-all/${status.toUpperCase()}`),

    getByUserId: (status: string) =>
      apiClient.get(`/basket/view-all-userId/${status.toUpperCase()}`),

    changeStatus: (basketId: number, status: string) =>
      apiClient.post("/basket/change-status", { basketId, status }),
    split: (data: {
      originalBasketId: number;
      itemsToMove: { itemId: number; quantity: number }[];
    }) => apiClient.post("/basket/split", data),
    viewAllHistory: () => apiClient.get("/basket/view-all"),
    deleteBasket: (id: string) => apiClient.delete(`/basket/delete/${id}`),
  },

  // --- ITEMS ---
  items: {
    viewByBasket: (basketId: number) =>
      apiClient.get(`/items/view-all/${basketId}`),
    add: (basketId: number, data: any) =>
      apiClient.post(`/items/add/${basketId}`, data),
    warehouseCheck: (data: { itemId: number; inWarehouse: boolean }) =>
      apiClient.post("/items/warehouse", data),
    addQuotation: (formData: FormData) =>
      apiClient.post("/items/add-quotation", formData),
    addInvoice: (formData: FormData) =>
      apiClient.post("/items/add-invoice", formData),
    addTag: (itemId: number) => apiClient.post("/items/tag", { itemId }),
    markDamaged: (data: { itemId: number; damagedQuantity: number }) =>
      apiClient.post("/items/mark-damaged", data),
    viewByCondition: (condition: string) =>
      apiClient.get(`/items/view/${condition}`),
    updateCondition: (
      itemId: number,
      data: { condition: string; note?: string },
    ) => apiClient.patch(`/items/${itemId}/condition`, data),
    removeItem: (basketId: string, itemId: number) =>
      apiClient.delete(`/items/remove/${basketId}/${itemId}`),
  },

  //  --- aprovals ---
  approvals: {
    decision: (basketId: number, status: string, comment: string) =>
      apiClient.post(`approval/decision`, { basketId, status, comment }),
  },
};

// 4. Global Error Handler Helper
export const handleApiError = (error: any) => {
  const message =
    error.response?.data?.error ||
    error.message ||
    "An unexpected error occurred";
  toast.error(message);
  return message;
};
