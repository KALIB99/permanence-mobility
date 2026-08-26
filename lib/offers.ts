import { ensureDatabase } from "./database";
import { isoAfterHours, makeToken, matchesWaitingClient, OFFER_HOURS } from "./domain";
import { sendOfferNotifications } from "./notifications";

type Vehicle = {
  id: number; make: string; model: string; category: string; weekly_price: number;
  location: string; eligibility: string; status: string;
};

export async function expireOffers(): Promise<void> {
  const db = await ensureDatabase();
  const expired = await db.prepare(
    `SELECT id, vehicle_id FROM waitlist_offers
     WHERE status = 'active' AND response_deadline <= CURRENT_TIMESTAMP`
  ).all<{ id: number; vehicle_id: number }>();

  for (const offer of expired.results) {
    const claimed = await db.prepare(
      `UPDATE waitlist_offers SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'active'`
    ).bind(offer.id).run();
    if (!claimed.meta.changes) continue;
    await db.prepare(
      `UPDATE vehicles SET status = 'available', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'offer_hold'`
    ).bind(offer.vehicle_id).run();
    await offerNextEligibleClient(offer.vehicle_id);
  }
}

export async function offerNextEligibleClient(vehicleId: number, deadline?: string) {
  const db = await ensureDatabase();
  const vehicle = await db.prepare(`SELECT * FROM vehicles WHERE id = ?`).bind(vehicleId).first<Vehicle>();
  if (!vehicle) throw new Error("Vehicle not found");
  if (vehicle.status !== "available") return { status: "not_available" };

  const activeOffer = await db.prepare(
    `SELECT id FROM waitlist_offers WHERE vehicle_id = ? AND status = 'active' LIMIT 1`
  ).bind(vehicleId).first();
  if (activeOffer) return { status: "already_offered" };

  const candidates = await db.prepare(
    `SELECT * FROM waiting_list
     WHERE status = 'approved'
       AND id NOT IN (
         SELECT waiting_list_id FROM waitlist_offers
         WHERE vehicle_id = ? AND status IN ('active', 'accepted', 'declined', 'expired')
       )
     ORDER BY created_at ASC, id ASC`
  ).bind(vehicleId).all<{
    id: number; name: string; email: string; mobile: string; location: string;
    preferred_vehicle_type: string; weekly_budget: number; approved_platforms: string;
  }>();

  const next = candidates.results.find((candidate: {
    id: number; name: string; email: string; mobile: string; location: string;
    preferred_vehicle_type: string; weekly_budget: number; approved_platforms: string;
  }) => matchesWaitingClient(vehicle, candidate));
  if (!next) return { status: "no_match" };

  const token = makeToken();
  const responseDeadline = deadline ?? isoAfterHours(OFFER_HOURS);
  let inserted;
  try {
    inserted = await db.prepare(
      `INSERT INTO waitlist_offers (token, vehicle_id, waiting_list_id, response_deadline)
       VALUES (?, ?, ?, ?)`
    ).bind(token, vehicleId, next.id, responseDeadline).run();
  } catch {
    return { status: "already_offered" };
  }
  const offerId = Number(inserted.meta.last_row_id);
  await db.prepare(
    `UPDATE vehicles SET status = 'offer_hold', updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(vehicleId).run();

  await sendOfferNotifications({
    offerId,
    waitingListId: next.id,
    name: next.name,
    email: next.email,
    mobile: next.mobile,
    vehicleLabel: `${vehicle.make} ${vehicle.model}`,
    token,
    deadline: responseDeadline,
  });
  return { status: "offered", offerId, waitingListId: next.id };
}
