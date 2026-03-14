export interface Product {
    id: string;
    barcode: string;
    name: string;
    category: string;
    categoryId?: string;
    categoryName?: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    minStock: number;
    unit: string;
    image: string | null;
    expiryDate: string | null;
    supplier: string;
    salesCount: number;
    createdAt: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    email: string | null;
    loyaltyPoints: number;
    totalSpent: number;
    totalDebt: number;
    totalTransactions: number;
    joinDate: string;
    lastVisit: string;
    avatar: string | null;
    notes: string;
}

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    qty: number;
    stock: number;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface Transaction {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customerName: string;
    items: any[]; // refine later if needed
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: string;
    amountPaid: number;
    change: number;
    status: 'completed' | 'refunded' | 'pending';
    cashier: string;
    notes: string;
    createdAt: string;
}

export interface Debt {
    id: string;
    customerId: string;
    customerName: string;
    amount: number;
    paidAmount: number;
    remaining: number;
    items: string;
    dueDate: string;
    status: 'overdue' | 'unpaid' | 'partial' | 'paid';
    createdAt: string;
    payments: any[];
    reminderSent: boolean;
}

export interface DashboardSummary {
    revenue: number;
    transactions: number;
    customers: number;
}

export interface DashboardData {
    summary: {
        today: DashboardSummary;
        yesterday: DashboardSummary;
    };
    recentTransactions: Transaction[];
    lowStockCount: number;
}
