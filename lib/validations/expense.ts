import { z } from "zod";
import { frequencyEnum } from "./income";

export const createExpenseSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  frequency: frequencyEnum.default("ONE_TIME"),
  isRecurring: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  vendor: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
