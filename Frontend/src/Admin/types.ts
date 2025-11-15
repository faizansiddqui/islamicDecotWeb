export interface Product {
    id: string;
    images: (File | string)[];
    title: string;
    description: string;
    mrp: number;
    sellingPrice: number;
    discountPercentage: number;
    material: string;
    dimensions: string;
    stock: number | 'in stock' | 'out of stock';
    stockType: 'number' | 'dropdown';
    category: string;
    features: string[];
    skuId: string;
}

export type ProductFormData = Omit<Product, 'id'>;

export const categories = [
    'Kiswah Clothes',
    'Kiswah Qandeel',
    'Kiswah Belts',
    'Kiswah Locks',
    'Kiswah Keys',
    'Kiswah Keys Bags',
    'Islamic Decoration Arts'
] as const;

