import { InspectionForm } from "@/components/InspectionForm";
import { FEATURED_VEHICLES } from "@/lib/content";
import { DEMO_RENTER_RENTALS } from "@/lib/demo-data";

export const metadata = {
  title: "Renter Inspections",
};

const vehicles = DEMO_RENTER_RENTALS.map((rental) => {
  const match = FEATURED_VEHICLES.find((v) =>
    rental.vehicle.includes(`${v.year} ${v.make} ${v.model}`),
  );
  return {
    id: match?.id ?? rental.id,
    label: rental.vehicle,
  };
});

export default function RenterInspectionsPage() {
  const active = DEMO_RENTER_RENTALS.find((r) => r.status === "confirmed");
  const defaultVehicle = vehicles.find((v) =>
    active ? v.label === active.vehicle : false,
  );

  return (
    <>
      <p className="eyebrow">Condition</p>
      <h1 className="section-title mt-4">Inspections</h1>
      <p className="mt-3 max-w-xl text-mist">
        Start a pickup or return inspection. Photos and live persistence arrive with ops wiring;
        this form validates and records in demo mode.
      </p>

      <div className="mt-10 max-w-2xl">
        <InspectionForm
          vehicles={
            vehicles.length
              ? vehicles
              : [{ id: "demo-vehicle", label: "Demo vehicle" }]
          }
          defaultVehicleId={defaultVehicle?.id}
          defaultType={active ? "pickup" : "return"}
          reservationId={active?.id}
        />
      </div>
    </>
  );
}
