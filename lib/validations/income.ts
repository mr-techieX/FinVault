import { z } from "zod";

export const frequencyEnum = z.enum([
  "ONE_TIME",
  "DAILY",
  "WEEKLY",
  "BI_WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
]);

export const createIncomeSchema = z.object({
  source: z.string().min(1, "Source is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  frequency: frequencyEnum.default("ONE_TIME"),
  categoryId: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  taxable: z.boolean().default(true),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
