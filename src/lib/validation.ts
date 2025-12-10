import { z } from 'zod';
import { VALIDATION, NCF_CONFIG } from './constants';

/**
 * Validation schemas for bulletproof input validation
 * These schemas ensure data integrity and prevent injection attacks
 */

// NCF validation schema
export const ncfSchema = z
  .string()
  .trim()
  .min(1, 'NCF es requerido')
  .max(VALIDATION.MAX_NCF_LENGTH, `NCF debe tener máximo ${VALIDATION.MAX_NCF_LENGTH} caracteres`)
  .regex(/^[A-Z0-9]+$/, 'NCF solo puede contener letras mayúsculas y números');

// Invoice amount validation
export const amountSchema = z
  .number()
  .min(VALIDATION.MIN_INVOICE_AMOUNT, 'El monto no puede ser negativo')
  .max(VALIDATION.MAX_INVOICE_AMOUNT, 'El monto excede el límite permitido')
  .finite('El monto debe ser un número válido');

// Percentage validation
export const percentageSchema = z
  .number()
  .min(VALIDATION.MIN_PERCENTAGE, 'El porcentaje no puede ser negativo')
  .max(VALIDATION.MAX_PERCENTAGE, 'El porcentaje no puede ser mayor a 100')
  .finite('El porcentaje debe ser un número válido');

// Product name validation
export const productNameSchema = z
  .string()
  .trim()
  .min(1, 'El nombre del producto es requerido')
  .max(VALIDATION.MAX_PRODUCT_NAME_LENGTH, `El nombre debe tener máximo ${VALIDATION.MAX_PRODUCT_NAME_LENGTH} caracteres`)
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/, 'El nombre contiene caracteres no válidos');

// Invoice date validation
export const invoiceDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)');

// Complete invoice validation schema
export const invoiceSchema = z.object({
  ncf: ncfSchema,
  invoiceDate: invoiceDateSchema,
  totalAmount: amountSchema,
  restAmount: amountSchema,
  restPercentage: percentageSchema,
  restCommission: amountSchema,
  totalCommission: amountSchema,
  products: z.array(z.object({
    name: productNameSchema,
    amount: amountSchema,
    percentage: percentageSchema,
    commission: amountSchema,
  })),
});

// Product validation schema
export const productSchema = z.object({
  name: productNameSchema,
  percentage: percentageSchema,
});

// Settings validation
export const settingsSchema = z.object({
  restPercentage: percentageSchema,
  lastNcfNumber: z.number().int().min(0).optional(),
});

/**
 * Safe number parser - returns 0 for invalid inputs
 */
export const safeParseNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  
  const cleaned = typeof value === 'string' 
    ? value.replace(/[,\s]/g, '') 
    : String(value);
  
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed) || !isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > VALIDATION.MAX_INVOICE_AMOUNT) return VALIDATION.MAX_INVOICE_AMOUNT;
  
  return parsed;
};

/**
 * Safe percentage parser - returns default for invalid inputs
 */
export const safeParsePercentage = (value: string | number | null | undefined, defaultValue = 25): number => {
  if (value === null || value === undefined || value === '') return defaultValue;
  
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  
  if (isNaN(parsed) || !isFinite(parsed)) return defaultValue;
  if (parsed < 0) return 0;
  if (parsed > 100) return 100;
  
  return parsed;
};

/**
 * Validate and sanitize NCF
 */
export const sanitizeNCF = (ncf: string): string => {
  return ncf
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, VALIDATION.MAX_NCF_LENGTH);
};

/**
 * Validate and sanitize product name
 */
export const sanitizeProductName = (name: string): string => {
  return name
    .trim()
    .replace(/[<>\"'&]/g, '')
    .slice(0, VALIDATION.MAX_PRODUCT_NAME_LENGTH);
};
