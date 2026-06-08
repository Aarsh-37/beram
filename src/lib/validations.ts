import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["ADMIN", "STAFF"]).optional().default("STAFF"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50)
    .regex(/^[A-Z0-9\-_]+$/i, "SKU can only contain letters, numbers, hyphens and underscores"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  lowStockThreshold: z.number().int().min(0, "Threshold cannot be negative"),
});

export const stockMovementSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  reason: z.string().min(1, "Reason is required").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
