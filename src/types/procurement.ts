// @/types/procurement.ts

export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_APPROVALS"
  | "REJECTED_REVISION_REQUIRED"
  | "APPROVED"
  | "PURCHASED"
  | "FINANCE_RECHECK_REQUIRED"
  | "HANDED_OVER"
  | "DONE";

export interface UserSnippet {
  id: number;
  email: string;
  role: string;
}

export interface RequestItem {
  id: number;
  title: string;
  description: string;
  quantity: number;
  targetDate: string;
  isUrgent: boolean;
  inWarehouse: boolean;
  price?: number | string | null;
  quoteUrl?: string | null;
  requestId: number;
  invoiceNumber: string | null;
  invoiceUrl: string | null;
  tag: string | null;
}

export interface RequestBasket {
  id: number;
  title: string;
  justification: string | null;
  status: RequestStatus;
  version: number;
  totalValue: number | string | null;
  requesterId: number;
  requester?: UserSnippet;
  items: RequestItem[];
  parentRequestId: number | null;
  createdAt: string;
  updatedAt: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  status: string;
  data: {
    baskets: T;
  };
}
