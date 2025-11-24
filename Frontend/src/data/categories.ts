// Centralized categories data
export interface Category {
    id: number;
    name: string;
}

export const CATEGORIES: Category[] = [
    { id: 1, name: "Kiswah Clothes" },
    { id: 2, name: "Kiswah Qandeel" },
    { id: 3, name: "Kiswah Belts" },
    { id: 4, name: "Kiswah Locks" },
    { id: 5, name: "Kiswah Keys" },
    { id: 6, name: "Kiswah Keys Bags" },
    { id: 7, name: "Islamic Decoration Arts" },
    { id: 8, name: "Red Kiswah" },
    { id: 9, name: "Green Kiswah" },
    { id: 10, name: "Kiswah Sets" },
    { id: 11, name: "Kiswah Framing Clothes" },
];

// Helper function to get all categories
export const getCategories = (): Category[] => {
    return CATEGORIES;
};

// Helper function to get category by id
export const getCategoryById = (id: number): Category | undefined => {
    return CATEGORIES.find(cat => cat.id === id);
};

// Helper function to get category by name
export const getCategoryByName = (name: string): Category | undefined => {
    return CATEGORIES.find(cat => cat.name.toLowerCase() === name.toLowerCase());
};
