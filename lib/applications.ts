import { createAdminClient } from "@/lib/supabase/admin";
import type {
  PartnerApplicationInput,
  RenterApplicationInput,
} from "@/lib/validators";

function parseFleetSize(value: string): number | null {
  const digits = value.match(/\d+/g);
  if (!digits?.length) return null;
  return Number.parseInt(digits[digits.length - 1]!, 10);
}

function splitPlatforms(value: string): string[] {
  return value
    .split(/[,;/|]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 20);
}

async function findAuthUserIdByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (error) throw error;
  return (
    data.users.find((user) => user.email?.toLowerCase() === normalized)?.id ?? null
  );
}

async function ensureAuthUser(
  admin: ReturnType<typeof createAdminClient>,
  input: { email: string; fullName: string; phone?: string },
): Promise<string> {
  const existingId = await findAuthUserIdByEmail(admin, input.email);
  if (existingId) return existingId;

  const tempPassword = `Pm!${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
      phone: input.phone ?? null,
    },
  });

  if (error) {
    const again = await findAuthUserIdByEmail(admin, input.email);
    if (again) return again;
    throw error;
  }

  if (!data.user?.id) {
    throw new Error("Auth user create returned no id");
  }
  return data.user.id;
}

async function ensureProfile(
  admin: ReturnType<typeof createAdminClient>,
  input: { id: string; email: string; fullName: string; phone?: string },
) {
  const { error } = await admin.from("profiles").upsert(
    {
      id: input.id,
      email: input.email,
      full_name: input.fullName,
      phone: input.phone ?? null,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

async function ensureRenterProfile(
  admin: ReturnType<typeof createAdminClient>,
  input: {
    userId: string;
    licenseNumber: string;
    licenseState: string;
    city: string;
    state: string;
    phone?: string;
  },
): Promise<string> {
  const { data: existing, error: selectError } = await admin
    .from("renter_profiles")
    .select("id")
    .eq("user_id", input.userId)
    .is("deleted_at", null)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing?.id) return existing.id as string;

  const { data, error } = await admin
    .from("renter_profiles")
    .insert({
      user_id: input.userId,
      status: "applicant",
      license_number: input.licenseNumber,
      license_state: input.licenseState,
      address: {
        city: input.city,
        state: input.state,
        phone: input.phone ?? null,
      },
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function persistRenterApplication(input: RenterApplicationInput) {
  const admin = createAdminClient();
  const userId = await ensureAuthUser(admin, {
    email: input.email,
    fullName: input.fullName,
    phone: input.phone,
  });
  await ensureProfile(admin, {
    id: userId,
    email: input.email,
    fullName: input.fullName,
    phone: input.phone,
  });
  const renterProfileId = await ensureRenterProfile(admin, {
    userId,
    licenseNumber: input.licenseNumber,
    licenseState: input.licenseState,
    city: input.city,
    state: input.state,
    phone: input.phone,
  });

  const { data, error } = await admin
    .from("renter_applications")
    .insert({
      renter_profile_id: renterProfileId,
      status: "submitted",
      preferred_platforms: splitPlatforms(input.gigPlatforms),
      preferred_vehicle_category: null,
      city: input.city,
      payload: {
        source: "public_apply",
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        city: input.city,
        state: input.state,
        licenseNumber: input.licenseNumber,
        licenseState: input.licenseState,
        gigPlatforms: input.gigPlatforms,
        yearsDriving: input.yearsDriving,
        preferredStart: input.preferredStart,
        notes: input.notes ?? null,
        agreeTerms: input.agreeTerms,
        submittedAt: new Date().toISOString(),
      },
    })
    .select("id, status, created_at")
    .single();

  if (error) throw error;
  return {
    id: data.id as string,
    status: data.status as string,
    userId,
    renterProfileId,
  };
}

export async function persistPartnerApplication(input: PartnerApplicationInput) {
  const admin = createAdminClient();

  let applicantUserId: string | null = null;
  try {
    applicantUserId = await ensureAuthUser(admin, {
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
    });
    await ensureProfile(admin, {
      id: applicantUserId,
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
    });
  } catch (error) {
    console.warn("[partner-application] auth/profile optional link failed", error);
    applicantUserId = null;
  }

  const { data, error } = await admin
    .from("partner_applications")
    .insert({
      applicant_user_id: applicantUserId,
      company_name: input.businessName,
      contact_email: input.email,
      contact_phone: input.phone,
      fleet_size_estimate: parseFleetSize(input.vehicleCount),
      status: "submitted",
      payload: {
        source: "public_partner_apply",
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        businessName: input.businessName,
        entityType: input.entityType,
        city: input.city,
        state: input.state,
        vehicleCount: input.vehicleCount,
        fleetDescription: input.fleetDescription,
        website: input.website || null,
        agreeTerms: input.agreeTerms,
        submittedAt: new Date().toISOString(),
      },
    })
    .select("id, status, created_at")
    .single();

  if (error) throw error;
  return {
    id: data.id as string,
    status: data.status as string,
    applicantUserId,
  };
}
