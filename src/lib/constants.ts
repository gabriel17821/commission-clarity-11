/**
 * Application Constants
 * Centralized configuration for long-term maintainability
 * Last updated: 2024
 */

// Default commission percentages
export const DEFAULT_REST_PERCENTAGE = 25;

// Product colors palette (HSL-based for consistency)
export const PRODUCT_COLORS = [
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#ef4444', // Red
] as const;

// NCF Configuration (Dominican Republic fiscal numbers)
export const NCF_CONFIG = {
  PREFIX: 'B01',
  PREFIX_LENGTH: 3,
  NUMBER_LENGTH: 8,
  TOTAL_LENGTH: 11,
} as const;

// Validation limits
export const VALIDATION = {
  MAX_INVOICE_AMOUNT: 999_999_999,
  MIN_INVOICE_AMOUNT: 0,
  MAX_PERCENTAGE: 100,
  MIN_PERCENTAGE: 0,
  MAX_PRODUCT_NAME_LENGTH: 100,
  MAX_NCF_LENGTH: 19,
} as const;

// Default products bank - commonly used products
export const DEFAULT_PRODUCTS_BANK = [
  { name: 'Colgate', percentage: 30 },
  { name: 'Palmolive', percentage: 30 },
  { name: 'Fabuloso', percentage: 30 },
  { name: 'Axion', percentage: 30 },
  { name: 'Suavitel', percentage: 28 },
  { name: 'Ajax', percentage: 28 },
  { name: 'Protex', percentage: 27 },
  { name: 'Irish Spring', percentage: 27 },
  { name: 'Speed Stick', percentage: 26 },
  { name: 'Lady Speed Stick', percentage: 26 },
  { name: 'Softsoap', percentage: 25 },
  { name: 'Sanex', percentage: 25 },
] as const;

// PDF Configuration
export const PDF_CONFIG = {
  COLORS: {
    darkGrey: '#404040',
    mediumGrey: '#666666',
    lightGrey: '#888888',
    veryLightGrey: '#e5e5e5',
    background: '#f8f8f8',
    border: '#d0d0d0',
    success: '#2d8a4e',
  },
  MARGIN: 15,
  FONT_SIZES: {
    title: 18,
    subtitle: 11,
    body: 10,
    small: 8,
    tiny: 7,
  },
} as const;

// Date format configuration
export const DATE_FORMAT = {
  DISPLAY: 'd MMM yyyy',
  MONTH_YEAR: 'MMMM yyyy',
  SHORT_MONTH: 'MMM',
  ISO: 'yyyy-MM-dd',
} as const;

// Settings keys
export const SETTINGS_KEYS = {
  REST_PERCENTAGE: 'rest_percentage',
  LAST_NCF_NUMBER: 'last_ncf_number',
} as const;

// Helper function to get color by index
export const getProductColor = (index: number): string => {
  return PRODUCT_COLORS[index % PRODUCT_COLORS.length];
};
