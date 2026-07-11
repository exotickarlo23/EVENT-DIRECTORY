import { getAllCategoriesFlat, getAllLocations, getAllOccasions } from "@/lib/admin-queries";
import { ListingForm } from "../listing-form";

export const dynamic = "force-dynamic";

export default function NoviOglasPage() {
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-plum md:text-3xl">Novi oglas</h1>
      <ListingForm
        listing={null}
        categories={getAllCategoriesFlat()}
        locations={getAllLocations()}
        occasions={getAllOccasions()}
      />
    </div>
  );
}
