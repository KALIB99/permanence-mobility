import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(4000),
});

export const renterApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(40),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(40),
  licenseNumber: z.string().trim().min(3).max(64),
  licenseState: z.string().trim().min(2).max(40),
  gigPlatforms: z.string().trim().min(2).max(240),
  yearsDriving: z.number().int().min(0).max(60),
  preferredStart: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(2000).optional(),
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms to continue",
  }),
});

export const partnerApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(40),
  businessName: z.string().trim().min(2).max(160),
  entityType: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(40),
  vehicleCount: z.string().trim().min(1).max(40),
  fleetDescription: z.string().trim().min(10).max(4000),
  website: z.union([z.literal(""), z.string().trim().url()]).optional(),
  agreeTerms: z.boolean().refine((value) => value === true, {
    message: "You must agree to the partner terms to continue",
  }),
});

export const vehicleCreateSchema = z.object({
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.number().int().min(1995).max(2100),
  category: z.string().trim().min(2).max(40),
  weeklyRateCents: z.number().int().min(1000).max(500_000),
  depositCents: z.number().int().min(0).max(500_000),
  location: z.string().trim().min(2).max(120),
  vin: z.union([z.literal(""), z.string().trim().min(11).max(17)]).optional(),
  plateNumber: z.union([z.literal(""), z.string().trim().max(20)]).optional(),
  eligibility: z.string().trim().max(240).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const partnerInviteSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum([
    "partner_manager",
    "partner_staff",
    "partner_accountant",
    "partner_read_only",
  ]),
  message: z.string().trim().max(1000).optional(),
});

export const createHoldSchema = z.object({
  vehicleId: z.string().trim().min(1).max(120),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
  weeks: z.number().int().min(1).max(26),
  depositCents: z.number().int().min(0).max(500_000).optional(),
});

export const feeAgreementSchema = z.object({
  type: z.enum(["percentage", "fixed", "hybrid"]),
  percentBps: z.number().int().min(0).max(10_000).optional(),
  fixedWeeklyCents: z.number().int().min(0).max(500_000).optional(),
  minimumCents: z.number().int().min(0).max(500_000).optional(),
});

export const feeCalculateSchema = z.object({
  grossCents: z.number().int().min(0).max(5_000_000),
  agreement: feeAgreementSchema,
  processingFeeCents: z.number().int().min(0).max(500_000).optional(),
  deductionsCents: z.array(z.number().int().min(0).max(500_000)).max(20).optional(),
  refundsCents: z.number().int().min(0).max(5_000_000).optional(),
});

export const DAMAGE_CHECKLIST_KEYS = [
  "exterior_scratches",
  "dents",
  "windshield",
  "tires",
  "interior_stains",
  "lights",
  "mirrors",
] as const;

export const inspectionSchema = z.object({
  vehicleId: z.string().trim().min(1).max(120),
  reservationId: z.string().trim().min(1).max(120).optional(),
  inspectionType: z.enum(["pickup", "return", "periodic", "damage", "pre_listing"]),
  odometer: z.number().int().min(0).max(2_000_000),
  fuelLevel: z.number().min(0).max(100),
  notes: z.string().trim().max(4000).optional(),
  damageChecklist: z.record(z.string(), z.boolean()).optional(),
  gpsConsent: z.boolean().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type RenterApplicationInput = z.infer<typeof renterApplicationSchema>;
export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>;
export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;
export type PartnerInviteInput = z.infer<typeof partnerInviteSchema>;
export type CreateHoldInput = z.infer<typeof createHoldSchema>;
export type FeeCalculateInput = z.infer<typeof feeCalculateSchema>;
export type InspectionInput = z.infer<typeof inspectionSchema>;
