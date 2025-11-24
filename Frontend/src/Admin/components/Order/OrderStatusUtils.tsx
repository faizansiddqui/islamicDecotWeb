import { CheckCircle, XCircle, Truck, Clock } from 'lucide-react';

// Add OrderItem interface
interface OrderItem {
    order_item_id: number;
    order_id: string;
    product_id: number;
    quantity: number;
    price: string;
    Product: {
        product_id: number;
        name: string;
        title: string;
        price: number;
        selling_price: number;
        product_image: string | string[] | { [key: string]: string };
    };
}

export interface Order {
    order_id: string;
    FullName: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    phone1: string;
    phone2?: string;
    createdAt: string;
    status: string;
    totalAmount: string;
    payment_method?: string;
    payu_payment_id?: string; // Add payu_payment_id property
    payu_transaction_id?: string; // Add payu_transaction_id property
    payment_status?: string; // Add payment_status property
    Product?: {
        product_id: number;
        name: string;
        title: string;
        price: number;
        selling_price: number;
        product_image: string | string[] | { [key: string]: string };
    };
    items?: OrderItem[]; // Add items array
}

export const getDisplayStatus = (status: string, paymentStatus?: string): string => {
    // If payment status is failed, show Payment Failed regardless of order status
    if (paymentStatus === 'failed') {
        return 'Payment Failed';
    }

    // If payment is successful (paid or success) and order is pending, show Confirmed
    if ((paymentStatus === 'success' || paymentStatus === 'paid') && status.toLowerCase() === 'pending') {
        return 'Confirmed';
    }

    // Default to pending if no status provided
    if (!status) return 'Pending';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case 'confirm':
        case 'confirmed':
            return 'Confirmed';
        case 'pending':
            return 'Pending'; // Change this from 'Ongoing' to 'Pending'
        case 'ongoing':
            return 'Ongoing';
        case 'delivered':
            return 'Delivered';
        case 'rto':
            return 'RTO';
        case 'reject':
        case 'rejected':
            return 'Reject';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
};

export const getStatusColor = (status: string, paymentStatus?: string) => {
    // If payment status is failed, show red color
    if (paymentStatus === 'failed') {
        return 'bg-red-100 text-red-800';
    }

    // If payment is successful (paid or success) and order is pending, show blue (confirmed) color
    if ((paymentStatus === 'success' || paymentStatus === 'paid') && status.toLowerCase() === 'pending') {
        return 'bg-blue-100 text-blue-800';
    }

    // Default to pending if no status provided
    if (!status) return 'bg-amber-100 text-amber-800';

    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case 'confirm':
        case 'confirmed':
            return 'bg-blue-100 text-blue-800';
        case 'pending':
            return 'bg-amber-100 text-amber-800';
        case 'ongoing':
            return 'bg-yellow-100 text-yellow-800';
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'rto':
            return 'bg-orange-100 text-orange-800';
        case 'reject':
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const getStatusIcon = (status: string, paymentStatus?: string) => {
    // If payment status is failed, show XCircle icon
    if (paymentStatus === 'failed') {
        return <XCircle size={16} />;
    }

    // If payment is successful (paid or success) and order is pending, show CheckCircle icon
    if ((paymentStatus === 'success' || paymentStatus === 'paid') && status.toLowerCase() === 'pending') {
        return <CheckCircle size={16} />;
    }

    // Default to pending if no status provided
    if (!status) return <Clock size={16} />;

    const statusLower = status.toLowerCase();
    switch (statusLower) {
        case 'confirm':
        case 'confirmed':
            return <CheckCircle size={16} />;
        case 'pending':
            return <Clock size={16} />;
        case 'ongoing':
            return <Clock size={16} />;
        case 'delivered':
            return <Truck size={16} />;
        case 'rto':
            return <XCircle size={16} />;
        case 'reject':
        case 'rejected':
            return <XCircle size={16} />;
        default:
            return <Clock size={16} />;
    }
};

export const getImageUrl = (productImage: string | string[] | { [key: string]: string } | undefined): string => {
    if (!productImage) return '';
    if (typeof productImage === 'string') {
        return productImage;
    }
    if (Array.isArray(productImage)) {
        return productImage[0] || '';
    }
    if (typeof productImage === 'object') {
        const values = Object.values(productImage);
        return values[0] || '';
    }
    return '';
};