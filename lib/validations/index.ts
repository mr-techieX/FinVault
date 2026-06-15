import { z } from "zod";

export const assetTypeEnum = z.enum([
  "REAL_ESTATE",
  "VEHICLE",
  "GOLD_JEWELRY",
  "ART_COLLECTIBLES",
  "ELECTRONICS",
  "FURNITURE",
  "OTHER",
]);

export const investmentTypeEnum = z.enum([
  "STOCKS",
  "MUTUAL_FUND",
  "ETF",
  "FIXED_DEPOSIT",
  "PPF",
  "EPF",
  "NPS",
  "BONDS",
  "CRYPTO",
  "US_STOCKS",
  "REITS",
  "SGBs",
  "OTHER",
]);

export const cardTypeEnum = z.enum([
  "VISA",
  "MASTERCARD",
  "RUPAY",
  "AMEX",
  "DINERS",
]);

export const bankAccountTypeEnum = z.enum([
  "SAVINGS",
  "CURRENT",
  "FIXED_DEPOSIT",
  "RECURRING_DEPOSIT",
  "SALARY",
]);

export const createCreditCardSchema = z.object({
  cardName: z.string().min(1, "Card name is required").max(100),
  bankName: z.string().min(1, "Bank name is required").max(100),
  lastFourDigits: z
    .string()
    .length(4)
    .regex(/^\d{4}$/, "Must be 4 digits")
    .optional()
    .nullable(),
  creditLimit: z.number().positive("Credit limit must be positive"),
  outstanding: z.number().min(0).default(0),
  minimumDue: z.number().min(0).default(0),
  dueDate: z.number().int().min(1).max(31),
  billingCycle: z.number().int().min(1).max(31).default(25),
  interestRate: z.number().min(0).max(100),
  annualFee: z.number().min(0).default(0),
  cardType: cardTypeEnum.default("VISA"),
  color: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateCreditCardSchema = createCreditCardSchema.partial();

export const createAssetSchema = z.object({
  assetName: z.string().min(1, "Asset name is required").max(100),
  assetType: assetTypeEnum,
  purchaseValue: z.number().positive("Purchase value must be positive"),
  currentValue: z.number().min(0, "Current value cannot be negative"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  description: z.string().max(500).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  area: z.number().min(0).optional().nullable(),
  registrationNo: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const createInvestmentSchema = z.object({
  investmentName: z.string().min(1, "Investment name is required").max(100),
  investmentType: investmentTypeEnum,
  platform: z.string().max(100).optional().nullable(),
  units: z.number().min(0).optional().nullable(),
  buyPrice: z.number().min(0).optional().nullable(),
  currentNAV: z.number().min(0).optional().nullable(),
  investedAmount: z.number().positive("Invested amount must be positive"),
  currentValue: z.number().min(0),
  maturityDate: z.string().optional().nullable(),
  interestRate: z.number().min(0).max(100).optional().nullable(),
  folioNumber: z.string().max(50).optional().nullable(),
  isin: z.string().max(20).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateInvestmentSchema = createInvestmentSchema.partial();

export const createBudgetSchema = z.object({
  name: z.string().min(1).max(100).default("Monthly Budget"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  totalLimit: z.number().min(0).optional().nullable(),
  rollover: z.boolean().default(false),
  notes: z.string().max(500).optional().nullable(),
  categories: z.array(
    z.object({
      categoryName: z.string().min(1),
      limit: z.number().positive(),
      color: z.string().optional().nullable(),
    })
  ),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  targetAmount: z.number().positive("Target amount must be positive"),
  deadline: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  icon: z.string().max(10).optional().nullable(),
  color: z.string().optional().nullable(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const createBankAccountSchema = z.object({
  bankName: z.string().min(1).max(100),
  accountName: z.string().min(1).max(100),
  accountNumber: z
    .string()
    .max(4)
    .optional()
    .nullable(),
  accountType: bankAccountTypeEnum.default("SAVINGS"),
  balance: z.number().min(0),
  interestRate: z.number().min(0).max(100).optional().nullable(),
  maturityDate: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateBankAccountSchema = createBankAccountSchema.partial();

export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
