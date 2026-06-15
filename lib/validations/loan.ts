import { z } from "zod";

export const loanTypeEnum = z.enum([
  "HOME",
  "CAR",
  "PERSONAL",
  "EDUCATION",
  "GOLD",
  "BUSINESS",
  "CREDIT_CARD_LOAN",
  "OTHER",
]);

export const createLoanSchema = z.object({
  loanName: z.string().min(1, "Loan name is required").max(100),
  lenderName: z.string().min(1, "Lender name is required").max(100),
  loanType: loanTypeEnum,
  principalAmount: z.number().positive("Principal must be positive"),
  outstandingAmount: z.number().min(0, "Outstanding cannot be negative"),
  interestRate: z
    .number()
    .min(0)
    .max(100, "Interest rate must be between 0 and 100"),
  tenureMonths: z
    .number()
    .int()
    .min(1, "Tenure must be at least 1 month")
    .max(360),
  emiAmount: z.number().positive("EMI must be positive"),
  disbursedDate: z.string().min(1, "Disbursed date is required"),
  firstEmiDate: z.string().min(1, "First EMI date is required"),
  loanAccountNumber: z.string().max(50).optional().nullable(),
  processingFee: z.number().min(0).default(0),
  prepaymentPenalty: z.number().min(0).max(10).default(0),
  notes: z.string().max(500).optional().nullable(),
});

export const updateLoanSchema = createLoanSchema.partial();

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
